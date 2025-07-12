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

    public function update(Request $request, Comment $comment)
    {
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'You do not have the right to do this action.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $comment->update($request->only('content'));

        return response()->json($comment->load('user:id,name,username'));
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