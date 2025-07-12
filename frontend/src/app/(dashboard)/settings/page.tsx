// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { isAxiosError } from 'axios';

export default function SettingsPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  // State cho form thông tin
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // State cho form mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  // State cho thông báo và lỗi
  const [infoMessage, setInfoMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [infoError, setInfoError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State loading
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, authLoading, router]);

  // Xử lý cập nhật thông tin cá nhân
  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingInfo(true);
    setInfoError('');
    setInfoMessage('');

    try {
      const response = await api.put('/profile/settings', { name, username, email });
      // Cập nhật lại user trong context và localStorage
      login(localStorage.getItem('token')!, response.data.user);
      setInfoMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setInfoError(err.response.data.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        setInfoError('Đã có lỗi xảy ra.');
      }
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('Mật khẩu mới không khớp.');
      setIsSubmittingPassword(false);
      return;
    }

    try {
      const response = await api.put('/profile/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setPasswordMessage(response.data.message);
      // Xóa các trường mật khẩu sau khi thành công
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setPasswordError(err.response.data.message || 'Đổi mật khẩu thất bại.');
      } else {
        setPasswordError('Đã có lỗi xảy ra.');
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (authLoading || !user) {
    return <p className="text-center mt-8">Đang tải...</p>;
  }

  return (
    <div className="container max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Cài đặt tài khoản</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form cập nhật thông tin */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Thông tin cá nhân</h2>
          {infoMessage && <p className="mb-4 text-center text-sm text-green-400 bg-green-500/10 p-3 rounded-md">{infoMessage}</p>}
          {infoError && <p className="form-error-card">{infoError}</p>}
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Họ và tên</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="form-input"/>
            </div>
             <div className="form-group">
              <label htmlFor="username" className="form-label">Tên đăng nhập</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input"/>
            </div>
            <button type="submit" disabled={isSubmittingInfo} className="btn btn-primary w-full">
              {isSubmittingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Form đổi mật khẩu */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Đổi mật khẩu</h2>
           {passwordMessage && <p className="mb-4 text-center text-sm text-green-400 bg-green-500/10 p-3 rounded-md">{passwordMessage}</p>}
          {passwordError && <p className="form-error-card">{passwordError}</p>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="current_password" className="form-label">Mật khẩu hiện tại</label>
              <input type="password" id="current_password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="new_password" className="form-label">Mật khẩu mới</label>
              <input type="password" id="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="form-input"/>
            </div>
            <div className="form-group">
              <label htmlFor="new_password_confirmation" className="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" id="new_password_confirmation" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} required className="form-input"/>
            </div>
            <button type="submit" disabled={isSubmittingPassword} className="btn btn-primary w-full">
               {isSubmittingPassword ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}