<?php

namespace App\Http\Controllers\Pages\Dashs;

use App\Helpers\ServerHelper;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Sendings\SMSSendingController;
use App\Models\Sendings\Report;
use App\Models\Sendings\SendingJob;
use App\Models\Sendings\SpamWord;
use App\Models\Sendings\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebDashPageController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboards/index');
    }

    public function createSMS()
    {
        $spam_world = SpamWord::pluck('word');

        return Inertia::render('dashboards/sendings/sms/add', compact('spam_world'));
    }

    public function jobSMS(Request $request)
    {
        $user = $request->user();
        $jobs = SendingJob::without(['user', 'server'])->where('user_id', $user->id)->orderBy('created_at', 'ASC')->limit(1000)->get();

        return Inertia::render('dashboards/jobs/sms/run', compact('jobs'));
    }

    public function sendingSMS(Request $request)
    {
        $jobs = SendingJob::without(['user', 'server'])->where('user_id', $request->user()->id)->orderBy('created_at', 'DESC')->limit(1000)->get();

        return Inertia::render('dashboards/sendings/sms/list', compact('jobs'));
    }

    public function reportSMS(Request $request)
    {
        $reports = Report::without(['user', 'server'])->where('user_id', $request->user()->id)->orderBy('created_at', 'DESC')->limit(1000)->get();
        return Inertia::render('dashboards/reports/sms/list', compact('reports'));
    }

    public function serverAdd(Request $request)
    {
        $server_id = Str::uuid()->toString();
        $server = [
            'id' => $server_id,
        ];

        return Inertia::render('dashboards/servers/add', compact('server'));
    }

    public function serverLists(Request $request)
    {
        $user = $request->user();
        $servers = Server::with('user')->where('user_id', $user->id)->get();

        return Inertia::render('dashboards/servers/lists', compact('servers'));
    }

    public function serverItem(Request $request, $id)
    {
        $server = Server::with('senders')->find($id);

        return Inertia::render('dashboards/servers/add', compact('server'));
    }

    public function senderAdd(Request $request)
    {
        $sender_id = Str::uuid()->toString();
        $sender = [
            'id' => $sender_id,
        ];

        return Inertia::render('dashboards/senders/add', compact('sender'));
    }
}
