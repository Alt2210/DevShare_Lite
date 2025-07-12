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
  
  if (loading || authLoading) return <p className="status-message">Loading...</p>;
  if (!profile) return <p className="status-message status-message--error">Can not find user.</p>;

  const isOwner = user?.username === profile.username;

  return (
    <div>
      <div className="card profile-header">
        <div className="profile-avatar">
          {profile.name.charAt(0)}
        </div>
        <h1 className="profile-name">{profile.name}</h1>
        <p className="profile-username">@{profile.username}</p>
        <div className="profile-stats">
          <span className="stat-item"><span>{profile.posts?.length ?? 0}</span> Post</span>
          <span className="stat-item"><span>{profile.followers_count ?? 0}</span> Followers</span>
          <span className="stat-item"><span>{profile.following_count ?? 0}</span> Following</span>
        </div>
        {!isOwner && user && (
          <button onClick={handleToggleFollow} className={`btn btn-primary btn-follow ${isFollowing ? 'following' : ''}`}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="tabs-container">
        <nav className="tabs-nav" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('published')}
            className={`tab-button ${activeTab === 'published' ? 'active' : ''}`}
          >
            Published ({profile.posts?.length ?? 0})
          </button>
          
          {isOwner && profile.drafts && (
            <button
              onClick={() => setActiveTab('drafts')}
              className={`tab-button ${activeTab === 'drafts' ? 'active' : ''}`}
            >
              Draft ({profile.drafts.length})
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === 'published' && (
          profile.posts && profile.posts.length > 0 ? (
            <div className="posts-grid">
              {profile.posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No published post.</p>
          )
        )}
        
        {activeTab === 'drafts' && (
           profile.drafts && profile.drafts.length > 0 ? (
            <div className="posts-grid">
              {profile.drafts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No draft.</p>
          )
        )}
      </div>
    </div>
  );
}