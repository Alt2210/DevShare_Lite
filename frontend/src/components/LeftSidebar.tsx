// src/components/LeftSidebar.tsx
'use client';

import NavItem from './NavItem';
import { Compass, Star, Clapperboard, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LeftSidebar() {
  const { user } = useAuth(); // Lấy thông tin người dùng

  return (
    <aside className="w-64 bg-dark-nav p-4 flex-col hidden md:flex">
      <nav className="flex flex-col space-y-2">
        <p className="font-bold text-white mb-4">Menu</p>
        <NavItem href="/" icon={Compass} label="Khám phá" />
        <NavItem href="/trending" icon={Star} label="Thịnh hành" />
        
        {/* Chỉ hiển thị các mục này khi đã đăng nhập */}
        {user && (
          <>
            <NavItem href="/posts/create" icon={Clapperboard} label="Tạo bài viết" />
            <NavItem href="/bookmarks" icon={Bookmark} label="Đã lưu" />
          </>
        )}
      </nav>

      <div className="mt-auto">
        {/* Hiển thị thông tin user hoặc nút đăng nhập */}
        {user ? (
           <Link href="/profile" className="flex items-center space-x-3 p-3 rounded-md hover:bg-dark-card">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user.name}</p>
                <p className="text-xs text-slate-400">Xem trang cá nhân</p>
              </div>
           </Link>
        ) : (
          <div className="p-3 text-center">
            <Link href="/login" className="w-full bg-accent text-white px-4 py-2 rounded-md hover:opacity-90">
                Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}