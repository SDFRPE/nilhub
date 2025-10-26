'use client';

import ProductCard from './ProductCard';
import { Producto } from '@/types';
import { Package, Search } from 'lucide-react';

interface ProductGridProps {
  productos: Producto[];
  tiendaSlug: string;
  showStats?: boolean; // Pasar a ProductCard si queremos mostrar stats
  emptyMessage?: string; // Mensaje personalizado cuando no hay productos
}

export default function ProductGrid({ 
  productos, 
  tiendaSlug,
  showStats = false,
  emptyMessage = "No se encontraron productos"
}: ProductGridProps) {
  
  // Estado vacío - cuando no hay productos
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        {/* Card con glassmorphism */}
        <div className="relative max-w-md w-full">
          {/* Efecto glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 
                        rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-white/60 backdrop-blur-xl border-2 border-white/20 
                        rounded-3xl p-12 text-center shadow-2xl">
            {/* Ícono animado */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 
                              rounded-2xl blur-lg opacity-30"></div>
                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 
                              flex items-center justify-center">
                  <Search className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            {/* Mensaje */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {emptyMessage}
            </h3>
            <p className="text-slate-600">
              Prueba cambiando los filtros o buscando otro término
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contador de productos */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Package className="w-4 h-4" />
        <span className="font-medium">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <ProductCard
            key={producto._id}
            producto={producto}
            tiendaSlug={tiendaSlug}
            showStats={showStats}
          />
        ))}
      </div>

      {/* Mensaje motivacional si hay pocos productos */}
      {productos.length > 0 && productos.length <= 3 && (
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 
                      border-2 border-white/50 backdrop-blur-sm">
          <p className="text-center text-slate-600 text-sm">
            💡 <span className="font-medium">Tip:</span> Los catálogos con más productos reciben más visitas
          </p>
        </div>
      )}
    </div>
  );
}