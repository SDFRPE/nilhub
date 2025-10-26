'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  telefono: string; // Número de WhatsApp (formato: 51999999999)
  mensaje: string;  // Mensaje pre-formateado
  className?: string;
  variant?: 'floating' | 'inline'; // floating = botón fijo, inline = botón normal
  size?: 'sm' | 'md' | 'lg';
}

export default function WhatsAppButton({
  telefono,
  mensaje,
  className,
  variant = 'floating',
  size = 'md'
}: WhatsAppButtonProps) {
  
  // Función para abrir WhatsApp
  const abrirWhatsApp = () => {
    // Limpiar el número (solo dígitos)
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Detectar si es móvil para usar la app o web
    const esMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // URL de WhatsApp
    const whatsappURL = esMobile
      ? `whatsapp://send?phone=${numeroLimpio}&text=${mensajeCodificado}`
      : `https://web.whatsapp.com/send?phone=${numeroLimpio}&text=${mensajeCodificado}`;
    
    // Abrir en nueva ventana
    window.open(whatsappURL, '_blank');
  };

  // Estilos según el tamaño
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Si es floating (botón fijo)
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
          {/* Efecto pulse en el fondo */}
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

          {/* Efecto shine en hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                        transition-transform duration-700 bg-gradient-to-r 
                        from-transparent via-white/20 to-transparent"></div>
        </Button>

        {/* Tooltip opcional */}
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

  // Si es inline (botón normal)
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

      {/* Efecto shine en hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                    transition-transform duration-700 bg-gradient-to-r 
                    from-transparent via-white/20 to-transparent"></div>
    </Button>
  );
}

// 🎁 BONUS: Función helper para generar mensajes pre-formateados
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

// 🎁 BONUS: Función helper para mensaje genérico de tienda
export function generarMensajeGeneral(nombreTienda: string): string {
  return `¡Hola *${nombreTienda}*! 👋

Vi tu catálogo y me gustaría hacer una consulta. ¿Podrías ayudarme? 🛍️`;
}