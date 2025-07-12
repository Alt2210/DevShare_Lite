<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Lấy danh sách thông báo chưa đọc
    public function index(Request $request)
    {
        return $request->user()->unreadNotifications()->paginate(10);
    }

    // Đánh dấu một thông báo là đã đọc
    public function markAsRead(Request $request, $notificationId)
    {
        $notification = $request->user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        return response()->json(['message' => 'Thông báo đã được đánh dấu là đã đọc.']);
    }
}