// src/types/index.ts

// Định nghĩa cấu trúc cho đối tượng User
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  followers_count?: number;
  following_count?: number;
  is_followed_by_auth_user?: boolean;
  posts?: Post[];
  drafts?: Post[];
}

// Định nghĩa cấu trúc cho đối tượng Tag
export interface Tag {
  id: number;
  name: string;
}

// Định nghĩa cấu trúc cho đối tượng Comment
export interface Comment {
  id: number;
  content: string;
  user: User;
  replies?: Comment[]; // Một bình luận có thể có các trả lời (không bắt buộc)
}

// Định nghĩa cấu trúc cho đối tượng Post
export interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  posts?: Post[]; // Danh sách các bài viết khác trong series (không bắt buộc)
}

export interface Post {
  id: number;
  title: string;
  slug: string; // Thêm slug để tạo link đẹp hơn
  content: string;
  status: number;
  user: User;
  tags: Tag[];
  comments: Comment[];
  series?: Series; // Bài viết có thể thuộc về 1 series (không bắt buộc)
}

export interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}