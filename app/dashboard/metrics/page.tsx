'use client';

import React, { useState, useEffect } from 'react';
import { getMetrics, getOrders } from '@/lib/data/store';
import { MetricsSummary, Order } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Bike,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, ords] = await Promise.all([getMetrics(), getOrders()]);
        setMetrics(m);
        setOrders(ords);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="space-y-2">
          <Skeleton className="w-48 h-7" />
          <Skeleton className="w-72 h-4" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const deliveryOrdersCount = orders.filter((o) => o.delivery_type === 'DELIVERY').length;
  const pickupOrdersCount = orders.filter((o) => o.delivery_type === 'PICKUP').length;
  const totalCompletedOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const totalRevenue = totalCompletedOrders.reduce((sum, o) => sum + o.total, 0);

  const maxDaySales = Math.max(...(metrics?.salesByDay.map((d: { total: number }) => d.total) || [1]), 1000);
  const maxHourOrders = Math.max(...(metrics?.salesByHour.map((h: { count: number }) => h.count) || [1]), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Métricas y Rendimiento
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Estadísticas de ventas, horarios con mayor demanda y productos estrella.
        </p>
      </div>

      {/* Main KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Ingresos Totales Acumulados
          </span>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            ${totalRevenue.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {totalCompletedOrders.length} pedidos procesados
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            ${(metrics?.averageTicket || 0).toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-zinc-400">
            Gasto promedio por cliente
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Modalidad de Entrega
          </span>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <Bike className="w-4 h-4 text-orange-500" />
              <span>Delivery: {deliveryOrdersCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <Store className="w-4 h-4 text-orange-500" />
              <span>Retiro: {pickupOrdersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Day (7 Days) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Ventas de los últimos 7 días
              </h3>
              <p className="text-xs text-zinc-500">Monto total facturado por día</p>
            </div>
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {metrics?.salesByDay.map((d: { day: string; dateStr: string; total: number }) => {
              const barHeight = Math.max(8, Math.round((d.total / maxDaySales) * 100));
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${d.total > 0 ? `${Math.round(d.total / 1000)}k` : '0'}
                  </span>
                  <div
                    className="w-full max-w-[32px] rounded-xl bg-orange-100 dark:bg-zinc-800 group-hover:bg-orange-500 transition-all relative overflow-hidden"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-orange-600 to-amber-500"
                      style={{ opacity: d.total > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {d.day}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{d.dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demand by Hour */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Horarios de Mayor Demanda
              </h3>
              <p className="text-xs text-zinc-500">Concentración de pedidos durante la jornada</p>
            </div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>

          <div className="h-48 flex items-end justify-between gap-1 pt-6 overflow-x-auto">
            {metrics?.salesByHour.map((h: { hour: string; count: number; total: number }) => {
              const barHeight = Math.max(6, Math.round((h.count / maxHourOrders) * 100));
              return (
                <div key={h.hour} className="flex-1 min-w-[20px] flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </span>
                  <div
                    className="w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-orange-500 transition-all relative overflow-hidden"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div
                      className="absolute inset-0 bg-orange-600"
                      style={{ opacity: h.count > 0 ? 1 : 0.15 }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-500">
                    {h.hour.split(':')[0]}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
