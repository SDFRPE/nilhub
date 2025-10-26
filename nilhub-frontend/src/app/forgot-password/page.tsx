// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  MessageCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

type Metodo = 'email' | 'whatsapp' | null;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [metodo, setMetodo] = useState<Metodo>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metodo) {
      setError('Selecciona un método de recuperación');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, metodo })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar código');
      }

      setSuccess(true);

      // Guardar email en localStorage para la siguiente página
      localStorage.setItem('reset_email', email);
      localStorage.setItem('reset_metodo', metodo);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/reset-password');
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Botón volver */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver al login</span>
        </Link>

        <Card className="bg-white/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <p className="text-sm text-slate-600">
              Te enviaremos un código de recuperación
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {metodo === 'email' 
                    ? '¡Código enviado! Revisa tu email.' 
                    : '¡Código enviado! Lo recibirás por WhatsApp.'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email de tu cuenta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading || success}
                  className="h-12"
                />
              </div>

              {/* Selección de método */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  ¿Cómo quieres recibir el código?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Opción Email */}
                  <button
                    type="button"
                    onClick={() => setMetodo('email')}
                    disabled={loading || success}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-300",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      metodo === 'email'
                        ? "border-pink-500 bg-pink-50 shadow-lg shadow-pink-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        metodo === 'email'
                          ? "bg-gradient-to-br from-pink-500 to-rose-500"
                          : "bg-slate-100"
                      )}>
                        <Mail className={cn(
                          "w-6 h-6",
                          metodo === 'email' ? "text-white" : "text-slate-600"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        metodo === 'email' ? "text-pink-700" : "text-slate-700"
                      )}>
                        Por Email
                      </span>
                      {metodo === 'email' && (
                        <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-pink-600" />
                      )}
                    </div>
                  </button>

                  {/* Opción WhatsApp */}
                  <button
                    type="button"
                    onClick={() => setMetodo('whatsapp')}
                    disabled={loading || success}
                    className={cn(
                      "relative p-4 rounded-xl border-2 transition-all duration-300",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      metodo === 'whatsapp'
                        ? "border-green-500 bg-green-50 shadow-lg shadow-green-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        metodo === 'whatsapp'
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-slate-100"
                      )}>
                        <MessageCircle className={cn(
                          "w-6 h-6",
                          metodo === 'whatsapp' ? "text-white" : "text-slate-600"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        metodo === 'whatsapp' ? "text-green-700" : "text-slate-700"
                      )}>
                        Por WhatsApp
                      </span>
                      {metodo === 'whatsapp' && (
                        <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>

                </div>
              </div>

              {/* Botón enviar */}
              <Button
                type="submit"
                disabled={loading || success || !metodo}
                className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando código...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Código enviado!
                  </>
                ) : (
                  <>
                    Enviar código de recuperación
                  </>
                )}
              </Button>

            </form>

            {/* Links adicionales */}
            <div className="text-center space-y-2 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                ¿Recordaste tu contraseña?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <Link 
                  href="/registro" 
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Registrarse
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Nota de ayuda */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600 bg-white/60 backdrop-blur-md rounded-lg p-3 border border-white/20">
            💡 <strong>Tip:</strong> Si eliges WhatsApp, asegúrate que tu número esté registrado en tu cuenta.
          </p>
        </div>

      </div>
    </div>
  );
}