import Link from 'next/link';
import { Store, Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Store className="h-6 w-6 text-pink-500" />
              NilHub
            </Link>
            <p className="text-sm mb-4">
              La plataforma perfecta para emprendedores de cosméticos en Lima Este. 
              Crea tu catálogo digital en minutos y vende más por WhatsApp.
            </p>
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

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-white mb-4">Producto</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#caracteristicas" className="hover:text-pink-500 transition">Características</Link></li>
              <li><Link href="#precios" className="hover:text-pink-500 transition">Precios</Link></li>
              <li><Link href="#" className="hover:text-pink-500 transition">Ejemplos</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-pink-500 transition">Centro de Ayuda</Link></li>
              <li><Link href="#" className="hover:text-pink-500 transition">Contacto</Link></li>
              <li><Link href="#" className="hover:text-pink-500 transition">WhatsApp</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 NilHub. Todos los derechos reservados. Hecho con ❤️ para emprendedores peruanos.</p>
        </div>
      </div>
    </footer>
  );
}