'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { useCart } from '@/context/CartContext';
import { getBusiness, createOrder, validateDiscountCode } from '@/lib/data/store';
import { Business, DeliveryType, PaymentMethod } from '@/types';
import {
  ArrowLeft,
  Bike,
  Store,
  Banknote,
  Landmark,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = (params?.business as string) || 'takeo-express';

  const {
    items,
    subtotal,
    discount,
    discountAmount,
    setDiscount,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    deliveryNotes,
    setDeliveryNotes,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    paymentMethod,
    setPaymentMethod,
    orderNotes,
    setOrderNotes,
    deliveryFee,
    total,
    clearCart,
  } = useCart();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Promo code in checkout
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const b = await getBusiness(businessSlug);
        setBusiness(b);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessSlug]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim() || !business) return;

    try {
      const res = await validateDiscountCode(promoInput, subtotal, business.id);
      if (res.valid && res.discount) {
        setDiscount(res.discount, res.discountAmount);
        setPromoStatus({ success: true, message: res.message });
      } else {
        setPromoStatus({ success: false, message: res.message });
      }
    } catch {
      setPromoStatus({ success: false, message: 'Error validando cupón' });
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (items.length === 0) {
      setErrorMsg('Tu carrito está vacío. Agrega productos para continuar.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg('Por favor ingresa un número de teléfono / WhatsApp válido.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMsg('Por favor ingresa la dirección de entrega para el delivery.');
      return;
    }

    setSubmitting(true);

    try {
      if (!business) throw new Error('Negocio no encontrado');

      const created = await createOrder({
        businessId: business.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        deliveryNotes: deliveryType === 'DELIVERY' ? deliveryNotes.trim() : undefined,
        paymentMethod,
        notes: orderNotes.trim() || undefined,
        discountCode: discount?.code,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b00', '#f59e0b', '#10b981'],
        });
      } catch {
        // Ignore
      }

      clearCart();
      router.push(`/${businessSlug}/order/${created.id}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setErrorMsg(err?.message || 'Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="mt-3 text-sm text-zinc-500">Cargando checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
      <Navbar business={business || undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        {/* Back Link */}
        <Link
          href={`/${businessSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al menú</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Finalizar Pedido
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Completá tus datos para enviar el pedido a {business?.name || 'TAKEO'}.
        </p>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Delivery Type Selection */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                1. Tipo de entrega
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('PICKUP')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    deliveryType === 'PICKUP'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span className="text-xs sm:text-sm">Retiro en Local</span>
                  <span className="text-[11px] font-normal text-zinc-500">Sin costo extra</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('DELIVERY')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    deliveryType === 'DELIVERY'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <span className="text-xs sm:text-sm">Envío a Domicilio</span>
                  <span className="text-[11px] font-normal text-zinc-500">
                    +${business?.delivery_fee.toLocaleString('es-AR')}
                  </span>
                </button>
              </div>

              {deliveryType === 'DELIVERY' && (
                <div className="mt-4 space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Dirección de entrega *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Santa Fe 3200, Piso 4 Depto B"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Aclaraciones o timbre (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Timbre no funciona, llamar al llegar"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Customer Contact */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                2. Datos de contacto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 11 5566 7788"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                3. Forma de pago
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs sm:text-sm">Efectivo</span>
                  <span className="text-[11px] font-normal text-zinc-500">Al recibir o retirar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'TRANSFER'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span className="text-xs sm:text-sm">Transferencia</span>
                  <span className="text-[11px] font-normal text-zinc-500">Envío de comprobante</span>
                </button>
              </div>

              {paymentMethod === 'TRANSFER' && (
                <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 animate-in fade-in">
                  ℹ️ Los datos bancarios y el CBU te serán mostrados en la pantalla de confirmación.
                </div>
              )}
            </div>

            {/* 4. Notes / Kitchen Comments */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                4. Observaciones para la cocina
              </h2>
              <textarea
                rows={2}
                placeholder="Ej: Sin sal, empanadas bien calientes, condimentos extra..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Resumen de tu pedido
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">
                    No tienes productos en el carrito.
                  </p>
                ) : (
                  items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Promo input in checkout */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {discount ? (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="font-semibold">Cupón: {discount.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscount(null);
                        setPromoStatus(null);
                      }}
                      className="underline font-bold"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupón (ej: TAKEO20)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-zinc-800 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
                {promoStatus && (
                  <p
                    className={`text-[11px] mt-1 ${
                      promoStatus.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {promoStatus.message}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ${subtotal.toLocaleString('es-AR')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Descuento aplicado</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}

                {deliveryType === 'DELIVERY' && (
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      ${deliveryFee.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base sm:text-lg font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>TOTAL</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Creando tu pedido...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Pedido (${total.toLocaleString('es-AR')})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pedido enviado directamente al WhatsApp del local</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
