// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { Usuario, Tienda } from '@/lib/api';

interface AuthContextType {
  usuario: Usuario | null;
  tienda: Tienda | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registro: (datos: RegistroData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegistroData {
  nombre: string;
  email: string;
  password: string;
  nombreTienda: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ Verificar sesión al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');

      // Si no hay token, salir
      if (!token) {
        console.log('ℹ️ No hay token guardado - Usuario no logueado');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Verificando sesión con el backend...');

      // Verificar token con el backend
      const response = await api.auth.me();

      if (response.success) {
        console.log('✅ Sesión válida:', response.data.usuario.email);
        setUsuario(response.data.usuario);
        setTienda(response.data.tienda);
      } else {
        console.warn('⚠️ Respuesta inválida del servidor');
        localStorage.removeItem('token');
        setUsuario(null);
        setTienda(null);
      }
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      
      // Determinar si limpiar el token o no
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Limpiar token solo si es error de autenticación
        if (errorMsg.includes('401') || errorMsg.includes('no autorizado') || errorMsg.includes('token')) {
          console.log('🗑️ Token inválido o expirado - Limpiando sesión');
          localStorage.removeItem('token');
          setUsuario(null);
          setTienda(null);
        } else {
          // Si es error de red, mantener el token (backend puede estar apagado temporalmente)
          console.warn('⚠️ Error de conexión - Manteniendo token para reintentar');
          // No limpiar el token en este caso
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login para:', email);
      const response = await api.auth.login(email, password);

      if (response.success) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        console.log('✅ Login exitoso - Token guardado');

        // Actualizar estado
        setUsuario(response.data.usuario);
        setTienda(response.data.tienda);

        // Redirigir al admin
        router.push('/admin');
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      const message = error instanceof Error ? error.message : 'Error al ingresar. Verifica tus credenciales';
      throw new Error(message);
    }
  };

  const registro = async (datos: RegistroData) => {
    try {
      console.log('📝 Registrando usuario:', datos.email);
      const response = await api.auth.registro(datos);

      if (response.success) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        console.log('✅ Registro exitoso - Token guardado');

        // Actualizar estado
        setUsuario(response.data.usuario);
        setTienda(response.data.tienda);

        // Redirigir al admin
        router.push('/admin');
      } else {
        throw new Error('Error al registrar usuario');
      }
    } catch (error: unknown) {
      console.error('❌ Error en registro:', error);
      const message = error instanceof Error ? error.message : 'Error al registrar usuario';
      throw new Error(message);
    }
  };

  const logout = () => {
    // Limpiar token
    localStorage.removeItem('token');
    console.log('👋 Sesión cerrada - Token eliminado');

    // Limpiar estado
    setUsuario(null);
    setTienda(null);

    // Redirigir al login
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No hay token para refrescar');
        return;
      }

      console.log('🔄 Refrescando datos del usuario...');
      const response = await api.auth.me();

      if (response.success) {
        console.log('✅ Datos del usuario actualizados');
        setUsuario(response.data.usuario);
        setTienda(response.data.tienda);
      }
    } catch (error) {
      console.error('❌ Error al refrescar usuario:', error);
    }
  };

  const value = {
    usuario,
    tienda,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    registro,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}