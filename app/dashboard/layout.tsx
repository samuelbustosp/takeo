'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { useTheme } from '@/context/ThemeContext';
import { getBusiness, createOrder } from '@/lib/data/store';
import { Business } from '@/types';
import {
  Sun,
  Moon,
  PlusCircle,
  Sparkles,
  ExternalLink,
  Store,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [business, setBusiness] = useState<Business | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  useEffect(() => {
    getBusiness().then(setBusiness);
  }, []);

  const handleSimulateOrder = async () => {
    if (!business) return;
    setSimulating(true);

    const sampleNames = ['Martín Silva', 'Lucía Rossi', 'Federico Álvarez', 'Camila Benítez'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomPhone = `+54911${Math.floor(10000000 + Math.random() * 90000000)}`;

    try {
      await createOrder({
        businessId: business.id,
        customerName: randomName,
        customerPhone: randomPhone,
        deliveryType: Math.random() > 0.5 ? 'DELIVERY' : 'PICKUP',
        deliveryAddress: 'Av. Libertador 4500, Palermo',
        paymentMethod: Math.random() > 0.5 ? 'CASH' : 'TRANSFER',
        notes: 'Pedido de prueba generado desde el simulador PWA',
        items: [
          {
            productId: 'p0000000-0000-0000-0000-000000000004',
            quantity: 3,
            notes: 'Bien cocidas',
          },
          {
            productId: 'p0000000-0000-0000-0000-000000000011',
            quantity: 1,
          },
        ],
      });

      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 3000);
      window.dispatchEvent(new CustomEvent('takeo_order_created'));
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
              {business?.name || 'TAKEO Express'}
            </h1>
            {business && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Activo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Test Order Simulator */}
            <button
              onClick={handleSimulateOrder}
              disabled={simulating}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                simSuccess
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800'
                  : 'bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900'
              }`}
            >
              {simSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">¡Pedido creado!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Simular Pedido</span>
                </>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Bar for PWA */}
      <MobileBottomNav />
    </div>
  );
}
