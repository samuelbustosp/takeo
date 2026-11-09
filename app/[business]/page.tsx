'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { CategoryTabs } from '@/components/ui/CategoryTabs';
import { ProductCard } from '@/components/ui/ProductCard';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { Skeleton } from '@/components/ui/skeleton';
import { getBusiness, getCategories, getProducts } from '@/lib/data/store';
import { Business, Category, Product } from '@/types';
import {
  Search,
  MapPin,
  Clock,
  Bike,
  Sparkles,
  Phone,
  Store,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function BusinessCatalogPage() {
  const params = useParams();
  const businessSlug = (params?.business as string) || 'takeo-express';

  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productLayout, setProductLayout] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBusiness(businessSlug);
        setBusiness(b);
        if (b) {
          const [cats, prods] = await Promise.all([
            getCategories(b.id),
            getProducts(b.id),
          ]);
          setCategories(cats);
          setProducts(prods);
        }
      } catch (err) {
        console.error('Error loading catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessSlug]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
      const matchesSearch = searchQuery.trim()
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
        {/* Top bar placeholder */}
        <div className="h-16 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-28 h-5" />
          </div>
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>

        {/* Banner skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <Skeleton className="h-44 sm:h-56 w-full rounded-3xl" />

          {/* Categories pills skeleton */}
          <div className="flex items-center gap-2 overflow-x-hidden pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-xl shrink-0" />
            ))}
          </div>

          {/* Product cards grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex gap-4"
              >
                <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Negocio no encontrado</h1>
        <p className="text-zinc-500 mt-2">El local ingresado no existe en TAKEO.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0d0e12] flex flex-col">
      <Navbar business={business} />

      {/* Hero / Banner Header */}
      <section className="relative bg-zinc-900 text-white overflow-hidden">
        {/* Banner image background with overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={business.banner_url}
            alt={business.name}
            className="w-full h-full object-cover blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-zinc-800 shrink-0">
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Business Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {business.name}
                </h1>
                {business.is_open ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Abierto ahora
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full">
                    Cerrado
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl line-clamp-2">
                {business.description}
              </p>

              {/* Delivery & Time Pills */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs text-zinc-300">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    Delivery: {business.estimated_delivery_min}-{business.estimated_delivery_max} min (${business.delivery_fee.toLocaleString('es-AR')})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    Retiro: {business.estimated_pickup_min}-{business.estimated_pickup_max} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full pb-28 sm:pb-12">
        {/* Search & Categories Bar */}
        <div className="sticky top-16 z-30 bg-[#faf9f6]/95 dark:bg-[#0d0e12]/95 backdrop-blur-md py-3 space-y-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Grid / List View Switcher (PedidosYa style) */}
            <div
              className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shrink-0 shadow-2xs"
              role="group"
              aria-label="Cambiar vista de productos"
            >
              <button
                type="button"
                onClick={() => setProductLayout('grid')}
                title="Vista en cuadrícula"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  productLayout === 'grid'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grilla</span>
              </button>
              <button
                type="button"
                onClick={() => setProductLayout('list')}
                title="Vista en lista"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  productLayout === 'list'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>

          {/* Categories Tab Bar */}
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid or List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400 mb-3">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              No encontramos productos
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Prueba con otra palabra clave o selecciona otra categoría.
            </p>
          </div>
        ) : (
          <div
            className={
              productLayout === 'list'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mt-6'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} layout={productLayout} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer & Mobile Floating Button */}
      <CartDrawer businessSlug={business.slug} businessId={business.id} />
      <FloatingCartButton />
    </div>
  );
}
