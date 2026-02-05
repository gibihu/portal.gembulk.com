<?php

namespace App\Http\Controllers\Apis;

use App\Http\Controllers\Controller;
use App\Models\Users\ApiKey;
use Illuminate\Http\Request;
use Throwable;

class ApiKeyController extends Controller
{
    public function generate(Request $request)
    {
        try{
            $new = ApiKey::generateKey();

            return response()->json([
                'message' => 'Api key created successfully',
                'data' => $new,
                'code' => 201,
            ], 201);
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

    public function store(Request $request)
    {
        try{
            $request->validate([
                'token' => 'required',
            ]);

            if ($request->id) {
                $api = ApiKey::findOrFail($request->id);

                $api->update([
                    'token' => $request->token,
                    'template' => $request->template,
                    'options' => $request->options,
                    'permissions' => $request->permissions,
                ]);

                return response()->json([
                    'message' => 'Api created successfully',
                    'data' => $api,
                    'code' => 201,
                ], 201);
            } else {
                $api = ApiKey::create([
                    'token' => $request->token,
                    'template' => $request->template,
                    'options' => $request->options,
                    'permissions' => $request->permissions,
                    'user_id' => auth()->id(),
                ]);

                return response()->json([
                    'message' => 'Api created successfully',
                    'data' => $api,
                    'code' => 200,
                ], 200);
            }
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
