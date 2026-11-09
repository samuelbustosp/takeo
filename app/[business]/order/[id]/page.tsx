'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { TakeoLogo } from '@/components/ui/TakeoLogo';
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
  Bike,
  Sparkles,
  MapPin,
  Banknote,
  CreditCard,
  AlertCircle,
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
      <div className="relative min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col overflow-hidden">
        <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-transparent blur-[120px] rounded-full z-0" />
        <header className="relative z-10 h-14 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 flex items-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-36 h-4" />
          </div>
        </header>
        <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full space-y-6">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#faf9f6] dark:bg-[#0d0e12]">
        <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/15 blur-[120px] rounded-full" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pedido no encontrado</h1>
          <p className="text-zinc-500 text-sm">No pudimos encontrar los datos del pedido solicitado.</p>
          <Link
            href={`/${businessSlug}`}
            className="inline-flex mt-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-600/20"
          >
            Volver al Menú
          </Link>
        </div>
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
    <div className="relative min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col overflow-x-hidden selection:bg-orange-500/20">
      {/* Ambient Orange Background Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[360px] bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent blur-[120px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-1/4 -right-32 w-[340px] h-[340px] bg-orange-500/10 dark:bg-orange-500/15 blur-[100px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-12 -left-32 w-[300px] h-[300px] bg-amber-500/10 dark:bg-amber-500/10 blur-[100px] rounded-full z-0" />

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

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 w-full space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-2 relative">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/25 rounded-3xl blur-xl" />
            <div className="relative w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            ¡Pedido #{order.order_number} recibido!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Gracias <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.customer_name}</span>. Tu pedido ya fue transmitido a la cocina de <span className="font-semibold text-zinc-800 dark:text-zinc-200">{business?.name}</span>.
          </p>
        </div>

        {/* WhatsApp Notification confirmation card */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-xs">
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
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-7 shadow-xs space-y-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
              Estado del pedido
            </h2>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>

          {/* Stepper Progress */}
          <div className="relative pt-1 pb-1">
            {/* Background track line: exactly connecting the centers of the 1st (10%) and 5th (90%) column */}
            <div className="absolute top-[20px] left-[10%] right-[10%] -translate-y-1/2 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full z-0" />
            
            {/* Active progress fill line: perfectly aligned with column centers */}
            <div
              className="absolute top-[20px] left-[10%] -translate-y-1/2 h-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full z-0 transition-all duration-700 ease-out"
              style={{
                width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%`,
              }}
            />

            {/* Stepper Columns */}
            <div className="relative z-10 grid grid-cols-5 gap-0">
              {STEPS.map((step, idx) => {
                const isDelivery = order.delivery_type === 'DELIVERY';
                const Icon = idx === 3 && isDelivery ? Bike : step.icon;
                const label = idx === 3 && isDelivery ? 'En camino' : step.label;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center px-0.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10 ${
                        isPassed
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-4 ring-white dark:ring-zinc-900'
                          : 'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-400 ring-4 ring-white dark:ring-zinc-900'
                      } ${isCurrent ? '!ring-orange-500/30 !scale-110' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-2.5 text-center leading-tight transition-colors ${
                        isPassed
                          ? 'text-zinc-900 dark:text-white'
                          : 'text-zinc-400 dark:text-zinc-500'
                      } ${isCurrent ? 'font-bold text-orange-600 dark:text-orange-400' : ''}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Helper Message (Icons only, no emojis) */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3.5 flex items-center justify-center gap-2.5 text-center text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/50">
            {order.status === 'PENDING' && (
              <>
                <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                <span>Esperando que el local confirme la recepción de tu pedido...</span>
              </>
            )}
            {order.status === 'CONFIRMED' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Tu pedido fue confirmado y pasará a cocina en instantes.</span>
              </>
            )}
            {order.status === 'PREPARING' && (
              <>
                <ChefHat className="w-4 h-4 text-orange-500 shrink-0" />
                <span>La cocina está preparando tus productos con dedicación.</span>
              </>
            )}
            {order.status === 'READY' && (
              <>
                <Store className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ¡Tu pedido está listo! Podés pasar a retirarlo por {business?.address}.
                </span>
              </>
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <>
                <Bike className="w-4 h-4 text-indigo-500 shrink-0 animate-bounce" />
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  El repartidor ya va en camino hacia tu domicilio.
                </span>
              </>
            )}
            {order.status === 'DELIVERED' && (
              <>
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ¡Pedido entregado con éxito!
                </span>
              </>
            )}
            {order.status === 'CANCELLED' && (
              <>
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  Este pedido fue cancelado.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
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
                    <p className="text-[11px] text-zinc-500 italic mt-0.5">Nota: {item.notes}</p>
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

          {/* Delivery & Payment Info (No emojis, sleek icons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 space-y-1.5">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Entrega</span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                {order.delivery_type === 'DELIVERY' ? (
                  <>
                    <Bike className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Envío a domicilio</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Retiro en local</span>
                  </>
                )}
              </div>
              {order.delivery_address && (
                <p className="text-zinc-500 text-[11px] leading-relaxed pl-6">{order.delivery_address}</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 space-y-1.5">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">Pago</span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                {order.payment_method === 'CASH' ? (
                  <>
                    <Banknote className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Efectivo</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Transferencia</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] pl-6">
                <span>Estado:</span>
                {order.payment_status === 'PAID' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Abonado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    Pendiente al recibir
                  </span>
                )}
              </div>
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

        {/* Takeo Branding Footer (Chiquito, simple, elegante) */}
        <footer className="pt-6 pb-2 flex flex-col items-center justify-center gap-2 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs hover:border-orange-500/40 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-200"
          >
            <TakeoLogo variant="rounded" size={17} animated={false} className="rounded-md" />
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
              Potenciado por <strong className="text-zinc-800 dark:text-zinc-100 font-black tracking-wide">TAKEO</strong>
            </span>
          </Link>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            Pedidos online simples y directos para tu negocio
          </p>
        </footer>
      </main>
    </div>
  );
}
