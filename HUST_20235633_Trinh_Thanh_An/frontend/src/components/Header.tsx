'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';

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
    const interval = setInterval(fetchNotifications, 30000);
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
      router.push(`/posts/${notification.data.post_id}`); 
      setShowNotifications(false);
    }).catch(console.error);
  }

  return (
    <header className="site-header">
      <nav className="container main-nav">
        <Link href="/" className="main-logo">
          DevShare Lite
        </Link>

        <div className="main-nav-search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="form-input form-input-search"
            />
          </form>
        </div>

        <div className="auth-actions">
          {loading ? (
            <div>Loading...</div>
          ) : user ? (
            <>
              <div className="notification-area">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="notification-bell-btn">
                      <Bell className="notification-icon"/>
                      {notifications.length > 0 && (
                          <span className="notification-ping"></span>
                      )}
                  </button>
                  {showNotifications && (
                      <div className="notification-dropdown">
                          <div className="notification-header">Notifications</div>
                          <ul className="notification-list">
                              {notifications.length > 0 ? notifications.map((notif) => (
                                  <li key={notif.id} onClick={() => handleNotificationClick(notif)}
                                      className="notification-item">
                                      {notif.data.message}
                                  </li>
                              )) : (
                                  <li className="notification-empty">No new activity.</li>
                              )}
                          </ul>
                      </div>
                  )}
              </div>
              
              <span className="user-greeting">Hi, {user.name}!</span>
              <Link href={`/profile/${user.username}`} className="btn btn-secondary">
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}