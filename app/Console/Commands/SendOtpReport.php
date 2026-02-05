<?php

namespace App\Console\Commands;

use App\Helpers\Servers\Actions\ActionServerHelper;
use App\Models\Sendings\Campaign;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendOtpReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-otp-report';

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
        $action_key_upper = 'Report OTP';
        Log::channel('otp_report')->info('---> Start ' . $action_key_upper);
        try{
            $limit = 50;

            Campaign::where('status', Campaign::STATUS_UNDER_REVIEW)
                ->where('action_key', 'otp')
                ->limit($limit)
                ->cursor()
                ->each(function ($item) {
                    Log::channel('otp_report')->info('--> Processing "' . $item->name . '"');
                    $item = ActionServerHelper::ActionReportOTP($item);
                    if($item !== false){
                        $item->save();
                        Log::channel('otp_report')->info('--> Action completed');
                    }else{
                        Log::channel('otp_report')->error('--> Cannot send OTP Report');
                    }
                }
                );
        } catch (Throwable $e) {
            Log::channel('otp_report')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('otp_report')->info('---> End ' . $action_key_upper);
    }
}
