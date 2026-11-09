'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/data/store';
import { Order, OrderStatus } from '@/types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { OrderDetailsModal } from '@/components/dashboard/OrderDetailsModal';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutGrid,
  List,
  Search,
  Clock,
  ChefHat,
  Store,
  Bike,
  PackageCheck,
  RotateCw,
  Phone,
  Eye,
  Banknote,
  Landmark,
} from 'lucide-react';

const BOARD_COLUMNS: {
  id: string;
  title: string;
  statuses: OrderStatus[];
  icon: React.ElementType;
}[] = [
  {
    id: 'pending',
    title: 'Pendientes',
    statuses: ['PENDING'],
    icon: Clock,
  },
  {
    id: 'preparing',
    title: 'En Preparación',
    statuses: ['CONFIRMED', 'PREPARING'],
    icon: ChefHat,
  },
  {
    id: 'ready',
    title: 'Listos / En Camino',
    statuses: ['READY', 'OUT_FOR_DELIVERY'],
    icon: Store,
  },
  {
    id: 'delivered',
    title: 'Entregados',
    statuses: ['DELIVERED'],
    icon: PackageCheck,
  },
];

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const targetCol = BOARD_COLUMNS.find((c) => c.id === destination.droppableId);
      if (targetCol && targetCol.statuses.length > 0) {
        const orderId = draggableId;
        const newStatus = targetCol.statuses[0];

        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );

        try {
          await updateOrderStatus(orderId, newStatus, true);
        } catch (e) {
          console.error(e);
          loadOrders();
        }
      }
    }
  };

  const handleAdvanceStatus = async (
    e: React.MouseEvent,
    orderId: string,
    nextStatus: OrderStatus
  ) => {
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

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-28 h-9 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 min-w-0">
      {/* Ambient Orange Glow */}
      <div className="pointer-events-none fixed top-24 right-12 w-96 h-96 rounded-full bg-orange-500/8 dark:bg-orange-500/10 blur-3xl -z-10" />

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
          <div className="bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tablero</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-600/30'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            aria-label="Actualizar"
            className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por #pedido, cliente o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 h-10 rounded-xl bg-white/75 dark:bg-zinc-900/70 backdrop-blur-md"
          />
        </div>

        {viewMode === 'list' && (
          <div className="w-full sm:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-10 bg-white/75 dark:bg-zinc-900/70">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="CONFIRMED">Confirmados</SelectItem>
                <SelectItem value="PREPARING">En Preparación</SelectItem>
                <SelectItem value="READY">Listos</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">En Camino</SelectItem>
                <SelectItem value="DELIVERED">Entregados</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Board View ("Tablero") with Horizontal Scroll Only on Columns */}
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 items-start min-w-max">
              {BOARD_COLUMNS.map((col) => {
                const colOrders = filteredOrders.filter((o) =>
                  col.statuses.includes(o.status)
                );
                const Icon = col.icon;

                return (
                  <div
                    key={col.id}
                    className="w-[300px] sm:w-[335px] shrink-0 bg-white/60 dark:bg-zinc-900/55 backdrop-blur-md rounded-2xl p-3.5 border border-zinc-200/70 dark:border-zinc-800/80 flex flex-col gap-3 min-h-[480px]"
                  >
                    <div className="flex items-center justify-between px-1 py-1 border-b border-zinc-200/50 dark:border-zinc-800/70">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 truncate">
                          {col.title}
                        </h3>
                      </div>
                      <span className="min-w-[24px] h-6 px-2 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 text-xs font-black flex items-center justify-center shrink-0">
                        {colOrders.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex flex-col gap-2.5 flex-1 min-h-[380px] rounded-xl transition-colors ${
                            snapshot.isDraggingOver
                              ? 'bg-orange-500/[0.06] ring-1 ring-orange-500/30 p-1'
                              : ''
                          }`}
                        >
                          {colOrders.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-32 flex items-center justify-center text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-2xl">
                              Sin pedidos
                            </div>
                          )}
                          {colOrders.map((order, index) => (
                            <Draggable
                              key={order.id}
                              draggableId={order.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`w-full min-w-0 ${
                                    snapshot.isDragging
                                      ? 'opacity-95 shadow-2xl scale-[1.01] transition-transform'
                                      : ''
                                  }`}
                                >
                                  <OrderCard
                                    order={order}
                                    onClick={() => setSelectedOrder(order)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      ) : (
        /* Modern Glassmorphic Table List View (Clean Neutral Header, 24h Time) */
        <div className="bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="px-5 py-3.5">Pedido</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Modalidad</th>
                  <th className="px-5 py-3.5">Pago</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Hora</th>
                  <th className="px-5 py-3.5 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/70">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-zinc-400 text-xs"
                    >
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-orange-500/[0.04] dark:hover:bg-orange-500/[0.06] cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          #{order.order_number}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {order.customer_name}
                        </p>
                        <span className="text-[11px] text-zinc-400 inline-flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-orange-500" />
                          {order.customer_phone}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {order.delivery_type === 'DELIVERY' ? (
                            <>
                              <Bike className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span>Delivery</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span>Retiro</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {order.payment_method === 'CASH' ? (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Efectivo</span>
                            </>
                          ) : (
                            <>
                              <Landmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>Transferencia</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-black text-zinc-900 dark:text-white">
                        ${order.total.toLocaleString('es-AR')}
                      </td>

                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>

                      <td className="px-5 py-3.5 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1 font-mono font-medium">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {new Date(order.created_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          title="Ver detalles completos"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
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
