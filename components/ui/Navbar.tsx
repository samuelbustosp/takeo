'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Sun, Moon, Utensils, LayoutDashboard } from 'lucide-react';
import { Business } from '@/types';

interface Props {
  business?: Business;
  isDashboard?: boolean;
}

export function Navbar({ business, isDashboard = false }: Props) {
  const { totalItemsCount, setIsCartOpen, subtotal } = useCart();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href={isDashboard ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white leading-none">
                TAKEO
              </span>
              <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400 leading-tight">
                Pedí. Listo.
              </span>
            </div>
          </Link>

          {business && !isDashboard && (
            <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
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

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Dashboard link for owner preview */}
          {!isDashboard ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Acceso Negocio</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Ver Web Pública</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Cart Trigger (Only on customer web) */}
          {!isDashboard && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-medium text-sm px-3.5 py-2 rounded-xl shadow-md shadow-orange-600/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
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
        </div>
      </div>
    </header>
  );
}
