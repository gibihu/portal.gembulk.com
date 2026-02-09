<?php

namespace App\Http\Controllers\Apis\Admins\Sender;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Sender;
use App\Models\Sendings\Servers\Server;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SenderAdminApiController extends Controller
{
    public function senderRequestActions(Request $request)
    {
        try {
            $action = $request->action ?? 'pending';
            $sender_id = $request->sender_id;

            $sender = DB::transaction(function () use ($sender_id, $action) {
                $sender = Sender::find($sender_id);
                $sender->status = Sender::fromString($action);
                $sender->save();

                return $sender;
            });
            return response()->json([
                'message' => 'ดำเนินการสำเร็จ',
                'data' => $sender,
                'code' => 200,
            ], 200);
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }

    public function senderDestroy(Request $request)
    {
        try {
            $sender_id = $request->id;
            DB::transaction(function () use ($sender_id) {
                $sender = Sender::find($sender_id);
                $sender->delete();
            });

            return response()->json([
                'message' => 'ลบสำเร็จ',
                'code' => 200,
            ], 200);
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }

    public function update(Request $request)
    {
        try{
            $sender = Sender::findOrFail($request->sender_id);
            $sender->name = $request->name;
            $sender->save();

            return response()->json([
                'success' => true,
                'message' => 'Update Success',
                'code' => 200,
            ], 200);
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
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
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'server_ids' => ['required', 'array', 'min:1'],
                'server_ids.*' => ['required', 'string', 'exists:sd_servers,id'],
                'user_id' => ['nullable', 'string', 'exists:users,id'],
            ]);

            $senders = DB::transaction(function () use ($validated) {
                $created = [];

                foreach ($validated['server_ids'] as $serverId) {
                    $created[] = Sender::create([
                        'name' => $validated['name'],
                        'server_id' => $serverId,
                        'user_id' => $validated['user_id'] ?? null,
                        'status' => Sender::STATUS_ACTIVE,
                    ]);
                }

                return $created;
            });

            return response()->json([
                'success' => true,
                'message' => 'สร้างผู้ส่งสำเร็จ',
                'data' => $senders,
                'code' => 200,
            ], 200);
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
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
