// src/components/tienda/CategoryFilter.tsx
/**
 * @fileoverview Filtros de categoría para catálogo de productos
 * Sistema de filtrado con 3 variantes visuales
 * @module CategoryFilter
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Leaf, 
  Wind, 
  Heart, 
  Scissors,
  Check
} from 'lucide-react';

// ===================================
// CONFIGURACIÓN DE CATEGORÍAS
// ===================================

/**
 * Configuración de categorías con íconos y colores
 * Cada categoría tiene un ícono específico y gradiente de color
 * @constant
 */
const CATEGORIAS = [
  {
    value: 'todas',
    label: 'Todas',
    icon: Sparkles,
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    activeBg: 'bg-gradient-to-br from-slate-500 to-slate-600'
  },
  {
    value: 'maquillaje',
    label: 'Maquillaje',
    icon: Sparkles,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    activeBg: 'bg-gradient-to-br from-pink-500 to-rose-500'
  },
  {
    value: 'skincare',
    label: 'Skincare',
    icon: Leaf,
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    activeBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  {
    value: 'fragancias',
    label: 'Fragancias',
    icon: Wind,
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    activeBg: 'bg-gradient-to-br from-purple-500 to-indigo-500'
  },
  {
    value: 'cuidado-personal',
    label: 'Cuidado Personal',
    icon: Heart,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    activeBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  {
    value: 'accesorios',
    label: 'Accesorios',
    icon: Scissors,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    activeBg: 'bg-gradient-to-br from-orange-500 to-amber-500'
  }
];

// ===================================
// TIPOS
// ===================================

/**
 * Props del componente CategoryFilter
 * @interface CategoryFilterProps
 */
interface CategoryFilterProps {
  /** Categoría actualmente seleccionada */
  categoriaActual: string;
  /** Callback al cambiar categoría */
  onCategoriaChange: (categoria: string) => void;
  /** Contador de productos por categoría (opcional) */
  contadores?: Record<string, number>;
  /** Variante visual del filtro */
  variant?: 'horizontal' | 'vertical' | 'grid';
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Filtros de categoría con múltiples variantes
 * 
 * Variantes disponibles:
 * - **horizontal**: Scroll horizontal ideal para mobile
 * - **vertical**: Lista vertical ideal para sidebar
 * - **grid**: Grid de 2-3 columnas ideal para secciones
 * 
 * Características:
 * - Íconos personalizados por categoría
 * - Gradientes de color únicos
 * - Contador de productos por categoría
 * - Animaciones en hover y active
 * - Badge de selección con check
 * 
 * @param props - Props del componente
 * @returns Filtros renderizados según variante
 * 
 * @example
 * // Variante horizontal (mobile)
 * <CategoryFilter
 *   categoriaActual={categoria}
 *   onCategoriaChange={setCategoria}
 *   contadores={{ todas: 25, maquillaje: 10 }}
 *   variant="horizontal"
 * />
 * 
 * @example
 * // Variante vertical (sidebar)
 * <CategoryFilter
 *   categoriaActual={categoria}
 *   onCategoriaChange={setCategoria}
 *   variant="vertical"
 * />
 */
export default function CategoryFilter({ 
  categoriaActual, 
  onCategoriaChange,
  contadores,
  variant = 'vertical'
}: CategoryFilterProps) {
  
  // ===================================
  // VARIANTE: HORIZONTAL (Mobile)
  // ===================================
  
  if (variant === 'horizontal') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide px-1">
          Categorías
        </h3>

        {/* Scroll horizontal sin scrollbar visible */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIAS.map((categoria) => {
            const Icon = categoria.icon;
            const isActive = categoriaActual === categoria.value;
            const contador = contadores?.[categoria.value] || 0;
            
            return (
              <button
                key={categoria.value}
                onClick={() => onCategoriaChange(categoria.value)}
                className={cn(
                  "group relative flex-shrink-0",
                  "flex items-center gap-2 px-4 py-2.5 rounded-full",
                  "border-2 transition-all duration-300",
                  "hover:scale-105 active:scale-95",
                  isActive 
                    ? `${categoria.activeBg} text-white border-transparent shadow-lg` 
                    : `${categoria.bg} ${categoria.text} ${categoria.border} hover:border-opacity-50`
                )}
              >
                <Icon className="w-4 h-4" />
                
                <span className="text-sm font-medium whitespace-nowrap">
                  {categoria.label}
                </span>

                {/* Contador de productos */}
                {contadores && contador > 0 && (
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "ml-1 h-5 px-2 text-xs font-bold",
                      isActive 
                        ? "bg-white/20 text-white border-0" 
                        : "bg-white text-slate-700"
                    )}
                  >
                    {contador}
                  </Badge>
                )}

                {/* Ícono de check si está activo */}
                {isActive && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================================
  // VARIANTE: VERTICAL (Sidebar)
  // ===================================
  
  if (variant === 'vertical') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Categorías
        </h3>

        <div className="space-y-2">
          {CATEGORIAS.map((categoria) => {
            const Icon = categoria.icon;
            const isActive = categoriaActual === categoria.value;
            const contador = contadores?.[categoria.value] || 0;
            
            return (
              <button
                key={categoria.value}
                onClick={() => onCategoriaChange(categoria.value)}
                className={cn(
                  "group w-full",
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "border-2 transition-all duration-300",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isActive 
                    ? `${categoria.activeBg} text-white border-transparent shadow-lg` 
                    : `bg-white/60 backdrop-blur-md border-white/20 hover:border-white/40 hover:bg-white/80`
                )}
              >
                {/* Container del ícono */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  "transition-all duration-300",
                  isActive 
                    ? "bg-white/20" 
                    : `${categoria.bg}`
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-white" : categoria.text
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-sm font-medium text-left flex-1",
                  isActive ? "text-white" : "text-slate-700"
                )}>
                  {categoria.label}
                </span>

                {/* Contador */}
                {contadores && contador > 0 && (
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "h-6 px-2.5 text-xs font-bold",
                      isActive 
                        ? "bg-white/20 text-white border-0" 
                        : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {contador}
                  </Badge>
                )}

                {/* Check si activo */}
                {isActive && (
                  <Check className="w-5 h-5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ===================================
  // VARIANTE: GRID
  // ===================================
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Categorías
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {CATEGORIAS.map((categoria) => {
          const Icon = categoria.icon;
          const isActive = categoriaActual === categoria.value;
          const contador = contadores?.[categoria.value] || 0;
          
          return (
            <button
              key={categoria.value}
              onClick={() => onCategoriaChange(categoria.value)}
              className={cn(
                "group relative",
                "flex flex-col items-center gap-3 p-4 rounded-2xl",
                "border-2 transition-all duration-300",
                "hover:scale-105 active:scale-95",
                isActive 
                  ? `${categoria.activeBg} text-white border-transparent shadow-xl` 
                  : `bg-white/60 backdrop-blur-md border-white/20 hover:border-white/40 hover:bg-white/80`
              )}
            >
              {/* Ícono */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "transition-all duration-300",
                isActive 
                  ? "bg-white/20" 
                  : `${categoria.bg}`
              )}>
                <Icon className={cn(
                  "w-6 h-6",
                  isActive ? "text-white" : categoria.text
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isActive ? "text-white" : "text-slate-700"
              )}>
                {categoria.label}
              </span>

              {/* Badge de contador (esquina superior derecha) */}
              {contadores && contador > 0 && (
                <Badge 
                  variant="secondary"
                  className={cn(
                    "absolute -top-1 -right-1",
                    "h-6 w-6 p-0 flex items-center justify-center",
                    "text-xs font-bold rounded-full",
                    isActive 
                      ? "bg-white text-slate-900 border-2 border-white/50" 
                      : `${categoria.activeBg} text-white border-0`
                  )}
                >
                  {contador}
                </Badge>
              )}

              {/* Check si activo (esquina superior izquierda) */}
              {isActive && (
                <div className="absolute top-2 left-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Exportar configuración de categorías para uso externo */
export { CATEGORIAS };