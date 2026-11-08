'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMetrics, getOrders, updateOrderStatus, getBusiness } from '@/lib/data/store';
import { MetricsSummary, Order, OrderStatus, Business } from '@/types';
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

  const handleAdvanceStatus = async (e: React.MouseEvent, orderId: string, nextStatus: OrderStatus) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(orderId, nextStatus, true);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
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
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  return (
    <div className="space-y-8">
      {/* Onboarding Alert Banner if business is missing or incomplete */}
      {(!business || !business.phone_whatsapp || business.address === 'Dirección pendiente') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
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
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 text-center"
          >
            Configurar mi Local →
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Sales Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Ventas Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            ${(metrics?.todaySales || 0).toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {metrics?.todayOrdersCount || 0} pedidos recibidos
          </span>
        </div>

        {/* Orders in kitchen */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Activos / Cocina
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Menú Activo
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
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

      {/* Main Section: Live Active Orders Stream & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Orders Stream */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                Pedidos en Curso ({activeOrders.length})
              </h2>
              <p className="text-xs text-zinc-500">
                Se actualiza en tiempo real al ingresar nuevos pedidos o avanzar de estado.
              </p>
            </div>

            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Ver Kanban completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                No hay pedidos en preparación en este momento
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Cuando un cliente realice un pedido desde la web pública o uses el botón de simulación, aparecerá aquí inmediatamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeOrders.slice(0, 6).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                  onAdvanceStatus={(e, next) => handleAdvanceStatus(e, order.id, next)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Top Selling Products */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Más Vendidos
            </h2>
            <p className="text-xs text-zinc-500">Productos con mayor rotación en TAKEO.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800">
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              metrics.topProducts.map((p: { name: string; salesCount: number; revenue: number }, idx: number) => (
                <div key={p.name} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white line-clamp-1">{p.name}</p>
                      <span className="text-[11px] text-zinc-500">{p.salesCount} unidades vendidas</span>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-200">
                    ${p.revenue.toLocaleString('es-AR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-4">No hay ventas registradas aún.</p>
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
