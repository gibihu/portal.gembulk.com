<?php

namespace Tests\Feature\web;

use App\Models\Users\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class WebTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_can_register()
    {
        $data = [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password123',
            'role' => ['user'],
        ];

        $this->post(route('web.register.store'), $data);


        // 2. เช็คว่ามีใน DB จริง
        $this->assertDatabaseHas('users', [
            'email' => $data['email'],
        ]);

        // ✅ ดึง user จาก DB
        $user = User::where('email', $data['email'])->first();

        // ✅ เช็คว่าล็อกอินอยู่จริง
        $this->assertAuthenticatedAs($user);
    }

    public function test_can_login()
    {

    }
}
