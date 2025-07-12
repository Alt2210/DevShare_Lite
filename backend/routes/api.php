<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SeriesController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/popular', [PostController::class, 'popular']);
Route::get('/trending', [PostController::class, 'trending']);
Route::get('/posts/{post}', [PostController::class, 'show']);

Route::get('/search', [PostController::class, 'search']);

Route::get('/profiles/{user:username}', [ProfileController::class, 'show']);

Route::get('/series', [SeriesController::class, 'publicIndex']);
Route::get('/series/{series:slug}', [SeriesController::class, 'show']);

Route::get('/popular-skaters', [ProfileController::class, 'popularSkaters']);
Route::get('/profile/{user:username}', [ProfileController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    // Thêm các route cần bảo vệ khác ở đây

    Route::put('/profile/settings', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user/series', [SeriesController::class, 'userIndex']);
    Route::post('/series', [SeriesController::class, 'store']);
    
    Route::post('/posts/{post}/toggle-like', [PostController::class, 'toggleLike']);
    Route::post('/posts/{post}/toggle-save', [PostController::class, 'toggleSave']);
    Route::get('/profile/saved-posts', [ProfileController::class, 'savedPosts']);

    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/replies', [CommentController::class, 'reply']);

    Route::post('/profiles/{user:username}/follow', [ProfileController::class, 'follow']);
    Route::delete('/profiles/{user:username}/unfollow', [ProfileController::class, 'unfollow']);
    Route::get('/profile/following', [ProfileController::class, 'following']);
    Route::get('/profile/followers', [ProfileController::class, 'followers']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});