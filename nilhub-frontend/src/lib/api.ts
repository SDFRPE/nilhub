// src/lib/api.ts - COMPLETO CON CORRECCIÓN
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ===================================
// TIPOS
// ===================================

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  role: 'user' | 'admin';
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
  logo_cloudinary_id?: string;
  banner_url?: string;
  banner_cloudinary_id?: string;
  color_tema: string;
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
  categoria: 'maquillaje' | 'skincare' | 'fragancias' | 'cuidado-personal' | 'accesorios' | 'otros';
  marca?: string;
  precio: number;
  precio_oferta?: number;
  stock: number;
  hay_stock: boolean;
  imagenes: {
    url: string;
    cloudinary_id: string;
    _id?: string;
  }[];
  ingredientes?: string;
  peso?: string;
  activo: boolean;
  vistas: number;
  clicks_whatsapp: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    usuario: Usuario;
    tienda: Tienda | null;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
  errors?: Array<{ type: string; value: string; msg: string; path: string; location: string }>;
}

export interface DashboardStats {
  totalProductos: number;
  productosActivos: number;
  productosSinStock: number;
  totalVistas: number;
  totalClicks: number;
}

// ===================================
// HELPER: Obtener Token
// ===================================

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// ===================================
// HELPER: Headers con Autenticación
// ===================================

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// ===================================
// HELPER: Manejo de Errores (MEJORADO)
// ===================================

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // Intentar parsear JSON
  let data;
  try {
    data = await response.json();
  } catch (error) {
    // Si falla el parseo, crear un error genérico
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }
  
  if (!response.ok) {
    // Manejar múltiples formatos de error del backend
    const errorMessage = data.error || data.message || 'Error en la petición';
    throw new Error(errorMessage);
  }
  
  return data;
};

// ===================================
// AUTH
// ===================================

export const auth = {
  // Registrar usuario
  registro: async (datos: {
    nombre: string;
    email: string;
    password: string;
    nombreTienda: string;
    whatsapp: string;
    instagram?: string;
    facebook?: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    return handleResponse<AuthResponse['data']>(response);
  },

  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse['data']>(response);
  },

  // Obtener usuario actual
  me: async (): Promise<ApiResponse<{ usuario: Usuario; tienda: Tienda | null }>> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================
// PRODUCTOS
// ===================================

export const productos = {
  // Obtener mis productos (admin)
  getMisProductos: async (): Promise<ApiResponse<Producto[]>> => {
    const response = await fetch(`${API_URL}/productos/mis-productos`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Obtener un producto por ID
  getById: async (id: string): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}`);
    return handleResponse(response);
  },

  // Crear producto
  create: async (datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  // Actualizar producto
  update: async (id: string, datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  // Actualizar solo el stock
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock }),
    });
    return handleResponse(response);
  },

  // Eliminar producto
  delete: async (id: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Registrar click en WhatsApp
  clickWhatsApp: async (id: string): Promise<ApiResponse<{ clicks_whatsapp: number }>> => {
    const response = await fetch(`${API_URL}/productos/${id}/click-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

// ===================================
// TIENDAS
// ===================================

export const tiendas = {
  // Obtener tienda por slug (pública)
  getBySlug: async (slug: string): Promise<ApiResponse<Tienda>> => {
    const response = await fetch(`${API_URL}/tiendas/${slug}`);
    return handleResponse(response);
  },

  // Obtener productos de una tienda (pública)
  getProductos: async (
    slug: string,
    filtros?: { categoria?: string; busqueda?: string }
  ): Promise<ApiResponse<Producto[]>> => {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    
    const url = `${API_URL}/tiendas/${slug}/productos${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // ✅ CORRECCIÓN APLICADA: Actualizar mi tienda (admin)
  update: async (id: string, datos: Partial<Tienda>): Promise<ApiResponse<Tienda>> => {
    const response = await fetch(`${API_URL}/tiendas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },
};

// ===================================
// STATS (Dashboard)
// ===================================

export const stats = {
  // Obtener estadísticas del dashboard
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================
// UPLOAD
// ===================================

export const upload = {
  // Subir una imagen
  imagen: async (file: File, folder?: string): Promise<ApiResponse<{ url: string; cloudinary_id: string }>> => {
    const formData = new FormData();
    formData.append('imagen', file);
    
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = folder ? `${API_URL}/upload/imagen?folder=${folder}` : `${API_URL}/upload/imagen`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(response);
  },

  // Subir múltiples imágenes
  imagenes: async (files: File[], folder?: string): Promise<ApiResponse<{ url: string; cloudinary_id: string }[]>> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('imagenes', file);
    });
    
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = folder ? `${API_URL}/upload/imagenes?folder=${folder}` : `${API_URL}/upload/imagenes`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(response);
  },

  // Eliminar imagen
  delete: async (cloudinary_id: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await fetch(`${API_URL}/upload/${cloudinary_id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
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
  stats,
};

export default api;