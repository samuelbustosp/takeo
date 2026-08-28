'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
} from 'lucide-react';

const MOBILE_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ClipboardList },
  { href: '/dashboard/products', label: 'Productos', icon: UtensilsCrossed },
  { href: '/dashboard/metrics', label: 'Métricas', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-around">
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
