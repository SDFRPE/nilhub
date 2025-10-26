'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Sparkles, Info, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProductGallery from '@/components/productos/ProductGallery';
import ProductCard from '@/components/productos/ProductCard';
import WhatsAppButton, { generarMensajeProducto } from '@/components/common/WhatsAppButton';
import { Producto, Tienda } from '@/types';
import api from '@/lib/api';

export default function ProductoDetallePage() {
  const params = useParams();
  const tiendaSlug = params.tienda as string;
  const productoId = params.id as string;

  // Estados
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [productosRelacionados, setProductosRelacionados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Cargar tienda
        const tiendaResponse = await api.tiendas.getBySlug(tiendaSlug);
        if (!tiendaResponse.success || !tiendaResponse.data) {
          setError('Tienda no encontrada');
          return;
        }
        setTienda(tiendaResponse.data);

        // 2. Cargar producto específico
        const productoResponse = await api.productos.getById(productoId);
        if (!productoResponse.success || !productoResponse.data) {
          setError('Producto no encontrado');
          return;
        }
        setProducto(productoResponse.data);

        // 3. Cargar productos de la tienda para encontrar relacionados
        const productosResponse = await api.tiendas.getProductos(tiendaSlug, {
          categoria: productoResponse.data.categoria
        });
        
        if (productosResponse.success) {
          // Filtrar: misma categoría, diferente ID, activos
          const relacionados = productosResponse.data
            .filter(p => p._id !== productoId && p.activo)
            .slice(0, 3);
          
          setProductosRelacionados(relacionados);
        }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tiendaSlug, productoId]);

  // Registrar click de WhatsApp
  const handleWhatsAppClick = async () => {
    if (!producto) return;

    try {
      await api.productos.clickWhatsApp(producto._id);
    } catch (error) {
      console.error('Error al registrar click:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-slate-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Error state - Producto no encontrado
  if (error || !producto || !tienda) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-2 border-white/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-slate-900">Producto no encontrado</h2>
            <p className="text-slate-600">
              {error || 'El producto que buscas no existe o fue eliminado.'}
            </p>
            <Link href={`/${tiendaSlug}`}>
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform">
                Volver al catálogo
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular descuento
  const descuento = producto.precio_oferta 
    ? Math.round(((producto.precio - producto.precio_oferta) / producto.precio) * 100)
    : 0;

  // Mensaje de WhatsApp
  const mensajeWhatsApp = generarMensajeProducto(
    producto.nombre,
    producto.precio,
    producto.precio_oferta
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Background con blobs animados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative">
        {/* Breadcrumb / Volver */}
        <div className="container mx-auto px-4 pt-6">
          <Link 
            href={`/${tiendaSlug}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver al catálogo</span>
          </Link>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Columna izquierda: Galería */}
            <div>
              <ProductGallery 
                imagenes={producto.imagenes}
                nombreProducto={producto.nombre}
              />
            </div>

            {/* Columna derecha: Información */}
            <div className="space-y-6">
              {/* Marca */}
              {producto.marca && (
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {producto.marca}
                </p>
              )}

              {/* Nombre del producto */}
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                {producto.nombre}
              </h1>

              {/* Badges: Categoría, Stock, Descuento */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
                  {producto.categoria}
                </Badge>
                
                {producto.hay_stock ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    ✓ Disponible {producto.stock > 0 && `(${producto.stock} unidades)`}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Sin stock
                  </Badge>
                )}

                {descuento > 0 && (
                  <Badge className="bg-red-500 text-white border-0 font-bold">
                    -{descuento}% OFF
                  </Badge>
                )}
              </div>

              {/* Precios */}
              <div className="flex items-end gap-3">
                {producto.precio_oferta ? (
                  <>
                    <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      S/ {producto.precio_oferta.toFixed(2)}
                    </span>
                    <span className="text-xl text-slate-400 line-through pb-1">
                      S/ {producto.precio.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-slate-900">
                    S/ {producto.precio.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Descripción
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Detalles adicionales */}
              {(producto.ingredientes || producto.peso) && (
                <Card className="bg-white/60 backdrop-blur-md border-2 border-white/30">
                  <CardContent className="p-6 space-y-4">
                    {producto.ingredientes && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Ingredientes
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {producto.ingredientes}
                        </p>
                      </div>
                    )}

                    {producto.peso && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Contenido
                        </h4>
                        <p className="text-sm text-slate-600">
                          {producto.peso}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botón de WhatsApp grande con registro de click */}
              <div onClick={handleWhatsAppClick}>
                <WhatsAppButton 
                  telefono={tienda.whatsapp}
                  mensaje={mensajeWhatsApp}
                  variant="inline"
                  size="lg"
                />
              </div>

              {/* Info adicional */}
              <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-100">
                <p className="text-sm text-blue-800">
                  💬 <span className="font-semibold">¿Tienes dudas?</span> Consúltanos por WhatsApp y te responderemos al instante.
                </p>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          {productosRelacionados.length > 0 && (
            <div className="mt-16 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Productos relacionados
                </h2>
                <Link 
                  href={`/${tiendaSlug}`}
                  className="text-sm font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
                >
                  Ver todo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosRelacionados.map((relacionado) => (
                  <ProductCard
                    key={relacionado._id}
                    producto={relacionado}
                    tiendaSlug={tiendaSlug}
                    showStats={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}