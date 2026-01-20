<?php

namespace App\Http\Controllers\Apis\Dashs\Sending;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Campaign;
use App\Models\Sendings\Sender;
use App\Models\Sendings\CampaignReceiver;
use App\Models\Sendings\Servers\Server;
use Exception;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SMSApiController extends Controller
{
    public function create(Request $request)
    {
        try{
            $cp_name = $request->campaign_name ?? '';
            $receivers = $request->receivers;
            $sender_id = $request->sender_id;
            $server_id = $request->server_id;
            $cost = $request->cost;
            $msg = $request->msg;
            $phone_counts = $request->phone_counts;
            $user = $request->user();
            $scheduled_at = $request->scheduled_at;
            $is_scheduled = $request->is_scheduled;

//            dd($request->all());
            $real_cost = $cost * $phone_counts;
            if($user->credits >= $real_cost){

                $all_status = DB::transaction(function () use ($user, $cp_name, $receivers, $sender_id, $server_id, $cost, $real_cost, $msg, $phone_counts, $is_scheduled, $scheduled_at) {
                    $sender = Sender::find($sender_id);
                    $server = Server::find($server_id);
                    $campaign = Campaign::create([
                        'name' => $cp_name,
                        'action_key' => 'sms',
                        'receivers' => $receivers,
                        'message' => $msg,
                        'data' => [
                            'phone_counts' => $phone_counts,
                            'cost' => $cost,
                            'real_cost' => $real_cost,
                        ],
                        'total_cost' => $real_cost,
                        'status' => Campaign::STATUS_PENDING,
                        'sender_name' => $sender->name,
                        'sender_id' => $sender->id,
                        'server_name' => $server->name,
                        'server_id' => $server->id,
                        'user_id' => $user->id,
                        'scheduled_at' => $is_scheduled ? $scheduled_at : null,
                    ]);

                    $success = [];
                    $fail = [];
                    foreach($receivers as $receiver){
                        $job = CampaignReceiver::create([
                            'receiver' => $receiver,
                            'sender_name' => $sender->name,
                            'message' => $msg,
                            'cost' => $cost,
                            'action_key' => 'sms',
                            'campaign_id' => $campaign->id,
                            'status' => CampaignReceiver::STATUS_PENDING,
                        ]);
                        if($job){
                            $success[] = $job->id;
                        }else{
                            $fail[] = $receiver;
                        }
                    }

                    return [
                        'success' => $success,
                        'fail' => $fail,
                    ];

                });

                $user->credits = $user->credits - ($real_cost);
                $user->save();

                if(!empty($all_status['success'])){
                    return  response()->json([
                        'message' => 'สำเร็จ',
                        'data' => [
                            'success' => $all_status['success'],
                            'fail' => $all_status['fail'],
                        ],
                        'code' => 201
                    ], 201);
                }else{
                    return  response()->json([
                        'message' => 'ไม่สำเร็จ',
                        'data' => [
                            'success' => $all_status['success'],
                            'fail' => $all_status['fail'],
                        ],
                        'code' => 400
                    ], 400);
                }
            }else{
                return response()->json([
                    'message' => 'เครดิตไม่พอ',
                    'description' => 'กรุณาเติมเครดิตก่อนส่ง',
                    'code' => 422,
                ], 422); // validate ความต้องการ
            }

        }catch (Exception $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage(),
                'code' => 500,
            ];
            if(config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage(),
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }

    public function syncJob(Request $request)
    {
        try{
            $jobs = Campaign::with(['receiver_s'])->where('user_id', $request->user()->id)->where('status', Campaign::STATUS_PENDING)->orWhere('status', Campaign::STATUS_PROCESSING)->orderBy('scheduled_at', 'ASC')->orderBy('created_at', 'ASC')->limit(1000)->get();
            return response()->json([
                'message' => 'สำเร็จ',
                'code' => 200,
                'data' => $jobs,
                'description' => '',
                // 'debug' => [
                //     'isset' => isset(json_decode($jobs, true)[0]['scheduled_at'])
                // ]
            ], 200);
        }catch (Exception $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage(),
                'code' => 500,
            ];
            if(config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage(),
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
}
