//src/app/registro/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Loader2, AlertCircle, ArrowLeft, User, Mail, Lock, Building2, Phone, Sparkles, Check } from 'lucide-react';

export default function RegistroPage() {
  const { registro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    nombre_tienda: '',
    whatsapp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Mapear campos al formato esperado por AuthContext
      await registro({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        nombreTienda: formData.nombre_tienda, // ✅ camelCase
        whatsapp: formData.whatsapp,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Botón volver */}
      <Link href="/" className="absolute top-6 left-6 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 bg-white/80 backdrop-blur-md hover:bg-white shadow-sm border border-slate-200/50 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">Volver</span>
        </Button>
      </Link>

      {/* Contenedor centrado */}
      <div className="relative min-h-screen flex items-center justify-center p-4 z-10 py-20">
        {/* Card principal */}
        <Card className="w-full max-w-[460px] bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Store className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
              Crea tu catálogo gratis
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Comienza a vender en menos de 5 minutos
            </p>

            {/* Beneficios rápidos */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Check className="h-3 w-3 text-green-600" />
                <span>Sin tarjeta</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Check className="h-3 w-3 text-green-600" />
                <span>Setup rápido</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Check className="h-3 w-3 text-green-600" />
                <span>100% gratis</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200/50 bg-red-50/80 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Nombre completo
                </label>
                <div className="relative group">
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="María García"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="h-11 pl-4 border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email
                </label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="maria@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11 pl-4 border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  Contraseña
                </label>
                <div className="relative group">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="h-11 pl-4 border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Nombre tienda */}
              <div className="space-y-2">
                <label htmlFor="nombre_tienda" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Nombre de tu tienda
                </label>
                <div className="relative group">
                  <Input
                    id="nombre_tienda"
                    name="nombre_tienda"
                    type="text"
                    placeholder="Cosméticos Mary"
                    value={formData.nombre_tienda}
                    onChange={handleChange}
                    required
                    className="h-11 pl-4 border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Será el nombre público de tu catálogo
                </p>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label htmlFor="whatsapp" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  WhatsApp
                </label>
                <div className="relative group">
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    placeholder="51987654321"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="h-11 pl-4 border-2 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Formato: 51 + tu número (sin espacios)
                </p>
              </div>

              {/* Botón premium */}
              <Button
                type="submit"
                className="relative w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 hover:from-pink-600 hover:via-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group mt-6"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando tu cuenta...
                    </>
                  ) : (
                    <>
                      Crear Mi Catálogo Gratis
                      <Sparkles className="ml-2 h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </Button>

              {/* Separador */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-slate-500 font-medium">¿Ya tienes cuenta?</span>
                </div>
              </div>

              {/* Link login */}
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  Inicia sesión aquí
                </Link>
              </div>

              <p className="text-xs text-center text-slate-500 leading-relaxed pt-2">
                Al registrarte, aceptas nuestros Términos y Política de Privacidad
              </p>
            </form>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}