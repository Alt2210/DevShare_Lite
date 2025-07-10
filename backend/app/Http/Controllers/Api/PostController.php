<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
     public function index()
    {
        // Lấy các bài viết có status = 1 (published)
        // Dùng with() để eager loading, tránh lỗi N+1 query
        // latest() để sắp xếp theo thứ tự mới nhất
        // paginate() để phân trang
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
                    ->where('status', 1)
                    ->latest()
                    ->paginate(10);

        return response()->json($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|integer|in:0,1', // 0 for draft, 1 for published
            'tags' => 'sometimes|array', // 'tags' là không bắt buộc, nhưng nếu có phải là một mảng
            'tags.*' => 'string|max:50' // Mỗi phần tử trong mảng 'tags' phải là một chuỗi
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Tạo bài viết
        $post = $request->user()->posts()->create([
            'title' => $request->title,
            'content' => $request->content,
            'status' => $request->status,
        ]);

        // 3. Xử lý Tags
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                // Tìm tag, nếu không có thì tạo mới
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            // Gắn các tag vào bài viết thông qua bảng trung gian
            $post->tags()->sync($tagIds);
        }

        // 4. Trả về response, kèm theo cả các tags đã được gắn
        return response()->json($post->load('tags'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
{
    if ($post->status == 0 && auth()->id() !== $post->user_id) {
        return response()->json(['message' => 'Không tìm thấy bài viết.'], 404);
    }

    // Tải tất cả các mối quan hệ cần thiết một cách tường minh
    $post->load([
        'user:id,name,username',
        'tags:id,name',
        // Lấy các bình luận gốc và user của chúng
        'comments' => function ($query) {
            $query->whereNull('parent_comment_id');
        },
        'comments.user:id,name,username',
        // Lấy các bình luận con và user của chúng (đây là phần quan trọng)
        'comments.replies.user:id,name,username',
        // Nếu muốn đệ quy sâu hơn nữa (trả lời của trả lời)
        'comments.replies.replies.user:id,name,username',
    ]);

    return response()->json($post);
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // 1. Phân quyền: Kiểm tra người dùng có phải là chủ bài viết không
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'You do not have right to do this action.'], 403);
        }

        // 2. Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|required|integer|in:0,1',
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 3. Cập nhật bài viết
        $post->update($validator->validated());

        // 4. Cập nhật Tags (nếu có)
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            $post->tags()->sync($tagIds);
        }

        // 5. Trả về response
        return response()->json($post->load(['user:id,name,username', 'tags:id,name']));
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

        // 2. Thực hiện tìm kiếm
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
            ->where('status', 1) // Chỉ tìm trong các bài đã publish
            ->where(function ($query) use ($searchTerm) {
                // Tìm kiếm trong cả title và content
                $query->where('title', 'like', '%' . $searchTerm . '%')
                      ->orWhere('content', 'like', '%' . $searchTerm . '%');
            })
            ->latest()
            ->paginate(10);

        return response()->json($posts);
    }
}
