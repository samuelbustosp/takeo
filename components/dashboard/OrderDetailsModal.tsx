'use client';

import React, { useState } from 'react';
import { Order, OrderStatus, WhatsAppMessage } from '@/types';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { updateOrderStatus, retryWhatsAppMessage, getWhatsAppMessages } from '@/lib/data/store';
import {
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  Store,
  Bike,
  PackageCheck,
  XCircle,
  MessageCircle,
  RotateCw,
  Phone,
  MapPin,
  Banknote,
  Landmark,
  Sparkles,
} from 'lucide-react';

interface Props {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export function OrderDetailsModal({ order, onClose, onOrderUpdated }: Props) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'whatsapp'>('detail');

  if (!order) return null;

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const all = await getWhatsAppMessages(order.business_id);
      const filtered = all.filter((m) => m.order_id === order.id);
      setMessages(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    setLoadingAction(true);
    try {
      await updateOrderStatus(order.id, status, true);
      onOrderUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRetryMessage = async (msgId: string) => {
    try {
      await retryWhatsAppMessage(msgId);
      loadMessages();
      onOrderUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-black">
              #{order.order_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  Pedido #{order.order_number}
                </h3>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              <p className="text-xs text-zinc-500">
                Creado: {new Date(order.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(order.created_at).toLocaleDateString('es-AR')})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 flex gap-2 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'detail'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Detalle del Pedido
          </button>
          <button
            onClick={() => {
              setActiveTab('whatsapp');
              loadMessages();
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'whatsapp'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Logs de WhatsApp</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'detail' ? (
            <>
              {/* Customer & Delivery Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 space-y-1.5">
                  <span className="font-bold text-zinc-400 uppercase text-[10px]">Cliente</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">
                    {order.customer_name}
                  </p>
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>{order.customer_phone}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 space-y-1.5">
                  <span className="font-bold text-zinc-400 uppercase text-[10px]">Entrega & Pago</span>
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                    {order.delivery_type === 'DELIVERY' ? <Bike className="w-3.5 h-3.5 text-orange-500" /> : <Store className="w-3.5 h-3.5 text-orange-500" />}
                    <span>{order.delivery_type === 'DELIVERY' ? 'Envío a domicilio' : 'Retiro en local'}</span>
                  </div>
                  {order.delivery_address && (
                    <p className="text-zinc-600 dark:text-zinc-400">{order.delivery_address}</p>
                  )}
                  {order.delivery_notes && (
                    <p className="text-zinc-500 text-[11px]">Ref: {order.delivery_notes}</p>
                  )}
                  <p className="text-zinc-600 dark:text-zinc-400 pt-0.5">
                    Pago: {order.payment_method === 'CASH' ? 'Efectivo' : 'Transferencia'} ({order.payment_status})
                  </p>
                </div>
              </div>

              {/* Order Notes if any */}
              {order.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Observación del cliente:</span> {order.notes}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Productos ({order.items.length})
                </h4>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 bg-zinc-50/50 dark:bg-zinc-800/20">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {item.quantity} × {item.product_name}
                        </span>
                        {item.notes && (
                          <p className="text-[11px] text-zinc-500 italic">{item.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ${order.subtotal.toLocaleString('es-AR')}
                  </span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento ({order.discount_code})</span>
                    <span>-${order.discount_total.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Costo de envío</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      ${order.delivery_fee.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>TOTAL A COBRAR</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    ${order.total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* WhatsApp Tab */
            <div className="space-y-3">
              {loadingMessages ? (
                <div className="py-8 text-center text-xs text-zinc-400">Cargando logs...</div>
              ) : messages.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No hay mensajes registrados para este pedido.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.status === 'SENT' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-zinc-900 dark:text-white">
                          Para: {m.recipient_type === 'BUSINESS' ? 'Negocio' : 'Cliente'} ({m.recipient_phone})
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-zinc-700 dark:text-zinc-300 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {m.message_text}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-500">
                        Estado: <span className="font-semibold">{m.status}</span> (Intentos: {m.attempts})
                      </span>
                      {m.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetryMessage(m.id)}
                          className="flex items-center gap-1 text-orange-600 hover:underline font-bold text-xs"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Reintentar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with One-Click State Actions */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-zinc-500">Avanzar estado:</span>

          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'PENDING' && (
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={loadingAction}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar</span>
              </button>
            )}

            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button
                onClick={() => handleStatusChange('PREPARING')}
                disabled={loadingAction}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Pasar a Cocina</span>
              </button>
            )}

            {order.status === 'PREPARING' && (
              <button
                onClick={() => handleStatusChange(order.delivery_type === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY')}
                disabled={loadingAction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                {order.delivery_type === 'DELIVERY' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>{order.delivery_type === 'DELIVERY' ? 'Despachar Delivery' : 'Marcar Listo'}</span>
              </button>
            )}

            {(order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY') && (
              <button
                onClick={() => handleStatusChange('DELIVERED')}
                disabled={loadingAction}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Marcar Entregado</span>
              </button>
            )}

            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={loadingAction}
                className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-semibold px-2.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
