// frontend/src/app/profile/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Post, Tag, User } from '@/types';
import Link from 'next/link';

// Định nghĩa kiểu dữ liệu cho profile user, bao gồm cả các bài viết
interface ProfileUser extends User {
  posts: Post[];
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { username } = params;

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

  if (loading) {
    return <p className="text-center mt-12">Đang tải hồ sơ...</p>;
  }

  if (!profile) {
    return <p className="text-center mt-12 text-red-500">Không tìm thấy người dùng.</p>;
  }

  return (
    <div className="container">
      <div className="mb-8">
        <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4">
          {profile.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
        <p className="text-slate-400">@{profile.username}</p>
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