<?php

namespace App\Http\Middleware;

use App\Models\Users\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserVerificationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if(empty($user->verified_at)) {
            return redirect()->route('web.dashboard.users.verify');
        }
        return $next($request);
    }
}
