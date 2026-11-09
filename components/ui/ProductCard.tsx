'use client';

import React from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Flame, ImageIcon } from 'lucide-react';

interface Props {
  product: Product;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  // PedidosYa-style horizontal list card
  if (layout === 'list') {
    return (
      <div className="group relative flex items-stretch justify-between gap-3.5 sm:gap-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-orange-500/40 transition-colors">
        {/* Left column: Title, Description, Price & Action */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {product.is_featured && (
                <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Destacado
                </span>
              )}
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                {product.name}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-zinc-400 line-through">
                  ${product.compare_at_price.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {product.is_available ? (
              quantity > 0 ? (
                <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-xl p-1">
                  <button
                    type="button"
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
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label="Sumar uno"
                    className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addItem(product, 1)}
                  className="flex items-center gap-1 bg-orange-500/10 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-500/25 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              )
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Right column: Square Image Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 self-center border border-zinc-200/60 dark:border-zinc-800">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${
                product.is_available ? 'group-hover:scale-105' : 'grayscale opacity-60'
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400 gap-1">
              <ImageIcon className="w-5 h-5 opacity-50" />
              <span className="text-[10px]">Sin foto</span>
            </div>
          )}

          {!product.is_available && (
            <div className="absolute inset-0 bg-zinc-950/65 backdrop-blur-2xs flex items-center justify-center">
              <span className="bg-zinc-900/95 text-zinc-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-700 shadow-sm">
                Agotado
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard vertical grid card
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-orange-500/30 transition-colors">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3.5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              product.is_available ? 'group-hover:scale-105' : 'grayscale opacity-60'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            Sin foto
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-2.5 left-2.5 bg-orange-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs inline-flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>Destacado</span>
          </div>
        )}

        {/* Sold out overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-zinc-950/65 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-zinc-900/95 text-zinc-100 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-zinc-700 shadow-sm">
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
                  type="button"
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
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  aria-label="Sumar uno"
                  className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product, 1)}
                className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-800 dark:text-zinc-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            )
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Agotado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
