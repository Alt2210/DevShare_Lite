'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { isAxiosError } from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/login', {
        email,
        password,
      });
      login(response.data.token, response.data.user);
      router.push('/');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Email hoặc mật khẩu không đúng.');
        } else {
          setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
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
      <h1 className="text-3xl font-bold text-white">Đăng nhập</h1>
      <p className="text-sm text-slate-400 mt-2 mb-8">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Tạo tài khoản ngay
        </Link>
      </p>

      {error && <p className="text-red-400 text-sm text-center mb-4 p-3 bg-red-500/10 rounded-md">{error}</p>}
      
      <div className="mt-4">
        <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
          required 
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent" 
        />
      </div>

      <div className="mt-4">
        <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">Mật khẩu</label>
        <input 
          id="password"
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••" 
          required 
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent" 
        />
      </div>
      
      <button type="submit" disabled={isSubmitting} className="w-full mt-8 p-3 bg-accent text-white font-semibold rounded-md hover:opacity-90 transition-colors disabled:bg-slate-600">
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}