'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types';
import {
  Clock,
  Bike,
  Store,
  Eye,
  Banknote,
  Landmark,
  ShoppingBag,
} from 'lucide-react';

interface Props {
  order: Order;
  onClick: () => void;
  onAdvanceStatus?: (e: React.MouseEvent, nextStatus: OrderStatus) => void;
}

export function OrderCard({ order, onClick }: Props) {
  const totalItemsQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

  const formattedTime24 = new Date(order.created_at).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      onClick={onClick}
      className="group w-full max-w-full min-w-0 overflow-hidden cursor-pointer bg-white/85 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/70 dark:border-zinc-800/80 hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-colors duration-150 rounded-2xl p-3.5 shadow-xs flex flex-col gap-2.5 select-none"
    >
      {/* Row 1: #Order + Customer Name + Eye Button */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
            #{order.order_number}
          </span>
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {order.customer_name}
          </h4>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          title="Ver detalles del pedido"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer shrink-0"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: Pure Icon Badges + 24h Time + Total Price */}
      <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span
            title={order.delivery_type === 'DELIVERY' ? 'Envío a domicilio' : 'Retiro en local'}
            className="w-6 h-6 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center text-orange-500 shrink-0"
          >
            {order.delivery_type === 'DELIVERY' ? (
              <Bike className="w-3.5 h-3.5" />
            ) : (
              <Store className="w-3.5 h-3.5" />
            )}
          </span>

          <span
            title={order.payment_method === 'CASH' ? 'Efectivo' : 'Transferencia'}
            className="w-6 h-6 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center shrink-0"
          >
            {order.payment_method === 'CASH' ? (
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Landmark className="w-3.5 h-3.5 text-blue-500" />
            )}
          </span>

          <span
            title={`${totalItemsQty} productos`}
            className="inline-flex items-center gap-1 px-1.5 h-6 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0"
          >
            <ShoppingBag className="w-2.5 h-2.5 text-zinc-400" />
            {totalItemsQty}
          </span>

          <span className="text-[11px] text-zinc-400 font-mono font-medium inline-flex items-center gap-1 pl-0.5 shrink-0">
            <Clock className="w-2.5 h-2.5" />
            {formattedTime24}
          </span>
        </div>

        <span className="font-black text-xs sm:text-sm text-zinc-900 dark:text-white shrink-0">
          ${order.total.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  );
}
