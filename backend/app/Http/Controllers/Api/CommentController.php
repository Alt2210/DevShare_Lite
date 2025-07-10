<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        // 1. Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Tạo bình luận mới
        $comment = $post->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id, // Lấy id của user đang đăng nhập
        ]);

        // 3. Trả về response, kèm theo thông tin user đã bình luận
        return response()->json($comment->load('user:id,name,username'), 201);
    }

    public function reply(Request $request, Comment $comment)
    {
        // 1. Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Tạo bình luận trả lời
        // Dùng quan hệ post->comments() để tự động gán post_id
        $reply = $comment->post->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
            'parent_comment_id' => $comment->id, // Gán ID của bình luận cha
        ]);

        // 3. Trả về response
        return response()->json($reply->load('user:id,name,username'), 201);
    }

    public function replies()
    {
    // Tự động load thêm user và các replies của replies (đệ quy)
    return $this->hasMany(Comment::class, 'parent_comment_id')->with('user', 'replies');
    }

}
