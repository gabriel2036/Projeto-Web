This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Project Organization

```tree
/
├── app/
│   ├── (auth)/             # Rotas de autenticação (não precisam do layout principal)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (app)/              # Rotas protegidas (só para usuários logados)
│   │   ├── layout.tsx      # Layout principal com barra de navegação, etc.
│   │   ├── dashboard/      # Página inicial após o login
│   │   │   └── page.tsx
│   │   ├── friends/        # Página para ver e adicionar amigos
│   │   │   └── page.tsx
│   │   ├── movies/         # Página para pesquisar e adicionar filmes
│   │   │   └── page.tsx
│   │   └── match/
│   │       ├── page.tsx      # Página para iniciar um novo match
│   │       └── [sessionId]/  # Página do match em andamento (rota dinâmica)
│   │           └── page.tsx
│   │
│   ├── api/                # Backend - Endpoints da API
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts    # Rota do Next-Auth
│   │   ├── friends/
│   │   │   └── route.ts    # API para adicionar/listar amigos
│   │   ├── movies/
│   │   │   └── route.ts    # API para adicionar/listar filmes de interesse
│   │   └── match/
│   │       └── route.ts    # API para criar sessão, registrar votos
│   │
│   ├── layout.tsx          # Layout raiz da aplicação
│   └── page.tsx            # Landing Page (página inicial pública)
│
├── components/             # Componentes reutilizáveis (botões, cards, modais)
│   ├── ui/                 # Componentes genéricos (ex: Button.tsx, Input.tsx)
│   └── MovieCard.tsx
│
├── lib/                    # Funções utilitárias, configurações
│   ├── prisma.ts           # Configuração da instância do Prisma
│   ├── auth.ts             # Configurações do Next-Auth
│   └── tmdb.ts             # Funções para buscar dados da API do TMDb
│
├── prisma/
│   └── schema.prisma       # Definição do seu banco de dados
│
└── ... (outros arquivos de configuração: next.config.mjs, tailwind.config.ts, etc.)
```

### Importante!!

Senha do db: StrongPassword123

## Prisma
Instalando o prisma: npm install prisma --save-dev
Rodando o prisma: npx prisma init
Migrando: npx prisma migrate dev --name migration_name

## Bcrypt
Instalando: npm install bcrypt
            npm install --save-dev @types/bcrypt

## Next-Auth
Instalando: npm install next-auth