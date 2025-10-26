// src/components/productos/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';
import { Producto } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  producto: Producto;
  tiendaSlug: string;
  showStats?: boolean; // Para mostrar vistas/clicks (opcional)
}

export default function ProductCard({ 
  producto, 
  tiendaSlug,
  showStats = false 
}: ProductCardProps) {
  
  // Calcular % de descuento si hay precio oferta
  const descuento = producto.precio_oferta 
    ? Math.round(((producto.precio - producto.precio_oferta) / producto.precio) * 100)
    : 0;

  // Imagen principal (primera del array)
  const imagenPrincipal = producto.imagenes[0]?.url || '/placeholder-product.jpg';

  // Mapeo de categorías a colores
  const getCategoriaColor = (categoria: string) => {
    const colores: Record<string, string> = {
      'maquillaje': 'from-pink-500 to-rose-500',
      'skincare': 'from-green-500 to-emerald-500',
      'fragancias': 'from-purple-500 to-indigo-500',
      'cuidado-personal': 'from-blue-500 to-cyan-500',
      'accesorios': 'from-orange-500 to-amber-500',
    };
    return colores[categoria] || 'from-slate-500 to-slate-600';
  };

  return (
    <Link 
      href={`/${tiendaSlug}/producto/${producto._id}`}
      className="group block"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-500",
        "bg-white/60 backdrop-blur-md border-2 border-white/20",
        "shadow-lg hover:shadow-2xl hover:shadow-pink-500/20",
        "hover:scale-105 hover:-translate-y-2",
        "hover:border-white/40",
        !producto.hay_stock && "opacity-70"
      )}>
        {/* Efecto glow en hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 
                      group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 
                      transition-all duration-500 pointer-events-none"></div>

        <CardContent className="p-0">
          {/* Contenedor de imagen */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* Overlay con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Badges superiores */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2 z-10">
              {/* Badge de descuento */}
              {producto.precio_oferta && (
                <Badge className={cn(
                  "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0",
                  "shadow-lg shadow-red-500/50 font-bold px-2.5 py-1"
                )}>
                  -{descuento}%
                </Badge>
              )}

              {/* Badge de stock */}
              <Badge 
                variant={producto.hay_stock ? "default" : "secondary"}
                className={cn(
                  "font-medium px-2.5 py-1 shadow-md",
                  producto.hay_stock 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-slate-400 text-white"
                )}
              >
                {producto.hay_stock ? `Stock: ${producto.stock}` : 'Sin stock'}
              </Badge>
            </div>

            {/* Badge de categoría (inferior izquierdo) */}
            <div className="absolute bottom-3 left-3 z-10">
              <Badge className={cn(
                "bg-gradient-to-r text-white border-0 shadow-lg backdrop-blur-sm",
                "bg-white/20 backdrop-blur-md border border-white/30",
                getCategoriaColor(producto.categoria)
              )}>
                {producto.categoria}
              </Badge>
            </div>

            {/* Estadísticas (inferior derecho) - Solo si showStats=true */}
            {showStats && (
              <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <Eye className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">{producto.vistas}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <MessageCircle className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">{producto.clicks_whatsapp}</span>
                </div>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="p-4 space-y-3">
            {/* Marca (si existe) */}
            {producto.marca && (
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {producto.marca}
              </p>
            )}

            {/* Nombre del producto */}
            <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[3rem] 
                         group-hover:text-transparent group-hover:bg-gradient-to-r 
                         group-hover:from-pink-600 group-hover:to-purple-600 
                         group-hover:bg-clip-text transition-all duration-300">
              {producto.nombre}
            </h3>

            {/* Descripción corta */}
            {producto.descripcion && (
              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {producto.descripcion}
              </p>
            )}

            {/* Precios */}
            <div className="flex items-end gap-2 pt-2">
              {producto.precio_oferta ? (
                <>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 
                                 bg-clip-text text-transparent">
                    S/ {producto.precio_oferta.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-400 line-through pb-1">
                    S/ {producto.precio.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-slate-900">
                  S/ {producto.precio.toFixed(2)}
                </span>
              )}
            </div>

            {/* Botón de acción - aparece en hover */}
            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={cn(
                "w-full py-2 px-4 rounded-lg text-center font-medium",
                "bg-gradient-to-r from-pink-500 to-purple-600 text-white",
                "flex items-center justify-center gap-2",
                "shadow-lg shadow-pink-500/30",
                "transform group-hover:shadow-xl group-hover:shadow-pink-500/50"
              )}>
                <Sparkles className="w-4 h-4" />
                <span>Ver detalles</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}