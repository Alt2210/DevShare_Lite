'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import Header from '@/components/Header';
import '@/styles/web.css';
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en" className="dark">
      <head>
        <title>DevShare Lite</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {isAuthPage ? (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
              
              {/* Đây là cái khung/thẻ lớn bao bọc bên ngoài */}
              <div className="w-full max-w-5xl bg-gray-900 p-2 rounded-2xl shadow-2xl">
                
                {/* Container cho 2 cột bên trong */}
                <div className="flex rounded-lg overflow-hidden">
                  
                  {/* Cột Trái (Trang trí) */}
                  <div className="w-1/2 p-12 text-white hidden md:flex flex-col justify-between bg-accent">
                    <div>
                      <Link href="/" className="text-2xl font-bold">DevShare</Link>
                      <p className="mt-4 text-lg opacity-80">
                        Nơi kiến thức được chia sẻ.
                      </p>
                    </div>
                    <p className="text-sm opacity-60">© 2025 DevShare Lite</p>
                  </div>
                  
                  {/* Cột Phải (Chứa Form) */}
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-dark-nav">
                    {children}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex flex-1">
                <LeftSidebar />
                <main className="flex-1 p-6 sm:p-8">
                  {children}
                </main>
                <RightSidebar />
              </div>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}