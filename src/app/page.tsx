import Image from 'next/image';
import { Eye } from 'lucide-react'; // ou qualquer outro ícone de olho

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-[#0F0F1C]">
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
            <h1 className="text-5xl font-bold text-[#7471D9]">Let’s sign you In.</h1>
            <p className="mt-2 text-sm text-[#7471D9]">Hello blablabla blblablabalaa</p>
          </div>

          <form className="space-y-5">
            {/* Campo Email */}
            <div className="relative w-full">
              <input
                type="email"
                id="email"
                placeholder=" "
                required
                className="peer w-full rounded-md border-2 border-[#7471D9] bg-transparent px-4 pt-6 pb-2 
                          text-[#7471D9] placeholder-transparent focus:border-[#a084ff] focus:outline-none"
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2.5 bg-[#1E1E2E] px-1 text-sm text-[#a0a0c0] transition-all 
                          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#7471D9]
                          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#a084ff]"
              >
                Email
              </label>
            </div>



            {/* Campo Senha com ícone */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border-2 border-[#7471D9] bg-transparent px-4 py-3 pr-10 
                            placeholder-[#a0a0c0] focus:border-[#a084ff] focus:outline-none"
                style={{
                  color: '#7471D9',             // cor do texto digitado
                  WebkitTextFillColor: '#7471D9' // SAFARI e EDGE (webkit fallback)
                }}
              />
              <Eye className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7471D9] cursor-pointer" />
            </div>

            {/* Link de esqueci a senha */}
            <div className="text-right text-sm">
              <a href="#" className="text-[#FFE6B3] hover:text-white">
                Forgot password?
              </a>
            </div>

            {/* Botão Login */}
            <button
              type="submit"
              className="w-full rounded-full py-3 font-semibold text-white hover:scale-105 transition-transform
                        bg-[radial-gradient(circle_at_center,_#7471D9_0%,_#8F84DD_40%,_#FFE6B3_100%)]"
            >
              Login
            </button>


          </form>

          {/* Link de registro */}
          <div className="text-center text-sm text-[#FFE6B3]">
            Don't have an account?{' '}
            <a href="#" className="text-[#FFE6B3] font-semibold hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
