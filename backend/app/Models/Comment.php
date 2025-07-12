<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['content', 'user_id', 'post_id', 'parent_comment_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // Lấy bình luận cha
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_comment_id');
    }

    // Lấy các bình luận con (replies)
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_comment_id')->with('user:id,name,username', 'replies');
    }
}
