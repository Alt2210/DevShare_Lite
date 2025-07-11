<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Hiển thị trang cá nhân của người dùng đã xác thực.
     */
    /*public function show(Request $request)
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
    }*/

    public function show(User $user)
    {
        // Tải danh sách các bài viết của người dùng này,
        // chỉ lấy các bài đã publish (status = 1)
        $user->load(['posts' => function ($query) {
            $query->where('status', 1)->with('tags:id,name')->latest();
        }]);

        return response()->json($user);
    }


    public function savedPosts(Request $request)
    {
        // Lấy người dùng đã xác thực
        $user = $request->user();

        // Lấy danh sách bài viết đã lưu qua relationship đã tạo
        // và phân trang kết quả
        $savedPosts = $user->savedPosts()
                        ->with(['user:id,name,username', 'tags:id,name']) // Lấy thêm thông tin user và tags
                        ->latest() // Sắp xếp theo thứ tự mới nhất
                        ->paginate(10);

        return response()->json($savedPosts);
    }
}