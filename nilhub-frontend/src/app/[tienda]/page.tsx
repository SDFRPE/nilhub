// src/app/[tienda]/page.tsx - VERSIÓN FINAL SIN ERRORES
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TiendaHeader from '@/components/tienda/TiendaHeader';
import SearchBar from '@/components/tienda/SearchBar';
import CategoryFilter from '@/components/tienda/CategoryFilter';
import ProductGrid from '@/components/productos/ProductGrid';
import WhatsAppButton, { generarMensajeGeneral } from '@/components/common/WhatsAppButton';
import { Producto, Tienda } from '@/types';
import api from '@/lib/api';
import { Store, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Skeleton loaders
function SkeletonCard() {
  return (
    <Card className="overflow-hidden bg-white/60 backdrop-blur-md border-2 border-white/20 animate-in fade-in duration-500">
      <CardContent className="p-0">
        <div className="aspect-square bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer 
                        bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-slate-200 rounded-full w-1/3 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded-full w-full animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-full w-2/3 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-full w-1/2 animate-pulse mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Componente principal
export default function CatalogoPage() {
  const params = useParams();
  const tiendaSlug = params.tienda as string;

  // Estados
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados UI
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const tiendaResponse = await api.tiendas.getBySlug(tiendaSlug);
        
        if (!tiendaResponse.success || !tiendaResponse.data) {
          setError('Tienda no encontrada');
          return;
        }

        setTienda(tiendaResponse.data);

        const productosResponse = await api.tiendas.getProductos(tiendaSlug);
        
        if (productosResponse.success) {
          setProductos(productosResponse.data);
        }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la tienda. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tiendaSlug]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const pasaCategoria = categoria === 'todas' || producto.categoria === categoria;
      const terminoBusqueda = busqueda.toLowerCase();
      const pasaBusqueda = !busqueda || 
        producto.nombre.toLowerCase().includes(terminoBusqueda) ||
        producto.descripcion?.toLowerCase().includes(terminoBusqueda) ||
        producto.marca?.toLowerCase().includes(terminoBusqueda);
      
      return pasaCategoria && pasaBusqueda && producto.activo;
    });
  }, [productos, categoria, busqueda]);

  // Contadores por categoría
  const contadores = useMemo(() => {
    const counts: Record<string, number> = { 
      todas: productos.filter(p => p.activo).length 
    };
    
    productos.forEach((producto) => {
      if (producto.activo) {
        counts[producto.categoria] = (counts[producto.categoria] || 0) + 1;
      }
    });
    
    return counts;
  }, [productos]);

  const mensajeWhatsApp = tienda ? generarMensajeGeneral(tienda.nombre) : '';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="relative">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-3xl bg-slate-200 animate-pulse" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-12 bg-slate-200 rounded-full w-3/4 animate-pulse" />
                <div className="h-6 bg-slate-200 rounded-full w-full animate-pulse" />
                <div className="h-6 bg-slate-200 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-[320px_1fr] gap-8 max-w-7xl mx-auto">
              <aside className="space-y-6">
                <div className="h-14 bg-white/60 backdrop-blur-md border-2 border-white/20 rounded-xl animate-pulse" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/60 backdrop-blur-md border-2 border-white/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              </aside>

              <main>
                <SkeletonGrid />
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tienda) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl scale-150" />
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Tienda no encontrada
            </h2>

            <p className="text-slate-600 leading-relaxed">
              {error || 'La tienda que buscas no existe o está temporalmente desactivada.'}
            </p>

            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300"
            >
              Ir al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contenido principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Background animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative">
        {/* Header */}
        <TiendaHeader 
          tienda={tienda}
          showBanner={true}
        />

        {/* Layout principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[320px_1fr] gap-8 max-w-7xl mx-auto">
            
            {/* Sidebar - Desktop */}
            <aside className="lg:sticky lg:top-8 lg:h-fit space-y-6">
              {/* Búsqueda */}
              <div className="animate-in fade-in slide-in-from-left duration-500">
                <SearchBar 
                  value={busqueda}
                  onChange={setBusqueda}
                  placeholder="Buscar productos..."
                />
              </div>

              {/* Filtros verticales - Solo desktop */}
              <div className="hidden lg:block animate-in fade-in slide-in-from-left duration-700">
                <CategoryFilter 
                  categoriaActual={categoria}
                  onCategoriaChange={setCategoria}
                  contadores={contadores}
                  variant="vertical"
                />
              </div>

              {/* Card de info */}
              <Card className="hidden lg:block bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-white/50 backdrop-blur-md">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-900">¿Tienes dudas?</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Consulta disponibilidad y precios directamente por WhatsApp
                  </p>
                </CardContent>
              </Card>
            </aside>

            {/* Contenido principal */}
            <main className="space-y-6">
              {/* Filtros horizontales - Solo mobile */}
              <div className="lg:hidden animate-in fade-in slide-in-from-bottom duration-500">
                <CategoryFilter 
                  categoriaActual={categoria}
                  onCategoriaChange={setCategoria}
                  contadores={contadores}
                  variant="horizontal"
                />
              </div>

              {/* Barra de información */}
              <div className="flex items-center justify-between gap-4 animate-in fade-in duration-700">
                <div className="flex-1">
                  {busqueda || categoria !== 'todas' ? (
                    <Alert className="bg-blue-50 border-blue-200 py-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        {productosFiltrados.length === 0 
                          ? `Sin resultados ${busqueda ? `para "${busqueda}"` : 'en esta categoría'}`
                          : `${productosFiltrados.length} producto${productosFiltrados.length === 1 ? '' : 's'}`
                        }
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
                      {productos.filter(p => p.activo).length} productos disponibles
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid de productos */}
              <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <ProductGrid 
                  productos={productosFiltrados}
                  tiendaSlug={tiendaSlug}
                  showStats={false}
                  emptyMessage={
                    busqueda 
                      ? `No se encontraron productos para "${busqueda}"` 
                      : categoria === 'todas'
                      ? "Esta tienda aún no tiene productos"
                      : "No hay productos en esta categoría"
                  }
                />
              </div>

              {/* Estado vacío */}
              {productos.length === 0 && !loading && (
                <Card className="bg-white/60 backdrop-blur-md border-2 border-white/30">
                  <CardContent className="p-16 text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-slate-400/20 rounded-full blur-3xl scale-150" />
                      <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-700">
                      Catálogo en construcción
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Esta tienda está preparando sus productos. ¡Vuelve pronto para ver las novedades!
                    </p>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>

        {/* WhatsApp flotante */}
        <WhatsAppButton 
          telefono={tienda.whatsapp}
          mensaje={mensajeWhatsApp}
          variant="floating"
          size="md"
        />
      </div>
    </div>
  );
}