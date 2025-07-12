<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Series;

class SeriesController extends Controller
{
    // Lấy tất cả series (công khai, có phân trang)
    public function publicIndex()
    {
        $series = Series::with('user:id,name,username')
                        ->withCount('posts') // Đếm số bài viết trong mỗi series
                        ->latest()
                        ->paginate(15);
                        
        return response()->json($series);
    }

    // Lấy danh sách series của user đang đăng nhập (dùng cho form tạo bài viết)
    public function userIndex(Request $request)
    {
        $series = $request->user()->series()->latest()->get(['id', 'title']);
        return response()->json($series);
    }

    // Tạo series mới
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $series = $request->user()->series()->create([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json($series, 201);
    }

    public function show(Series $series)
    {
        // Tải các bài viết đã được publish của series, kèm theo thông tin user và tags
        $series->load(['posts' => function ($query) {
            $query->where('status', 1)
                  ->with('user:id,name,username')
                  ->with('tags:id,name');
        }]);

        return response()->json($series);
    }
}