import Link from 'next/link';
import { Post } from '@/types';
import { Tag as TagIcon } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const snippet = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');

  return (
    <div className="card h-full flex flex-col">
      <div className="flex-grow">
        <Link href={`/posts/${post.id}`}>
          <h2 className="post-card-title">
            {post.title}
          </h2>
        </Link>

        <p className="post-meta">
          Posted by{' '}
          <Link href={`/profile/${post.user.username}`} className="link text-white">
            {post.user.name}
          </Link>
        </p>

        <p className="text-slate-300 mt-4 text-sm">{snippet}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="tags-container">
          <TagIcon className="w-4 h-4 text-slate-500" />
          {post.tags && post.tags.length > 0 ? (
            post.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="tag-badge-neutral">
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No tag</span>
          )}
        </div>
      </div>
    </div>
  );
}