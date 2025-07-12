<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Series;

class SeriesController extends Controller
{
    public function publicIndex()
    {
        $series = Series::with('user:id,name,username')
                        ->withCount('posts') 
                        ->latest()
                        ->paginate(15);
                        
        return response()->json($series);
    }

    public function userIndex(Request $request)
    {
        $series = $request->user()->series()->latest()->get(['id', 'title']);
        return response()->json($series);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $series = $request->user()->series()->create([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json($series, 201);
    }

    public function show(Series $series)
    {
        $series->load(['posts' => function ($query) {
            $query->where('status', 1)
                  ->with('user:id,name,username')
                  ->with('tags:id,name');
        }]);

        return response()->json($series);
    }
}