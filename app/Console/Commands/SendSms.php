<?php

namespace App\Console\Commands;

use App\Helpers\ServerHelper;
use App\Helpers\Servers\Actions\ActionServerHelper;
use App\Http\Controllers\Sendings\SMSSendingController;
use App\Models\Sendings\Campaign;
use App\Models\Sendings\CampaignReceiver;
use App\Models\Sendings\SendingJob;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendSms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-sms';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action_key_upper = 'SMS';
        Log::channel('sms_sent')->info('---> Start Sending ' . $action_key_upper);

        try {
            $limit = 50;
            $count = Campaign::where('status', Campaign::STATUS_PENDING)
                ->where('action_key', strtolower($action_key_upper))
                ->limit($limit)
                ->count();
            Log::channel('sms_sent')->info('--> Found ' . $count . ' pending campaigns' . ' Limit ' . $limit);
            if ($count === 0) {
                return;
            }

            Campaign::where('status', Campaign::STATUS_PENDING)
                ->where('action_key', strtolower($action_key_upper))
                ->limit($limit)
                ->cursor()
                ->each(function ($item) {

                    Log::channel('sms_sent')->info('--> Processing "' . $item->name . '"');

                    // 1. เช็คว่า server รองรับ scheduled_at ไหม
                    $serverSupportSchedule = collect($item->server->action_sms->body)
                        ->contains(fn ($row) => array_key_exists('scheduled_at', $row));

                    // 2. campaign มีเวลานัดส่งไหม
                    $itemHasSchedule = !empty($item->scheduled_at);

                    // 3. server ไม่รองรับ schedule → ต้องเช็คเวลาเอง
                    if (!$serverSupportSchedule && $itemHasSchedule) {

                        if (now()->lt($item->scheduled_at)) {
//                            Log::channel('sms_sent')->info('--> Skip: Not time yet');
                            return; // ⛔ ยังไม่ถึงเวลา ข้าม
                        }
                        Log::channel('sms_sent')->info('--> Time reached, continue sending');
                    } else {
                        Log::channel('sms_sent')->info('--> Server supports schedule, send immediately');
                    }

                    $updated = Campaign::where('id', $item->id)
                        ->where('status', Campaign::STATUS_PENDING)
                        ->update([
                            'status' => Campaign::STATUS_PROCESSING,
                        ]);

                    if ($updated === 0) {
                        return; // มีตัวอื่นแย่งไปแล้ว
                    }

                    try {
                        Log::channel('sms_sent')->info('--> Action Is "sms"');
                        $item = $item->fresh();
                        $item = ActionServerHelper::ActionSMS($item);
                        $item->save();
                        Log::channel('sms_sent')->info('--> Action completed');

                    } catch (\Throwable $e) {

                        // ===== 3. ถ้า error → mark FAILED =====
                        Log::channel('sms_sent')->error('Campaign #' . $item->id . ' failed: ' . $e->getMessage());

                        $item->status = Campaign::STATUS_FAILED;
                        $item->save();
                    }
                }
            );
        } catch (Throwable $e) {
            Log::channel('sms_sent')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('sms_sent')->info('---> End Sending ' . $action_key_upper);
    }
}
