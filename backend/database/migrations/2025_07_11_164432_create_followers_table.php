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
        Schema::create('followers', function (Blueprint $table) {
            $table->id();
            // Người được theo dõi (followed user)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Người đi theo dõi (follower)
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Đảm bảo mỗi cặp user_id và follower_id là duy nhất
            $table->unique(['user_id', 'follower_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('followers');
    }
};