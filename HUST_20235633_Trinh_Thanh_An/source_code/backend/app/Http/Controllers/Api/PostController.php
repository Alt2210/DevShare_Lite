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
     * Display a paginated list of published posts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch posts that have status '1' (published)
        // Eager load user and tags for efficiency
        // Order by the latest posts first
        // Paginate the results, 10 per page
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
                      ->where('status', 1)
                      ->latest()
                      ->paginate(10);

        return response()->json($posts);
    }

    /**
     * Store a newly created post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|integer|in:0,1', // 0 for draft, 1 for published
            'tags' => 'sometimes|array', // Tags are optional
            'tags.*' => 'string|max:50', // Each tag must be a string
            'series_id' => 'nullable|exists:series,id,user_id,' . $request->user()->id, // Series must exist and belong to the user
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Create the post associated with the authenticated user
        $post = $request->user()->posts()->create($validator->validated());

        // Handle tags if they are provided
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                // Find the tag or create it if it doesn't exist
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            // Sync the tags with the post
            $post->tags()->sync($tagIds);
        }

        // Return the created post with its tags, with a 201 Created status
        return response()->json($post->load('tags'), 201);
    }

    /**
     * Display the specified post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, Post $post)
    {
        // If the post is a draft (status 0), only the owner can see it
        if ($post->status == 0) {
            if (!$request->user('sanctum') || $request->user('sanctum')->id !== $post->user_id) {
                return response()->json(['message' => 'Post not found.'], 404);
            }
        }

        // Eager load related data for the post
        $post->load([
            'user:id,name,username',
            'tags:id,name',
            'comments' => function ($query) {
                // Load only top-level comments and their nested replies
                $query->whereNull('parent_comment_id')->with('user:id,name,username', 'replies');
            },
            'series' => function ($query) {
                // Load the series and its related posts (only id and title)
                $query->with('posts:id,title,series_id')->select('id', 'title', 'slug');
            }
        ]);

        // Add the total likes count to the post object
        $post->likes_count = $post->likes()->count();

        // Check if the current authenticated user has liked or saved the post
        if ($user = $request->user('sanctum')) {
            $post->is_liked_by_user = $post->likes()->where('user_id', $user->id)->exists();
            $post->is_saved_by_user = $user->savedPosts()->where('post_id', $post->id)->exists();
        } else {
            // Default to false for guests
            $post->is_liked_by_user = false;
            $post->is_saved_by_user = false;
        }

        return response()->json($post);
    }

    /**
     * Update the specified post in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Post $post)
    {
        // Authorize that the current user owns the post
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'You do not have the right to do this action.'], 403);
        }

        // Validate the incoming data. 'sometimes' means validate only if present.
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

        // Update the post with validated data
        $post->update($validator->validated());

        // Handle tag updates if provided
        if ($request->has('tags')) {
            $tagIds = [];
            foreach ($request->tags as $tagName) {
                $tag = Tag::firstOrCreate(['name' => trim($tagName)]);
                $tagIds[] = $tag->id;
            }
            // Sync tags, removing any that are no longer associated
            $post->tags()->sync($tagIds);
        }

        // Return the updated post with its relations
        return response()->json($post->load(['user:id,name,username', 'tags:id,name', 'series']));
    }

    /**
     * Remove the specified post from storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Post $post)
    {
        // Authorize that the current user owns the post
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'You do not have the right to do this action.'], 403);
        }

        // Delete the post
        $post->delete();

        return response()->json(['message' => 'Successfully deleted post.'], 200);
    }

    /**
     * Search for posts and users.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        // Validate the search query
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $searchTerm = $request->q;

        // Search for published posts where title or content matches the search term
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
            ->where('status', 1) 
            ->where(function ($query) use ($searchTerm) {
                $query->where('title', 'like', '%' . $searchTerm . '%')
                      ->orWhere('content', 'like', '%' . $searchTerm . '%');
            })
            ->latest()
            ->paginate(5, ['*'], 'posts_page'); // Paginate with a custom page name

        // Search for users where name or username matches the search term
        $users = User::where('name', 'like', '%' . $searchTerm . '%')
                       ->orWhere('username', 'like', '%' . $searchTerm . '%')
                       ->paginate(5, ['id', 'name', 'username'], 'users_page'); // Paginate with a custom page name

        return response()->json([
            'posts' => $posts,
            'users' => $users,
        ]);
    }

    /**
     * Toggle the like status for a post by the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleLike(Request $request, Post $post)
    {
        // Find if a like from this user already exists for this post
        $like = $post->likes()->where('user_id', $request->user()->id)->first();

        if ($like) {
            // If it exists, delete it (unlike)
            $like->delete();
            return response()->json(['message' => 'Unliked']);
        } else {
            // If it doesn't exist, create it (like)
            $post->likes()->create(['user_id' => $request->user()->id]);
            return response()->json(['message' => 'Liked']);
        }
    }

    /**
     * Toggle the save status for a post by the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleSave(Request $request, Post $post)
    {
        // Attach or detach the post from the user's saved posts list
        $request->user()->savedPosts()->toggle($post->id);

        // Check the new saved status to return it in the response
        $isSaved = $request->user()->savedPosts()->where('post_id', $post->id)->exists();

        return response()->json([
            'message' => $isSaved ? 'Saved' : 'Unsaved',
            'is_saved' => $isSaved
        ]);
    }

    /**
     * Get a list of trending posts based on a scoring algorithm.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function trending()
    {
        // Gravity factor for the trending algorithm (time decay)
        $gravity = 1.8;

        // This query calculates a 'trending_score' for each post
        // Score = (Likes*1 + Comments*2 + Saves*3 - 1) / (TimeInHours + 2)^Gravity
        $posts = Post::with(['user:id,name,username', 'tags:id,name'])
            ->select('posts.*')
            ->selectSub(
                sprintf(
                    '(COUNT(DISTINCT likes.id) * 1 + COUNT(DISTINCT comments.id) * 2 + COUNT(DISTINCT post_saves.id) * 3 - 1) / POW(((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(posts.created_at)) / 3600) + 2, %F)',
                    $gravity
                ),
                'trending_score'
            )
            ->leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            ->leftJoin('comments', 'posts.id', '=', 'comments.post_id')
            ->leftJoin('post_saves', 'posts.id', '=', 'post_saves.post_id')
            ->where('posts.status', 1) // Only published posts
            ->whereNotNull('posts.created_at') 
            ->where('posts.created_at', '>=', now()->subDays(7)) // Only posts from the last 7 days
            ->groupBy('posts.id') // Group by post to count interactions
            ->orderBy('trending_score', 'desc') // Order by the highest score
            ->paginate(10);
       
        return response()->json($posts);
    }

    /**
     * Get a list of the most popular posts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function popular()
    {
        // Subqueries to count likes and saves efficiently
        $likesSubquery = '(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)';
        $savesSubquery = '(SELECT COUNT(*) FROM post_saves WHERE post_saves.post_id = posts.id)';

        // Fetch top 5 posts ordered by the sum of their likes and saves
        $posts = Post::select(
            'posts.id',
            'posts.title',
            DB::raw("$likesSubquery as likes_count"),
            DB::raw("$savesSubquery as saves_count")
        )
        ->where('status', 1) // Only published posts
        ->orderByRaw("($likesSubquery + $savesSubquery) DESC") // Order by total interactions
        ->limit(5)
        ->get();

        return response()->json($posts);
    }
}
