// fronted/src/components/productos/ProductGallery.tsx
/**
 * @fileoverview Galería de imágenes con navegación para productos
 * Carrusel de imágenes con thumbnails y controles
 * @module ProductGallery
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===================================
// TIPOS
// ===================================

/**
 * Estructura de una imagen
 * @interface Imagen
 */
interface Imagen {
  /** URL completa de la imagen en Cloudinary */
  url: string;
  /** ID de Cloudinary (para eliminar) */
  cloudinary_id: string;
}

/**
 * Props del componente ProductGallery
 * @interface ProductGalleryProps
 */
interface ProductGalleryProps {
  /** Array de imágenes del producto */
  imagenes: Imagen[];
  /** Nombre del producto (para alt text) */
  nombreProducto: string;
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Galería de imágenes con navegación y thumbnails
 * 
 * Características:
 * - Imagen principal grande con glassmorphism
 * - Navegación con flechas (solo si hay múltiples imágenes)
 * - Indicador de posición (1/5)
 * - Thumbnails clicables debajo
 * - Efecto glow y animaciones premium
 * - Placeholder si no hay imágenes
 * 
 * @param props - Props del componente
 * @returns Galería renderizada
 * 
 * @example
 * <ProductGallery
 *   imagenes={producto.imagenes}
 *   nombreProducto={producto.nombre}
 * />
 */
export default function ProductGallery({ 
  imagenes, 
  nombreProducto 
}: ProductGalleryProps) {
  
  /** Índice de la imagen actualmente mostrada */
  const [imagenActual, setImagenActual] = useState(0);

  /**
   * Navega a la imagen anterior
   * Si está en la primera, va a la última (ciclo)
   * @private
   */
  const irAnterior = () => {
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  /**
   * Navega a la siguiente imagen
   * Si está en la última, va a la primera (ciclo)
   * @private
   */
  const irSiguiente = () => {
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  // ===================================
  // ESTADO VACÍO
  // ===================================
  
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 
                    rounded-3xl flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-sm font-medium">Sin imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* ===================================
          IMAGEN PRINCIPAL
          =================================== */}
      <div className="relative group">
        {/* Efecto glow de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 
                      rounded-3xl blur-3xl"></div>
        
        {/* Container con glassmorphism */}
        <div className="relative bg-white/80 backdrop-blur-xl border-4 border-white/50 
                      rounded-3xl overflow-hidden shadow-2xl aspect-square">
          <Image
            src={imagenes[imagenActual].url}
            alt={`${nombreProducto} - Imagen ${imagenActual + 1}`}
            fill
            className="object-cover"
            priority={imagenActual === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />

          {/* Overlay con gradiente en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* ===================================
              CONTROLES DE NAVEGACIÓN
              (solo si hay múltiples imágenes)
              =================================== */}
          {imagenes.length > 1 && (
            <>
              {/* Botón anterior */}
              <button
                onClick={irAnterior}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2",
                  "w-10 h-10 rounded-full",
                  "bg-white/90 backdrop-blur-md border-2 border-white/50",
                  "flex items-center justify-center",
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-300",
                  "opacity-0 group-hover:opacity-100",
                  "hover:scale-110 active:scale-95",
                  "z-10"
                )}
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              {/* Botón siguiente */}
              <button
                onClick={irSiguiente}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2",
                  "w-10 h-10 rounded-full",
                  "bg-white/90 backdrop-blur-md border-2 border-white/50",
                  "flex items-center justify-center",
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-300",
                  "opacity-0 group-hover:opacity-100",
                  "hover:scale-110 active:scale-95",
                  "z-10"
                )}
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>

              {/* Indicador de posición (1/5) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                              bg-black/50 backdrop-blur-md">
                  <span className="text-xs font-medium text-white">
                    {imagenActual + 1} / {imagenes.length}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================
          THUMBNAILS
          (solo si hay múltiples imágenes)
          =================================== */}
      {imagenes.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {imagenes.map((imagen, index) => (
            <button
              key={imagen.cloudinary_id}
              onClick={() => setImagenActual(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden",
                "border-2 transition-all duration-300",
                "hover:scale-105 active:scale-95",
                imagenActual === index
                  ? "border-pink-500 shadow-lg shadow-pink-500/50 ring-2 ring-pink-500/20"
                  : "border-white/30 hover:border-white/50 shadow-md"
              )}
            >
              {/* Overlay de selección */}
              {imagenActual === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20"></div>
              )}

              <Image
                src={imagen.url}
                alt={`${nombreProducto} - Miniatura ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  imagenActual === index ? "scale-110" : "scale-100 hover:scale-105"
                )}
                sizes="100px"
              />

              {/* Overlay en hover */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-300",
                imagenActual === index 
                  ? "bg-pink-500/10" 
                  : "bg-black/0 hover:bg-black/10"
              )}></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}