'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { EmpanadaScrollScrubber } from '@/components/ui/EmpanadaScrollScrubber';
import { TakeoLogo } from '@/components/ui/TakeoLogo';
import { getBusiness } from '@/lib/data/store';
import { Business } from '@/types';
import {
  LayoutDashboard,
  Smartphone,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Zap,
  QrCode,
  Sparkles,
  Store,
  Clock,
  Flame,
} from 'lucide-react';

const KANBAN_COLUMNS = [
  {
    id: 0,
    title: 'Nuevos',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    statusText: 'Recibido · Hace instantes',
    ghostItem: { id: '#105', desc: '2x Docena Surtida', mode: 'Retiro' },
  },
  {
    id: 1,
    title: 'En preparación',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    statusText: 'En horno · Aviso enviado',
    ghostItem: { id: '#102', desc: '4x Carne a Cuchillo', mode: 'Delivery' },
  },
  {
    id: 2,
    title: 'Listos',
    dotClass: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    statusText: 'En camino · Cliente notificado',
    ghostItem: { id: '#101', desc: '1x Promo Familiar', mode: 'Delivery' },
  },
];

const WHATSAPP_MESSAGES = [
  {
    id: 1,
    text: 'Tu pedido #104 fue confirmado',
    emoji: '/emojis/ios-check.png',
    emojiAlt: '✅',
    emojiPosition: 'after' as const,
    time: '20:30',
  },
  {
    id: 2,
    text: 'Tu pedido entró a la cocina',
    emoji: '/emojis/ios-chef.png',
    emojiAlt: '👨‍🍳',
    emojiPosition: 'before' as const,
    time: '20:38',
  },
  {
    id: 3,
    text: 'Tu pedido va en camino a tu casa',
    emoji: '/emojis/ios-scooter.png',
    emojiAlt: '🛵',
    emojiPosition: 'before' as const,
    time: '20:51',
  },
];

