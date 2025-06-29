// app/components/FloatingLabelInput.tsx
'use client';

import { useState, InputHTMLAttributes } from 'react';

// Define os tipos das propriedades que o componente vai aceitar
type FloatingLabelInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  endIcon?: React.ReactNode; 
};

export default function FloatingLabelInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  endIcon,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Determina se o label deve estar "flutuando" para cima
  const isLabelFloated = isFocused || (value && String(value).length > 0);

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)} // Ativa o foco
        onBlur={() => setIsFocused(false)}  // Desativa o foco
        className="peer w-full rounded-md border-2 border-[#7471D9] bg-transparent px-4 pt-6 pb-2 text-white focus:border-[#a084ff] focus:outline-none"
        {...props} // Passa outras props como 'required'
      />
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 pointer-events-none 
                    bg-[#1E1E2E] px-1 // O truque do recorte na borda!
                    ${
                      isLabelFloated
                        ? '-top-2.5 text-sm text-[#a084ff]' // Estilo "para cima"
                        : 'top-4 text-base text-[#7471D9]' // Estilo "para baixo"
                    }`}
      >
        {label}
      </label>
      {/* Renderiza o ícone se ele for passado */}
      {endIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endIcon}</div>}
    </div>
  );
}