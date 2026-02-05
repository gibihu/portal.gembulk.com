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

    public function store(Request $request)
    {
        try{
            $data = [
                'id' => $request->id,
                'name' => $request->name,
                'description' => $request->description,
                'details' => $request->details,
                'price' => $request->price,
                'credit_limit' => $request->credit_limit,
                'duration' => $request->duration,
                'duration_unit' => (int) ($request->duration_unit ?? 0),
                'options' => $request->options ?? [],
                'servers' => $request->servers ?? [],
            ];

            $plan_save = Plan::updateOrCreate(
                ['id' => $data['id']],
                $data
            );

            return response()->json([
                'message' => 'success',
                'data' => $plan_save,
                'code' => 201,
            ], 201);
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
