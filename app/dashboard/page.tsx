'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMetrics, getOrders, getBusiness } from '@/lib/data/store';
import { MetricsSummary, Order, Business } from '@/types';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { OrderDetailsModal } from '@/components/dashboard/OrderDetailsModal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  Sparkles,
  ChefHat,
  Flame,
  Store,
  ExternalLink,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, ords, b] = await Promise.all([getMetrics(), getOrders(), getBusiness()]);
      setMetrics(m);
      setOrders(ords);
      setBusiness(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 4000);

    const handleCreated = () => loadData();
    window.addEventListener('takeo_order_created', handleCreated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('takeo_order_created', handleCreated);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <Skeleton className="w-full h-24 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/75 dark:bg-zinc-900/75 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-28 h-7" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="w-48 h-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const catalogSlug = business?.slug || 'takeo-express';

  return (
    <div className="relative space-y-8 pb-8">
      {/* Ambient Orange Background Glows */}
      <div className="pointer-events-none fixed top-20 right-10 w-96 h-96 rounded-full bg-orange-500/8 dark:bg-orange-500/12 blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-80 h-80 rounded-full bg-amber-500/6 dark:bg-orange-600/8 blur-3xl -z-10" />

      {/* Welcome Business Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-500/12 blur-3xl" />

        <div className="flex items-center gap-4 min-w-0 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-orange-500/20 border border-white/20">
            {business?.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white truncate">
                ¡Hola, {business?.name || 'tu negocio'}!
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  business?.is_open
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    business?.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                {business?.is_open ? 'Local Abierto' : 'Local Cerrado'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Resumen de tu operación en vivo, pedidos activos y platos más pedidos del día.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <Link
            href={`/${catalogSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-orange-400 border border-zinc-200/70 dark:border-zinc-700/70 transition-colors"
          >
            <span>Ver Catálogo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm shadow-orange-600/20 transition-colors"
          >
            <span>Ir al Tablero</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Onboarding Alert Banner if business is missing or incomplete */}
      {(!business || !business.phone_whatsapp || business.address === 'Dirección pendiente') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Completá la información de tu local</h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
                Configurá el WhatsApp de recepción de pedidos y la dirección física para habilitar tu catálogo digital.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0 text-center"
          >
            Configurar mi Local →
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Revenue Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Ingresos Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            ${(metrics?.todaySales || 0).toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {metrics?.todayOrdersCount || 0} pedidos hoy
          </span>
        </div>

        {/* Orders in kitchen */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Activos / Cocina
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            {activeOrders.length}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {metrics?.pendingCount || 0} pendientes de confirmar
          </span>
        </div>

        {/* Average ticket */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            ${(metrics?.averageTicket || 0).toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-zinc-500 font-medium">
            Por orden completada
          </span>
        </div>

        {/* Active Products */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Menú Activo
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            {metrics?.totalProductsCount || 0}
          </p>
          <span className="text-[11px] text-zinc-500 font-medium">
            Platos disponibles para pedir
          </span>
        </div>
      </div>

      {/* Main Section: Live Active Orders Stream & Top 5 Ordered Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Orders Stream */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Pedidos en Curso
                </h2>
                <span className="min-w-[26px] h-6 px-2 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 text-xs font-black inline-flex items-center justify-center">
                  {activeOrders.length}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Hacé clic en el ícono del ojo para ver el detalle o cambiar el estado.
              </p>
            </div>

            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Ver Tablero completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                No hay pedidos en preparación en este momento
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Cuando un cliente realice un pedido desde la web pública, aparecerá aquí inmediatamente con alerta sonora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeOrders.slice(0, 6).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Más Pedidos Top 5 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Más Pedidos · Top 5</span>
              </h2>
              <p className="text-xs text-zinc-500">Platos más elegidos por tus clientes.</p>
            </div>
          </div>

          <div className="bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 p-4 shadow-xs divide-y divide-zinc-200/50 dark:divide-zinc-800/70">
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              metrics.topProducts
                .slice(0, 5)
                .map((p: { name: string; salesCount: number; revenue: number }, idx: number) => (
                  <div key={p.name} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-[11px] shrink-0 ${
                          idx === 0
                            ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <span className="text-[11px] text-zinc-500">{p.salesCount} pedidos</span>
                      </div>
                    </div>
                    <span className="font-bold text-orange-600 dark:text-orange-400 shrink-0 ml-2">
                      ${p.revenue.toLocaleString('es-AR')}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-6">No hay pedidos registrados aún.</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={loadData}
      />
    </div>
  );
}
