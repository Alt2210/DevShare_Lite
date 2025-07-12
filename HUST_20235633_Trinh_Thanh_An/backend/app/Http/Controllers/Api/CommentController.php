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
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $comment = $post->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id, 
        ]);

        return response()->json($comment->load('user:id,name,username'), 201);
    }

    public function reply(Request $request, Comment $comment)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $reply = $comment->post->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
            'parent_comment_id' => $comment->id, 
        ]);

        return response()->json($reply->load('user:id,name,username'), 201);
    }

    public function replies()
    {
    return $this->hasMany(Comment::class, 'parent_comment_id')->with('user', 'replies');
    }

}