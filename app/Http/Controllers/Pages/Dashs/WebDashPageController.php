<?php

namespace App\Http\Controllers\Pages\Dashs;

use App\Http\Controllers\Controller;
use App\Models\Sendings\CampaignReceiver;
use App\Models\Sendings\Campaign;
use App\Models\Sendings\Servers\Server;
use App\Models\Sendings\SpamWord;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebDashPageController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/index');
    }

    public function smsAdd()
    {
        $spam_world = SpamWord::pluck('word');

        return Inertia::render('dashboards/sendings/sms/add', compact('spam_world'));
    }

    public function jobSMS(Request $request)
    {
        $user = $request->user();
        $jobs = Campaign::with(['receiver_s'])->where('user_id', $user->id)->where('status', Campaign::STATUS_PENDING)->orWhere('status', Campaign::STATUS_PROCESSING)->orderBy('created_at', 'ASC')->limit(100)->get();

        return Inertia::render('dashboards/jobs/sms/run', compact('jobs'));
    }

    public function sendingSMS(Request $request)
    {
        $jobs = Campaign::without(['user', 'server'])->where('user_id', $request->user()->id)->orderBy('created_at', 'DESC')->limit(1000)->get();

        return Inertia::render('dashboards/sendings/sms/list', compact('jobs'));
    }

    public function reportCampaigns(Request $request)
    {
        $campaigns = Campaign::where('user_id', $request->user()->id)->orderBy('created_at', 'DESC')->limit(100)->get();
        return Inertia::render('dashboards/campaigns/reports', compact('campaigns'));
    }

    public function senderAdd(Request $request)
    {
        $sender_id = Str::uuid()->toString();
        $sender = [
            'id' => $sender_id,
        ];

        return Inertia::render('dashboards/senders/add', compact('sender'));
    }

    public function templateOTP(Request $request)
    {
        $server_id = $request->user()->plan->servers[0];
        $server = [
            'id' => $server_id,
        ];

        return Inertia::render('dashboards/otp/templates/add', compact('server'));
    }
}
