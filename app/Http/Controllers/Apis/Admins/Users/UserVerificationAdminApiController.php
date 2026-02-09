<?php

namespace App\Http\Controllers\Apis\Admins\Users;

use App\Http\Controllers\Controller;
use App\Models\Users\UserVerification;
use Illuminate\Http\Request;
use Throwable;

class UserVerificationAdminApiController extends Controller
{
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'verification_id' => ['required', 'string', 'exists:user_verifications,id'],
                // allow either numeric status or string status (completed/rejected)
                'status' => ['required'],
                'rejected_reason' => ['nullable', 'string', 'max:2000'],
            ]);

            $status = $validated['status'];
            if (is_string($status)) {
                $status = UserVerification::fromString($status);
            }
            if (!is_int($status)) {
                return response()->json([
                    'message' => 'สถานะไม่ถูกต้อง',
                    'code' => 422,
                ], 422);
            }

            if ($status === UserVerification::STATUS_REJECTED && empty($validated['rejected_reason'])) {
                return response()->json([
                    'message' => 'กรุณาระบุเหตุผลกรณีไม่ผ่าน',
                    'code' => 422,
                ], 422);
            }

            $verification = UserVerification::query()->findOrFail($validated['verification_id']);

            // only allow deciding on pending/processing (avoid double-approve)
            if ($verification->isFinalStatus()) {
                return response()->json([
                    'message' => 'คำขอนี้ถูกพิจารณาแล้ว',
                    'code' => 409,
                ], 409);
            }

            $verification->status = $status;
            $verification->admin_id = $request->user()->id;
            $verification->verified_at = now();
            $verification->rejected_reason = $status === UserVerification::STATUS_REJECTED ? $validated['rejected_reason'] : null;
            $verification->save();

            return response()->json([
                'message' => 'Success',
                'data' => $verification->fresh(),
                'code' => 200,
            ], 200);
        } catch (Throwable $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if (config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
}

