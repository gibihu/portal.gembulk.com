<?php

namespace Tests\Feature\web;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function testDashboard()
    {
        $this->login();
        $this->get(route('web.dashboard.index'))->assertOk();
    }
}
