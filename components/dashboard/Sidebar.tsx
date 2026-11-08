'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBusiness } from '@/lib/data/store';
import { Business } from '@/types';
import { TakeoLogo } from '@/components/ui/TakeoLogo';
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
  LogOut,
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
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getBusiness().then(setBusiness);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const catalogSlug = business?.slug || 'takeo-express';

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl p-4 justify-between shrink-0 h-screen sticky top-0 transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-1">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <TakeoLogo
              variant="rounded"
              size={36}
              animated
              className="rounded-xl shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                TAKEO
              </span>
              <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 tracking-wider uppercase mt-0.5 truncate">
                {business?.name || 'Dashboard'}
              </span>
            </div>
          </Link>
        </div>

        {/* Minimal Navigation */}
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
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-105' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Minimal Section */}
      <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
        {/* Public Catalog Link with dynamic slug */}
        <Link
          href={`/${catalogSlug}`}
          target="_blank"
          className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100/70 dark:bg-zinc-900/60 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-400 border border-zinc-200/60 dark:border-zinc-800/70 transition-all duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Store className="w-4 h-4 text-orange-500 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="leading-tight font-bold">Ver Catálogo</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                /{catalogSlug}
              </span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* Minimal Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{signingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
        </button>
      </div>
    </aside>
  );
}
