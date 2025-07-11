'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { RegisterFormData } from '@/types';
import { isAxiosError } from 'axios';
import '../../styles/web.css'; // Import your global styles

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(formData);
      router.push('/');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response) {
        setError('Đăng ký thất bại. Email hoặc tên đăng nhập có thể đã tồn tại.');
      } else {
        setError('Một lỗi không xác định đã xảy ra.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h1 className="text-3xl font-bold text-white">Tạo tài khoản</h1>
      <p className="text-sm text-slate-400 mt-2 mb-8">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Đăng nhập
        </Link>
      </p>

      {error && <p className="form-error-card">{error}</p>}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Tên của bạn</label>
          <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="username">Tên đăng nhập</label>
          <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} required className="form-input" />
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="form-input" />
      </div>

      <div className="form-group mt-4">
        <label className="form-label" htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="form-input" />
      </div>
      
      <div className="form-group mt-4">
        <label className="form-label" htmlFor="password_confirmation">Xác nhận mật khẩu</label>
        <input id="password_confirmation" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required className="form-input" />
      </div>
      
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full mt-8">
        {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
      </button>
    </form>
  );
}