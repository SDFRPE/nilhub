// fronted/src/components/layout/AdminSidebar.tsx
/**
 * @fileoverview Sidebar de navegación del panel de administración
 * Menú lateral fijo con navegación, info del usuario y logout
 * @module AdminSidebar
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Store,
  Sparkles,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===================================
// CONFIGURACIÓN DEL MENÚ
// ===================================

/**
 * Items del menú de navegación
 * Cada item tiene título, ruta e ícono
 * @constant
 */
const menuItems = [
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

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Sidebar de navegación para el panel admin
 * 
 * Barra lateral fija con:
 * - Logo y branding
 * - Información del usuario y tienda
 * - Menú de navegación con estados activos
 * - Botón para ver catálogo público
 * - Botón de cerrar sesión
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
  const { usuario, tienda, logout } = useAuth();

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
            <p className="text-xs text-slate-500">Panel Admin</p>
          </div>
        </Link>
      </div>

      {/* ===================================
          INFORMACIÓN DE USUARIO Y TIENDA
          =================================== */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Avatar y datos del usuario */}
        <div className="flex items-center gap-3">
          {/* Avatar con inicial del usuario */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {tienda?.nombre || 'Mi Tienda'}
            </p>
            <p className="text-xs text-slate-600 truncate">
              {usuario?.email}
            </p>
          </div>
        </div>
        
        {/* Link al catálogo público */}
        {tienda?.slug && (
          <Link 
            href={`/${tienda.slug}`}
            target="_blank"
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-purple-600 transition-colors">
              Ver catálogo público
            </span>
          </Link>
        )}
      </div>

      {/* ===================================
          MENÚ DE NAVEGACIÓN
          =================================== */}
      <nav className="flex-1 p-4 space-y-1">
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
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
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