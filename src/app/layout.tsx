// app/layout.tsx

import type { Metadata } from 'next';
// Passo 1: Importar a Sofia_Sans
import { Sofia_Sans } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

// Passo 2: Configurar a fonte com seus pesos
const sofia_sans = Sofia_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'YouVerse',
  description: 'Encontre o filme perfeito para assistir com seus amigos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      {/* Passo 3: Aplicar a classe da nova fonte */}
      <body className={sofia_sans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}