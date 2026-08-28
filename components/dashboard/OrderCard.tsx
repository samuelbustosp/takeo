'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import {
  Clock,
  Bike,
  Store,
  Phone,
  ArrowRight,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

interface Props {
  order: Order;
  onClick: () => void;
  onAdvanceStatus?: (e: React.MouseEvent, nextStatus: OrderStatus) => void;
}

export function OrderCard({ order, onClick, onAdvanceStatus }: Props) {
  const getNextStatus = (current: OrderStatus, deliveryType: string): OrderStatus | null => {
    switch (current) {
      case 'PENDING':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'PREPARING';
      case 'PREPARING':
        return deliveryType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY';
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status, order.delivery_type);

  const getNextActionLabel = (next: OrderStatus | null) => {
    switch (next) {
      case 'CONFIRMED':
        return 'Confirmar';
      case 'PREPARING':
        return 'A Cocina';
      case 'READY':
        return 'Listo';
      case 'OUT_FOR_DELIVERY':
        return 'En Camino';
      case 'DELIVERED':
        return 'Entregar';
      default:
        return 'Avanzar';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
            #{order.order_number}
          </span>
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(order.created_at).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {order.whatsapp_business_sent && (
            <span
              title="Notificado por WhatsApp"
              className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center"
            >
              <MessageCircle className="w-3 h-3" />
            </span>
          )}
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Customer & Items Summary */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {order.customer_name}
          </h4>
          <span className="font-black text-sm text-zinc-900 dark:text-white">
            ${order.total.toLocaleString('es-AR')}
          </span>
        </div>

        <p className="text-xs text-zinc-500 line-clamp-1">
          {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-0.5">
          <span className="flex items-center gap-1">
            {order.delivery_type === 'DELIVERY' ? (
              <Bike className="w-3 h-3 text-orange-500" />
            ) : (
              <Store className="w-3 h-3 text-orange-500" />
            )}
            {order.delivery_type === 'DELIVERY' ? 'Delivery' : 'Retiro'}
          </span>
          <span>•</span>
          <span>{order.payment_method === 'CASH' ? 'Efectivo' : 'Transferencia'}</span>
        </div>
      </div>

      {/* Footer Quick Action */}
      {nextStatus && onAdvanceStatus && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 group-hover:text-zinc-600 transition-colors">
            Ver detalle
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStatus(e, nextStatus);
            }}
            className="bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-600 hover:text-white text-orange-600 dark:text-orange-400 font-bold text-xs px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-900/50 flex items-center gap-1 transition-all shadow-2xs"
          >
            <span>{getNextActionLabel(nextStatus)}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
