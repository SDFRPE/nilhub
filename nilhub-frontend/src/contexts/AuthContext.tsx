// fronted/src/contexts/AuthContext.tsx
/**
 * @fileoverview Contexto de autenticación para NilHub
 * Maneja el estado global de autenticación del usuario
 * Soporta usuarios admin (sin tienda) y vendedores (con tienda)
 * @module AuthContext
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { Usuario, Tienda } from '@/lib/api';

// ===================================
// TIPOS
// ===================================

/**
 * Tipo del contexto de autenticación
 * @interface AuthContextType
 */
interface AuthContextType {
  /** Usuario autenticado (null si no hay sesión) */
  usuario: Usuario | null;
  /** Tienda del usuario (null si es admin o no tiene) */
  tienda: Tienda | null;
  /** Indica si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Indica si se está verificando la sesión */
  isLoading: boolean;
  /** Indica si el usuario es administrador */
  isAdmin: boolean;
  /** Función para iniciar sesión */
  login: (email: string, password: string) => Promise<void>;
  /** Función para registrar nuevo usuario */
  registro: (datos: RegistroData) => Promise<void>;
  /** Función para cerrar sesión */
  logout: () => void;
  /** Función para refrescar datos del usuario */
  refreshUser: () => Promise<void>;
}

/**
 * Datos necesarios para registro de usuario
 * @interface RegistroData
 */
interface RegistroData {
  /** Nombre completo del usuario */
  nombre: string;
  /** Email único */
  email: string;
  /** Contraseña (mínimo 6 caracteres) */
  password: string;
  /** Nombre de la tienda a crear */
  nombreTienda: string;
  /** Número de WhatsApp con código de país */
  whatsapp: string;
  /** Usuario de Instagram (opcional) */
  instagram?: string;
  /** URL de Facebook (opcional) */
  facebook?: string;
}

// ===================================
// CONTEXTO
// ===================================

/** Contexto de autenticación */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===================================
// PROVIDER
// ===================================

/**
 * Proveedor del contexto de autenticación
 * Debe envolver toda la aplicación
 * 
 * Roles soportados:
 * - 'admin': Usuario administrador sin tienda (gestiona la plataforma)
 * - 'vendedor': Usuario con tienda (gestiona su catálogo)
 * 
 * @param props - Props del componente
 * @param props.children - Componentes hijos
 * 
 * @example
 * // En layout.tsx
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estados locales
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Verifica la autenticación al montar el componente
   * Lee el token de localStorage y valida con el backend
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifica si hay una sesión válida
   * Lee el token del localStorage y lo valida con el backend
   * 
   * IMPORTANTE: Los usuarios admin NO tienen tienda asociada
   * 
   * @private
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');

      // Si no hay token, no hay sesión
      if (!token) {
        console.log('ℹ️ No hay token guardado - Usuario no logueado');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Verificando sesión con el backend...');

      // Validar token con el backend
      const response = await api.auth.me();

      if (response.success) {
        const { usuario, tienda } = response.data;
        
        console.log('✅ Sesión válida:', usuario.email);
        console.log('📋 Rol:', usuario.rol);
        
        setUsuario(usuario);
        
        // ⚠️ IMPORTANTE: Admin NO tiene tienda (es null)
        if (usuario.rol === 'admin') {
          console.log('👑 Usuario es administrador - Sin tienda asignada');
          setTienda(null);
        } else {
          console.log('🏪 Usuario es vendedor - Tienda:', tienda?.nombre);
          setTienda(tienda || null);
        }
      } else {
        console.warn('⚠️ Respuesta inválida del servidor');
        localStorage.removeItem('token');
        setUsuario(null);
        setTienda(null);
      }
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      
      // Determinar si limpiar el token
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Limpiar solo si es error de autenticación
        if (errorMsg.includes('401') || errorMsg.includes('no autorizado') || errorMsg.includes('token')) {
          console.log('🗑️ Token inválido o expirado - Limpiando sesión');
          localStorage.removeItem('token');
          setUsuario(null);
          setTienda(null);
        } else {
          // Error de red: mantener token
          console.warn('⚠️ Error de conexión - Manteniendo token para reintentar');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia sesión con email y contraseña
   * Guarda el token en localStorage y redirige al admin
   * 
   * @param email - Email del usuario
   * @param password - Contraseña
   * @throws Error si las credenciales son inválidas
   * 
   * @example
   * try {
   *   await login('user@example.com', 'password123');
   * } catch (error) {
   *   console.error('Login falló:', error.message);
   * }
   */
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login para:', email);
      const response = await api.auth.login(email, password);

      if (response.success) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        console.log('✅ Login exitoso - Token guardado');

        const { usuario, tienda } = response.data;

        // Actualizar estado
        setUsuario(usuario);
        
        // ⚠️ Admin no tiene tienda
        if (usuario.rol === 'admin') {
          console.log('👑 Login como administrador');
          setTienda(null);
        } else {
          console.log('🏪 Login como vendedor');
          setTienda(tienda || null);
        }

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

  /**
   * Registra un nuevo usuario y crea su tienda
   * Guarda el token en localStorage y redirige al admin
   * 
   * NOTA: Solo aplica para rol 'vendedor'
   * El registro de admin se hace manualmente desde el backend
   * 
   * @param datos - Datos del usuario y tienda
   * @throws Error si el registro falla
   * 
   * @example
   * try {
   *   await registro({
   *     nombre: 'María García',
   *     email: 'maria@example.com',
   *     password: 'password123',
   *     nombreTienda: 'Cosméticos Mary',
   *     whatsapp: '51987654321'
   *   });
   * } catch (error) {
   *   console.error('Registro falló:', error.message);
   * }
   */
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
        setTienda(response.data.tienda || null);

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

  /**
   * Cierra la sesión actual
   * Elimina el token del localStorage y redirige al login
   * 
   * @example
   * logout(); // Cierra sesión y redirige a /login
   */
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

  /**
   * Refresca los datos del usuario desde el backend
   * Útil después de actualizar perfil o tienda
   * 
   * @example
   * // Después de actualizar la tienda
   * await api.tiendas.update(id, datos);
   * await refreshUser(); // Recargar datos
   */
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
        const { usuario, tienda } = response.data;
        
        setUsuario(usuario);
        
        // Admin no tiene tienda
        if (usuario.rol === 'admin') {
          setTienda(null);
        } else {
          setTienda(tienda || null);
        }
      }
    } catch (error) {
      console.error('❌ Error al refrescar usuario:', error);
    }
  };

  // Calcular si es admin
  const isAdmin = usuario?.rol === 'admin';

  // Valor del contexto
  const value = {
    usuario,
    tienda,
    isAuthenticated: !!usuario,
    isLoading,
    isAdmin,
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

// ===================================
// HOOK
// ===================================

/**
 * Hook para acceder al contexto de autenticación
 * Debe usarse dentro de un AuthProvider
 * 
 * @returns Contexto de autenticación
 * @throws Error si se usa fuera de AuthProvider
 * 
 * @example
 * function MiComponente() {
 *   const { usuario, isAuthenticated, isAdmin, login, logout } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <div>No autenticado</div>;
 *   }
 * 
 *   if (isAdmin) {
 *     return <div>Panel de Administrador</div>;
 *   }
 * 
 *   return <div>Hola {usuario?.nombre}</div>;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}