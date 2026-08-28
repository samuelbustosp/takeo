'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/data/store';
import { Order, OrderStatus } from '@/types';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { OrderDetailsModal } from '@/components/dashboard/OrderDetailsModal';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import {
  LayoutGrid,
  List,
  Search,
  Clock,
  CheckCircle2,
  ChefHat,
  Store,
  Bike,
  PackageCheck,
  RotateCw,
  Phone,
} from 'lucide-react';

const KANBAN_COLUMNS: {
  id: string;
  title: string;
  statuses: OrderStatus[];
  color: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'pending',
    title: 'Pendientes',
    statuses: ['PENDING'],
    color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    icon: Clock,
  },
  {
    id: 'preparing',
    title: 'En Preparación',
    statuses: ['CONFIRMED', 'PREPARING'],
    color: 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20',
    icon: ChefHat,
  },
  {
    id: 'ready',
    title: 'Listos / En Camino',
    statuses: ['READY', 'OUT_FOR_DELIVERY'],
    color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20',
    icon: Store,
  },
  {
    id: 'delivered',
    title: 'Entregados',
    statuses: ['DELIVERED'],
    color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
    icon: PackageCheck,
  },
];

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    const handleCreated = () => loadOrders();
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
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchesSearch = searchQuery.trim()
        ? String(o.order_number).includes(searchQuery.trim()) ||
          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_phone.includes(searchQuery)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Gestión de Pedidos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Control de cocina y despacho en tiempo real con notificaciones automáticas.
          </p>
        </div>

        {/* View mode toggle & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            onClick={loadOrders}
            aria-label="Actualizar"
            className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por #pedido, cliente o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {viewMode === 'list' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="PREPARING">En Preparación</option>
            <option value="READY">Listos</option>
            <option value="OUT_FOR_DELIVERY">En Camino</option>
            <option value="DELIVERED">Entregados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colOrders = filteredOrders.filter((o) => col.statuses.includes(o.status));
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-3xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-3 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      {col.title}
                    </h3>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center justify-center shadow-2xs">
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders in this column */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                      Sin pedidos
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onClick={() => setSelectedOrder(order)}
                        onAdvanceStatus={(e, next) => handleAdvanceStatus(e, order.id, next)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3"># Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha / Hora</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-400 text-xs">
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-extrabold text-zinc-900 dark:text-white">
                        #{order.order_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {order.customer_name}
                        </p>
                        <span className="text-xs text-zinc-400">{order.customer_phone}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                        {order.delivery_type === 'DELIVERY' ? '🛵 Delivery' : '📍 Retiro'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                        ${order.total.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-500">
                        {new Date(order.created_at).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="text-xs font-bold text-orange-600 hover:underline"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={loadOrders}
      />
    </div>
  );
}
