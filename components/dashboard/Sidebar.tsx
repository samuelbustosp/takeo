'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Layers,
  Tag,
  BarChart3,
  Settings,
  ExternalLink,
  Store,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/dashboard/products', label: 'Productos', icon: UtensilsCrossed },
  { href: '/dashboard/categories', label: 'Categorías', icon: Layers },
  { href: '/dashboard/discounts', label: 'Descuentos', icon: Tag },
  { href: '/dashboard/metrics', label: 'Métricas', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 justify-between shrink-0 h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20">
              T
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white leading-none">
                TAKEO
              </span>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Dashboard PWA
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Link to Customer Web */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
        <Link
          href="/takeo-express"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 hover:text-orange-600 border border-zinc-200/70 dark:border-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-500" />
            <span>Ver Catálogo Público</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
