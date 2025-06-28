// app/(auth)/login/page.tsx
'use client';

import Image from 'next/image';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import FloatingLabelInput from '@/components/FloatingLabelInput'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Credenciais inválidas. Tente novamente.');
      } else {
        router.push('/interest');
      }
    } catch (error) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const PasswordIcon = (
    <div
      className="cursor-pointer"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5 text-[#7471D9]" />
      ) : (
        <Eye className="h-5 w-5 text-[#7471D9]" />
      )}
    </div>
  );

  return (
    <main className="flex min-h-screen bg-[#0F0F1C]">
      {/* Coluna da imagem */}
      <div className="relative hidden w-[70%] lg:block">
        <Image
          src="/galaxy.jpg"
          alt="Galaxy"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Coluna do formulário */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-[30%] bg-[#1E1E2E]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#7471D9]">Let’s sign you In.</h1>
            <p className="mt-2 text-sm text-[#a0a0c0]">Welcome back! You've been missed!</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            
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
            
            <div className="text-right text-sm">
              <a href="#" className="text-[#FFE6B3] hover:text-white">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full py-3 font-semibold text-white transition-transform hover:scale-105
                         bg-[radial-gradient(circle_at_center,_#7471D9_0%,_#8F84DD_40%,_#FFE6B3_100%)]
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <a href="/register" className="font-semibold text-[#FFE6B3] hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}