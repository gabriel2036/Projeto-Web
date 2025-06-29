import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E2E] text-white">
      <h1 className="text-5xl font-bold">Bem-vindo(a) ao YouVerse</h1>
      <p className="mt-4 text-xl text-gray-300">
        O lugar para encontrar o filme perfeito com seus amigos.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors">
          Fazer Login
        </Link>
        <Link href="/register" className="px-6 py-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors">
          Criar Conta
        </Link>
      </div>
    </main>
  );
}