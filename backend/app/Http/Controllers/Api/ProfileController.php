<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Notifications\NewFollower;

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

    public function popularSkaters()
    {
        $gravity = 1.8;

        $postScores = DB::table('posts')
            ->select(
                'posts.user_id',
                DB::raw(
                    sprintf(
                        // Sử dụng công thức tính toán an toàn hơn
                        '((COUNT(DISTINCT likes.id) * 1 + COUNT(DISTINCT comments.id) * 2 + COUNT(DISTINCT post_saves.id) * 3 - 1) / POW(((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(posts.created_at)) / 3600) + 2, %F)) as score',
                        $gravity
                    )
                )
            )
            ->leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
            ->leftJoin('post_saves', 'posts.id', '=', 'post_saves.post_id')
            ->where('posts.status', 1)
            ->whereNotNull('posts.created_at') // Thêm điều kiện này
            ->where('posts.created_at', '>=', now()->subDays(30))
            ->groupBy('posts.id', 'posts.user_id', 'posts.created_at');

        $popularUsers = DB::table('users')
            ->select(
                'users.id',
                'users.name',
                'users.username',
                DB::raw('SUM(post_scores.score) as total_trending_score')
            )
            ->joinSub($postScores, 'post_scores', function ($join) {
                $join->on('users.id', '=', 'post_scores.user_id');
            })
            ->groupBy('users.id', 'users.name', 'users.username')
            ->orderByDesc('total_trending_score')
            ->havingRaw('total_trending_score > 0') 
            ->limit(6)
            ->get();

        return response()->json($popularUsers);
    }

    /**
     * Theo dõi một người dùng.
     */
    public function follow(Request $request, User $user)
    {
        $follower = $request->user();

        if ($follower->id === $user->id) {
            return response()->json(['message' => 'Bạn không thể tự theo dõi chính mình.'], 422);
        }
        $follower->following()->syncWithoutDetaching($user->id);

        $user->notify(new NewFollower($follower));

        return response()->json(['message' => 'Đã theo dõi thành công.']);
    }

    /**
     * Bỏ theo dõi một người dùng.
     */
    public function unfollow(Request $request, User $user)
    {
        $follower = $request->user();
        $follower->following()->detach($user->id);
        return response()->json(['message' => 'Đã bỏ theo dõi.']);
    }

    /**
     * Lấy danh sách những người đang theo dõi người dùng đã xác thực.
     */
    public function followers(Request $request)
    {
        $user = $request->user();
        return response()->json($user->followers()->paginate(15));
    }

    /**
     * Lấy danh sách những người mà người dùng đã xác thực đang theo dõi.
     */
    public function following(Request $request)
    {
        $user = $request->user();
        return response()->json($user->following()->paginate(15));
    }
}