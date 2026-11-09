'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBusiness, getOrders } from '@/lib/data/store';
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
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: boolean;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operación',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/orders', label: 'Pedidos', icon: ClipboardList, badge: true },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { href: '/dashboard/products', label: 'Productos', icon: UtensilsCrossed },
      { href: '/dashboard/categories', label: 'Categorías', icon: Layers },
      { href: '/dashboard/discounts', label: 'Descuentos', icon: Tag },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { href: '/dashboard/metrics', label: 'Métricas', icon: BarChart3 },
      { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const loadSidebarInfo = async () => {
      try {
        const [b, ords] = await Promise.all([getBusiness(), getOrders()]);
        setBusiness(b);
        const activeCount = ords.filter(
          (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
        ).length;
        setPendingOrdersCount(activeCount);
      } catch {
        // Ignore
      }
    };
    loadSidebarInfo();
    const interval = setInterval(loadSidebarInfo, 6000);
    return () => clearInterval(interval);
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
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/70 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl p-4 justify-between shrink-0 h-screen sticky top-0 relative overflow-hidden">
      {/* Subtle Ambient Orange Glow */}
      <div className="pointer-events-none absolute -top-20 -left-16 w-48 h-48 bg-orange-500/15 dark:bg-orange-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="px-2 pt-1 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/70">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <TakeoLogo
              variant="rounded"
              size={38}
              animated
              className="rounded-xl shadow-md shadow-orange-500/25 ring-1 ring-orange-400/20 group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                TAKEO
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-1">
                {business?.name || 'Panel de Control'}
              </span>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                {group.title}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-orange-500/[0.06] dark:hover:bg-orange-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? 'text-white'
                            : 'text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && pendingOrdersCount > 0 ? (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-black rounded-full leading-none ${
                          isActive
                            ? 'bg-white text-orange-600'
                            : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {pendingOrdersCount}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/70 space-y-2.5">
        {/* Public Catalog Link */}
        <Link
          href={`/${catalogSlug}`}
          target="_blank"
          className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-orange-500/[0.06] dark:bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-orange-600/30">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="leading-tight font-bold text-zinc-900 dark:text-white">
                Ver Catálogo
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 truncate font-mono">
                /{catalogSlug}
              </span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{signingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
        </button>
      </div>
    </aside>
  );
}
