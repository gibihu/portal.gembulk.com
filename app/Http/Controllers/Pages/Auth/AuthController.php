<?php

namespace App\Http\Controllers\Pages\Auth;

use App\Http\Controllers\Controller;
use App\Models\Users\Role;
use App\Models\Users\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Mockery\Exception;

class AuthController extends Controller
{
    public function store(Request $request)
    {
        try{
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if (Auth::attempt($credentials, $request->boolean('remember'))) {
                $request->session()->regenerate();
                return redirect()->intended(route('web.home', absolute: false))->with('reload', true);
            }

            throw ValidationException::withMessages([
                'email' => "The provided credentials do not match our records."
            ]);
        }catch (Exception $e){
            throw ValidationException::withMessages([
                'email' => $e->getMessage(),
            ]);
        }
    }

    public function registerStore(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::defaults()],
        ]);

        $data = array_merge($validated, [
            'roles' => Role::where('name', 'user')->pluck('name')->toArray(),
            'status' => User::STATUS_PENDING,
        ]);
        $user = User::create($data);
        Auth::login($user);

        return redirect()->route('web.home');
    }
}
