// fronted/src/types/index.ts
/**
 * @fileoverview Definiciones de tipos TypeScript para NilHub
 * Centraliza todas las interfaces utilizadas en la aplicación
 * @module types
 */

// ===================================
// INTERFACES DE ENTIDADES
// ===================================

/**
 * Usuario registrado en la plataforma
 * @interface Usuario
 */
export interface Usuario {
  /** ID único de MongoDB */
  _id: string;
  /** Email del usuario (único) */
  email: string;
  /** Nombre completo del usuario */
  nombre: string;
  /** Rol del usuario en el sistema */
  rol: 'vendedor' | 'admin';
  /** Estado de la cuenta */
  activo: boolean;
  /** Fecha de creación (ISO string) */
  createdAt: string;
  /** Fecha de última actualización (ISO string) */
  updatedAt: string;
}

/**
 * Tienda virtual de un vendedor
 * @interface Tienda
 */
export interface Tienda {
  /** ID único de MongoDB */
  _id: string;
  /** ID del usuario propietario */
  usuario_id: string;
  /** Nombre de la tienda */
  nombre: string;
  /** URL amigable (único, auto-generado) */
  slug: string;
  /** Descripción de la tienda */
  descripcion?: string;
  /** Número de WhatsApp con código de país */
  whatsapp: string;
  /** Usuario de Instagram sin @ */
  instagram?: string;
  /** URL de Facebook */
  facebook?: string;
  /** URL del logo en Cloudinary */
  logo_url?: string;
  /** URL del banner en Cloudinary */
  banner_url?: string;
  /** Color hexadecimal del tema */
  color_tema?: string;
  /** Estado de la tienda */
  activa: boolean;
  /** Contador de productos activos */
  total_productos: number;
  /** Fecha de creación (ISO string) */
  createdAt: string;
  /** Fecha de última actualización (ISO string) */
  updatedAt: string;
}

/**
 * Producto de una tienda
 * @interface Producto
 */
export interface Producto {
  /** ID único de MongoDB */
  _id: string;
  /** ID de la tienda propietaria */
  tienda_id: string;
  /** Nombre del producto */
  nombre: string;
  /** Descripción detallada */
  descripcion?: string;
  /** Categoría del producto */
  categoria: string;
  /** Marca del producto */
  marca?: string;
  /** Precio regular en soles */
  precio: number;
  /** Precio en oferta */
  precio_oferta?: number;
  /** Cantidad disponible (manual) */
  stock: number;
  /** Indicador de disponibilidad */
  hay_stock: boolean;
  /** Array de imágenes del producto */
  imagenes: Array<{
    /** URL completa de la imagen */
    url: string;
    /** ID de Cloudinary para eliminar */
    cloudinary_id: string;
  }>;
  /** Lista de ingredientes */
  ingredientes?: string;
  /** Peso/tamaño del producto */
  peso?: string;
  /** Visibilidad en catálogo */
  activo: boolean;
  /** Contador de visualizaciones */
  vistas: number;
  /** Contador de clicks en WhatsApp */
  clicks_whatsapp: number;
  /** Fecha de creación (ISO string) */
  createdAt: string;
  /** Fecha de última actualización (ISO string) */
  updatedAt: string;
}

// ===================================
// RESPUESTAS DE LA API
// ===================================

/**
 * Respuesta de autenticación exitosa
 * @interface AuthResponse
 */
export interface AuthResponse {
  /** JWT para autenticación */
  token: string;
  /** Datos del usuario autenticado */
  usuario: Usuario;
  /** Tienda del usuario (si existe) */
  tienda?: Tienda;
}