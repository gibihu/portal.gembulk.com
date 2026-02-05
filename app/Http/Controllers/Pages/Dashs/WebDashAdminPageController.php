<?php

namespace App\Http\Controllers\Pages\Dashs;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Plan;
use App\Models\Sendings\Sender;
use App\Models\Sendings\Servers\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebDashAdminPageController extends Controller
{
    public function senderRequests(Request $request)
    {
        $sender_request = Sender::with(['server', 'user'])->where('status', Sender::STATUS_PENDING)->get();

        return Inertia::render('dashboards/admins/senders/request', compact('sender_request'));
    }


    public function serverStoreAdd(Request $request)
    {
        $server_id = Str::uuid()->toString();
        $server = [
            'id' => $server_id,
        ];

        return Inertia::render('dashboards/admins/servers/add', compact('server'));
    }

    public function serverLists(Request $request)
    {
        $servers = Server::with('user')->get();

        return Inertia::render('dashboards/admins/servers/lists', compact('servers'));
    }

    public function serverItem(Request $request, $id)
    {
        $server = Server::with('senders')->find($id);

        return Inertia::render('dashboards/admins/servers/add', compact('server'));
    }

    public function serverStoreEdit(Request $request, $id)
    {
        $server = Server::with('actions')->find($id);
        return Inertia::render('dashboards/admins/servers/add', compact('server'));
    }

    public function plansIndex()
    {
        return Inertia::render('dashboards/admins/plans/list');
    }

    public function plansAdd()
    {
        $plan = [
            'id' => str::uuid(),
        ];
        return Inertia::render('dashboards/admins/plans/add', compact('plan'));
    }

    public function plansEdit(Request $request, $id)
    {
        $plan = plan::find($id);
        return Inertia::render('dashboards/admins/plans/add', compact('plan'));
    }

}
