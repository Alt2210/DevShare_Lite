// frontend/src/components/PostCard.tsx
import Link from 'next/link';
import { Post } from '@/types';
import { Tag } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const snippet = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');

  return (
    <div className="h-full flex flex-col bg-dark-card p-6 rounded-lg shadow-lg space-y-4 margin-bottom-6">
      <div className="flex-grow">
        {/* Tiêu đề bài viết */}
        <Link href={`/posts/${post.id}`}>
          <h2 className="text-xl font-bold text-white hover:text-accent transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Thông tin tác giả */}
        <p className="text-sm text-slate-400 mt-2">
          Đăng bởi{' '}
          <Link href={`/profile/${post.user.username}`} className="font-semibold hover:underline">
            {post.user.name}
          </Link>
        </p>

        {/* Đoạn trích nội dung */}
        <p className="text-slate-300 mt-4 text-sm">{snippet}</p>
      </div>

      {/* Phần footer của card, chứa các tag */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-slate-500" />
          {post.tags && post.tags.length > 0 ? (
            post.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">Không có tag</span>
          )}
        </div>
      </div>
    </div>
  );
}