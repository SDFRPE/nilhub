// src/app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  
  // Estados principales
  const [email, setEmail] = useState('');
  const [metodo, setMetodo] = useState<'email' | 'whatsapp' | null>(null);
  const [code, setCode] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [codigoValido, setCodigoValido] = useState<boolean | null>(null);

  // Cargar datos de la página anterior
  useEffect(() => {
    const savedEmail = localStorage.getItem('reset_email');
    const savedMetodo = localStorage.getItem('reset_metodo') as 'email' | 'whatsapp' | null;
    
    if (savedEmail) setEmail(savedEmail);
    if (savedMetodo) setMetodo(savedMetodo);
  }, []);

  // Verificar código cuando el usuario lo ingresa
  useEffect(() => {
    if (code.length === 6 && email) {
      verificarCodigo();
    } else {
      setCodigoValido(null);
    }
  }, [code]);

  const verificarCodigo = async () => {
    setVerificandoCodigo(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCodigoValido(true);
      } else {
        setCodigoValido(false);
        setError(data.error || 'Código inválido');
      }

    } catch (err) {
      setCodigoValido(false);
      setError('Error al verificar el código');
    } finally {
      setVerificandoCodigo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, nuevaPassword })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      setSuccess(true);

      // Limpiar localStorage
      localStorage.removeItem('reset_email');
      localStorage.removeItem('reset_metodo');

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);

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
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Solicitar nuevo código</span>
        </Link>

        <Card className="bg-white/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Restablecer contraseña
            </CardTitle>
            {metodo && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                {metodo === 'email' ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Código enviado a {email}</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Código enviado por WhatsApp</span>
                  </>
                )}
              </div>
            )}
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
                  ¡Contraseña actualizada! Redirigiendo al login...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Código de recuperación */}
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-slate-700">
                  Código de recuperación
                </label>
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    disabled={loading || success}
                    className={cn(
                      "h-14 text-center text-2xl font-mono tracking-widest",
                      code.length === 6 && codigoValido === true && "border-green-500",
                      code.length === 6 && codigoValido === false && "border-red-500"
                    )}
                  />
                  {verificandoCodigo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  )}
                  {code.length === 6 && codigoValido === true && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Ingresa el código de 6 dígitos que recibiste
                </p>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading || success || codigoValido !== true}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading || success || codigoValido !== true}
                  className={cn(
                    "h-12",
                    confirmarPassword && nuevaPassword !== confirmarPassword && "border-red-500"
                  )}
                />
                {confirmarPassword && nuevaPassword !== confirmarPassword && (
                  <p className="text-xs text-red-600">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* Botón cambiar contraseña */}
              <Button
                type="submit"
                disabled={loading || success || codigoValido !== true || nuevaPassword !== confirmarPassword}
                className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cambiando contraseña...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Contraseña actualizada!
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Cambiar contraseña
                  </>
                )}
              </Button>

            </form>

            {/* Links adicionales */}
            <div className="text-center space-y-2 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                ¿No recibiste el código?{' '}
                <Link 
                  href="/forgot-password" 
                  className="font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                >
                  Solicitar nuevamente
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                ¿Recordaste tu contraseña?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Nota de seguridad */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600 bg-white/60 backdrop-blur-md rounded-lg p-3 border border-white/20">
            🔒 <strong>Seguridad:</strong> El código expira en 1 hora y solo puedes intentar usarlo 3 veces.
          </p>
        </div>

      </div>
    </div>
  );
}