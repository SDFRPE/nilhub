// fronted/src/lib/api.ts - COMPLETO CON CORRECCIÓN
/**
 * @fileoverview Cliente API REST para NilHub
 * Maneja todas las peticiones HTTP al backend
 * @module api
 */

/** URL base de la API */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ===================================
// TIPOS (exportados desde types/index.ts)
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
// HELPERS PRIVADOS
// ===================================

/**
 * Obtiene el token JWT del localStorage
 * @returns Token JWT o null si no existe
 * @private
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Construye headers con autenticación
 * @returns Headers con Content-Type y Authorization (si hay token)
 * @private
 */
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

/**
 * Maneja la respuesta HTTP y parsea JSON
 * Lanza error si la respuesta no es ok
 * 
 * @template T - Tipo de datos esperado en la respuesta
 * @param response - Respuesta HTTP de fetch
 * @returns Promesa con datos parseados
 * @throws Error si la respuesta no es ok o no es JSON válido
 * @private
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // Intentar parsear JSON
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
  }
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Error en la petición';
    throw new Error(errorMessage);
  }
  
  return data;
};

// ===================================
// API: AUTENTICACIÓN
// ===================================

export const auth = {
  /**
   * Registra un nuevo usuario y crea su tienda
   * 
   * @param datos - Datos del usuario y tienda
   * @returns Promesa con token, usuario y tienda
   * @throws Error si el registro falla
   * 
   * @example
   * const response = await api.auth.registro({
   *   nombre: 'María García',
   *   email: 'maria@example.com',
   *   password: 'password123',
   *   nombreTienda: 'Cosméticos Mary',
   *   whatsapp: '51987654321'
   * });
   */
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

  /**
   * Inicia sesión con email y contraseña
   * 
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns Promesa con token, usuario y tienda
   * @throws Error si las credenciales son inválidas
   * 
   * @example
   * const response = await api.auth.login('maria@example.com', 'password123');
   * localStorage.setItem('token', response.data.token);
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse['data']>(response);
  },

  /**
   * Obtiene datos del usuario autenticado actual
   * Requiere token JWT en localStorage
   * 
   * @returns Promesa con usuario y tienda
   * @throws Error si el token es inválido o expiró
   * 
   * @example
   * const response = await api.auth.me();
   * console.log(response.data.usuario.nombre);
   */
  me: async (): Promise<ApiResponse<{ usuario: Usuario; tienda: Tienda | null }>> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================
// API: PRODUCTOS
// ===================================

