// fronted/src/app/admin/productos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Eye,
  MessageCircle,
  AlertCircle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { Producto } from '@/lib/api';

const categorias = [
  { value: '', label: 'Todas las categorías' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'fragancias', label: 'Fragancias' },
  { value: 'cuidado-personal', label: 'Cuidado Personal' },
  { value: 'accesorios', label: 'Accesorios' },
];

export default function ProductosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await api.productos.getMisProductos();
      if (response.success) {
        setProductos(response.data);
      }
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.marca?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  // Stats calculadas
  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo).length;
  const productosSinStock = productos.filter(p => !p.hay_stock).length;

  // Handlers
  const handleUpdateStock = async (id: string, stock: number) => {
    try {
      await api.productos.updateStock(id, stock);
      // Actualizar localmente
      setProductos(prev => prev.map(p => 
        p._id === id ? { ...p, stock, hay_stock: stock > 0 } : p
      ));
    } catch (err) {
      alert('Error al actualizar stock');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await api.productos.delete(id);
      setProductos(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Error al eliminar producto');
      console.error(err);
    }
  };

  const handleToggleActivo = async (id: string) => {
    const producto = productos.find(p => p._id === id);
    if (!producto) return;

    try {
      await api.productos.update(id, { activo: !producto.activo });
      setProductos(prev => prev.map(p => 
        p._id === id ? { ...p, activo: !p.activo } : p
      ));
    } catch (err) {
      alert('Error al actualizar producto');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Mis Productos
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-slate-600">
              {totalProductos} productos totales
            </span>
            <span className="text-sm text-slate-600">•</span>
            <span className="text-sm text-green-600 font-medium">
              {productosActivos} activos
            </span>
            {productosSinStock > 0 && (
              <>
                <span className="text-sm text-slate-600">•</span>
                <span className="text-sm text-orange-600 font-medium">
                  {productosSinStock} sin stock
                </span>
              </>
            )}
          </div>
        </div>

        <Link href="/admin/productos/nuevo">
          <Button 
            size="lg"
            className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/30"
          >
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o marca..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por categoría */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
            >
              {categorias.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Botón limpiar filtros */}
            {(busqueda || categoriaFiltro) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBusqueda('');
                  setCategoriaFiltro('');
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista o Estado vacío */}
      {productosFiltrados.length === 0 ? (
        // Estado vacío
        <Card>
          <CardContent className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {productos.length === 0 ? 'No tienes productos aún' : 'No se encontraron productos'}
            </h3>
            <p className="text-slate-600 mb-6">
              {productos.length === 0 
                ? 'Comienza agregando tu primer producto al catálogo'
                : 'Intenta con otros filtros de búsqueda'
              }
            </p>
            {productos.length === 0 && (
              <Link href="/admin/productos/nuevo">
                <Button className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600">
                  <Plus className="h-5 w-5" />
                  Agregar Primer Producto
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        // Lista de productos
        <div className="space-y-3">
          {productosFiltrados.map((producto) => (
            <ProductoItem
              key={producto._id}
              producto={producto}
              onUpdateStock={handleUpdateStock}
              onDelete={handleDelete}
              onToggleActivo={handleToggleActivo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente: Item de Producto
interface ProductoItemProps {
  producto: Producto;
  onUpdateStock: (id: string, stock: number) => void;
  onDelete: (id: string) => void;
  onToggleActivo: (id: string) => void;
}

function ProductoItem({ producto, onUpdateStock, onDelete, onToggleActivo }: ProductoItemProps) {
  const [editandoStock, setEditandoStock] = useState(false);
  const [stockTemp, setStockTemp] = useState(producto.stock);

  const handleGuardarStock = () => {
    onUpdateStock(producto._id, stockTemp);
    setEditandoStock(false);
  };

  const handleCancelar = () => {
    setStockTemp(producto.stock);
    setEditandoStock(false);
  };

  return (
    <Card className={cn(
      "border-2 transition-all duration-300 hover:shadow-md",
      !producto.activo && "opacity-60 bg-slate-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Imagen */}
          <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-slate-100">
            <img
              src={producto.imagenes[0]?.url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">
                {producto.nombre}
              </h3>
              {!producto.activo && (
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 shrink-0">
                  Inactivo
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="capitalize">{producto.categoria}</span>
              {producto.marca && (
                <>
                  <span>•</span>
                  <span>{producto.marca}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              {/* Precio */}
              <div className="flex items-center gap-2">
                {producto.precio_oferta ? (
                  <>
                    <span className="text-lg font-bold text-pink-600">
                      S/ {producto.precio_oferta.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      S/ {producto.precio.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-slate-900">
                    S/ {producto.precio.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <Eye className="h-3 w-3" />
                  <span>{producto.vistas}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <MessageCircle className="h-3 w-3" />
                  <span>{producto.clicks_whatsapp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Control de stock */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
            {editandoStock ? (
              // Modo edición
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={stockTemp}
                  onChange={(e) => setStockTemp(parseInt(e.target.value) || 0)}
                  className="w-20 h-8 text-center"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={handleGuardarStock}
                    className="h-7 px-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelar}
                    className="h-7 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Modo vista
              <button
                onClick={() => setEditandoStock(true)}
                className="text-left hover:bg-slate-100 p-2 rounded transition-colors group"
              >
                <div className="text-xs text-slate-500 mb-1">Stock</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {producto.stock}
                  </span>
                  <Badge
                    variant={producto.hay_stock ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      producto.hay_stock 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : "bg-orange-100 text-orange-700 border-orange-200"
                    )}
                  >
                    {producto.hay_stock ? 'Disponible' : 'Sin stock'}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-1 group-hover:text-pink-600 transition-colors">
                  Click para editar
                </div>
              </button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            {/* ✅ RUTA CORREGIDA - Removido "/editar/" */}
            <Link href={`/admin/productos/${producto._id}`}>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActivo(producto._id)}
              className={cn(
                "w-full gap-2",
                !producto.activo && "border-green-200 text-green-700 hover:bg-green-50"
              )}
            >
              {producto.activo ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Activar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(producto._id)}
              className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}