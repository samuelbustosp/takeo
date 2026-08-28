'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { validateDiscountCode } from '@/lib/data/store';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Props {
  businessSlug?: string;
  businessId?: string;
}

export function CartDrawer({ businessSlug = 'takeo-express', businessId }: Props) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    discountAmount,
    setDiscount,
    total,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoFeedback(null);

    try {
      const res = await validateDiscountCode(promoCode, subtotal, businessId);
      if (res.valid && res.discount) {
        setDiscount(res.discount, res.discountAmount);
        setPromoFeedback({ success: true, message: res.message });
      } else {
        setPromoFeedback({ success: false, message: res.message });
      }
    } catch {
      setPromoFeedback({ success: false, message: 'Error validando el cupón' });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(null);
    setPromoFeedback(null);
    setPromoCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                Tu Carrito
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px]">
                  Elegí tus platos favoritos del catálogo para comenzar tu pedido.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="py-4 first:pt-0 flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                          {item.product.name}
                        </h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          ${item.product.price.toLocaleString('es-AR')} c/u
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-orange-600 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex flex-col gap-3">
              {/* Promo Coupon Box */}
              <div>
                {discount ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Cupón {discount.code} aplicado (-${discountAmount.toLocaleString('es-AR')})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 underline text-[11px]"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cupón de descuento (ej: TAKEO20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-zinc-900 dark:bg-zinc-800 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shrink-0"
                    >
                      {promoLoading ? '...' : 'Aplicar'}
                    </button>
                  </form>
                )}

                {promoFeedback && (
                  <p
                    className={`text-[11px] mt-1 flex items-center gap-1 ${
                      promoFeedback.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {promoFeedback.success ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ${subtotal.toLocaleString('es-AR')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Total estimado</span>
                  <span className="text-base text-orange-600 dark:text-orange-400">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href={`/${businessSlug}/checkout`}
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-center"
              >
                <span>Continuar al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
