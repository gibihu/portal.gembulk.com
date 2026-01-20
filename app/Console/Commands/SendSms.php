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

            Campaign::where('status', Campaign::STATUS_PENDING)
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
                            Log::channel('sms_sent')->info('--> Skip: Not time yet');
                            return; // ⛔ ยังไม่ถึงเวลา ข้าม
                        }

                        Log::channel('sms_sent')->info('--> Time reached, continue sending');
                    } else {
                        Log::channel('sms_sent')->info('--> Server supports schedule, send immediately');
                    }

                    // 4. เริ่มประมวลผล
                    $item->status = Campaign::STATUS_PROCESSING;
                    $item->save();

                    if ($item->action_key === 'sms') {
                        Log::channel('sms_sent')->info('--> Action Is "' . $item->action_key . '"');

                        $item = ActionServerHelper::ActionSMS($item);
                        $item->save();

                        Log::channel('sms_sent')->info('--> Action completed');
                    }
                }
                );
        } catch (Throwable $e) {
            Log::channel('sms_sent')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('sms_sent')->info('---> End Sending ' . $action_key_upper);
    }
}
