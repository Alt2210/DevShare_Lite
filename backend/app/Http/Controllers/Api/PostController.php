<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
                    ->where('status', 1)
                    ->latest()
                    ->paginate(10);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|integer|in:0,1',
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:50',
            'series_id' => 'nullable|exists:series,id,user_id,' . $request->user()->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = $request->user()->posts()->create($validator->validated());

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json($post->load('tags'), 201);
    }

    public function show(Request $request, Post $post)
    {
        if ($post->status == 0) {
            if (!$request->user('sanctum') || $request->user('sanctum')->id !== $post->user_id) {
                return response()->json(['message' => 'Không tìm thấy bài viết.'], 404);
            }
        }

        // Đảm bảo các quan hệ quan trọng luôn được tải
        $post->load([
            'user:id,name,username', // <-- DÒNG QUAN TRỌNG NHẤT
            'tags:id,name',
            'comments' => function ($query) {
                $query->whereNull('parent_comment_id')->with('user:id,name,username', 'replies');
            },
            'series' => function ($query) {
                $query->with('posts:id,title,series_id')->select('id', 'title', 'slug');
            }
        ]);

        $post->likes_count = $post->likes()->count();

        if ($user = $request->user('sanctum')) {
            $post->is_liked_by_user = $post->likes()->where('user_id', $user->id)->exists();
            $post->is_saved_by_user = $user->savedPosts()->where('post_id', $post->id)->exists();
        } else {
            $post->is_liked_by_user = false;
            $post->is_saved_by_user = false;
        }

        return response()->json($post);
    }

    public function update(Request $request, Post $post)
    {
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'You do not have right to do this action.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|required|integer|in:0,1',
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:50',
            'series_id' => 'nullable|exists:series,id,user_id,' . $request->user()->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post->update($validator->validated());

        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        return response()->json($post->load(['user:id,name,username', 'tags:id,name', 'series']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Post $post)
    {
        // 1. Phân quyền: Kiểm tra người dùng có phải là chủ bài viết không
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'You do not have right to do this action.'], 403);
        }

        // 2. Xóa bài viết
        $post->delete();

        // 3. Trả về response thành công
        return response()->json(['message' => 'Successfully deleted post.'], 200);
    }

    public function search(Request $request)
    {
        // 1. Validate search query
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $searchTerm = $request->q;

        // 2. Tìm kiếm bài viết (Posts)
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
            ->where('status', 1) // Chỉ tìm trong các bài đã publish
            ->where(function ($query) use ($searchTerm) {
                $query->where('title', 'like', '%' . $searchTerm . '%')
                      ->orWhere('content', 'like', '%' . $searchTerm . '%');
            })
            ->latest()
            ->paginate(5, ['*'], 'posts_page'); // Phân trang cho posts

        // 3. Tìm kiếm người dùng (Users)
        $users = User::where('name', 'like', '%' . $searchTerm . '%')
                     ->orWhere('username', 'like', '%' . $searchTerm . '%')
                     ->paginate(5, ['id', 'name', 'username'], 'users_page'); // Phân trang cho users

        // 4. Trả về kết quả tổng hợp
        return response()->json([
            'posts' => $posts,
            'users' => $users,
        ]);
    }

    public function toggleLike(Request $request, Post $post)
    {
        $like = $post->likes()->where('user_id', $request->user()->id)->first();

        if ($like) {
            $like->delete();
            return response()->json(['message' => 'Unliked']);
        } else {
            $post->likes()->create(['user_id' => $request->user()->id]);
            return response()->json(['message' => 'Liked']);
        }
    }

    public function toggleSave(Request $request, Post $post)
    {
        // 'toggle' sẽ tự động thêm hoặc xóa record trong bảng trung gian
        $request->user()->savedPosts()->toggle($post->id);

        $isSaved = $request->user()->savedPosts()->where('post_id', $post->id)->exists();

        return response()->json([
            'message' => $isSaved ? 'Saved' : 'Unsaved',
            'is_saved' => $isSaved
        ]);
    }

    public function trending()
    {
        $gravity = 1.8;

        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
            ->select('posts.*')
            ->selectSub(
                // Công thức tính điểm mới, an toàn hơn
                sprintf(
                    '(COUNT(DISTINCT likes.id) * 1 + COUNT(DISTINCT comments.id) * 2 + COUNT(DISTINCT post_saves.id) * 3 - 1) / POW(((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(posts.created_at)) / 3600) + 2, %F)',
                    $gravity
                ),
                'trending_score'
            )
            ->leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
            ->leftJoin('post_saves', 'posts.id', '=', 'post_saves.post_id')
            ->where('posts.status', 1)
            ->whereNotNull('posts.created_at') // Thêm điều kiện này để đảm bảo an toàn
            ->where('posts.created_at', '>=', now()->subDays(7)) 
            ->groupBy('posts.id') 
            ->orderBy('trending_score', 'desc')
            ->paginate(10);
        
        return response()->json($posts);
    }

    public function popular()
    {
        $likesSubquery = '(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)';
        $savesSubquery = '(SELECT COUNT(*) FROM post_saves WHERE post_saves.post_id = posts.id)';

        $posts = Post::select(
            'posts.id',
            'posts.title',
            // Không còn cột 'slug' ở đây
            DB::raw("$likesSubquery as likes_count"),
            DB::raw("$savesSubquery as saves_count")
        )
        ->where('status', 1) // Chỉ lấy các bài đã published
        // Sắp xếp trực tiếp bằng công thức để đảm bảo hoạt động trên mọi DB
        ->orderByRaw("($likesSubquery + $savesSubquery) DESC")
        ->limit(5)
        ->get();

        return response()->json($posts);
    }
}
