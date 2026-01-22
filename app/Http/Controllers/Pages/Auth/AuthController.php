<?php

namespace App\Http\Controllers\Pages\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
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
}
