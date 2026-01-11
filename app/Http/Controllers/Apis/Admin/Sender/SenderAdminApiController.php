<?php

namespace App\Http\Controllers\Apis\Admin\Sender;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Sender;
use Exception;
use Illuminate\Http\Request;

class SenderAdminApiController extends Controller
{
    public function senderRequestActions(Request $request)
    {
        try{
            $action = $request->action;
            $sender_id = $request->sender_id;

            $sender = Sender::find($sender_id);
            if(!$sender){
                return response()->json([
                    'message' => 'ไม่พบชื่อนี้ในฐานข้อมูล',
                    'code' => 404,
                ], 404);
            }

            switch ($action) {
                case 'accept':
                    $sender->status = Sender::STATUS_COMPLETED;
                    break;
                case 'reject':
                    $sender->status = Sender::STATUS_REJECTED;
                    break;
                default:
                    $sender->status = Sender::STATUS_PENDING;
            }

            if($sender->save()){
                return response()->json([
                    'message' => 'ดำเนินการสำเร็จ',
                    'data' => $sender,
                    'code' => 200,
                ], 200);
            }else{
                return response()->json([
                    'message' => 'ไม่สามารถบันทึกได้ ลงอีกครั้ง',
                    'code' => 422 ,
                ], 422 );
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
