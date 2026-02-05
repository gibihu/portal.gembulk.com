<?php

namespace Tests;

use App\Models\Users\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(); // 👈 Seed ทุกครั้งก่อน test
    }
    protected function login($attributes = [])
    {
        $user = User::factory()->create($attributes);

        $this->actingAs($user);

        return $user;
    }
}
