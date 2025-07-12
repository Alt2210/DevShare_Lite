'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Post } from '@/types';
import SeriesSelector from '@/components/SeriesSelector';

export default function EditPost() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState(1);
  const [seriesId, setSeriesId] = useState<number | null>(null); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const fetchedPost = response.data;
        setPost(fetchedPost);
        setTitle(fetchedPost.title);
        setContent(fetchedPost.content);
        setStatus(fetchedPost.status);
        setTags(fetchedPost.tags.map((tag: any) => tag.name).join(', '));
        setSeriesId(fetchedPost.series?.id ?? null); 
      } catch (err) {
        setError('Can not load post details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (post && user.id !== post.user.id) {
        setError('You are not authorized to edit this post.');
        router.push(`/posts/${id}`);
      }
    }
  }, [user, post, authLoading, router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      await api.put(`/posts/${id}`, {
        title,
        content,
        status,
        tags: tagsArray,
        series_id: seriesId, 
      });
      router.push(`/posts/${id}`); 
    } catch (err) {
      setError('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Edit</h1>
      <form onSubmit={handleSubmit} className="space-y-6 card">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input"/>
        </div>
        <div className="form-group">
          <label htmlFor="content" className="form-label">Content (Support markdown) </label>
          <textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required className="form-textarea"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags (Divided by comma) </label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="form-input"/>
        </div>
        
        {}
        <SeriesSelector selectedSeriesId={seriesId} onChange={setSeriesId} />

        <div className="form-group">
          <label className="form-label">State</label>
          <select value={status} onChange={(e) => setStatus(Number(e.target.value))} className="form-select">
            <option value={1}>Published</option>
            <option value={0}>Draft</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
}