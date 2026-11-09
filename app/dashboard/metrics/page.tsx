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
  PieChart as PieChartIcon,
  Award,
  Banknote,
  Landmark,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  const totalCompletedOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const deliveryOrdersCount = totalCompletedOrders.filter((o) => o.delivery_type === 'DELIVERY').length;
  const pickupOrdersCount = totalCompletedOrders.filter((o) => o.delivery_type === 'PICKUP').length;
  const cashOrdersCount = totalCompletedOrders.filter((o) => o.payment_method === 'CASH').length;
  const transferOrdersCount = totalCompletedOrders.filter((o) => o.payment_method === 'TRANSFER').length;
  const totalRevenue = totalCompletedOrders.reduce((sum, o) => sum + o.total, 0);

  const deliveryData = [
    { name: 'Delivery', value: deliveryOrdersCount || 1, realValue: deliveryOrdersCount, color: '#ff6b00' },
    { name: 'Retiro en Local', value: pickupOrdersCount || 1, realValue: pickupOrdersCount, color: '#f59e0b' },
  ];

  const topProducts = (metrics?.topProducts || []).slice(0, 5);
  const maxTopQty = Math.max(...topProducts.map((p) => p.salesCount), 1);

  return (
    <div className="relative space-y-8 pb-10">
      {/* Ambient Orange Background Glows */}
      <div className="pointer-events-none fixed top-24 right-12 w-96 h-96 rounded-full bg-orange-500/8 dark:bg-orange-500/12 blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-12 left-1/3 w-80 h-80 rounded-full bg-amber-500/6 dark:bg-orange-600/8 blur-3xl -z-10" />

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Métricas y Rendimiento
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Análisis de pedidos, horarios de mayor demanda y platos más pedidos.
        </p>
      </div>

      {/* Main KPI cards (Clean Glassmorphism without heavy borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Ingresos Acumulados
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            ${totalRevenue.toLocaleString('es-AR')}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {totalCompletedOrders.length} pedidos procesados
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            ${(metrics?.averageTicket || 0).toLocaleString('es-AR')}
          </p>
          <span className="text-xs text-zinc-400">
            Gasto promedio por pedido
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Medios de Pago
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-5 pt-1">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-black text-zinc-900 dark:text-white">
                {cashOrdersCount}
              </span>
              <span className="text-xs text-zinc-400">Efvo.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-500" />
              <span className="text-xl font-black text-zinc-900 dark:text-white">
                {transferOrdersCount}
              </span>
              <span className="text-xs text-zinc-400">Transf.</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 block">
            Preferencia: {transferOrdersCount >= cashOrdersCount ? 'Transferencia' : 'Efectivo'}
          </span>
        </div>
      </div>

      {/* Recharts Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Evolución de los últimos 7 días */}
        <div className="p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Evolución de los últimos 7 días
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Volumen de pedidos facturados por jornada
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics?.salesByDay || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="orangeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(161, 161, 170, 0.14)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(val) => (val >= 1000 ? `$${Math.round(val / 1000)}k` : `$${val}`)}
                />
                <Tooltip
                  cursor={{ stroke: '#ff6b00', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as {
                        day: string;
                        dateStr: string;
                        total: number;
                      };
                      return (
                        <div className="rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 px-3.5 py-2.5 shadow-xl text-white">
                          <p className="text-[11px] font-semibold text-zinc-400">
                            {item.day} · {item.dateStr}
                          </p>
                          <p className="text-sm font-black text-orange-400 mt-0.5">
                            ${item.total.toLocaleString('es-AR')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#ff6b00"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orangeAreaGradient)"
                  activeDot={{
                    r: 5,
                    fill: '#ff6b00',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Horarios de Mayor Demanda */}
        <div className="p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Horarios de Mayor Demanda
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Concentración de pedidos por franja horaria
              </p>
            </div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics?.salesByHour || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="orangeBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(161, 161, 170, 0.14)"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val: string) => `${val.split(':')[0]}h`}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 107, 0, 0.06)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as {
                        hour: string;
                        count: number;
                        total: number;
                      };
                      return (
                        <div className="rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 px-3.5 py-2.5 shadow-xl text-white">
                          <p className="text-[11px] font-semibold text-zinc-400">
                            Franja {item.hour} hs
                          </p>
                          <p className="text-sm font-black text-orange-400 mt-0.5">
                            {item.count} {item.count === 1 ? 'pedido' : 'pedidos'}
                          </p>
                          <p className="text-[11px] text-zinc-300">
                            ${item.total.toLocaleString('es-AR')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#orangeBarGradient)"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 5 Más Pedidos & Distribución de Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Más Pedidos */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Más Pedidos · Top 5
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Productos con mayor cantidad de pedidos
              </p>
            </div>
            <Award className="w-5 h-5 text-orange-500" />
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              Aún no hay suficientes pedidos para calcular el ranking.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {topProducts.map((prod, idx) => {
                const pct = Math.max(12, Math.round((prod.salesCount / maxTopQty) * 100));
                return (
                  <div
                    key={prod.name}
                    className="p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/35 border border-zinc-200/50 dark:border-zinc-800/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center text-[11px] shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {prod.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-500 dark:text-zinc-400 font-semibold">
                          {prod.salesCount} pedidos
                        </span>
                        <span className="font-black text-orange-600 dark:text-orange-400">
                          ${prod.revenue.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donut Chart: Modalidad de Entrega */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                Modalidad de Entrega
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Proporción entre envíos a domicilio y retiro
              </p>
            </div>
            <PieChartIcon className="w-5 h-5 text-orange-500" />
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as {
                        name: string;
                        realValue: number;
                      };
                      return (
                        <div className="rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 px-3 py-2 shadow-xl text-white text-xs">
                          <span className="font-bold text-orange-400">{item.name}: </span>
                          <span className="font-black">{item.realValue} pedidos</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                  Delivery
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {deliveryOrdersCount} pedidos
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block">
                  Retiro Local
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {pickupOrdersCount} pedidos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
