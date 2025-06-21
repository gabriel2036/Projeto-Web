// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // A função authorize é onde a mágica acontece
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Encontrar o usuário no banco de dados pelo email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null; // Usuário não encontrado
        }

        // 2. Comparar a senha enviada com a senha hasheada no banco
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (isPasswordCorrect) {
          // 3. Se tudo estiver correto, retorne o objeto do usuário
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        return null; // Senha incorreta
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login', // Redireciona para sua página se o usuário não estiver logado
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };