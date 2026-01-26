<?php

use App\Http\Controllers\Apis\Admins\Plans\PlanAdminApiController;
use App\Http\Controllers\Apis\Admins\Sender\SenderAdminApiController;
use App\Http\Controllers\Apis\Admins\Servers\ServerAdminApiController;
use App\Http\Controllers\Apis\ApiKeyController;
use App\Http\Controllers\Apis\Dashs\Sending\SMSApiController;
use App\Http\Controllers\Apis\Plans\PlansApiController;
use App\Http\Controllers\Apis\Senders\SenderApiController;
use App\Http\Controllers\Apis\Servers\ServerApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('api')->name('api.')->group(function () {

    Route::controller(SMSApiController::class)->group(function () {
        Route::prefix('sms')->name('sms.')->group(function () {
            Route::post('create', 'create')->name('create');
        });
        Route::prefix('jobs')->name('job.')->group(function(){
            Route::get('/sms', 'syncJob')->name('sms');
        });
    });

    Route::controller(SenderApiController::class)->prefix('senders')->name('senders.')->group(function () {
        Route::post('/request', 'senderRequest')->name('request');
        Route::post('/status', 'senderStatus')->name('status');
        Route::delete('/delete', 'senderDelete')->name('delete');
    });

    Route::controller(PlansApiController::class)->prefix('plans')->name('plans.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{id}', 'show')->name('show');
    });

    Route::controller(ServerApiController::class)->prefix('servers')->name('servers.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(ApiKeyController::class)->prefix('keys')->name('keys.')->group(function () {
        Route::get('/generate', 'generate')->name('generate');
        Route::post('/store', 'store')->name('store');
    });

    Route::prefix('admins')->name('admins.')->group(function () {
        Route::controller(SenderAdminApiController::class)->prefix('senders')->name('senders.')->group(function () {
            Route::prefix('requests')->name('requests.')->group(function () {
                Route::post('/actions', 'senderRequestActions')->name('actions');
                Route::delete('/destroy', 'destroy')->name('destroy');
            });
        });

        Route::controller(ServerAdminApiController::class)->prefix('servers')->name('servers.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/store', 'store')->name('store');
            Route::delete('/destroy', 'destroy')->name('destroy');
        });

        Route::controller(PlanAdminApiController::class)->prefix('plans')->name('plans.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/store', 'store')->name('store');
        });
    });
});
