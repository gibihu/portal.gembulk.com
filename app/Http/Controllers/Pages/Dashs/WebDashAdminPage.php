<?php

namespace App\Http\Controllers\Pages\Dashs;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Sender;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebDashAdminPage extends Controller
{
    public function senderRequests(Request $request)
    {
        $sender_request = Sender::with(['server', 'user'])->where('status', Sender::STATUS_PENDING)->get();

        return Inertia::render('dashboards/admins/senders/request', compact('sender_request'));
    }
}
