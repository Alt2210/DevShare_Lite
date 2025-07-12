'use client';

import NavItem from './NavItem';
import { Compass, Star, Clapperboard, Bookmark, Settings, ListOrdered } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <p className="sidebar-menu-title">Menu</p>
        <NavItem href="/" icon={Compass} label="Khám phá" />
        <NavItem href="/trending" icon={Star} label="Thịnh hành" />
        <NavItem href="/series" icon={ListOrdered} label="Series" />
        
        {user && (
          <>
            <NavItem href="/posts/create" icon={Clapperboard} label="Tạo bài viết" />
            <NavItem href="/bookmarks" icon={Bookmark} label="Đã lưu" />
            <NavItem href="/settings" icon={Settings} label="Cài đặt" />
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <Link href={`/profile/${user.username}`} className="user-profile-link">
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="user-name">{user.name}</p>
              <p className="user-profile-prompt">Xem trang cá nhân</p>
            </div>
          </Link>
        ) : (
          <div className="sidebar-login-section">
            <Link href="/login" className="btn btn-primary w-full">
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}