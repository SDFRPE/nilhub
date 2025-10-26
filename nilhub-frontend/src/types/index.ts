// fronted/src/types/index.ts
export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: 'vendedor' | 'admin';
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

// AGREGAR ESTA INTERFAZ
export interface AuthResponse {
  token: string;
  usuario: Usuario;
  tienda?: Tienda;
}