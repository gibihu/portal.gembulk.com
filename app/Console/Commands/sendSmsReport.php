<?php

namespace App\Console\Commands;

use App\Helpers\Servers\Actions\ActionServerHelper;
use App\Models\Sendings\Campaign;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class sendSmsReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-sms-report';

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
        $action_key_upper = 'Report SMS';
        Log::channel('sms_report')->info('---> Start ' . $action_key_upper);
        try{
            $limit = 50;

            Campaign::where('status', Campaign::STATUS_UNDER_REVIEW)
                ->limit($limit)
                ->cursor()
                ->each(function ($item) {
                    Log::channel('sms_report')->info('--> Processing "' . $item->name . '"');
                    if ($item->action_key === 'sms') {
                        Log::channel('sms_report')->info('--> Action Is "' . $item->action_key . '"');

                        $item = ActionServerHelper::ActionReportSMS($item);
                        if($item !== false){
                            $item->save();
                            Log::channel('sms_report')->info('--> Action completed');
                        }else{
                            Log::channel('sms_report')->error('--> Cannot send SMS Report');
                        }
                    }
                }
                );
        } catch (Throwable $e) {
            Log::channel('sms_report')->error('--> Error: ' . $e->getMessage());
        }

        Log::channel('sms_report')->info('---> End ' . $action_key_upper);
    }
}
