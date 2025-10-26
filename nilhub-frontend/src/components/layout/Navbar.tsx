import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-slate-900/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Store className="relative h-6 w-6 text-pink-500 group-hover:scale-110 transition-transform" />
          </div>
          <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-black">
            NilHub
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#caracteristicas" className="text-sm font-semibold text-slate-700 hover:text-pink-600 transition-colors relative group">
            Características
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="#como-funciona" className="text-sm font-semibold text-slate-700 hover:text-pink-600 transition-colors relative group">
            Cómo Funciona
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="#precios" className="text-sm font-semibold text-slate-700 hover:text-pink-600 transition-colors relative group">
            Precios
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-semibold hover:bg-white/60 backdrop-blur-sm transition-all hover:scale-105">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button 
              size="sm" 
              className="group relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-semibold shadow-lg shadow-pink-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">Crear Catálogo</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}