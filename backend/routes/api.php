<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/logout', [AuthController::class, 'logout']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);

Route::get('/search', [PostController::class, 'search']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Thêm các route cần bảo vệ khác ở đây

    Route::post('/posts/{post}/toggle-like', [PostController::class, 'toggleLike']);
    Route::post('/posts/{post}/toggle-save', [PostController::class, 'toggleSave']);
    Route::get('/posts/trending', [PostController::class, 'trending']);

    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/replies', [CommentController::class, 'reply']);

    Route::get('/profile', [ProfileController::class, 'show']);
});