import Image from 'next/image';
import { Eye } from 'lucide-react'; // ou qualquer outro ícone de olho

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-[#0F0F1C] text-white">
      {/* Coluna da imagem */}
      <div className="relative hidden w-[70%] lg:block">
        <Image
          src="/galaxy.jpg" // Substitua pelo caminho correto da sua imagem
          alt="Galaxy"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Coluna do formulário */}
      <div className="flex w-full items-center px-16 py-12 lg:w-[30%] bg-[#1E1E2E]">
        <div className="ml-auto w-full max-w-md space-y-12">
          <div>
            <h1 className="text-5xl font-bold text-[#b4aaff]">Let’s sign you In.</h1>
            <p className="mt-2 text-sm text-[#a0a0c0]">Hello blablabla blblablabalaa</p>
          </div>

          <form className="space-y-5">
            {/* Campo Email */}
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-md border border-[#6e64a8] bg-transparent px-4 py-3 text-white placeholder-[#a0a0c0] focus:border-[#a084ff] focus:outline-none"
            />

            {/* Campo Senha com ícone */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-[#6e64a8] bg-transparent px-4 py-3 pr-10 text-white placeholder-[#a0a0c0] focus:border-[#a084ff] focus:outline-none"
              />
              <Eye className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a0a0c0] cursor-pointer" />
            </div>

            {/* Link de esqueci a senha */}
            <div className="text-right text-sm">
              <a href="#" className="text-[#cfcfcf] hover:text-white">
                Forgot password?
              </a>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              className="w-full rounded-full py-3 font-semibold text-white hover:scale-105 transition-transform
                        bg-[radial-gradient(ellipse_at_center,_#7471D9_25%,_#A89EE5_50%,_#FFE6B3_100%)]"
            >
              Login
            </button>


          </form>

          {/* Link de registro */}
          <div className="text-center text-sm text-[#cfcfcf]">
            Don't have an account?{' '}
            <a href="#" className="text-[#e7e7ff] font-semibold hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
