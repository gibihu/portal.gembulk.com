<?php

namespace App\Http\Controllers\Apis\Senders;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Sender;
use Exception;
use Illuminate\Http\Request;

class SenderApiController extends Controller
{
    public function senderRequest(Request $request)
    {
        try{
            $request->validate([
                'name' => 'required',
                'request_id' => 'required',
                'server_id' => 'required',
            ]);

            $user = $request->user();
            $request_id = $request->request_id;
            $server_id = $request->server_id;
            $name = $request->name;
            $user_id = $user->id;
            $is_free = $request->is_free ?? false;

            $sender = new Sender;
            $sender->name = $name;
            $sender->user_id = $is_free ? null : $user_id;
            $sender->server_id = $server_id;
            $sender->status = Sender::STATUS_PENDING;
            if($sender->save()){
                return response()->json([
                    'message' => 'สำเร็จ',
                    'data' => $sender,
                    'code' => 201,
                ]);
            }else{
                return  response()->json([
                    'message' => 'ไม่สำเร็จ',
                    'code' => 400
                ], 400);
            }
        }catch (Exception $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if(config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
}
