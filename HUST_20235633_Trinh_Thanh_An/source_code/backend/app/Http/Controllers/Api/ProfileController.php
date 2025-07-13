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
    /**
     * Update the authenticated user's profile information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            // Username and email must be unique, but ignore the current user's own records
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);
        
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Update the user with validated data
        $user->update($validator->validated());

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user
        ]);
    }

    /**
     * Display the specified user's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user The user whose profile is being viewed.
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, User $user)
    {
        // Eager load the user's published posts with their author and tags
        $user->load(['posts' => function ($query) {
            $query->where('status', 1) // Only published posts
                  ->with('user:id,name,username') 
                  ->with('tags:id,name')
                  ->latest();
        }]);

        // Get the currently authenticated user, if any
        $authUser = $request->user('sanctum');

        // If the authenticated user is viewing their own profile, also load their drafts
        if ($authUser && $authUser->id === $user->id) {
            $user->load(['drafts' => function ($query) {
                $query->with('user:id,name,username') 
                      ->with('tags:id,name')
                      ->latest();
            }]);
        }

        // Add follower and following counts to the user object
        $user->followers_count = $user->followers()->count();
        $user->following_count = $user->following()->count();

        // Check if the authenticated user is following the profile user
        if ($authUser) {
            $user->is_followed_by_auth_user = $user->isFollowedBy($authUser);
        } else {
            // Default to false for guests
            $user->is_followed_by_auth_user = false;
        }

        return response()->json($user);
    }

    /**
     * Update the authenticated user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        // Validate the password fields
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed', // 'confirmed' checks for a 'password_confirmation' field
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Check if the provided current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 422);
        }

        // Hash and save the new password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Get a paginated list of posts saved by the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function savedPosts(Request $request)
    {
        $user = $request->user();

        // Retrieve saved posts, eager loading relations for efficiency
        $savedPosts = $user->savedPosts()
                           ->with(['user:id,name,username', 'tags:id,name']) 
                           ->latest() 
                           ->paginate(10);

        return response()->json($savedPosts);
    }

    /**
     * Get a list of popular users (skaters) based on a trending score of their posts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function popularSkaters()
    {
        $gravity = 1.8; // Time decay factor

        // Subquery to calculate a trending score for each post from the last 30 days
        $postScores = DB::table('posts')
            ->select(
                'posts.user_id',
                DB::raw(
                    sprintf(
                        // The same trending algorithm as in PostController
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

        // Main query to sum up the post scores for each user
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
            ->havingRaw('total_trending_score > 0') // Only include users with a positive score
            ->limit(6) // Get the top 6
            ->get();

        return response()->json($popularUsers);
    }

    /**
     * Follow a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user The user to follow.
     * @return \Illuminate\Http\JsonResponse
     */
    public function follow(Request $request, User $user)
    {
        $follower = $request->user();

        // Prevent a user from following themselves
        if ($follower->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }
        // Attach the follow relationship without detaching existing ones
        $follower->following()->syncWithoutDetaching($user->id);

        // Notify the user about the new follower
        $user->notify(new NewFollower($follower));

        return response()->json(['message' => 'Successfully followed.']);
    }

    /**
     * Unfollow a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user The user to unfollow.
     * @return \Illuminate\Http\JsonResponse
     */
    public function unfollow(Request $request, User $user)
    {
        $follower = $request->user();
        // Detach the follow relationship
        $follower->following()->detach($user->id);
        return response()->json(['message' => 'Successfully unfollowed.']);
    }

    
    /**
     * Get a paginated list of the authenticated user's followers.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function followers(Request $request)
    {
        $user = $request->user();
        return response()->json($user->followers()->paginate(15));
    }

    /**
     * Get a paginated list of users the authenticated user is following.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function following(Request $request)
    {
        $user = $request->user();
        return response()->json($user->following()->paginate(15));
    }

    /**
     * Toggle the follow status for a user.
     *
     * @param \Illuminate\Http\Request $request
     * @param User $user The user to follow or unfollow.
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleFollow(Request $request, User $user)
    {
        $follower = $request->user();

        // Prevent a user from following themselves
        if ($follower->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 422);
        }

        // Check if the authenticated user is already following the target user
        $isFollowing = $follower->following()->where('user_id', $user->id)->exists();

        if ($isFollowing) {
            // If already following, unfollow them
            $follower->following()->detach($user->id);
            $message = 'Successfully unfollowed.';
        } else {
            // If not following, follow them and send a notification
            $follower->following()->attach($user->id);
            $user->notify(new NewFollower($follower));
            $message = 'Successfully followed.';
        }

        return response()->json(['message' => $message]);
    }
}
