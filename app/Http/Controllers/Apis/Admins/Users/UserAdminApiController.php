<?php

namespace App\Http\Controllers\Apis\Admins\Users;

use App\Http\Controllers\Controller;
use App\Models\Users\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Throwable;

class UserAdminApiController extends Controller
{
    public function index(Request $request)
    {
        try{
            $users = User::with([
                'plan' => function ($q) {
                    $q->select('id', 'name'); // field ของ plan
                }, 'verifications'
            ])->select([
                'id',
                'name',
                'username',
                'avatar',
                'email',
                'email_verified_at',
                'credits',
                'roles',
            ])->where('id', '!=', auth()->id())->get();

            return response()->json([
                'message' => 'Success',
                'data' => $users,
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

    public function store(Request $request)
    {
        try{
            $roles = $request->roles ?? null;
            $credits = $request->credit_change ?? 0;

            $user = User::findOrFail($request->user_id);

            if ($request->has('name') && $request->name) {
                $user->name = $request->name;
            }

            if ($request->has('password') && $request->password) {
                $user->password = Hash::make($request->password);
            }

            $user->roles = $roles ?? $user->roles;
            $user->credits = max(0, $user->credits + $credits);
            $user->save();

            return response()->json([
                'message' => 'Success',
                'data' => [
                    'name' => $user->name,
                    'credits' => $user->credits,
                    'roles' => $user->roles,
                ],
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
