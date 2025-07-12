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
        <NavItem href="/" icon={Compass} label="Discover" />
        <NavItem href="/trending" icon={Star} label="Trending" />
        <NavItem href="/series" icon={ListOrdered} label="Series" />
        
        {user && (
          <>
            <NavItem href="/posts/create" icon={Clapperboard} label="Create Post" />
            <NavItem href="/bookmarks" icon={Bookmark} label="Saved" />
            <NavItem href="/settings" icon={Settings} label="Settings" />
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <Link href={`/profile/${user.username}`} className="user-profile-link">
            <div className="user-avatar">
              {}
              {user.name && typeof user.name === 'string' ? user.name.charAt(0) : '?'}
            </div>
            <div>
              <p className="user-name">{user.name}</p>
              <p className="user-profile-prompt">View Profile</p>
            </div>
          </Link>
        ) : (
          <div className="sidebar-login-section">
            <Link href="/login" className="btn btn-primary w-full">
              Login
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}