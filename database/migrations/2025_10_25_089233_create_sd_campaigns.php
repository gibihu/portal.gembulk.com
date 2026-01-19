<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sd_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('action_key')->default('sms');
            $table->json('receivers')->nullable();
            $table->text('message')->nullable();
            $table->json('data');
            $table->decimal('total_cost', 12,2)->default(0);
            $table->tinyInteger('status')->default(0);
            $table->string('sender_name');
            $table->json('response')->nullable();
            $table->json('response_callback')->nullable();
            $table->json('response_report')->nullable();
            $table->json('response_report_callback')->nullable();

            $table->uuid('sender_id')->nullable();
            $table->foreign('sender_id')->references('id')->on('sd_senders')->onDelete('set null');

            $table->uuid('user_id')->index();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->string('server_name');
            $table->uuid('server_id')->nullable();
            $table->foreign('server_id')->references('id')->on('sd_servers')->onDelete('set null');


            $table->timestamp('sent_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sd_campaigns');
    }
};
