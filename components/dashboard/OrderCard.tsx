'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import {
  Clock,
  Bike,
  Store,
  Phone,
  MapPin,
  ArrowRight,
  ChevronDown,
  MessageCircle,
  Eye,
  Banknote,
  Landmark,
} from 'lucide-react';

interface Props {
  order: Order;
  onClick: () => void;
  onAdvanceStatus?: (e: React.MouseEvent, nextStatus: OrderStatus) => void;
}

export function OrderCard({ order, onClick, onAdvanceStatus }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const totalItemsQty = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className={`group cursor-pointer bg-white dark:bg-zinc-900 border transition-all duration-200 rounded-2xl p-3 shadow-xs hover:shadow-md flex flex-col gap-2.5 ${
        isExpanded
          ? 'border-orange-500/60 dark:border-orange-500/50 ring-2 ring-orange-500/10'
          : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-orange-500/40 dark:hover:border-orange-500/40'
      }`}
    >
      {/* Compact Top Row: #Order, Time, Eye Modal Trigger & Expand Chevron */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
            #{order.order_number}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {new Date(order.created_at).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {order.whatsapp_business_sent && (
            <span
              title="Notificado por WhatsApp"
              className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0"
            >
              <MessageCircle className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Eye Button: Opens full modal directly */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            title="Ver detalles completos"
            aria-label="Ver detalles completos"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse indicator */}
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-orange-500' : ''
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Customer Name & Total */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-bold text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 leading-snug break-words">
            {order.customer_name}
          </h4>
          <span className="font-black text-xs sm:text-[13px] text-zinc-900 dark:text-white shrink-0">
            ${order.total.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Compact meta tags (no cut-off text) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
            {order.delivery_type === 'DELIVERY' ? (
              <Bike className="w-3 h-3 text-orange-500 shrink-0" />
            ) : (
              <Store className="w-3 h-3 text-orange-500 shrink-0" />
            )}
            {order.delivery_type === 'DELIVERY' ? 'Delivery' : 'Retiro'}
          </span>
          <span>•</span>
          <span>
            {totalItemsQty} {totalItemsQty === 1 ? 'ítem' : 'ítems'}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            {order.payment_method === 'CASH' ? (
              <Banknote className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <Landmark className="w-3 h-3 text-indigo-500 shrink-0" />
            )}
            {order.payment_method === 'CASH' ? 'Efectivo' : 'Transf.'}
          </span>
        </div>
      </div>

      {/* Inline Collapsible Details Section */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-150 cursor-default"
        >
          {/* Full Items List without truncation */}
          <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Detalle del pedido
            </div>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                  <div className="text-zinc-800 dark:text-zinc-200 font-medium leading-tight">
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {item.quantity}x
                    </span>{' '}
                    {item.product_name}
                    {item.notes && (
                      <p className="text-[10px] text-zinc-400 italic mt-0.5">Nota: {item.notes}</p>
                    )}
                  </div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                    ${item.subtotal.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Address Info */}
          <div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="font-medium">{order.customer_phone}</span>
            </div>
            {order.delivery_type === 'DELIVERY' && order.delivery_address && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{order.delivery_address}</span>
              </div>
            )}
            {order.notes && (
              <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px]">
                <strong>Nota:</strong> {order.notes}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <OrderStatusBadge status={order.status} size="sm" />
            <button
              type="button"
              onClick={() => onClick()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Abrir modal completo</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Quick Action */}
      {nextStatus && onAdvanceStatus && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <span className="text-[10px] text-zinc-400 font-medium">
            {isExpanded ? 'Clic para plegar' : 'Clic para desplegar'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStatus(e, nextStatus);
            }}
            className="bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-600 hover:text-white text-orange-600 dark:text-orange-400 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-900/50 flex items-center gap-1 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <span>{getNextActionLabel(nextStatus)}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
