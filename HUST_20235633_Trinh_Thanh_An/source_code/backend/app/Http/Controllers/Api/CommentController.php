<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Comment;

class CommentController extends Controller
{
    /**
     * Store a newly created comment for a specific post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Update the specified comment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Comment  $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Comment $comment)
    {
        // Authorize that the user owns the comment
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

    /**
     * Store a reply to a specific comment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Comment  $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function reply(Request $request, Comment $comment)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create a new comment and set its parent to the current comment
        $reply = $comment->post->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
            'parent_comment_id' => $comment->id,
        ]);

        return response()->json($reply->load('user:id,name,username'), 201);
    }

    /**
     * Get all replies for a comment.
     * Note: This method defines a relationship and should typically be in the Comment model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies()
    {
        // This defines the 'hasMany' relationship for nested replies.
        return $this->hasMany(Comment::class, 'parent_comment_id')->with('user', 'replies');
    }

    /**
     * Remove the specified comment from storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Comment  $comment
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Comment $comment)
    {
        // Authorize that the user owns the comment
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'You do not have the right to do this action.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Successfully deleted comment.'], 200);
    }
}