<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Series extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'description', 'user_id'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($series) {
            $slug = Str::slug($series->title);
            $count = static::whereRaw("slug RLIKE '^{$slug}(-[0-9]+)?$'")->count();
            $series->slug = $count ? "{$slug}-{$count}" : $slug;
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class)->orderBy('created_at', 'asc');
    }
}