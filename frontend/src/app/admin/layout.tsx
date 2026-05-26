import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Admin | Geopolitiqué',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
