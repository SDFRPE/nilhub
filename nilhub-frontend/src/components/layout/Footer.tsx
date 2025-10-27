// src/components/layout/Footer.tsx
/**
 * @fileoverview Footer de la landing page pública
 * Pie de página con información de la empresa y links
 * @module Footer
 */

import Link from 'next/link';
import { Store, Instagram, Facebook, Mail } from 'lucide-react';

/**
 * Footer principal para páginas públicas
 * 
 * Incluye:
 * - Logo y descripción de la empresa
 * - Links de redes sociales
 * - Menú de navegación organizado en columnas
 * - Copyright y mensaje de branding
 * 
 * @returns Footer renderizado
 * 
 * @example
 * // Usado en layout.tsx
 * <main>{children}</main>
 * <Footer />
 */
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* ===================================
              LOGO Y DESCRIPCIÓN (2 columnas)
              =================================== */}
          <div className="col-span-1 md:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Store className="h-6 w-6 text-pink-500" />
              NilHub
            </Link>
            
            {/* Descripción */}
            <p className="text-sm mb-4">
              La plataforma perfecta para emprendedores de cosméticos en Lima Este. 
              Crea tu catálogo digital en minutos y vende más por WhatsApp.
            </p>
            
            {/* Redes sociales */}
            <div className="flex gap-3">
              <a href="#" className="hover:text-pink-500 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-pink-500 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="mailto:hola@nilhub.xyz" className="hover:text-pink-500 transition">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ===================================
              ENLACES RÁPIDOS - PRODUCTO
              =================================== */}
          <div>
            <h3 className="font-semibold text-white mb-4">Producto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#caracteristicas" className="hover:text-pink-500 transition">
                  Características
                </Link>
              </li>
              <li>
                <Link href="#precios" className="hover:text-pink-500 transition">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-500 transition">
                  Ejemplos
                </Link>
              </li>
            </ul>
          </div>

          {/* ===================================
              ENLACES RÁPIDOS - SOPORTE
              =================================== */}
          <div>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-pink-500 transition">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-500 transition">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-500 transition">
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ===================================
            COPYRIGHT
            =================================== */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; 2025 NilHub. Todos los derechos reservados. 
            Hecho con ❤️ para emprendedores peruanos.
          </p>
        </div>
      </div>
    </footer>
  );
}