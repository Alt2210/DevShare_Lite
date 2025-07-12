'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react'; // Import icon Bell
import api from '@/lib/api';
import '@/app/globals.css';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = () => {
      if (user) {
        api.get('/notifications')
           .then(res => setNotifications(res.data.data))
           .catch(console.error);
      }
    };

    fetchNotifications();

    // Thiết lập một interval để kiểm tra thông báo mới mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000);

    // Dọn dẹp interval khi component bị unmount
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${searchQuery}`);
  };

  const handleNotificationClick = (notification: any) => {
    api.post(`/notifications/${notification.id}/read`).then(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        router.push(`/profile/${notification.data.follower_username}`);
        setShowNotifications(false);
    }).catch(console.error);
  }

  return (
    <header className="bg-white dark:bg-dark-nav shadow-md relative">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="main-logo">
          DevShare Lite
        </Link>

        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="form-input-search"
            />
          </form>
        </div>

        <div className="space-x-4 flex items-center">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                      <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300"/>
                      {notifications.length > 0 && (
                          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-nav animate-ping"></span>
                      )}
                  </button>
                  {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-lg shadow-xl z-20">
                          <div className="p-4 font-bold text-black border-b border-black dark:border-black">Thông báo</div>
                          <ul className="max-h-96 overflow-y-auto">
                              {notifications.length > 0 ? notifications.map((notif) => (
                                  <li key={notif.id} onClick={() => handleNotificationClick(notif)}
                                      className="p-4 text-black hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm hover:text-gray-200">
                                      {notif.data.message}
                                  </li>
                              )) : (
                                  <li className="p-4 text-center text-black">Không có thông báo mới.</li>
                              )}
                          </ul>
                      </div>
                  )}
              </div>
              
              <span className="text-gray-700 dark:text-gray-300">Chào, {user.name}!</span>
              <Link href={`/profile/${user.username}`} className="btn">
                Trang cá nhân
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn">
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="btn btn-primary"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}