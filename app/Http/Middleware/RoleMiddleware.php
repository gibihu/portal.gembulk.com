<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed ...$roles  // รับ role หลายตัว
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            // ถ้าไม่ login
            return redirect()->route('login');
        }

        // สมมติ User model มี accessor ->roles_text
        $userRoles = $user->roles; // ['user','admin','dev']

        // เช็คว่ามี role ตรงกับที่กำหนดไหม
        if (!array_intersect($roles, $userRoles)) {
            abort(403, 'Unauthorized.'); // หรือ redirect ไปหน้าอื่น
        }

        return $next($request);
    }
}
