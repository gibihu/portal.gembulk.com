<?php

namespace App\Http\Controllers\Apis\Senders;

use App\Helpers\UploadHelper;
use App\Http\Controllers\Controller;
use App\Models\Sendings\Sender;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class SenderApiController extends Controller
{

//    public function index(Request $request)
//    {
//        try{
//
//        } catch (Exception $e) {
//            $response = [
//                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
//                'description' => $e->getMessage() ?? '',
//                'code' => 500,
//            ];
//            if (config('app.debug')) $response['debug'] = [
//                'message' => $e->getMessage() ?? '',
//                'request' => $request->all(),
//            ];
//            return response()->json($response, 500);
//        }
//    }
    public function senderRequest(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required',
                'request_id' => 'required',
                'server_id' => 'required',
                'images' => 'required',
                'images.*' => 'image',
            ]);

            $user_id = $request->user()->id;
            $request_id = $request->request_id;
            $server_id = $request->server_id;
            $name = $request->name;
            $is_free = $request->is_free ?? false;


            $data = [
                'sources' => 'user',
                'type' => 'sender',
                'path' => "upload/users/{$user_id}/senders",
                'user_id' => $user_id,
            ];

            $files = $request->file('images');
            $file_ids = [];
            if ($files) {
                // รองรับทั้ง single file และ multiple files
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    $getData = UploadHelper::uploadFileGetId($file, $data);
                    if($getData['success']){
                        $file_ids[] = $getData['data']['id'];
                    }
                }
            }

            $sender = Sender::create([
                'name' => $name,
                'user_id' => $user_id,
                'server_id' => $server_id,
                'status' => Sender::STATUS_PENDING,
                'resource_ids' => $file_ids,
                'content' => $request['content'],
            ]);

            if ($sender) {
                return response()->json([
                    'message' => 'สำเร็จ',
                    'data' => $sender,
                    'code' => 201,
                ], 201);
            } else {
                return response()->json([
                    'message' => 'ไม่สำเร็จ',
                    'code' => 400
                ], 400);
            }
        } catch (Exception $e) {
            $response = [
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

    public function senderStatus(Request $request)
    {
        try {
            $status = $request->status;
            $sender_id = $request->sender_id;

            $sender = DB::transaction(function () use ($status, $sender_id) {
                $sender = Sender::findOrFail($sender_id);
                $sender->status = Sender::fromString($status);
                $sender->save();

                return $sender;
            });

            return response()->json([
                'message' => 'อัพเดทสถาณะแล้ว',
                'data' => $sender,
                'code' => 200,
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

    public function destroy(Request $request)
    {
        try{
            $sender_id = $request->sender_id;
            DB::transaction(function () use ($sender_id) {
                $sender = Sender::findOrFail($sender_id);
                $sender->delete();
            });

            return response()->json([
                'message' => 'ลบสำเร็จ',
                'code' => 200,
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
}
