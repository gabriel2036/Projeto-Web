// components/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

// Definimos as props, esperando que receba 'children'
type Props = {
  children?: React.ReactNode;
};

// Este é o nosso componente AuthProvider
export default function AuthProvider({ children }: Props) {
  // Ele simplesmente renderiza o SessionProvider do Next-Auth,
  // passando os 'children' para dentro dele.
  return <SessionProvider>{children}</SessionProvider>;
}