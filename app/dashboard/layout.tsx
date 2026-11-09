'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { getBusiness, getOrders } from '@/lib/data/store';
import { Business, Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sun,
  Moon,
  LogOut,
  Bell,
  Volume2,
  CheckCheck,
  ShoppingBag,
  ArrowRight,
  X,
} from 'lucide-react';

interface OrderNotification {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
  createdAt: string;
  read: boolean;
}

function playNewOrderChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Note 2: A5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.14);
    gain2.gain.setValueAtTime(0.32, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.55);

    // Note 3: C#6 (Warm major triad finish)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1108.73, now + 0.28);
    gain3.gain.setValueAtTime(0.25, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.28);
    osc3.stop(now + 0.8);
  } catch {
    // Ignore if blocked before first user interaction
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  // Notification Bell State
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<OrderNotification | null>(null);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const triggerOrderNotification = useCallback((order: Order) => {
    playNewOrderChime();
    const newNotif: OrderNotification = {
      id: `${order.id}-${Date.now()}`,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      total: order.total,
      createdAt: order.created_at || new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    setLiveToast(newNotif);
    setTimeout(() => {
      setLiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 6000);
  }, []);

  useEffect(() => {
    getBusiness()
      .then(setBusiness)
      .finally(() => setLoadingBusiness(false));
  }, []);

  // Poll & Realtime Listener for New Orders
  useEffect(() => {
    let isMounted = true;

    const checkOrders = async () => {
      try {
        const orders = await getOrders();
        if (!isMounted) return;

        if (knownOrderIdsRef.current === null) {
          // Initial load: populate known IDs and seed recent pending orders into bell
          knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
          const initialPending = orders
            .filter((o) => o.status === 'PENDING')
            .slice(0, 5)
            .map((o) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerName: o.customer_name,
              total: o.total,
              createdAt: o.created_at,
              read: false,
            }));
          if (initialPending.length > 0) {
            setNotifications(initialPending);
          }
          return;
        }

        // Check for newly arrived orders
        for (const order of orders) {
          if (!knownOrderIdsRef.current.has(order.id)) {
            knownOrderIdsRef.current.add(order.id);
            triggerOrderNotification(order);
          }
        }
      } catch {
        // Ignore polling errors
      }
    };

    checkOrders();
    const pollInterval = setInterval(checkOrders, 3500);

    // Supabase Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-orders-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          if (newOrder && newOrder.id) {
            if (!knownOrderIdsRef.current) {
              knownOrderIdsRef.current = new Set([newOrder.id]);
            } else if (!knownOrderIdsRef.current.has(newOrder.id)) {
              knownOrderIdsRef.current.add(newOrder.id);
              triggerOrderNotification(newOrder);
            }
          }
        }
      )
      .subscribe();

    const handleLocalOrderEvent = () => {
      checkOrders();
    };
    window.addEventListener('takeo_order_created', handleLocalOrderEvent);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
      window.removeEventListener('takeo_order_created', handleLocalOrderEvent);
    };
  }, [triggerOrderNotification]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0b0c10] flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100 relative">
      {/* Ambient Background Orange Light */}
      <div className="pointer-events-none fixed -top-36 right-1/4 w-[500px] h-[280px] bg-orange-500/[0.07] dark:bg-orange-500/[0.08] blur-[120px] rounded-full z-0" />

      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6 relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/70 dark:border-zinc-800/80 h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loadingBusiness ? (
              <Skeleton className="w-36 h-6 rounded-lg" />
            ) : (
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white">
                {business?.name || 'Mi Negocio'}
              </h1>
            )}
            {business && (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  business.is_open
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    business.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {business.is_open ? 'Local Abierto' : 'Local Cerrado'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={() => setIsBellOpen((prev) => !prev)}
                aria-label="Notificaciones de pedidos"
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  unreadCount > 0
                    ? 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
                }`}
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-orange-600/40">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Bell Dropdown Popover */}
              {isBellOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-black/20 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white">
                        Notificaciones
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400">
                          {unreadCount} {unreadCount === 1 ? 'nuevo' : 'nuevos'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={playNewOrderChime}
                        title="Probar sonido de notificación"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          title="Marcar todas como leídas"
                          className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 px-1.5 py-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Leer todo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Sin pedidos nuevos
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Te avisaremos con sonido apenas ingrese un pedido.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href="/dashboard/orders"
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id ? { ...item, read: true } : item
                              )
                            );
                            setIsBellOpen(false);
                          }}
                          className={`flex items-start justify-between gap-3 p-3.5 hover:bg-orange-500/[0.06] transition-colors ${
                            !n.read ? 'bg-orange-500/[0.04]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-zinc-900 dark:text-white">
                                  ¡Nuevo pedido #{n.orderNumber}!
                                </span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                                {n.customerName} ·{' '}
                                <strong className="text-orange-600 dark:text-orange-400">
                                  ${n.total.toLocaleString('es-AR')}
                                </strong>
                              </p>
                              <span className="text-[10px] text-zinc-400">
                                {new Date(n.createdAt).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-2" />
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Dashboard Only) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Cambiar tema del panel"
              title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Live Floating Toast when a new order arrives */}
        {liveToast && (
          <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-zinc-900/95 dark:bg-zinc-900 text-white border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-orange-500/20 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/30">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-orange-400 uppercase tracking-wider">
                  ¡Nuevo Pedido #{liveToast.orderNumber}!
                </p>
                <p className="text-xs font-semibold text-zinc-100 truncate">
                  {liveToast.customerName} · ${liveToast.total.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/dashboard/orders"
                onClick={() => setLiveToast(null)}
                className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
              >
                Ver
              </Link>
              <button
                type="button"
                onClick={() => setLiveToast(null)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
