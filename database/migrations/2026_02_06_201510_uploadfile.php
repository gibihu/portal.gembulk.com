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
        Schema::create('upload_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('path');
            $table->string('name');
            $table->text('full_path');

            $table->json('file_properties')->default('{}');

            $table->uuid('owner_id')->nullable();
            $table->tinyInteger('status')->default(1);

            $table->softDeletes();
            $table->timestamps();
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_files');
    }
};
