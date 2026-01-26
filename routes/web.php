<?php

use App\Http\Controllers\Pages\Auth\AuthController;
use App\Http\Controllers\Pages\Dashs\WebDashAdminPageController;
use App\Http\Controllers\Pages\Dashs\WebDashPageController;
use App\Http\Controllers\Pages\WebPageController;
use App\Http\Controllers\Tests\CronjobTestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::name('web.')->group(function () {

    Route::controller(AuthController::class)->group(function () {
        Route::prefix('login')->name('login.')->group(function () {
            Route::post('/', 'store')->name('store');
        });
        Route::prefix('register')->name('register.')->group(function () {
            Route::post('/', 'registerStore')->name('store');
        });
    });

    Route::middleware(['auth'])->group(function () {
        Route::controller(WebDashPageController::class)->group(function () {
            Route::get('/', 'index')->name('home');
        });

        Route::prefix('dashboard')->name('dashboard.')->group(function () {
            Route::controller(WebDashPageController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::prefix('senders')->name('senders.')->group(function () {
                    Route::get('add', 'senderAdd')->name('add');
                });
                Route::prefix('sending')->name('sending.')->group(function () {
                    Route::prefix('sms')->name('sms.')->group(function () {
                        Route::get('add', 'smsAdd')->name('add');
                    });
                    Route::get('otp', 'sendingOTP')->name('otp');
                });
                Route::prefix('jobs')->name('jobs.')->group(function () {
                    Route::get('sms', 'jobSMS')->name('sms');
                    Route::get('otp', 'jobOTP')->name('otp');
                });
                Route::prefix('reports')->name('report.')->group(function () {
                    Route::get('sms', 'reportSMS')->name('sms');
                    Route::get('otp', 'reportOTP')->name('otp');
                });
                Route::prefix('campaigns')->name('campaigns.')->group(function () {
                    Route::get('reports', 'reportCampaigns')->name('reports');
                });
                Route::prefix('otp')->name('otp.')->group(function () {
//                    Route::get('template', 'templateOTP')->name('template');
                });
                Route::prefix('plans')->name('plans.')->group(function () {
                    Route::get('/', 'plansIndex')->name('index');
                    Route::get('/pay/{id}', 'plansPayment')->name('payment');
                    Route::get('/{id}', 'preview')->name('preview');
                });
                Route::prefix('api')->name('api.')->group(function () {
                    Route::get('/', 'apiIndex')->name('index');
                });
            });

            Route::controller(WebDashAdminPageController::class)->prefix('admins')->name('admins.')->group(function () {
                Route::prefix('senders')->name('senders.')->group(function () {
                    Route::get('requests', 'senderRequests')->name('requests');
                });

                Route::prefix('server')->name('server.')->group(function () {
                    Route::prefix('store')->name('store.')->group(function () {
                        Route::get('add', 'serverStoreAdd')->name('add');
                        Route::get('{id}', 'serverStoreEdit')->name('edit');
                    });
                    Route::get('lists', 'serverLists')->name('lists');
                });

                Route::prefix('plans')->name('plans.')->group(function () {
                    Route::get('/', 'plansIndex')->name('index');
                    Route::get('add', 'plansAdd')->name('add');
                    Route::get('edit/{id}', 'plansEdit')->name('edit');
                });
            });
        });
    });
});

Route::controller(CronjobTestController::class)->prefix('test')->name('test.')->group(function () {
    Route::prefix('cronjob')->name('cronjob.')->group(function () {
        Route::prefix('sending')->name('sending.')->group(function () {
            Route::prefix('sms')->name('sms.')->group(function () {
                Route::get('/', 'sendingSMS')->name('index');
                Route::get('reports', 'ReportSMS')->name('reports');
            });
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/apis/index.php';
require __DIR__.'/apis/auth.php';
