<?php

use App\Http\Controllers\Apis\Admin\Sender\SenderAdminApiController;
use App\Http\Controllers\Apis\Dashs\Sending\SMSApiController;
use App\Http\Controllers\Apis\Plans\PlansApiController;
use App\Http\Controllers\Apis\Senders\SenderApiController;
use App\Http\Controllers\Apis\Servers\ServerApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('api')->name('api.')->group(function () {
    Route::prefix('dashboards')->name('dash.')->group(function () {
        Route::controller(SMSApiController::class)->group(function () {
            Route::prefix('create')->name('create.')->group(function () {
                Route::post('sms', 'create')->name('sms');
            });
            Route::prefix('jobs')->name('job.')->group(function(){
                Route::get('/sms', 'syncJob')->name('sms');
            });
        });
    });

    Route::controller(SenderApiController::class)->prefix('senders')->name('senders.')->group(function () {
        Route::post('/request', 'senderRequest')->name('request');
    });

    Route::controller(PlansApiController::class)->prefix('plans')->name('plans.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(ServerApiController::class)->prefix('servers')->name('servers.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::prefix('admins')->name('admins.')->group(function () {
        Route::controller(SenderAdminApiController::class)->prefix('senders')->name('senders.')->group(function () {
            Route::prefix('requests')->name('requests.')->group(function () {
                Route::post('/actions', 'senderRequestActions')->name('actions');
            });
        });
    });
});
