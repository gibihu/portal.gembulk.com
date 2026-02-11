<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

//Artisan::command('inspire', function () {
//    $this->comment(Inspiring::quote());
//})->purpose('Display an inspiring quote');

Schedule::command('app:send-sms')->everyMinute()->withoutOverlapping();
Schedule::command('app:send-sms-report')->everyFiveMinutes()->withoutOverlapping();

Schedule::command('app:send-otp')->everyFiveSeconds()->withoutOverlapping();
Schedule::command('app:send-otp-report')->everyMinute()->withoutOverlapping();

Schedule::command('app:payment-hook')->everySecond()->withoutOverlapping();
