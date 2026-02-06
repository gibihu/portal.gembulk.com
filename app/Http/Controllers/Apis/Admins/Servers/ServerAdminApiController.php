<?php

namespace App\Http\Controllers\Apis\Admins\Servers;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Servers\Server;
use App\Models\Sendings\Servers\ServerAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class ServerAdminApiController extends Controller
{

    public function index(Request $request)
    {
        try {
            $servers = Server::with('senders')->when($request->select, function ($query, $select) {
                $columns = is_array($select)
                    ? $select
                    : explode(',', $select);

                $allowed = ['id','name','status'];

                $columns = array_intersect($columns, $allowed);

                return $query->select($columns);
            })->get();
            return response()->json([
                'message' => 'Success',
                'data' => $servers,
                'code' => 200
            ], 200);
        } catch (Throwable $e) {
            $response = [
                'message' => 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้',
                'description' => 'เกิดข้อผิดพลาดระหว่างการบันทึกข้อมูล',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
    public function store(Request $request)
    {
        try {
            $request->validate([
                'server_id' => 'required',
                'server_name' => 'required',
                'server_host' => 'required',
            ]);

            DB::transaction(function () use ($request, &$server) {

                // 1️⃣ สร้าง server
                $server = Server::find($request->server_id) ?? new Server();
                $server->id = $request->server_id;
                $server->name = $request->server_name ?? '';
                $server->host = $request->server_host ?? '';
                $server->user_id = $request->user()?->id;
                $server->saveOrFail();

                // 2️⃣ สร้าง sms action
                foreach ($request->input('actions', []) as $action) {
                    $server->actions()->updateOrCreate(
                        [
                            'server_id' => $server->id,
                            'action_key' => $action['key'],
                        ],
                        [
                            'method' => $action['method'] ?? 'POST',
                            'endpoint' => $action['endpoint'] ?? '',
                            'headers' => $action['headers'] ?? [],
                            'body' => $action['body'] ?? [],
                            'response' => $action['response'] ?? [],
                            'settings' => $action['settings'] ?? [],
                            'status' => ServerAction::STATUS_DRAFT,
                        ]
                    );
                }
            });

            // 3️⃣ load relation หลัง commit
            $server->load('actions');

            return response()->json([
                'message' => 'บันทึกสำเร็จ',
                'data' => $server,
                'code' => 201,
            ], 201);
        } catch (Throwable $e) {
            $response = [
                'message' => 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้',
                'description' => 'เกิดข้อผิดพลาดระหว่างการบันทึกข้อมูล',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }

    public function destroy(Request $request)
    {
        try{
            $server = Server::find($request->id);

            if (!$server) {
                return response()->json([
                    'message' => 'ไม่พบข้อมูล server',
                    'code' => 404,
                ], 404);
            }

            $server->delete();

            return response()->json([
                'message' => 'ลบสำเร็จ',
                'code' => 200,
            ]);

        } catch (Throwable $e) {
            $response = [
                'message' => 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้',
                'description' => 'เกิดข้อผิดพลาดระหว่างการบันทึกข้อมูล',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
}
