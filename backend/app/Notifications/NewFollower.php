<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class NewFollower extends Notification
{
    use Queueable;

    protected $follower;

    public function __construct(User $follower)
    {
        $this->follower = $follower;
    }

    public function via(object $notifiable): array
    {
        // Chúng ta sẽ lưu thông báo vào cơ sở dữ liệu
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        // Đây là dữ liệu sẽ được lưu trong cột 'data' của bảng notifications
        return [
            'follower_id' => $this->follower->id,
            'follower_name' => $this->follower->name,
            'follower_username' => $this->follower->username,
            'message' => $this->follower->name . ' đã bắt đầu theo dõi bạn.'
        ];
    }
}