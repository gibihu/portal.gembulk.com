<?php

namespace App\Http\Controllers\Apis\Admins\Plans;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Plan;
use Illuminate\Http\Request;
use Throwable;

class PlanAdminApiController extends Controller
{
    public function index(Request $request)
    {
        try{
            $plans = Plan::all();
            return response()->json([
                'message' => 'success',
                'data' => $plans,
                'code' => 200,
            ], 200);
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
