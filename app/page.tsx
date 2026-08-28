'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { getBusiness } from '@/lib/data/store';
import { Business } from '@/types';
import {
  Utensils,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Smartphone,
  MessageCircle,
} from 'lucide-react';

export default function RootHomePage() {
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    getBusiness('takeo-express').then(setBusiness);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
      <Navbar business={business || undefined} />

      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/40 text-orange-600 dark:text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TAKEO 2026 — Plataforma Gastronómica Moderna</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            Pedí. Listo.{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Sin fricción.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Catálogo digital ultra rápido para tus clientes con pedidos automatizados a WhatsApp y Dashboard PWA para el control total de tu cocina.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/takeo-express"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Utensils className="w-4 h-4" />
              <span>Ver Menú Online (Cliente)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-orange-600" />
              <span>Abrir Dashboard PWA</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 sm:mt-24">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Experiencia Web para Clientes
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Sin descargas obligatorias. Abre en segundos desde QR, Instagram o link de WhatsApp con carrito y checkout optimizado.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              WhatsApp Cloud API Integrado
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Recepción automática del pedido en el WhatsApp del negocio y avisos al cliente cuando el pedido está confirmado o listo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Dashboard PWA para el Negocio
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Instalable como app en celular, tablet o PC. Tablero Kanban de pedidos, métricas de ventas y control de stock en tiempo real.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
