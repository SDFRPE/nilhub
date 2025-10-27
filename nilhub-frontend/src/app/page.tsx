
// fronted/src/app/page.tsx
/**
 * @fileoverview Landing Page (Home) de NilHub
 * Página principal de marketing con CTA de registro
 * @module HomePage
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Store, 
  Smartphone, 
  Zap, 
  TrendingUp, 
  Check, 
  Sparkles,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Star
} from 'lucide-react';

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

/**
 * Landing Page principal de NilHub
 * 
 * Página de marketing diseñada para convertir visitantes en usuarios registrados.
 * Muestra la propuesta de valor del producto y guía al usuario hacia el registro.
 * 
 * Secciones:
 * 1. **Hero Section** - Título impactante con CTAs principales
 * 2. **Características** - 6 beneficios clave del producto
 * 3. **Cómo Funciona** - 3 pasos simples
 * 4. **CTA Final** - Última oportunidad de conversión
 * 
 * Características visuales:
 * - Background animado con blobs flotantes
 * - Gradientes animados en textos
 * - Efectos glassmorphism en cards
 * - Animaciones escalonadas en scroll
 * - Efectos hover premium en todas las interacciones
 * 
 * @returns Landing page renderizada
 * 
 * @example
 * // Esta página se renderiza en la ruta raíz '/'
 * // URL: https://nilhub.xyz
 */
export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Navbar fijo superior */}
      <Navbar />

      {/* ===================================
          BACKGROUND ANIMADO GLOBAL
          =================================== */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute inset-0 opacity-30">
          {/* 3 blobs con animaciones desfasadas */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* ===================================
          HERO SECTION
          =================================== */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          
          {/* Badge flotante animado */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/60 backdrop-blur-md border border-white/20 shadow-lg shadow-pink-500/10 animate-in fade-in slide-in-from-top duration-700">
            <Sparkles className="h-4 w-4 text-pink-600 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Gratis durante 3 meses
            </span>
            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold">
              NUEVO
            </span>
          </div>
          
          {/* Título principal con gradiente animado */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300%">
              Tu Catálogo Digital
            </span>
            <br />
            <span className="text-slate-900">
              en 5 Minutos
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-slate-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Crea tu tienda virtual profesional sin conocimientos técnicos. 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-bold"> Muestra tus productos</span> y recibe consultas directas por WhatsApp.
          </p>

          {/* CTAs principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            
            {/* CTA Primario - Registro */}
            <Link href="/registro">
              <Button 
                size="lg" 
                className="group relative h-14 px-8 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 hover:from-pink-600 hover:via-purple-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Crear Mi Catálogo Gratis
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </span>
                {/* Efecto shine */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </Button>
            </Link>
            
            {/* CTA Secundario - Scroll */}
            <Link href="#como-funciona">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg font-semibold bg-white/60 backdrop-blur-md border-2 border-slate-200 hover:border-pink-400 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Ver Cómo Funciona
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-700 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            {[
              { icon: Check, text: "Sin tarjeta de crédito" },
              { icon: Zap, text: "Setup en 5 minutos" },
              { icon: Star, text: "Soporte en español" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/20 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                <item.icon className="h-5 w-5 text-green-600" />
                <span className="font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================
          SECCIÓN: CARACTERÍSTICAS
          =================================== */}
      <section id="caracteristicas" className="py-24 px-4 relative">
        <div className="container mx-auto">
          
          {/* Header de sección */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">
              Características
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Todo lo que necesitas para vender más
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Diseñado específicamente para emprendedores de cosméticos
            </p>
          </div>

          {/* Grid de 6 características */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: Store,
                title: "Catálogo Profesional",
                description: "Muestra tus productos con múltiples fotos, descripciones detalladas y precios claros",
                gradient: "from-pink-500 to-rose-500",
                bgGradient: "from-pink-50 to-rose-50"
              },
              {
                icon: Smartphone,
                title: "100% Responsive",
                description: "Tu catálogo se ve perfecto en celulares, tablets y computadoras",
                gradient: "from-purple-500 to-indigo-500",
                bgGradient: "from-purple-50 to-indigo-50"
              },
              {
                icon: MessageCircle,
                title: "Integración WhatsApp",
                description: "Tus clientes te contactan directo por WhatsApp con un solo clic",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                icon: Zap,
                title: "Setup Rápido",
                description: "Crea tu tienda en menos de 5 minutos. Sin complicaciones técnicas",
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50"
              },
              {
                icon: ShoppingBag,
                title: "Gestión de Stock",
                description: "Actualiza el stock de tus productos fácilmente desde tu panel",
                gradient: "from-orange-500 to-amber-500",
                bgGradient: "from-orange-50 to-amber-50"
              },
              {
                icon: BarChart3,
                title: "Estadísticas Básicas",
                description: "Ve cuántas personas visitan tu catálogo y qué productos prefieren",
                gradient: "from-violet-500 to-purple-500",
                bgGradient: "from-violet-50 to-purple-50"
              }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="group relative overflow-hidden border-2 border-transparent hover:border-white/40 bg-white/60 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              >
                {/* Efecto glow en hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <CardHeader className="relative">
                  {/* Ícono con gradiente */}
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                  <p className="text-slate-600 leading-relaxed mt-2">
                    {feature.description}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================
          SECCIÓN: CÓMO FUNCIONA
          =================================== */}
      <section id="como-funciona" className="py-24 px-4 relative">
        <div className="container mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
              Proceso Simple
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Cómo funciona NilHub
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              En 3 pasos simples tendrás tu catálogo digital funcionando
            </p>
          </div>

          {/* 3 pasos con números */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: "1",
                title: "Regístrate Gratis",
                description: "Crea tu cuenta con tu email y elige el nombre de tu tienda",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                number: "2",
                title: "Agrega tus Productos",
                description: "Sube fotos, precios y descripciones. Tan fácil como Instagram",
                gradient: "from-purple-500 to-indigo-500"
              },
              {
                number: "3",
                title: "Comparte y Vende",
                description: "Obtén tu link personalizado y compártelo en tus redes sociales",
                gradient: "from-blue-500 to-cyan-500"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                
                {/* Línea conectora (solo desktop, entre pasos) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-slate-300 to-transparent"></div>
                )}
                
                <div className="relative text-center">
                  
                  {/* Número circular con glow */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`relative h-16 w-16 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center text-2xl font-black shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================
          CTA FINAL
          =================================== */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-2xl shadow-purple-500/30">
            
            {/* Pattern decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
            
            <CardContent className="relative pt-16 pb-16 text-center px-8">
              
              {/* Ícono central */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <TrendingUp className="relative h-16 w-16 text-white" />
                </div>
              </div>
              
              {/* Título */}
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                ¿Listo para hacer crecer tu negocio?
              </h2>
              
              {/* Descripción */}
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                Únete a cientos de emprendedores que ya venden más con NilHub
              </p>
              
              {/* CTA Button */}
              <Link href="/registro">
                <Button 
                  size="lg" 
                  className="group h-14 px-10 bg-white text-purple-600 hover:bg-slate-50 font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  Crear Mi Catálogo Ahora
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              
              {/* Disclaimer */}
              <p className="text-sm text-white/80 mt-6 font-medium">
                No se requiere tarjeta de crédito • Gratis por 3 meses
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}