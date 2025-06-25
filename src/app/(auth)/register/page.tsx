// app/(auth)/register/page.tsx
'use client';

import Image from 'next/image';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import FloatingLabelInput from '@/components/FloatingLabelInput';

export default function RegisterPage() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // A lógica de submissão agora chama nossa API /api/users
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // Se a resposta não for OK, pegamos a mensagem de erro da API
        const errorData = await response.json();
        setError(errorData.error || 'Falha ao criar conta.');
      } else {
        // Se o cadastro for bem-sucedido, redireciona para o login
        // Podemos até passar uma mensagem de sucesso na URL
        router.push('/login?status=success');
      }
    } catch (err) {
      setError('Ocorreu um erro de rede. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const PasswordIcon = (
    <div className="cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff className="h-5 w-5 text-[#7471D9]" /> : <Eye className="h-5 w-5 text-[#7471D9]" />}
    </div>
  );

  return (
    <main className="flex min-h-screen bg-[#0F0F1C]">
      {/* Coluna da imagem */}
      <div className="relative hidden w-[70%] lg:block">
        <Image src="/galaxy.jpg" alt="Galaxy" fill className="object-cover" priority />
      </div>

      {/* Coluna do formulário */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-[30%] bg-[#1E1E2E]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#7471D9]">Let’s create your YouVerse.</h1>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* NOVO CAMPO 'NAME' */}
            <FloatingLabelInput
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FloatingLabelInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingLabelInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              endIcon={PasswordIcon}
            />

            {error && <p className="text-center text-sm text-red-400">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full py-3 font-semibold text-white transition-transform hover:scale-105
                         bg-[radial-gradient(circle_at_center,_#7471D9_0%,_#8F84DD_40%,_#FFE6B3_100%)]
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <a href="/login" className="font-semibold text-[#FFE6B3] hover:underline">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}