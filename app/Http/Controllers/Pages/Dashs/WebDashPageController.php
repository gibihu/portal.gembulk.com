<?php

namespace App\Http\Controllers\Pages\Dashs;

use App\Http\Controllers\Controller;
use App\Models\Sendings\CampaignReceiver;
use App\Models\Sendings\Campaign;
use App\Models\Sendings\Plan;
use App\Models\Sendings\Servers\Server;
use App\Models\Sendings\SpamWord;
use App\Models\UploadFile;
use App\Models\Users\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpParser\Node\Stmt\Return_;

class WebDashPageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if(!empty($user->plan_id) || $user->credits == 0){
            return Inertia::render('dashboards/plans/index');
        }else{
            return Inertia::render('dashboards/senders/add');
        }
    }

    public function fileView(Request $request, $id)
    {
        $file = UploadFile::where('id', base64_decode($id))->firstOrFail();
        $user = $request->user();
        if (!in_array('admin', $user->roles, true) && $user->id !== $file->owner_id) {
            abort(403);
        }

        $filePath = $file->path . '/' . $file->name;

        if (Storage::disk('public')->exists($filePath)) {
            $mimeType = Storage::disk('public')->mimeType($filePath);
            $fileContent = Storage::disk('public')->get($filePath);

            return response($fileContent, 200)
                ->header('Content-Type', $mimeType)
                ->header('Cache-Control', 'public, max-age=604800, immutable');
        }

        abort(404); // หากไม่พบไฟล์
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

    public function sendersIndex(Request $request)
    {
        return Inertia::render('dashboards/senders/list');
    }
    public function senderAdd(Request $request)
    {
        $sender_id = Str::uuid()->toString();
        $sender = [
            'id' => $sender_id,
        ];

        return Inertia::render('dashboards/senders/add', compact('sender'));
    }

    public function apiIndex(Request $request)
    {
        $apiKeys = $request->user()->load('apiKeys')->apiKeys;
        return Inertia::render('dashboards/apis/add', compact('apiKeys'));
    }
    public function apiDocs(Request $request)
    {
        return Inertia::render('dashboards/apis/docs/index');
    }

    public function plansIndex(Request $request)
    {
        $user = $request->user();
        $plan = Plan::find($user->plan_id);
        return Inertia::render('dashboards/plans/index', compact('plan'));
    }
    public function plansManage(Request $request)
    {
        $user = $request->user();
        if(!empty($user->plan_id)){
            $plan = Plan::find($user->plan_id);
            return Inertia::render('dashboards/plans/manage', compact('plan'));
        }else{
            return redirect()->route('web.dashboard.plans.index');
        }
    }

    public function plansPayment(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);
        return Inertia::render('dashboards/plans/payment', compact('plan'));
    }

    public function usersVerify(Request $request)
    {
        $user = $request->user()->load('latestVerification');
//        dd($user);

        return Inertia::render('dashboards/users/verify', [
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
}
