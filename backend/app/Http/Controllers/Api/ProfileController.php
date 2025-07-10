<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Hiển thị trang cá nhân của người dùng đã xác thực.
     */
    public function show(Request $request)
    {
        // 1. Lấy thông tin người dùng đang đăng nhập
        $user = $request->user();

        // 2. Lấy danh sách các bài viết đã công khai (published)
        $publishedPosts = $user->posts()
                               ->with('tags:id,name')
                               ->where('status', 1)
                               ->latest()
                               ->paginate(5, ['*'], 'published_page');

        // 3. Lấy danh sách các bài viết nháp (draft)
        $draftPosts = $user->posts()
                           ->with('tags:id,name')
                           ->where('status', 0)
                           ->latest()
                           ->paginate(5, ['*'], 'draft_page');

        // 4. Trả về response tổng hợp
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'published_posts' => $publishedPosts,
            'draft_posts' => $draftPosts,
        ]);
    }
}