// src/components/common/WhatsAppButton.tsx
/**
 * @fileoverview Botón de WhatsApp para consultas de productos
 * Componente reutilizable que abre WhatsApp con mensaje pre-formateado
 * @module WhatsAppButton
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ===================================
// TIPOS
// ===================================

/**
 * Props del componente WhatsAppButton
 * @interface WhatsAppButtonProps
 */
interface WhatsAppButtonProps {
  /** Número de WhatsApp con código de país (ej: 51987654321) */
  telefono: string;
  /** Mensaje pre-formateado a enviar */
  mensaje: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante del botón: floating (fijo) o inline (normal) */
  variant?: 'floating' | 'inline';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Botón para abrir conversación de WhatsApp
 * 
 * Detecta automáticamente si es móvil para abrir la app o WhatsApp Web.
 * En modo floating, aparece fijo en la esquina inferior derecha.
 * En modo inline, se comporta como un botón normal de ancho completo.
 * 
 * @param props - Props del componente
 * @returns Botón de WhatsApp renderizado
 * 
 * @example
 * // Botón flotante (fijo en pantalla)
 * <WhatsAppButton
 *   telefono="51987654321"
 *   mensaje="Hola, me interesa tu producto"
 *   variant="floating"
 *   size="md"
 * />
 * 
 * @example
 * // Botón inline (normal)
 * <WhatsAppButton
 *   telefono="51987654321"
 *   mensaje={generarMensajeProducto('Labial Rosa', 25.00)}
 *   variant="inline"
 *   size="lg"
 * />
 */
export default function WhatsAppButton({
  telefono,
  mensaje,
  className,
  variant = 'floating',
  size = 'md'
}: WhatsAppButtonProps) {
  
  /**
   * Abre WhatsApp con el mensaje pre-formateado
   * Detecta si es móvil para usar la app o WhatsApp Web
   * @private
   */
  const abrirWhatsApp = () => {
    // Limpiar el número (solo dígitos)
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Detectar si es móvil para usar la app o web
    const esMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // URL de WhatsApp (app en móvil, web en desktop)
    const whatsappURL = esMobile
      ? `whatsapp://send?phone=${numeroLimpio}&text=${mensajeCodificado}`
      : `https://web.whatsapp.com/send?phone=${numeroLimpio}&text=${mensajeCodificado}`;
    
    // Abrir en nueva ventana
    window.open(whatsappURL, '_blank');
  };

  // Clases de tamaño según el prop size
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  // Tamaño del ícono según el prop size
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // ===================================
  // RENDER: BOTÓN FLOTANTE
  // ===================================
  
  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        "animate-in slide-in-from-bottom-8 duration-500",
        className
      )}>
        <Button
          onClick={abrirWhatsApp}
          className={cn(
            "group relative overflow-hidden",
            "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
            "text-white shadow-2xl shadow-green-500/50 hover:shadow-green-500/70",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            sizeClasses[size],
            "rounded-full"
          )}
        >
          {/* Efecto pulse animado en el fondo */}
          <div className="absolute inset-0 bg-green-400 animate-ping opacity-20"></div>
          
          {/* Contenido del botón */}
          <div className="relative flex items-center gap-2">
            <MessageCircle className={cn(
              iconSize[size],
              "animate-bounce"
            )} />
            <span className="font-semibold hidden sm:inline">
              Consultar
            </span>
          </div>

          {/* Efecto shine (brillo) en hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                        transition-transform duration-700 bg-gradient-to-r 
                        from-transparent via-white/20 to-transparent"></div>
        </Button>

        {/* Tooltip informativo (solo visible en hover) */}
        <div className={cn(
          "absolute right-full mr-3 top-1/2 -translate-y-1/2",
          "bg-slate-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg",
          "whitespace-nowrap opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300 pointer-events-none",
          "shadow-lg"
        )}>
          ¡Pregúntanos por WhatsApp!
        </div>
      </div>
    );
  }

  // ===================================
  // RENDER: BOTÓN INLINE
  // ===================================
  
  return (
    <Button
      onClick={abrirWhatsApp}
      className={cn(
        "group relative overflow-hidden w-full",
        "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
        "text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50",
        "transition-all duration-300",
        "hover:scale-105 active:scale-95",
        sizeClasses[size],
        className
      )}
    >
      {/* Contenido del botón */}
      <div className="relative flex items-center justify-center gap-2 w-full">
        <MessageCircle className={iconSize[size]} />
        <span className="font-semibold">
          Consultar por WhatsApp
        </span>
      </div>

      {/* Efecto shine (brillo) en hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-700 bg-gradient-to-r 
                    from-transparent via-white/20 to-transparent"></div>
    </Button>
  );
}

// ===================================
// FUNCIONES HELPER
// ===================================

/**
 * Genera mensaje pre-formateado para un producto específico
 * 
 * Incluye nombre, precio y emoji. Si hay precio de oferta,
 * muestra el precio original tachado.
 * 
 * @param nombreProducto - Nombre del producto
 * @param precio - Precio regular
 * @param precioOferta - Precio de oferta (opcional)
 * @returns Mensaje formateado listo para WhatsApp
 * 
 * @example
 * generarMensajeProducto('Labial Rosa', 25.00, 20.00)
 * // → "¡Hola! 👋 Me interesa este producto:
 * //    *Labial Rosa*
 * //    ~~S/ 25.00~~ → *S/ 20.00*
 * //    ¿Está disponible? 🛍️"
 */
export function generarMensajeProducto(
  nombreProducto: string,
  precio: number,
  precioOferta?: number
): string {
  const precioFinal = precioOferta || precio;
  const textoDescuento = precioOferta 
    ? `\n~~S/ ${precio.toFixed(2)}~~ → *S/ ${precioOferta.toFixed(2)}*`
    : `\nPrecio: *S/ ${precio.toFixed(2)}*`;

  return `¡Hola! 👋 Me interesa este producto:

*${nombreProducto}*${textoDescuento}

¿Está disponible? 🛍️`;
}

/**
 * Genera mensaje genérico para consulta a una tienda
 * 
 * Usado cuando el cliente quiere consultar sin producto específico.
 * 
 * @param nombreTienda - Nombre de la tienda
 * @returns Mensaje formateado listo para WhatsApp
 * 
 * @example
 * generarMensajeGeneral('Cosméticos Mary')
 * // → "¡Hola *Cosméticos Mary*! 👋
 * //    Vi tu catálogo y me gustaría hacer una consulta..."
 */
export function generarMensajeGeneral(nombreTienda: string): string {
  return `¡Hola *${nombreTienda}*! 👋

Vi tu catálogo y me gustaría hacer una consulta. ¿Podrías ayudarme? 🛍️`;
}