<?php

namespace App\Http\Controllers\Tests;

use App\Helpers\Servers\Actions\ActionServerHelper;
use App\Http\Controllers\Controller;
use App\Models\Sendings\Campaign;
use App\Models\Sendings\CampaignReceiver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CronjobTestController extends Controller
{
    public function sendingSMS()
    {
        $action_key_upper = 'SMS';
        Log::channel('sms')->info('---> Start Sending ' . $action_key_upper);

        try {
            $limit = 50;

            Campaign::where('status', Campaign::STATUS_PENDING)
                ->limit($limit)
                ->cursor()
                ->each(function ($item) {

                    Log::channel('sms')->info('--> Processing "' . $item->name . '"');

                    // 1. เช็คว่า server รองรับ scheduled_at ไหม
                    $serverSupportSchedule = collect($item->server->action_sms->body)
                        ->contains(fn ($row) => array_key_exists('scheduled_at', $row));

                    // 2. campaign มีเวลานัดส่งไหม
                    $itemHasSchedule = !empty($item->scheduled_at);

                    // 3. server ไม่รองรับ schedule → ต้องเช็คเวลาเอง
                    if (!$serverSupportSchedule && $itemHasSchedule) {

                        if (now()->lt($item->scheduled_at)) {
                            Log::channel('sms')->info('--> Skip: Not time yet');
                            return; // ⛔ ยังไม่ถึงเวลา ข้าม
                        }

                        Log::channel('sms')->info('--> Time reached, continue sending');
                    } else {
                        Log::channel('sms')->info('--> Server supports schedule, send immediately');
                    }

                    // 4. เริ่มประมวลผล
                    $item->status = Campaign::STATUS_PROCESSING;
                    $item->save();

                    if ($item->action_key === 'sms') {
                        Log::channel('sms')->info('--> Action Is "' . $item->action_key . '"');

                        $item = ActionServerHelper::ActionSMS($item);

                        $item->status = Campaign::STATUS_UNDER_REVIEW;
                        $item->save();

                        Log::channel('sms')->info('--> Action completed');
                    }
                });
        } catch (Throwable $e) {
            Log::channel('sms')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('sms')->info('---> End Sending ' . $action_key_upper);
    }
}
