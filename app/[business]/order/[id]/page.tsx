'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBusiness, getOrderById } from '@/lib/data/store';
import { Business, Order, OrderStatus } from '@/types';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Store,
  Check,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Pendiente', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'En Preparación', icon: ChefHat },
  { status: 'READY', label: 'Listo', icon: Store },
  { status: 'DELIVERED', label: 'Entregado', icon: Check },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const businessSlug = (params?.business as string) || 'takeo-express';
  const orderId = params?.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const [b, o] = await Promise.all([
        getBusiness(businessSlug),
        getOrderById(orderId),
      ]);
      setBusiness(b);
      setOrder(o);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Poll status every 3 seconds for live tracking updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [businessSlug, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
        <header className="h-14 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-36 h-4" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="w-16 h-16 rounded-3xl" />
            <Skeleton className="w-56 h-8" />
            <Skeleton className="w-72 h-4" />
          </div>
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-24 h-6 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pedido no encontrado</h1>
        <p className="text-zinc-500 mt-2">No pudimos encontrar los datos del pedido solicitado.</p>
        <Link
          href={`/${businessSlug}`}
          className="mt-4 bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
        >
          Volver al Menú
        </Link>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'OUT_FOR_DELIVERY') return 3;
    const idx = STEPS.findIndex((s) => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
      {/* Minimal Dedicated Order Header (No Navbar) */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-3xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
          <Link
            href={`/${businessSlug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a {business?.name || 'la tienda'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Seguimiento en vivo · #{order.order_number}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            ¡Pedido #{order.order_number} recibido!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Gracias <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.customer_name}</span>. Tu pedido ya fue transmitido a la cocina de <span className="font-semibold text-zinc-800 dark:text-zinc-200">{business?.name}</span>.
          </p>
        </div>

        {/* WhatsApp Notification confirmation card */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Notificación automática por WhatsApp activada
            </p>
            <p className="text-emerald-700 dark:text-emerald-400">
              El negocio recibió tu pedido en su sistema. Te enviaremos mensajes automáticos a tu WhatsApp ({order.customer_phone}) cuando esté confirmado y listo.
            </p>
          </div>
        </div>

        {/* Live Stepper Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
              Estado del pedido
            </h2>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          {/* Stepper Progress */}
          <div className="relative flex items-center justify-between">
            {/* Progress line */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-zinc-100 dark:bg-zinc-800 z-0" />
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-600 to-amber-500 z-0 transition-all duration-700"
              style={{
                width: `${(currentStepIndex / (STEPS.length - 1)) * 92}%`,
              }}
            />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                        : 'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                    } ${isCurrent ? 'ring-4 ring-orange-500/20 scale-110' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 text-center whitespace-nowrap ${
                      isPassed
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dynamic Helper Message */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 text-center text-xs text-zinc-600 dark:text-zinc-400">
            {order.status === 'PENDING' && (
              <span>⏳ Esperando que el local confirme la recepción de tu pedido...</span>
            )}
            {order.status === 'CONFIRMED' && (
              <span>✅ Tu pedido fue confirmado y pasará a cocina en instantes.</span>
            )}
            {order.status === 'PREPARING' && (
              <span>👨‍🍳 La cocina está preparando tus productos con dedicación.</span>
            )}
            {order.status === 'READY' && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                🟢 ¡Tu pedido está LISTO! Podés pasar a retirarlo por {business?.address}.
              </span>
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                🛵 El repartidor ya va en camino hacia tu domicilio.
              </span>
            )}
            {order.status === 'DELIVERED' && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                🎉 ¡Pedido entregado! ¡Buen provecho!
              </span>
            )}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
            Detalle del Pedido
          </h3>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.quantity} × {item.product_name}
                  </span>
                  {item.notes && (
                    <p className="text-[11px] text-zinc-500 italic">Nota: {item.notes}</p>
                  )}
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">
                  ${item.subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
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
                <span>Envío</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  ${order.delivery_fee.toLocaleString('es-AR')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span>TOTAL</span>
              <span className="text-orange-600 dark:text-orange-400">
                ${order.total.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
              <span className="font-bold text-zinc-500 uppercase text-[10px]">Entrega</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {order.delivery_type === 'DELIVERY' ? '🛵 Envío a domicilio' : '📍 Retiro en local'}
              </p>
              {order.delivery_address && (
                <p className="text-zinc-500">{order.delivery_address}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
              <span className="font-bold text-zinc-500 uppercase text-[10px]">Pago</span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {order.payment_method === 'CASH'
                  ? '💵 Efectivo'
                  : '💳 Transferencia'}
              </p>
              <p className="text-zinc-500">
                Estado: {order.payment_status === 'PAID' ? 'Abonado ✅' : 'Pendiente al recibir'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/${businessSlug}`}
            className="w-full sm:flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm py-3 rounded-xl text-center transition-colors"
          >
            Hacer otro pedido
          </Link>
          <a
            href={`https://wa.me/${business?.phone_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hola ${business?.name}, consulto por mi pedido #${order.order_number}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm py-3 rounded-xl text-center shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultar al local</span>
          </a>
        </div>
      </main>
    </div>
  );
}