export const productos = {
  /**
   * Obtiene todos los productos del usuario autenticado
   * Requiere autenticación
   * 
   * @returns Promesa con array de productos
   * @throws Error si no está autenticado
   * 
   * @example
   * const response = await api.productos.getMisProductos();
   * console.log(response.data); // Producto[]
   */
  getMisProductos: async (): Promise<ApiResponse<Producto[]>> => {
    const response = await fetch(`${API_URL}/productos/mis-productos`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Obtiene un producto por su ID
   * Ruta pública
   * 
   * @param id - ID del producto
   * @returns Promesa con el producto
   * @throws Error si el producto no existe
   * 
   * @example
   * const response = await api.productos.getById('507f1f77bcf86cd799439011');
   */
  getById: async (id: string): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}`);
    return handleResponse(response);
  },

  /**
   * Crea un nuevo producto
   * Requiere autenticación
   * 
   * @param datos - Datos del producto a crear
   * @returns Promesa con el producto creado
   * @throws Error si la validación falla
   * 
   * @example
   * const response = await api.productos.create({
   *   nombre: 'Labial Mate Rosa',
   *   precio: 25.00,
   *   categoria: 'maquillaje',
   *   stock: 10,
   *   hay_stock: true,
   *   imagenes: [{ url: '...', cloudinary_id: '...' }]
   * });
   */
  create: async (datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  /**
   * Actualiza un producto existente
   * Requiere autenticación y ser el propietario
   * 
   * @param id - ID del producto
   * @param datos - Datos a actualizar (parcial)
   * @returns Promesa con el producto actualizado
   * @throws Error si no tiene permisos
   * 
   * @example
   * await api.productos.update('507f...', { precio: 30.00 });
   */
  update: async (id: string, datos: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(datos),
    });
    return handleResponse(response);
  },

  /**
   * Actualiza solo el stock de un producto
   * Requiere autenticación
   * 
   * @param id - ID del producto
   * @param stock - Nueva cantidad de stock
   * @returns Promesa con el producto actualizado
   * 
   * @example
   * await api.productos.updateStock('507f...', 5);
   */
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Producto>> => {
    const response = await fetch(`${API_URL}/productos/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock }),
    });
    return handleResponse(response);
  },

  /**
   * Elimina un producto
   * Requiere autenticación y ser el propietario
   * 
   * @param id - ID del producto a eliminar
   * @returns Promesa con confirmación
   * @throws Error si no tiene permisos
   * 
   * @example
   * await api.productos.delete('507f...');
   */
  delete: async (id: string): Promise<ApiResponse<Record<string, never>>> => {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Registra un click en el botón de WhatsApp de un producto
   * Ruta pública (no requiere auth)
   * 
   * @param id - ID del producto
   * @returns Promesa con el nuevo contador de clicks
   * 
   * @example
   * await api.productos.clickWhatsApp('507f...');
   */
  clickWhatsApp: async (id: string): Promise<ApiResponse<{ clicks_whatsapp: number }>> => {
    const response = await fetch(`${API_URL}/productos/${id}/click-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

// ===================================
// API: TIENDAS
// ===================================

export const tiendas = {
  /**
   * Obtiene una tienda por su slug
   * Ruta pública
   * 
   * @param slug - Slug de la tienda (ej: 'cosmeticos-mary')
   * @returns Promesa con los datos de la tienda
   * @throws Error si la tienda no existe o está inactiva
   * 
   * @example
   * const response = await api.tiendas.getBySlug('cosmeticos-mary');
   * console.log(response.data.nombre);
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Tienda>> => {
    const response = await fetch(`${API_URL}/tiendas/${slug}`);
    return handleResponse(response);
  },

  /**
   * Obtiene los productos de una tienda
   * Ruta pública con filtros opcionales
   * 
   * @param slug - Slug de la tienda
   * @param filtros - Filtros opcionales (categoría, búsqueda)
   * @returns Promesa con array de productos
   * 
   * @example
   * // Todos los productos
   * await api.tiendas.getProductos('cosmeticos-mary');
   * 
   * // Con filtros
   * await api.tiendas.getProductos('cosmeticos-mary', {
   *   categoria: 'maquillaje',
   *   busqueda: 'labial'
   * });
   */
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

  /**
   * Actualiza la tienda del usuario autenticado
   * Requiere autenticación
   * 
   * @param id - ID de la tienda
   * @param datos - Datos a actualizar (parcial)
   * @returns Promesa con la tienda actualizada
   * 
   * @example
   * await api.tiendas.update('507f...', {
   *   nombre: 'Nuevo Nombre',
   *   descripcion: 'Nueva descripción',
   *   logo_url: 'https://...'
   * });
   */
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
// API: ESTADÍSTICAS
// ===================================

export const stats = {
  /**
   * Obtiene estadísticas del dashboard
   * Requiere autenticación
   * 
   * @returns Promesa con estadísticas agregadas
   * 
   * @example
   * const response = await api.stats.getDashboard();
   * console.log(response.data.totalProductos);
   */
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================
// API: UPLOAD DE IMÁGENES
// ===================================

export const upload = {
  /**
   * Sube una imagen a Cloudinary
   * Requiere autenticación
   * 
   * @param file - Archivo a subir (File)
   * @param folder - Carpeta de Cloudinary (opcional)
   * @returns Promesa con URL y cloudinary_id
   * @throws Error si el archivo es muy grande o tipo inválido
   * 
   * @example
   * const response = await api.upload.imagen(file, 'logos');
   * console.log(response.data.url); // URL de Cloudinary
   */
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

  /**
   * Sube múltiples imágenes a Cloudinary
   * Requiere autenticación. Máximo 5 imágenes
   * 
   * @param files - Array de archivos a subir
   * @param folder - Carpeta de Cloudinary (opcional)
   * @returns Promesa con array de URLs y IDs
   * @throws Error si hay más de 5 archivos
   * 
   * @example
   * const response = await api.upload.imagenes([file1, file2], 'productos');
   */
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

  /**
   * Elimina una imagen de Cloudinary
   * Requiere autenticación
   * 
   * @param cloudinary_id - ID de la imagen en Cloudinary
   * @returns Promesa con confirmación
   * 
   * @example
   * await api.upload.delete('nilhub/productos/abc123');
   */
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

/**
 * Cliente API completo para NilHub
 * 
 * @example
 * import api from '@/lib/api';
 * 
 * // Autenticación
 * await api.auth.login(email, password);
 * 
 * // Productos
 * const productos = await api.productos.getMisProductos();
 * 
 * // Tiendas
 * const tienda = await api.tiendas.getBySlug('mi-tienda');
 */
const api = {
  auth,
  productos,
  tiendas,
  upload,
  stats,
};

export default api;