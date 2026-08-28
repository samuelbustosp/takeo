'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Check } from 'lucide-react';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-orange-500/30 transition-all">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3.5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            Sin foto
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-2.5 left-2.5 bg-orange-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            Destacado
          </div>
        )}

        {/* Sold out overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-zinc-900 text-zinc-200 text-xs font-bold px-3 py-1 rounded-full border border-zinc-700">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-zinc-900 dark:text-white">
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-zinc-400 line-through">
                  ${product.compare_at_price.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {product.is_available ? (
            quantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label="Restar uno"
                  className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-orange-600 hover:text-white shadow-xs transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-orange-600 dark:text-orange-400">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  aria-label="Sumar uno"
                  className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(product, 1)}
                className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-800 dark:text-zinc-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            )
          ) : (
            <span className="text-xs font-medium text-zinc-400">No disponible</span>
          )}
        </div>
      </div>
    </div>
  );
}
