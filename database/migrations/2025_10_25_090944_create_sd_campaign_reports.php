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
        Schema::create('sd_campaign_receivers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('receiver', 20);
            $table->string('sender_name');
            $table->text('message')->nullable();
            $table->string('response')->nullable();
            $table->integer('cost')->default(0);
            $table->string('action_key')->default('sms');
            $table->timestamp('sent_at')->nullable();
            $table->json('response_report')->nullable();

            $table->uuid('campaign_id')->index();
            $table->foreign('campaign_id')->references('id')->on('sd_campaigns')->onDelete('cascade');

            $table->tinyInteger('status')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sd_campaign_receivers');
    }
};
