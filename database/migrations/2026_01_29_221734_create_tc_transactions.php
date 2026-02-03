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
        Schema::create('tc_banks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();   // SCB, KBANK, BBL, etc.
            $table->string('name');             // ชื่อธนาคาร
            $table->tinyInteger('status')->default(0);
            $table->timestamps();
        });

        Schema::create('tc_providers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('host')->nullable();
            $table->tinyInteger('status')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('tc_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();      // ใช้ UUID เป็น PK
            $table->uuid('user_id');
            $table->uuid('provider_id')->nullable();
            $table->string('provider_name')->nullable();
            $table->uuid('transaction_id')->nullable();
            $table->uuid('plan_id')->nullable();
            $table->uuid('payment_method')->nullable();
            $table->enum('type', ['deposit', 'withdraw']);
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0);
            $table->decimal('net_amount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->boolean('tax_invoice')->default(false);
            $table->string('currency', 10)->default('THB');
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->tinyInteger('status')->default(0);
            $table->timestamps();

            // FK
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('provider_id')->references('id')->on('tc_providers')->onDelete('set null');
            $table->foreign('plan_id')->references('id')->on('sd_plans')->onDelete('set null');
        });

        Schema::create('tc_transaction_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id')->unique();
            $table->uuid('bank_code')->nullable();      // ถ้ามีข้อมูลบัญชีแบงค์
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->text('qr_code')->nullable();      // รูป QR Code
            $table->string('phone_number')->nullable(); // สำหรับ TrueWallet
            $table->json('extra')->nullable(); // เก็บข้อมูลขยายอนาคต (JSON)
            $table->timestamps();

            // FK
            $table->foreign('transaction_id')->references('id')->on('tc_transactions')
                ->onDelete('cascade');
        });

        Schema::create('tc_transaction_callbacks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaction_id')->unique();
            $table->string('event')->nullable();             // ex: payment.completed
            $table->json('payload')->nullable();             // ข้อมูล callback เต็มๆ
            $table->timestamps();

            $table->foreign('transaction_id')->references('id')->on('tc_transactions')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tc_banks');
        Schema::dropIfExists('tc_providers');
        Schema::dropIfExists('tc_transactions');
        Schema::dropIfExists('tc_transaction_details');
        Schema::dropIfExists('tc_transaction_callbacks');
    }
};
