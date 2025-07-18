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
          setError('Email or password is incorrect.');
        } else {
          setError('Failed to login. Please check your input.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h1 className="text-3xl font-bold text-white">Login</h1>
      <p className="text-sm text-slate-400 mt-2 mb-8">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Register here
        </Link>
      </p>

      {error && <p className="form-error-card">{error}</p>}
      
      <div className="form-group mt-4">
        <label className="form-label" htmlFor="email">Email</label>
        <input 
          id="email"
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
          required 
          className="form-input" 
        />
      </div>

      <div className="form-group mt-4">
        <label className="form-label" htmlFor="password">Password</label>
        <input 
          id="password"
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••" 
          required 
          className="form-input" 
        />
      </div>
      
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full mt-8">
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>
    </form>
  );
}