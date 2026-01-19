<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('sd_servers', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            $table->string('name');

            $table->string('host');

            $table->tinyInteger('status')->default(0);

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('sd_server_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('server_id');
            $table->foreign('server_id')
                ->references('id')
                ->on('sd_servers')
                ->onDelete('cascade');

            // เช่น sms, sms_otp, email_otp, verify_otp
            $table->string('action_key');

            // HTTP
            $table->string('method')->default('POST');
            $table->string('endpoint'); // /send , /otp/send

            // dynamic config
            $table->json('headers')->nullable();
            $table->json('body')->nullable();
            $table->json('response')->nullable();
            $table->json('settings')->nullable();

            $table->tinyInteger('status')->default(0);

            $table->timestamps();

            $table->unique(['server_id', 'action_key']);
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sd_servers');
        Schema::dropIfExists('sd_server_actions');
    }
};