function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (entry.boundingClientRect.top > 0) {
          setIsVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-none'
          : 'opacity-0 translate-y-8 scale-[0.98] blur-sm'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function RootHomePage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeKanbanStep, setActiveKanbanStep] = useState<number>(0);
  const [wppStep, setWppStep] = useState<number>(1);

  useEffect(() => {
    getBusiness('takeo-express').then(setBusiness);
  }, []);

  // Auto-cycle the animated order across the 3 Kanban columns
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKanbanStep((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle WhatsApp incoming notification bubbles sequentially
  useEffect(() => {
    const sequence = [
      { step: 1, delay: 2400 },
      { step: 2, delay: 2400 },
      { step: 3, delay: 3800 },
    ];
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runNext = () => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setWppStep(sequence[currentIndex].step);
      timeoutId = setTimeout(runNext, sequence[currentIndex].delay);
    };

    timeoutId = setTimeout(runNext, sequence[0].delay);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="dark min-h-screen bg-[#0d0e12] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col w-full">
        {/* Full-bleed Hero + Scroll-Driven Image Sequence Scrubbing */}
        <EmpanadaScrollScrubber />

        {/* Modern Bento Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 w-full isolate">
          {/* Ambient Orange Background Lights */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
          >
            <div className="absolute top-20 left-[5%] w-[360px] sm:w-[560px] h-[340px] sm:h-[460px] rounded-full bg-gradient-to-br from-orange-500/25 via-amber-500/15 to-transparent dark:from-orange-500/25 dark:via-amber-500/15 blur-[110px] sm:blur-[140px]" />
            <div className="absolute bottom-12 right-[4%] w-[340px] sm:w-[520px] h-[320px] sm:h-[440px] rounded-full bg-gradient-to-tl from-orange-600/20 via-amber-400/15 to-transparent dark:from-orange-600/25 dark:via-amber-500/15 blur-[110px] sm:blur-[145px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[480px] h-[280px] sm:h-[360px] rounded-full bg-orange-500/12 dark:bg-orange-500/15 blur-[130px]" />
          </div>

          {/* Section Header */}
          <ScrollReveal className="max-w-2xl mb-10 sm:mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
              ////
              <span>DISEÑADO PARA GASTRONÓMICOS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
              Tu propio canal de ventas.{' '}
              <span className="inline-block font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Sin intermediarios.
              </span>
            </h2>
          </ScrollReveal>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Card 1: Large Feature — Menú Web Instantáneo */}
            <ScrollReveal className="lg:col-span-7 flex" delay={60}>
              <div className="w-full group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-[#14161f]/60 backdrop-blur-2xl border border-orange-500/15 dark:border-orange-500/20 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-7 sm:gap-8 shadow-lg shadow-orange-500/[0.04] hover:border-orange-500/40 transition-all duration-300">
              <div className="space-y-4 w-full">
                {/* Unified Card Header */}
                <div className="w-full flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    01 · WEB CLIENTE
                  </span>
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Abre al instante desde{' '}
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      Instagram o QR
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Sin descargas ni registros. Tus clientes ven fotos reales, eligen variantes y confirman su compra en segundos.
                  </p>
                </div>
              </div>

              {/* Interactive-style Mini UI Preview */}
              <div className="rounded-2xl bg-white/70 dark:bg-[#0d0e12]/70 backdrop-blur-md border border-zinc-200/70 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-orange-500/20">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                      takeo.app/tu-local
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Link directo para tu bio y mesas
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Olvidate de tomar pedidos por WhatsApp */}
            <ScrollReveal className="lg:col-span-5 flex" delay={160}>
              <div className="w-full group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-[#14161f]/60 backdrop-blur-2xl border border-orange-500/15 dark:border-orange-500/20 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-2 sm:gap-3 shadow-lg shadow-orange-500/[0.04] hover:border-emerald-500/40 transition-all duration-300">
              <div className="space-y-4 w-full">
                {/* Unified Card Header with Notification Badge */}
                <div className="w-full flex items-center justify-between">
                  <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                    {/* Pulsing Red Notification Circle with White "1" */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-extrabold text-white items-center justify-center shadow-xs">
                        1
                      </span>
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    02 · ESTADOS EN VIVO
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Olvidate de tomar pedidos{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      por WhatsApp
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    El cliente pide en la web y recibe cada estado al instante, sin responder chats.
                  </p>
                </div>
              </div>

              {/* Compact WhatsApp Simulated Message Stream */}
              <div className="rounded-2xl bg-white/70 dark:bg-[#0c1317]/75 backdrop-blur-md border border-emerald-500/20 p-3 sm:p-2.5 space-y-3">
                {/* WhatsApp Chat mini-header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[9px] shadow-xs">
                        T
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white dark:border-[#0c1317] absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px] leading-none">
                          Takeo
                        </span>
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500/20" />
                      </div>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                        en línea
                      </span>
                    </div>
                  </div>

                </div>

                {/* Messages stream: slender compact bubbles */}
                <div className="space-y-1 min-h-[110px] flex flex-col justify-start">
                  {WHATSAPP_MESSAGES.slice(0, wppStep).map((msg) => (
                    <div
                      key={msg.id}
                      className="animate-in fade-in slide-in-from-bottom-1.5 duration-250 flex items-start"
                    >
                      <div className="relative w-fit max-w-[94%] rounded-xl rounded-tl-xs px-2.5 py-1.5 bg-white dark:bg-[#1f2c34] text-zinc-900 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs text-[11px] sm:text-xs flex items-baseline gap-2">
                        <span className="font-medium text-zinc-800 dark:text-zinc-100 inline-flex items-center gap-1">
                          {msg.emojiPosition === 'before' && (
                            <img
                              src={msg.emoji}
                              alt={msg.emojiAlt}
                              className="w-3.5 h-3.5 inline-block shrink-0"
                            />
                          )}
                          <span>{msg.text}</span>
                          {msg.emojiPosition === 'after' && (
                            <img
                              src={msg.emoji}
                              alt={msg.emojiAlt}
                              className="w-3.5 h-3.5 inline-block shrink-0"
                            />
                          )}
                        </span>
                        <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] text-zinc-400 dark:text-zinc-400 ml-auto">
                          <span>{msg.time}</span>
                          <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[10px] leading-none">✓✓</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {wppStep < 3 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 italic animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
                      <span>Escribiendo...</span>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Full-Width Bottom Bento — Animated Mini Kanban Showcase */}
            <ScrollReveal className="lg:col-span-12" delay={100}>
              <div className="relative overflow-hidden rounded-3xl bg-zinc-900/80 dark:bg-[#14161f]/60 backdrop-blur-2xl border border-orange-500/20 dark:border-orange-500/20 p-6 sm:p-8 lg:p-10 flex flex-col gap-7 sm:gap-8 text-white shadow-xl shadow-orange-500/[0.05]">
              {/* Unified Card Header (matching 01 and 02) */}
              <div className="w-full flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  03 · TABLERO DE COCINA
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 items-center">
                {/* Left Description + CTA */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    Control total de tu cocina{' '}
                    <span className="font-bold text-orange-400">
                      en vivo.
                    </span>
                  </h3>

                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    Visualizá y mové cada comanda en tiempo real. Cada cambio de columna actualiza el estado del pedido y notifica al cliente al instante.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href="/register"
                      className="group bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-flow text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02]"
                    >
                      <Store className="w-4 h-4" />
                      <span>Crear mi Tienda</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Animated Mini Kanban Board */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {KANBAN_COLUMNS.map((col, colIdx) => {
                    const isActiveCol = activeKanbanStep === colIdx;

                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setActiveKanbanStep(colIdx)}
                        className={`text-left rounded-2xl p-3.5 border transition-all duration-500 flex flex-col gap-3 cursor-pointer ${
                          isActiveCol
                            ? 'bg-white/[0.07] border-orange-500/50 shadow-lg shadow-black/30'
                            : 'bg-white/[0.03] border-white/10 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${col.dotClass} ${
                                isActiveCol ? 'animate-pulse' : ''
                              }`}
                            />
                            <span className="text-xs font-extrabold tracking-tight text-zinc-200">
                              {col.title}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                            {isActiveCol ? 2 : 1}
                          </span>
                        </div>

                        {/* Animated Active Order Card (#104) */}
                        <div
                          className={`rounded-xl border transition-all duration-500 overflow-hidden ${
                            isActiveCol
                              ? 'max-h-40 opacity-100 scale-100 p-3 bg-zinc-950/90 border-orange-500/40 shadow-md'
                              : 'max-h-0 opacity-0 scale-95 p-0 border-transparent pointer-events-none'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-extrabold text-orange-400">
                              #104
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                              <Flame className="w-3 h-3 text-orange-500" />
                              6x Empanadas
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mb-2">
                            Carne Cortada a Cuchillo
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${col.badgeClass}`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{col.statusText}</span>
                          </div>
                        </div>

                        {/* Background Static Order Card for Realism */}
                        <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-zinc-400">
                              {col.ghostItem.id}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500">
                              {col.ghostItem.mode}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-zinc-300 truncate">
                            {col.ghostItem.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Clean Footer with Animated TakeoLogo & Explorar */}
      <footer className="relative overflow-hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#090a0d] py-14 sm:py-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-12 border-b border-zinc-200/70 dark:border-zinc-800/70">
            {/* Brand Column with Animated Smile Logo */}
            <div className="space-y-4 max-w-sm">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <TakeoLogo
                  variant="rounded"
                  size={48}
                  animated
                  className="rounded-2xl shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white leading-none">
                    TAKEO
                  </span>
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 tracking-wide mt-1">
                    Pedí. Listo.
                  </span>
                </div>
              </Link>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                El sistema de pedidos web para locales gastronómicos que quieren vender directo, ordenar su cocina y quedarse con el 100% de cada venta.
              </p>
            </div>

            {/* Explorar Links */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 block">
                EXPLORAR
              </span>
              <ul className="flex flex-wrap items-center gap-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Crear mi tienda</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/takeo-express"
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Ver menú demo en vivo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Acceso para dueños
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
            <span>© {new Date().getFullYear()} TAKEO. Todos los derechos reservados.</span>
            <span className="font-mono text-[11px]">
              Hecho para dueños gastronómicos · Pedí. Listo.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
