'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { getBusiness } from '@/lib/data/store';
import { Business } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    getBusiness()
      .then(setBusiness)
      .finally(() => setLoadingBusiness(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loadingBusiness ? (
              <Skeleton className="w-36 h-6 rounded-lg" />
            ) : (
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                {business?.name || 'Mi Negocio'}
              </h1>
            )}
            {business && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Activo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar for PWA */}
      <MobileBottomNav />
    </div>
  );
}
