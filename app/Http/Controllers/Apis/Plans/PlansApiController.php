<?php

namespace App\Http\Controllers\Apis\Plans;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Plan;
use Exception;
use Illuminate\Http\Request;

class PlansApiController extends Controller
{
    public function index(Request $request)
    {
        try{
            $plans = Plan::where('status', Plan::STATUS_PUBLISHED)->get();
            return response()->json([
                'message' => 'Success',
                'data' => $plans,
                'code' => 200
            ], 200);
        }catch (Exception $e) {
            $response = [
                'message' => 'มีบางอย่างผิดพลาด โปรดลองอีกครั้งในภายหลัง',
                'description' => $e->getMessage() ?? '',
                'code' => 500,
            ];
            if(config('app.debug')) $response['debug'] = [
                'message' => $e->getMessage() ?? '',
                'request' => $request->all(),
            ];
            return response()->json($response, 500);
        }
    }
}
