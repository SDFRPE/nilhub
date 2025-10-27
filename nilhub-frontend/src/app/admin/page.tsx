// fronted/src/app/admin/page.tsx
/**
 * @fileoverview Dashboard principal del panel de administración
 * Adaptativo: muestra estadísticas globales para admin o de tienda para vendedor
 * @module AdminDashboard
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Eye, 
  MessageCircle, 
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Loader2,
  Users,
  Store,
  ShoppingBag,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api, { Producto, Tienda } from '@/lib/api';

// ===================================
// INTERFACES
// ===================================

/**
 * Estadísticas de una tienda (para vendedor)
 */
interface StatsVendedor {
  total_productos: number;
  total_visitas: number;
  clicks_whatsapp: number;
  productos_sin_stock: number;
  ultimos_productos: Producto[];
}

/**
 * Estadísticas globales (para admin)
 */
interface StatsAdmin {
  usuarios: number;
  vendedores: number;
  tiendas: number;
  tiendas_activas: number;
  productos: number;
  productos_activos: number;
}

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Dashboard adaptativo según rol del usuario
 * - Admin: Estadísticas globales de la plataforma
 * - Vendedor: Estadísticas de su tienda
 */
export default function AdminDashboard() {
  const { usuario, tienda, isAdmin } = useAuth();
  
  // Estados
  const [statsVendedor, setStatsVendedor] = useState<StatsVendedor | null>(null);
  const [statsAdmin, setStatsAdmin] = useState<StatsAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      cargarEstadisticasAdmin();
    } else {
      cargarEstadisticasVendedor();
    }
  }, [isAdmin]);

  /**
   * Carga estadísticas globales para administrador
   */
  const cargarEstadisticasAdmin = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint de stats del admin
      const response = await api.admin.getStats();
      
      if (response.success) {
        setStatsAdmin(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas admin:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga estadísticas de la tienda del vendedor
   */
  const cargarEstadisticasVendedor = async () => {
    try {
      setLoading(true);
      
      // Obtener productos del backend
      const response = await api.productos.getMisProductos();
      
      if (response.success) {
        const productos = response.data;
        
        // Calcular estadísticas
        const total_visitas = productos.reduce((sum, p) => sum + p.vistas, 0);
        const clicks_whatsapp = productos.reduce((sum, p) => sum + p.clicks_whatsapp, 0);
        const productos_sin_stock = productos.filter(p => !p.hay_stock).length;
        
        // Obtener últimos 3 productos
        const ultimos_productos = productos.slice(0, 3);
        
        setStatsVendedor({
          total_productos: productos.length,
          total_visitas,
          clicks_whatsapp,
          productos_sin_stock,
          ultimos_productos,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas vendedor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Renderizar dashboard según rol
  return isAdmin ? <DashboardAdmin stats={statsAdmin} /> : <DashboardVendedor stats={statsVendedor} tienda={tienda} />;
}

// ===================================
// DASHBOARD ADMINISTRADOR
// ===================================

/**
 * Dashboard para usuarios administradores
 * Muestra estadísticas globales de la plataforma
 */
function DashboardAdmin({ stats }: { stats: StatsAdmin | null }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          <p className="text-slate-600">
            Vista global de la plataforma NilHub
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Usuarios */}
        <Card className="border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Usuarios
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.usuarios || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.vendedores || 0} vendedores registrados
            </p>
          </CardContent>
        </Card>

        {/* Total Tiendas */}
        <Card className="border-2 border-transparent hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Tiendas
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.tiendas || 0}
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-600"></span>
              {stats?.tiendas_activas || 0} activas
            </p>
          </CardContent>
        </Card>

        {/* Total Productos */}
        <Card className="border-2 border-transparent hover:border-pink-200 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Productos
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.productos || 0}
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-600"></span>
              {stats?.productos_activos || 0} activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/usuarios">
          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Users className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Gestionar Usuarios</p>
                  <p className="text-xs text-slate-500">Ver todos los usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tiendas">
          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <Store className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Gestionar Tiendas</p>
                  <p className="text-xs text-slate-500">Ver todas las tiendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/productos">
          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ver Productos</p>
                  <p className="text-xs text-slate-500">Todos los productos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info Banner */}
      <Card className="border-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white">
        <CardContent className="relative p-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6" />
              <Badge className="bg-white/20 text-white border-white/30">
                Admin
              </Badge>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Administración de NilHub
            </h3>
            <p className="text-white/90 max-w-2xl">
              Tienes acceso completo a la plataforma. Gestiona usuarios, tiendas y productos. 
              Recuerda mantener la calidad del contenido y moderar cuando sea necesario.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================================
// DASHBOARD VENDEDOR
// ===================================

/**
 * Dashboard para vendedores
 * Muestra estadísticas de su tienda
 */
function DashboardVendedor({ stats, tienda }: { stats: StatsVendedor | null; tienda: Tienda | null }) {
  // Calcular tasa de conversión de forma segura
  const tasaConversion = stats?.total_visitas && stats?.clicks_whatsapp
    ? ((stats.clicks_whatsapp / stats.total_visitas) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Bienvenido de vuelta, aquí está el resumen de tu tienda
          </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Productos */}
        <Card className="border-2 border-transparent hover:border-pink-200 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Productos
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.total_productos || 0}
            </div>
            {stats?.productos_sin_stock && stats.productos_sin_stock > 0 && (
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-600"></span>
                {stats.productos_sin_stock} sin stock
              </p>
            )}
          </CardContent>
        </Card>

        {/* Visitas */}
        <Card className="border-2 border-transparent hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Visitas Totales
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.total_visitas || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              A tu catálogo completo
            </p>
          </CardContent>
        </Card>

        {/* Clicks WhatsApp */}
        <Card className="border-2 border-transparent hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Consultas WhatsApp
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats?.clicks_whatsapp || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Clientes interesados
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Conversión */}
        <Card className="border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Tasa de Consulta
              </CardTitle>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {tasaConversion}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Visitas que consultan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Productos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Productos Recientes
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Tus últimos productos agregados
              </p>
            </div>
            <Link href="/admin/productos">
              <Button variant="outline" size="sm" className="gap-2">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!stats?.ultimos_productos || stats.ultimos_productos.length === 0 ? (
            // Estado vacío
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No tienes productos aún
              </h3>
              <p className="text-slate-600 mb-6">
                Comienza agregando tu primer producto al catálogo
              </p>
              <Link href="/admin/productos/nuevo">
                <Button className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600">
                  <Plus className="h-5 w-5" />
                  Agregar Primer Producto
                </Button>
              </Link>
            </div>
          ) : (
            // Lista de productos
            <div className="space-y-4">
              {stats.ultimos_productos.map((producto) => (
                <div
                  key={producto._id}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-slate-100 hover:border-pink-200 transition-all duration-300 hover:shadow-md"
                >
                  {/* Imagen */}
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={producto.imagenes[0]?.url}
                      alt={producto.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">
                      {producto.nombre}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-lg font-bold text-pink-600">
                        S/ {producto.precio.toFixed(2)}
                      </span>
                      <Badge
                        variant={producto.hay_stock ? "default" : "outline"}
                        className={producto.hay_stock 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-orange-100 text-orange-700 border-orange-200"
                        }
                      >
                        {producto.hay_stock ? 'En Stock' : 'Sin Stock'}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">{producto.vistas}</span>
                      </div>
                      <p className="text-xs text-slate-500">vistas</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-semibold">{producto.clicks_whatsapp}</span>
                      </div>
                      <p className="text-xs text-slate-500">consultas</p>
                    </div>
                  </div>

                  {/* Botón editar */}
                  <Link href={`/admin/productos/${producto._id}`}>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA Banner */}
      <Card className="border-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 text-white overflow-hidden">
        <CardContent className="relative p-8">
          {/* Pattern decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6" />
                <Badge className="bg-white/20 text-white border-white/30">
                  Consejo
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                ¿Quieres vender más?
              </h3>
              <p className="text-white/90 max-w-xl">
                Comparte el link de tu catálogo en tus redes sociales y en el estado de WhatsApp. 
                Mientras más visitas, más ventas conseguirás.
              </p>
            </div>
            {tienda?.slug && (
              <Link href={`/${tienda.slug}`} target="_blank">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-slate-50 shadow-xl"
                >
                  Ver Mi Catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}