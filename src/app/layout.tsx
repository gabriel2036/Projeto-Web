// app/layout.tsx

import type { Metadata } from 'next';
import { Sofia_Sans } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'YouVerse',
  description: 'Encontre o filme perfeito para assistir com seus amigos',
  icons: {
    icon: '/sino.png', 
  },
};


const sofia_sans = Sofia_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={sofia_sans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}