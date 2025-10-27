// fronted/src/lib/api.ts
/**
 * @fileoverview Cliente de API para comunicación con el backend
 * Centraliza todas las peticiones HTTP
 * @module api
 */

import axios, { AxiosError } from 'axios';

// ===================================
// CONFIGURACIÓN
// ===================================

/**
 * Base URL de la API desde variables de entorno
 * @constant
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Cliente de Axios configurado con base URL e interceptores
 * @constant
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===================================
// INTERCEPTORES
// ===================================

/**
 * Interceptor de peticiones
 * Agrega el token JWT automáticamente si existe
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas
 * Maneja errores globalmente
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Sesión expirada - Redirigiendo a login');
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===================================
// INTERFACES
// ===================================

export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: 'vendedor' | 'admin';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tienda {
  _id: string;
  usuario_id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  logo_url?: string;
  banner_url?: string;
  color_tema?: string;
  activa: boolean;
  total_productos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Producto {
  _id: string;
  tienda_id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  marca?: string;
  precio: number;
  precio_oferta?: number;
  stock: number;
  hay_stock: boolean;
  imagenes: Array<{
    url: string;
    cloudinary_id: string;
  }>;
  ingredientes?: string;
  peso?: string;
  activo: boolean;
  vistas: number;
  clicks_whatsapp: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// ===================================
// API: AUTENTICACIÓN
// ===================================

export const auth = {
  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string): Promise<ApiResponse<{
    token: string;
    usuario: Usuario;
    tienda?: Tienda;
  }>> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Registrar nuevo usuario
   */
  registro: async (datos: {
    nombre: string;
    email: string;
    password: string;
    nombreTienda: string;
    whatsapp: string;
    instagram?: string;
    facebook?: string;
  }): Promise<ApiResponse<{
    token: string;
    usuario: Usuario;
    tienda: Tienda;
  }>> => {
    try {
      const response = await apiClient.post('/auth/registro', datos);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al registrar');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener usuario actual
   */
  me: async (): Promise<ApiResponse<{
    usuario: Usuario;
    tienda?: Tienda;
  }>> => {
    try {
      const response = await apiClient.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener usuario');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Solicitar código de recuperación
   */
  forgotPassword: async (email: string, metodo: 'email' | 'whatsapp'): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email, metodo });
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al solicitar código');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Verificar código de recuperación
   */
  verifyResetCode: async (email: string, code: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post('/auth/verify-reset-code', { email, code });
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Código inválido');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Cambiar contraseña con código
   */
  resetPassword: async (email: string, code: string, nuevaPassword: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, code, nuevaPassword });
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al cambiar contraseña');
      }
      throw new Error('Error de conexión');
    }
  },
};

// ===================================
// API: PRODUCTOS
// ===================================

export const productos = {
  /**
   * Obtener mis productos (requiere auth)
   */
  getMisProductos: async (): Promise<ApiResponse<Producto[]>> => {
    try {
      const response = await apiClient.get('/productos/mis-productos');
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener productos');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener productos de una tienda (público)
   */
  getByTienda: async (slug: string, categoria?: string, buscar?: string): Promise<ApiResponse<Producto[]>> => {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (buscar) params.append('buscar', buscar);

      const response = await apiClient.get(`/productos/tienda/${slug}?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener productos');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener un producto por ID (público)
   */
  getById: async (id: string): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiClient.get(`/productos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Producto no encontrado');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Crear producto (requiere auth)
   */
  create: async (datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiClient.post('/productos', datos);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al crear producto');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Actualizar producto (requiere auth)
   */
  update: async (id: string, datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiClient.put(`/productos/${id}`, datos);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al actualizar producto');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Eliminar producto (requiere auth)
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.delete(`/productos/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al eliminar producto');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Actualizar stock manualmente (requiere auth)
   */
  updateStock: async (id: string, stock: number, hay_stock: boolean): Promise<ApiResponse<Producto>> => {
    try {
      const response = await apiClient.patch(`/productos/${id}/stock`, { stock, hay_stock });
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al actualizar stock');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Registrar click en WhatsApp (público)
   */
  clickWhatsApp: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.post(`/productos/${id}/click-whatsapp`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn('Error al registrar click WhatsApp:', error);
      return { success: false, data: { message: 'Error' } };
    }
  },
};

// ===================================
// API: TIENDAS
// ===================================

export const tiendas = {
  /**
   * Obtener tienda por slug (público)
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Tienda>> => {
    try {
      const response = await apiClient.get(`/tiendas/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Tienda no encontrada');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener mi tienda (requiere auth)
   */
  getMiTienda: async (): Promise<ApiResponse<Tienda>> => {
    try {
      const response = await apiClient.get('/tiendas/mi-tienda');
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener tienda');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Actualizar mi tienda (requiere auth)
   */
  update: async (datos: Partial<Tienda>): Promise<ApiResponse<Tienda>> => {
    try {
      const response = await apiClient.put('/tiendas/mi-tienda', datos);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al actualizar tienda');
      }
      throw new Error('Error de conexión');
    }
  },
};

// ===================================
// API: UPLOAD
// ===================================

export const upload = {
  /**
   * Subir una imagen (requiere auth)
   */
  imagen: async (file: File): Promise<ApiResponse<{
    url: string;
    cloudinary_id: string;
  }>> => {
    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const response = await apiClient.post('/upload/imagen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al subir imagen');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Subir múltiples imágenes (requiere auth)
   */
  imagenes: async (files: File[]): Promise<ApiResponse<Array<{
    url: string;
    cloudinary_id: string;
  }>>> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('imagenes', file);
      });

      const response = await apiClient.post('/upload/imagenes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data.imagenes };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al subir imágenes');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Eliminar imagen (requiere auth)
   */
  delete: async (cloudinary_id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.delete(`/upload/${cloudinary_id}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al eliminar imagen');
      }
      throw new Error('Error de conexión');
    }
  },
};

// ===================================
// API: ADMIN
// ===================================

export const admin = {
  /**
   * Obtener estadísticas globales (requiere rol admin)
   */
  getStats: async (): Promise<ApiResponse<{
    usuarios: number;
    vendedores: number;
    tiendas: number;
    tiendas_activas: number;
    productos: number;
    productos_activos: number;
  }>> => {
    try {
      const response = await apiClient.get('/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener estadísticas');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener todos los usuarios (requiere rol admin)
   */
  getUsuarios: async (): Promise<ApiResponse<Usuario[]>> => {
    try {
      const response = await apiClient.get('/admin/usuarios');
      return { success: true, data: response.data.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener usuarios');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Obtener todas las tiendas (requiere rol admin)
   */
  getTiendas: async (): Promise<ApiResponse<Tienda[]>> => {
    try {
      const response = await apiClient.get('/admin/tiendas');
      return { success: true, data: response.data.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al obtener tiendas');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Activar/Desactivar tienda (requiere rol admin)
   */
  toggleTienda: async (id: string): Promise<ApiResponse<Tienda>> => {
    try {
      const response = await apiClient.put(`/admin/tiendas/${id}/toggle`);
      return { success: true, data: response.data.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al cambiar estado de tienda');
      }
      throw new Error('Error de conexión');
    }
  },

  /**
   * Eliminar usuario (requiere rol admin)
   */
  deleteUsuario: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiClient.delete(`/admin/usuarios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || 'Error al eliminar usuario');
      }
      throw new Error('Error de conexión');
    }
  },
};

// ===================================
// EXPORT DEFAULT
// ===================================

const api = {
  auth,
  productos,
  tiendas,
  upload,
  admin,
};

export default api;