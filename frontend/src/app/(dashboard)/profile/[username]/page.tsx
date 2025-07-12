// frontend/src/app/(dashboard)/profile/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Post, Tag, User } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Cập nhật interface
interface ProfileUser extends User {
  posts: Post[];
  followers_count: number;
  following_count: number;
  is_followed_by_auth_user: boolean;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { username } = params;
  const { user: authUser } = useAuth(); // Lấy người dùng đang đăng nhập

  useEffect(() => {
    if (typeof username === 'string') {
      api.get(`/profiles/${username}`)
        .then(response => {
          setProfile(response.data);
        })
        .catch(err => {
          console.error("Failed to fetch profile", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [username]);
  
  const handleFollowToggle = async () => {
      if (!authUser || !profile) return;
      
      const originalProfile = { ...profile };

      // Cập nhật giao diện trước để tạo cảm giác nhanh
      setProfile(prev => {
          if (!prev) return null;
          const currentFollowers = typeof prev.followers_count === 'number' ? prev.followers_count : 0;

          return {
              ...prev,
              is_followed_by_auth_user: !prev.is_followed_by_auth_user,
              followers_count: prev.is_followed_by_auth_user 
                                 ? currentFollowers - 1
                                 : currentFollowers + 1,
          }
      });

      try {
          if (originalProfile.is_followed_by_auth_user) {
              await api.delete(`/profiles/${profile.username}/unfollow`);
          } else {
              await api.post(`/profiles/${profile.username}/follow`);
          }
      } catch (error) {
          console.error("Follow/Unfollow failed", error);
          // Nếu có lỗi, trả lại trạng thái ban đầu
          setProfile(originalProfile);
      }
  };

  if (loading) {
    return <p className="text-center mt-12">Đang tải hồ sơ...</p>;
  }

  if (!profile) {
    return <p className="text-center mt-12 text-red-500">Không tìm thấy người dùng.</p>;
  }

  return (
    <div className="container">
      <div className="mb-8">
        <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    <p className="text-slate-400">@{profile.username}</p>
                </div>
                {/* Nút Follow/Unfollow */}
                {authUser && authUser.id !== profile.id && (
                    <button onClick={handleFollowToggle}
                        className={`btn ${profile.is_followed_by_auth_user ? 'btn-primary' : 'btn-primary'}`}>
                        {profile.is_followed_by_auth_user ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>
                )}
              </div>
              <div className="flex space-x-4 mt-4 text-slate-300">
                <span><span className="font-bold text-white">{profile.followers_count ?? 0}</span> Người theo dõi</span>
                <span><span className="font-bold text-white">{profile.following_count ?? 0}</span> Đang theo dõi</span>
              </div>
            </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Bài viết của {profile.name}</h2>
      <div className="space-y-6">
        {profile.posts.length > 0 ? (
          profile.posts.map(post => (
            <div key={post.id} className="card">
              <Link href={`/posts/${post.id}`} className="hover:underline">
                <h3 className="text-xl font-bold text-white">{post.title}</h3>
              </Link>
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag: Tag) => (
                  <span key={tag.id} className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400">Người dùng này chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
}