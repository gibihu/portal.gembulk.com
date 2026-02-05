<?php

namespace App\Http\Controllers\Apis\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Transactions\Transaction;
use Illuminate\Http\Request;
use Throwable;

class TransactionApiController extends Controller
{
    public function list(Request $request)
    {
        try{
            $user = $request->user();
            $transactions = Transaction::select([
                'amount',
                'fee',
                'currency',
                'status',
                'payment_method',
                'tax'
            ])->where('user_id', $user->id)->get();

            return response()->json([
                'message' => 'Success',
                'data' => $transactions,
                'code' => 200
            ], 200);
        }catch (Throwable $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if(config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all() ?? '',
            ];
            return response()->json($response, 500);
        }
    }
}
