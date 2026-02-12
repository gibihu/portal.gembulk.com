<?php

namespace App\Http\Controllers\Apis\Payments;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Plan;
use App\Models\Transactions\Provider;
use App\Models\Transactions\Transaction;
use App\Models\Transactions\TransactionCallback;
use App\Models\Transactions\TransactionDetail;
use App\Services\P2wPayService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class PaymentApiController extends Controller
{
    public function qrPay(Request $request)
    {
        DB::beginTransaction();

        try {

            $request->validate([
                'plan_id' => 'required',
                'payment_method' => 'required',
            ]);

            $now = Carbon::now();
            $start = $now->copy()->setTime(22, 30);

            if ($now->gte($start) || $now->lt($now->copy()->setTime(2, 0))) {
                return response()->json([
                    'success' => false,
                    'message' => 'ผู้ให้บริการปิดปรับปุง',
                    'description' => 'งดทำรายการช่วง 22:30 - 02:00 น.',
                    'code' => 503,
                ], 503);
            }

            $plan = Plan::findOrFail($request->plan_id);
            $provider = Provider::where('code', 'p2wpay')->firstOrFail();

            // ===== Transaction =====
            $tax_rate = $plan->price + ($plan->price * ($plan->tax_rate ?? 1));
            $trans = Transaction::firstOrCreate(
                ['id' => $request->transaction_id],
                [
                    'user_id' => $request->user()->id,
                    'provider_id' => $provider->id,
                    'provider_name' => $provider->name,
                    'plan_id' => $plan->id,
                    'amount' => $tax_rate,
                    'payment_method' => $request->payment_method,
                    'type' => 'deposit',
                    'fee' => $plan->fee_rate ?? 0,
                    'status' => Transaction::STATUS_PROCESSING,
                ]
            );

            // ===== Detail =====
            $trans_detail = TransactionDetail::firstOrCreate(
                ['transaction_id' => $trans->id],
                [
                    'bank_code' => null,
                    'account_name' => null,
                    'account_number' => null,
                    'phone_number' => null,
                ]
            );

            // ===== Callback =====
            $trans_callback = TransactionCallback::firstOrCreate([
                'transaction_id' => $trans->id
            ]);

            // ===== Call API =====
            $body = [
                'amount' => $trans->amount,
                'custom_order_id' => $trans->id,
                'transaction_id' => $trans->transaction_id,
            ];

            $get = P2wPayService::deposit($body);

            // ===== API Error =====
            if (!$get['success']) {

                $trans_callback->payload = $get['error'] ?? null;
                $trans_callback->save();

                throw new Exception($get['error']['error'] ?? 'API Error');
            }

            $callback = $get['data'];

            if (!$callback['success']) {
                throw new Exception('Deposit failed');
            }

            // ===== Save Callback =====
            $trans_callback->payload = $callback;
            $trans_callback->save();

            $data = $callback['data'];

            // ===== Update Transaction =====
            $trans->update([
                'transaction_id' => $data['transaction_id'] ?? null,
                'amount' => $data['amount'] ?? null,
                'net_amount' => $data['net_amount'] ?? null,
                'expired_at' => $data['expired_at'] ?? null,
                'currency' => $data['currency'] ?? null,
                'paid_at' => $data['paid_at'] ?? null,
                'status' => Transaction::fromString($callback['status'] ?? 'pending'),
            ]);

            if($trans->status == Transaction::STATUS_COMPLETED) {
                $trans->load('user');
                if ($trans->user) {
                    $user = $trans->user;
                    $user->credits += $plan->credit_limit ?? 0;
                    $user->plan_id = $plan->id;
                    $user->save();
                }
                $plan->increment('orders');
            }

            // ===== Update Detail =====
            if (isset($data['qr_code'])) {
                $trans_detail->qr_code = $data['qr_code'];
            }

            $trans_detail->extra = [
                'create_at' => $data['create_at'] ?? null,
                'phone_number' => $data['promptpay_number'] ?? null,
                'status' => $data['status'] ?? null,
                'message' => $data['message'] ?? null,
                'company_bank' => $data['company_bank'] ?? null,
            ];

            $trans_detail->save();

            // ===== SUCCESS =====
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $get['message'] ?? null,
                'data' => $trans->load('detail'),
                'code' => 201,
            ], 201);

        } catch (Throwable $e) {

            // ===== ROLLBACK =====
            DB::rollBack();

            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage(),
                'code' => 500,
            ];

            if (config('app.debug')) {
                $response['debug'] = [
                    'error' => $e->getMessage(),
                    'request' => $request->all(),
                ];
            }

            return response()->json($response, 500);
        }
    }

    public static function qrReport(Request $request)
    {
        try{
            $trans_id = Transaction::firstOrFail($request->transaction_id ?? null);
        }catch (Throwable $e){
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
