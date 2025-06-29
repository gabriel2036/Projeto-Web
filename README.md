# YouVerse 🎮

Este é um projeto [Next.js](https://nextjs.org) criado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Primeiros Passos

Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação no navegador.

## 🧠 Sobre o Projeto

O **YouVerse** é uma plataforma para encontrar filmes que combinam com você e seus amigos. Usando swipes (como em apps de relacionamento), você pode encontrar o "match cinematográfico perfeito" com base em interesses em comum.

## 📦 Estrutura do Projeto

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

---

## ⚙️ Setup do Projeto

### 1. Pré-requisitos

- Node.js v18 ou superior
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### 2. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 3. Rodar o setup automático

```bash
chmod +x setup.sh
./setup.sh
```

Ou manualmente:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

---

## 🔐 Variáveis de Ambiente

Confira o arquivo `.env.example` para as variáveis necessárias:

```dotenv
DATABASE_URL="..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
TMDB_API_KEY="..."
```

---

## 📚 Tecnologias

- [Next.js](https://nextjs.org)
- [Prisma ORM](https://www.prisma.io)
- [Next-Auth](https://next-auth.js.org)
- [Supabase](https://supabase.com)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)

---

## ☁️ Deploy

Recomendado: [Vercel](https://vercel.com)

Siga a [documentação oficial do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

---

Feito com 💜 para encontrar filmes inesquecíveis com amigos!

