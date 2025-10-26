// src/components/tienda/TiendaHeader.tsx - VERSIÓN ULTRA PREMIUM
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Store, MapPin, Phone, Clock } from 'lucide-react';
import { Tienda } from '@/types';
import { cn } from '@/lib/utils';

interface TiendaHeaderProps {
  tienda: Tienda;
  showBanner?: boolean;
}

export default function TiendaHeader({ 
  tienda,
  showBanner = true 
}: TiendaHeaderProps) {
  const [scrollY, setScrollY] = useState(0);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative overflow-hidden">
      {/* ===================================
          BANNER CON PARALLAX
          =================================== */}
      {showBanner && tienda.banner_url && (
        <div 
          className="absolute inset-0 h-[400px] sm:h-[500px] overflow-hidden"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <Image
            src={tienda.banner_url}
            alt={`Banner de ${tienda.nombre}`}
            fill
            className="object-cover"
            priority
          />
          {/* Overlays graduales */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-50 via-transparent to-transparent" />
        </div>
      )}

      {/* ===================================
          CONTENIDO PRINCIPAL
          =================================== */}
      <div className="relative container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Layout: Logo a la izquierda, Info a la derecha (desktop) */}
          {/* Layout: Centrado (mobile) */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            
            {/* ===================================
                LOGO ADAPTATIVO (NUEVO)
                =================================== */}
            <div className="flex-shrink-0 lg:sticky lg:top-8">
              <div className="relative group">
                {/* Glow effect animado */}
                <div className="absolute -inset-4 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 
                              rounded-[2rem] blur-2xl opacity-30 group-hover:opacity-50 
                              transition-opacity duration-500 animate-pulse" />
                
                {/* Logo container con borde adaptativo */}
                <div className={cn(
                  "relative bg-white rounded-3xl shadow-2xl overflow-hidden",
                  "transition-all duration-500 group-hover:scale-105"
                )}>
                  {tienda.logo_url ? (
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
                      <Image
                        src={tienda.logo_url}
                        alt={`Logo de ${tienda.nombre}`}
                        fill
                        className="object-contain p-4"
                        priority
                      />
                    </div>
                  ) : (
                    // Fallback gradiente si no hay logo
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 
                                  bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 
                                  flex items-center justify-center">
                      <Store className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                    </div>
                  )}
                  
                  {/* Borde decorativo */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-white/50" />
                  
                  {/* Efecto shine en hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                                transition-transform duration-1000 bg-gradient-to-r 
                                from-transparent via-white/30 to-transparent" />
                </div>

                {/* Badge de verificación */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full 
                                bg-gradient-to-r from-green-500 to-emerald-500 
                                shadow-lg border-2 border-white">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Activa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================
                INFORMACIÓN DE LA TIENDA
                =================================== */}
            <div className="flex-1 space-y-6">
              
              {/* Nombre e info principal */}
              <div className="space-y-3">
                <h1 className={cn(
                  "text-4xl sm:text-5xl lg:text-6xl font-black leading-tight",
                  "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
                  "bg-clip-text text-transparent",
                  showBanner && tienda.banner_url && "drop-shadow-2xl text-white bg-gradient-to-r from-white to-slate-100"
                )}>
                  {tienda.nombre}
                </h1>

                {/* Descripción */}
                {tienda.descripcion && (
                  <p className={cn(
                    "text-lg sm:text-xl leading-relaxed max-w-2xl",
                    showBanner && tienda.banner_url 
                      ? "text-white drop-shadow-lg font-medium" 
                      : "text-slate-600"
                  )}>
                    {tienda.descripcion}
                  </p>
                )}
              </div>

              {/* Stats quick view */}
              <div className="flex flex-wrap gap-3">
                {/* Total productos */}
                <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md 
                              border-2 border-white/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-bold text-slate-900">
                      {tienda.total_productos} productos
                    </span>
                  </div>
                </div>

                {/* WhatsApp rápido */}
                <Link
                  href={`https://wa.me/${tienda.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 
                           border-2 border-white shadow-lg transition-all duration-300
                           hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">
                      Contactar
                    </span>
                  </div>
                </Link>
              </div>

              {/* Redes sociales - Diseño horizontal mejorado */}
              {(tienda.instagram || tienda.facebook) && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    Síguenos
                  </span>
                  
                  <div className="flex gap-2">
                    {/* Instagram */}
                    {tienda.instagram && (
                      <Link
                        href={`https://instagram.com/${tienda.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 
                                      rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity" />
                        <div className={cn(
                          "relative w-11 h-11 rounded-xl",
                          "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
                          "flex items-center justify-center",
                          "shadow-lg hover:shadow-xl transition-all duration-300",
                          "hover:scale-110 active:scale-95"
                        )}>
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                      </Link>
                    )}

                    {/* Facebook */}
                    {tienda.facebook && (
                      <Link
                        href={tienda.facebook.startsWith('http') 
                          ? tienda.facebook 
                          : `https://facebook.com/${tienda.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-blue-600 
                                      rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity" />
                        <div className={cn(
                          "relative w-11 h-11 rounded-xl",
                          "bg-gradient-to-br from-blue-600 to-blue-500",
                          "flex items-center justify-center",
                          "shadow-lg hover:shadow-xl transition-all duration-300",
                          "hover:scale-110 active:scale-95"
                        )}>
                          <Facebook className="w-5 h-5 text-white" />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================
          SEPARADOR DECORATIVO CON WAVE
          =================================== */}
      <div className="relative h-8 -mt-8">
        <svg 
          className="absolute bottom-0 w-full h-full" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path 
            fill="currentColor" 
            className="text-pink-50"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </header>
  );
}