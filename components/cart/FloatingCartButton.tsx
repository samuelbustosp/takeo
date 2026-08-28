'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function FloatingCartButton() {
  const { totalItemsCount, total, setIsCartOpen } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-5 inset-x-4 z-40 sm:hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-xs font-black">
            {totalItemsCount}
          </div>
          <span className="text-sm font-semibold">Ver Carrito</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold">
            ${total.toLocaleString('es-AR')}
          </span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
