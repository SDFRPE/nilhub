'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  value, 
  onChange,
  placeholder = "Buscar productos...",
  className 
}: SearchBarProps) {
  
  const [isFocused, setIsFocused] = useState(false);

  // Función para limpiar búsqueda
  const limpiarBusqueda = () => {
    onChange('');
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Efecto glow cuando está en focus */}
      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl blur-lg opacity-0 transition-opacity duration-300",
        isFocused && "opacity-30"
      )}></div>

      <div className="relative">
        {/* Contenedor del input con glassmorphism */}
        <div className={cn(
          "relative flex items-center",
          "bg-white/60 backdrop-blur-xl border-2 rounded-2xl",
          "transition-all duration-300 shadow-lg",
          isFocused 
            ? "border-white/50 bg-white/80 shadow-xl" 
            : "border-white/30 hover:border-white/40"
        )}>
          {/* Ícono de búsqueda */}
          <div className="absolute left-4 pointer-events-none">
            <Search className={cn(
              "w-5 h-5 transition-colors duration-300",
              isFocused ? "text-pink-500" : "text-slate-400"
            )} />
          </div>

          {/* Input */}
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-12 py-6 text-base",
              "border-0 bg-transparent",
              "placeholder:text-slate-400",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />

          {/* Botón para limpiar (solo si hay texto) */}
          {value && (
            <button
              onClick={limpiarBusqueda}
              className={cn(
                "absolute right-4",
                "p-1 rounded-lg",
                "bg-slate-100 hover:bg-slate-200",
                "transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "group/clear"
              )}
            >
              <X className="w-4 h-4 text-slate-600 group-hover/clear:text-slate-900" />
            </button>
          )}
        </div>

        {/* Texto de ayuda (opcional - muestra conteo si hay búsqueda) */}
        {value && (
          <div className="absolute -bottom-6 left-0 text-xs text-slate-500">
            Buscando: <span className="font-medium text-slate-700">&quot;{value}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
}