<?php

namespace App\Console\Commands;

use App\Helpers\Servers\Actions\ActionServerHelper;
use App\Models\Sendings\Campaign;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendOtp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-otp';

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
        $action_key_upper = 'OTP';
        Log::channel('otp_sent')->info('---> Start Sending ' . $action_key_upper);

        try {
            $limit = 50;
            $count = Campaign::where('status', Campaign::STATUS_PENDING)
                ->where('action_key', 'otp')
                ->limit($limit)
                ->count();
            Log::channel('otp_sent')->info('--> Found ' . $count . ' pending campaigns' . ' Limit ' . $limit);
            if ($count === 0) {
                return;
            }

            Campaign::where('status', Campaign::STATUS_PENDING)
                ->where('action_key', 'otp')
                ->limit($limit)
                ->cursor()
                ->each(function ($item) {

                    Log::channel('otp_sent')->info('--> Processing "' . $item->name . '"');

                    $updated = Campaign::where('id', $item->id)
                        ->where('status', Campaign::STATUS_PENDING)
                        ->update([
                            'status' => Campaign::STATUS_PROCESSING,
                        ]);
                    if ($updated === 0) {
                        return; // มีตัวอื่นแย่งไปแล้ว
                    }
                    try {
                        Log::channel('otp_sent')->info('--> Action Is "otp"');
                        $item = $item->fresh();
                        $item = ActionServerHelper::ActionOTP($item);
                        $item->save();
                        Log::channel('otp_sent')->info('--> Action completed');
                    } catch (\Throwable $e) {
                        // ===== 3. ถ้า error → mark FAILED =====
                        Log::channel('otp_sent')->error('Campaign #' . $item->id . ' failed: ' . $e->getMessage());

                        $item->status = Campaign::STATUS_FAILED;
                        $item->save();
                    }
                }
                );
        } catch (Throwable $e) {
            Log::channel('otp_sent')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('otp_sent')->info('---> End Sending ' . $action_key_upper);
    }
}
