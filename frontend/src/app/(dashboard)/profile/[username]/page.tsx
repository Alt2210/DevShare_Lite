// frontend/src/app/(dashboard)/profile/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { User, Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import PostCard from '@/components/PostCard';

export default function Profile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const { username } = params;

  // State để quản lý tab đang hoạt động
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/profile/${username}`);
        setProfile(data);
        setIsFollowing(data.is_followed_by_auth_user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      await api.post(`/profile/${profile.username}/toggle-follow`);
      setIsFollowing(!isFollowing);
      // Cập nhật số lượng followers một cách tương đối
      if (profile.followers_count !== undefined) {
        setProfile({
          ...profile,
          followers_count: isFollowing ? profile.followers_count - 1 : profile.followers_count + 1,
        });
      }
    } catch (error) {
      console.error('Failed to toggle follow', error);
    }
  };
  
  if (loading || authLoading) return <p className="text-center mt-12">Đang tải...</p>;
  if (!profile) return <p className="text-center mt-12 text-red-500">Không tìm thấy người dùng.</p>;

  // Kiểm tra xem người đang xem có phải là chủ nhân profile không
  const isOwner = user?.username === profile.username;

  return (
    <div>
      {/* Phần header của trang cá nhân */}
      <div className="card mb-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
            {profile.name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
          <p className="text-slate-400">@{profile.username}</p>
          <div className="flex justify-center space-x-6 mt-4 text-white">
            <span><span className="font-bold">{profile.posts?.length ?? 0}</span> Bài viết</span>
            <span><span className="font-bold">{profile.followers_count ?? 0}</span> Người theo dõi</span>
            <span><span className="font-bold">{profile.following_count ?? 0}</span> Đang theo dõi</span>
          </div>
          {!isOwner && user && (
            <button onClick={handleToggleFollow} className={`mt-6 px-6 py-2 rounded-md font-semibold ${isFollowing ? 'bg-slate-700 text-white' : 'bg-accent text-white'}`}>
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          )}
        </div>
      </div>

      {/* Hệ thống TAB */}
      <div className="border-b border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('published')}
            className={`${
              activeTab === 'published'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-400'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Đã xuất bản ({profile.posts?.length ?? 0})
          </button>
          
          {isOwner && profile.drafts && (
            <button
              onClick={() => setActiveTab('drafts')}
              className={`${
                activeTab === 'drafts'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-400'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bản nháp ({profile.drafts.length})
            </button>
          )}
        </nav>
      </div>

      {/* Hiển thị danh sách bài viết theo TAB */}
      <div>
        {activeTab === 'published' && (
          profile.posts && profile.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Chưa có bài viết nào được xuất bản.</p>
          )
        )}
        
        {activeTab === 'drafts' && (
           profile.drafts && profile.drafts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.drafts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Không có bản nháp nào.</p>
          )
        )}
      </div>
    </div>
  );
}