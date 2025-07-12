<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Notifications\NewFollower;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);
        
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user' => $user
        ]);
    }

    public function show(Request $request, User $user)
    {
        // Tải các bài viết đã xuất bản, KÈM THEO user và tags
        $user->load(['posts' => function ($query) {
            $query->where('status', 1)
                ->with('user:id,name,username') // <-- DÒNG QUAN TRỌNG
                ->with('tags:id,name')
                ->latest();
        }]);

        $authUser = $request->user('sanctum');

        // Nếu là chủ profile, tải thêm các bài nháp, KÈM THEO user và tags
        if ($authUser && $authUser->id === $user->id) {
            $user->load(['drafts' => function ($query) {
                $query->with('user:id,name,username') // <-- DÒNG QUAN TRỌNG
                    ->with('tags:id,name')
                    ->latest();
            }]);
        }

        // Đếm số người theo dõi và đang theo dõi
        $user->followers_count = $user->followers()->count();
        $user->following_count = $user->following()->count();

        // Kiểm tra trạng thái follow
        if ($authUser) {
            $user->is_followed_by_auth_user = $user->isFollowedBy($authUser);
        } else {
            $user->is_followed_by_auth_user = false;
        }

        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function savedPosts(Request $request)
    {
        $user = $request->user();

        $savedPosts = $user->savedPosts()
                        ->with(['user:id,name,username', 'tags:id,name']) 
                        ->latest() 
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
                       
                        '((COUNT(DISTINCT likes.id) * 1 + COUNT(DISTINCT comments.id) * 2 + COUNT(DISTINCT post_saves.id) * 3 - 1) / POW(((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(posts.created_at)) / 3600) + 2, %F)) as score',
                        $gravity
                    )
                )
            )
            ->leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
            ->leftJoin('post_saves', 'posts.id', '=', 'post_saves.post_id')
            ->where('posts.status', 1)
            ->whereNotNull('posts.created_at') 
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

    public function unfollow(Request $request, User $user)
    {
        $follower = $request->user();
        $follower->following()->detach($user->id);
        return response()->json(['message' => 'Đã bỏ theo dõi.']);
    }

   
    public function followers(Request $request)
    {
        $user = $request->user();
        return response()->json($user->followers()->paginate(15));
    }

    public function following(Request $request)
    {
        $user = $request->user();
        return response()->json($user->following()->paginate(15));
    }
}