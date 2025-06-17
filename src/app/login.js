import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1E1E2E]">
      <div className="flex w-full max-w-5xl rounded-xl bg-[#28283E] shadow-lg">
        {/* Coluna da Imagem */}
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src="/galaxy.jpg" // Coloque sua imagem na pasta `public`
            alt="Galaxy"
            layout="fill"
            objectFit="cover"
            className="rounded-l-xl"
          />
        </div>

        {/* Coluna do Formulário */}
        <div className="w-full p-12 lg:w-1/2">
          <h1 className="text-3xl font-bold text-white">Let's sign you in.</h1>
          <p className="mt-2 text-gray-400">Hello blablabla blbablsbalas</p>

          <form className="mt-8 space-y-6">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-gray-600 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-gray-600 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
              {/* Ícone de olho (opcional, pode ser um componente SVG) */}
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                forgot password?
              </a>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 py-3 font-semibold text-white transition-transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-white hover:underline">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}