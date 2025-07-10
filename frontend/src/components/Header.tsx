'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // Import useState
import '../styles/web.css'; // Import your global styles

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${searchQuery}`);
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
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
              <span className="text-gray-700">Chào, {user.name}!</span>
              <Link href="/profile" className="font-medium text-gray-600 hover:text-gray-900">
                Trang cá nhân
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-black text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-gray-600 hover:text-gray-900">
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="bg-black text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
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