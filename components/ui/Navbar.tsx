'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Utensils, LayoutDashboard, Store } from 'lucide-react';
import { Business } from '@/types';
import { TakeoLogo } from './TakeoLogo';

interface Props {
  business?: Business;
  isDashboard?: boolean;
}

export function Navbar({ business, isDashboard = false }: Props) {
  const { totalItemsCount, setIsCartOpen, subtotal } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled
          ? 'pt-2.5 sm:pt-3.5 px-3 sm:px-6 pointer-events-none'
          : 'pt-0 px-0'
      }`}
    >
      <div
        className={`mx-auto w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto ${
          isScrolled
            ? 'max-w-4xl h-14 px-4 sm:px-6 rounded-full border border-zinc-200/80 dark:border-zinc-800/90 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40'
            : 'max-w-full h-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Brand with Animated Logo & Outer Glow */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={isDashboard ? '/dashboard' : '/'}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <TakeoLogo
                variant="rounded"
                size={isScrolled ? 36 : 40}
                animated
                className="rounded-xl shadow-lg shadow-orange-500/35 ring-1 ring-orange-400/20 group-hover:scale-105 transition-all duration-300"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-white leading-none">
                  TAKEO
                </span>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold text-orange-600 dark:text-orange-400 leading-tight transition-all duration-300 ${
                    isScrolled ? 'hidden sm:block' : 'block'
                  }`}
                >
                  Pedí. Listo.
                </span>
              </div>
            </Link>

            {business && !isDashboard && (
              <div
                className={`hidden md:flex items-center gap-2 pl-4 ml-2 border-l border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
                  isScrolled ? 'lg:flex' : ''
                }`}
              >
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[160px]">
                  {business.name}
                </span>
                {business.is_open ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Abierto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    Cerrado
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions: In customer catalog (!isDashboard && business), NO "Acceso Negocio" button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isDashboard && !business && (
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${
                  isScrolled ? 'rounded-full' : 'rounded-lg'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="hidden xs:inline sm:inline">Acceso Negocio</span>
              </Link>
            )}

            {isDashboard && (
              <Link
                href="/"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ${
                  isScrolled ? 'rounded-full' : 'rounded-lg'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                <span>Ver Web Pública</span>
              </Link>
            )}

            {/* Cart Trigger (Only on customer web when business is present) */}
            {!isDashboard && business && (
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 shadow-md shadow-orange-600/25 active:scale-95 transition-all cursor-pointer ${
                  isScrolled ? 'rounded-full' : 'rounded-xl'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline font-semibold">
                  {subtotal > 0 ? `$${subtotal.toLocaleString('es-AR')}` : 'Carrito'}
                </span>
                {totalItemsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-bold flex items-center justify-center shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* On landing page (!isDashboard && !business): "Crear cuenta" button */}
            {!isDashboard && !business && (
              <Link
                href="/register"
                className={`relative flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 shadow-md shadow-orange-600/25 active:scale-95 transition-all cursor-pointer ${
                  isScrolled ? 'rounded-full' : 'rounded-xl'
                }`}
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span>Crear cuenta</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
