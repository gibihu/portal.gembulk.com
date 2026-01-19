<?php

namespace App\Http\Controllers\Apis\Servers;

use App\Http\Controllers\Controller;
use App\Models\Sendings\Servers\Server;
use Exception;
use Illuminate\Http\Request;

class ServerApiController extends Controller
{
    public function index(Request $request)
    {
        try{
            $with = array_filter(explode(',', $request->query('with', '')));
            $plan = $request->user()->load('plan')->plan;
            if (empty($plan->servers)) {
                return response()->json([
                    'message' => 'Success',
                    'data' => [],
                    'code' => 200,
                ]);
            }

            $server = Server::with($with)->whereIn('id', $plan->servers)->get()->makeHidden(['password']);
            return response()->json([
                'message' => 'Success',
                'data' => $server,
                'code' => 200,
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
