// fronted/src/components/layout/AdminSidebar.tsx
/**
 * @fileoverview Sidebar de navegación del panel de administración
 * Menú lateral adaptativo: muestra UI diferente para admin vs vendedor
 * @module AdminSidebar
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Store,
  Sparkles,
  Users,
  ShoppingBag,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===================================
// CONFIGURACIÓN DEL MENÚ
// ===================================

/**
 * Items del menú para VENDEDORES
 * Gestión de su propia tienda y productos
 * @constant
 */
const menuItemsVendedor = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Productos',
    href: '/admin/productos',
    icon: Package,
  },
  {
    title: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
  },
];

/**
 * Items del menú para ADMINISTRADORES
 * Gestión de toda la plataforma
 * @constant
 */
const menuItemsAdmin = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Tiendas',
    href: '/admin/tiendas',
    icon: Store,
  },
  {
    title: 'Productos',
    href: '/admin/productos',
    icon: ShoppingBag,
  },
];

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Sidebar de navegación para el panel admin
 * 
 * Muestra diferentes menús según el rol:
 * - Admin: Gestión global de usuarios, tiendas y productos
 * - Vendedor: Gestión de su propia tienda y productos
 * 
 * @returns Sidebar renderizado
 * 
 * @example
 * // Usado en layout.tsx del admin
 * <div className="flex">
 *   <AdminSidebar />
 *   <main className="flex-1">
 *     {children}
 *   </main>
 * </div>
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { usuario, tienda, isAdmin, logout } = useAuth();

  // Seleccionar menú según rol
  const menuItems = isAdmin ? menuItemsAdmin : menuItemsVendedor;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      
      {/* ===================================
          HEADER CON LOGO
          =================================== */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="relative">
            {/* Efecto glow en el ícono */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Store className="relative h-8 w-8 text-pink-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NilHub
            </h2>
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Administración' : 'Panel Admin'}
            </p>
          </div>
        </Link>
      </div>

      {/* ===================================
          INFORMACIÓN DE USUARIO
          =================================== */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Avatar y datos del usuario */}
        <div className="flex items-center gap-3">
          {/* Avatar con inicial del usuario */}
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
            isAdmin 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
              : "bg-gradient-to-br from-pink-500 to-purple-600"
          )}>
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {usuario?.nombre}
              </p>
              {isAdmin && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
                  <Shield className="h-3 w-3 mr-0.5" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate">
              {usuario?.email}
            </p>
          </div>
        </div>
        
        {/* Info adicional según rol */}
        {isAdmin ? (
          // Para admin: Mostrar que gestiona la plataforma
          <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-medium text-blue-700">
              Gestión de Plataforma
            </p>
            <p className="text-[10px] text-blue-600 mt-0.5">
              Acceso total al sistema
            </p>
          </div>
        ) : (
          // Para vendedor: Link a su catálogo público
          tienda?.slug && (
            <>
              <p className="text-xs font-medium text-slate-700 mt-3 mb-2">
                Tu tienda:
              </p>
              <Link 
                href={`/${tienda.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-slate-50 transition-colors group border border-slate-200"
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {tienda.nombre}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ver catálogo público
                  </p>
                </div>
              </Link>
            </>
          )
        )}
      </div>

      {/* ===================================
          MENÚ DE NAVEGACIÓN
          =================================== */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Determinar si la ruta actual coincide con el item
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group",
                isActive
                  ? isAdmin
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {/* Ícono con animación de escala */}
              <item.icon className={cn(
                "h-5 w-5 transition-transform",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* ===================================
          FOOTER CON LOGOUT
          =================================== */}
      <div className="p-4 border-t border-slate-200">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}