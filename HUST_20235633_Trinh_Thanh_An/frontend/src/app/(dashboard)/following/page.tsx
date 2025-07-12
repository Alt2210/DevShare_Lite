'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function FollowingPage() {
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/profile/following')
        .then(response => {
          setFollowing(response.data.data);
        })
        .catch(err => {
          setError('Can not load following users.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  if (loading || authLoading) {
    return <p className="text-center mt-12">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-white mb-6">Following</h1>
      
      {following.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {following.map((followedUser) => (
            <Link key={followedUser.id} href={`/profile/${followedUser.username}`} className="card flex items-center space-x-4 hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0">
                {followedUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white">{followedUser.name}</p>
                <p className="text-sm text-slate-400">@{followedUser.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">You have not followed an user</p>
      )}
    </div>
  );
}