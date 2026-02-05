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
        Schema::create('sd_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('description')->nullable();
            $table->text('details')->nullable();
            $table->decimal('price', 24, 2)->default(0);
            $table->string('currency')->default('THB');
            $table->bigInteger('credit_limit')->default(0);
            $table->unsignedInteger('orders')->default(0);
            $table->json('options')->nullable();
            $table->decimal('more_than', 12,2)->default(0);
            $table->decimal('tax_rate', 12,2)->default(0);
            $table->string('tax_type')->default('vat');
            $table->string('fee_label')->default('Platform Fee');
            $table->decimal('fee_rate', 12,2)->default(0);
            $table->string('fee_type')->default('percent');

            $table->text('custom_plans')->nullable();

            $table->integer('duration')->default(0);
            $table->integer('duration_unit')->default(1); // 1 = 1 วิ
            $table->boolean('recommended')->default(false);

            $table->json('servers')->nullable();

            $table->tinyInteger('status')->default(0);
            $table->integer('public')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sd_plans');
    }
};
