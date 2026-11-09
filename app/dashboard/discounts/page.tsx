'use client';

import React, { useState, useEffect } from 'react';
import { getDiscounts, createDiscount, updateDiscount } from '@/lib/data/store';
import { Discount, DiscountType } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Tag,
  Percent,
  DollarSign,
  X,
  Copy,
  Check,
  TicketPercent,
  ShoppingBag,
  Users,
} from 'lucide-react';

export default function DiscountsManagementPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'PERCENTAGE' as DiscountType,
    value: 10,
    min_order_amount: 0,
    is_active: true,
  });

  const loadData = async () => {
    try {
      const data = await getDiscounts();
      setDiscounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (d: Discount) => {
    try {
      await updateDiscount(d.id, { is_active: !d.is_active });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDiscount({
        code: formData.code.toUpperCase().trim(),
        title: formData.title,
        type: formData.type,
        value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount),
        is_active: formData.is_active,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-3xl bg-white/75 dark:bg-zinc-900/65 border border-zinc-200/70 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-32 h-7" />
              <Skeleton className="w-full h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-8">
      {/* Ambient Orange Background Glows */}
      <div className="pointer-events-none fixed top-24 right-12 w-96 h-96 rounded-full bg-orange-500/8 dark:bg-orange-500/12 blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-12 left-1/3 w-80 h-80 rounded-full bg-amber-500/6 dark:bg-orange-600/8 blur-3xl -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Cupones y Descuentos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Creá promociones para fidelizar clientes e incentivar más pedidos.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData({
              code: '',
              title: '',
              type: 'PERCENTAGE',
              value: 15,
              min_order_amount: 4000,
              is_active: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </Button>
      </div>

      {/* Grid of Modern Glassmorphic Discount Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((d) => {
          const isCopied = copiedId === d.id;
          return (
            <div
              key={d.id}
              className={`group relative overflow-hidden p-5 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border transition-colors flex flex-col justify-between gap-4 shadow-xs ${
                d.is_active
                  ? 'border-zinc-200/70 dark:border-zinc-800/80 hover:border-orange-500/40'
                  : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-65'
              }`}
            >
              {/* Subtle Ambient Corner Glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Top Row: Code Pill + Active Toggle */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <TicketPercent className="w-5 h-5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(d.id, d.code)}
                    title="Copiar código"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-orange-500/10 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500/40 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm text-zinc-900 dark:text-white tracking-wider">
                      {d.code}
                    </span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(d)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer shrink-0 ${
                    d.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {d.is_active ? 'Activo' : 'Pausado'}
                </button>
              </div>

              {/* Middle: Discount Value & Title */}
              <div className="space-y-1 relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                    {d.type === 'PERCENTAGE'
                      ? `${d.value}% OFF`
                      : `$${d.value.toLocaleString('es-AR')} OFF`}
                  </span>
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">
                  {d.title}
                </h4>
              </div>

              {/* Bottom Metadata Row */}
              <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-800/70 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 relative z-10">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  {d.min_order_amount > 0
                    ? `Mín. $${d.min_order_amount.toLocaleString('es-AR')}`
                    : 'Sin mínimo'}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  <Users className="w-3 h-3 text-orange-500" />
                  {d.usage_count} {d.usage_count === 1 ? 'uso' : 'usos'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                  Nuevo Cupón de Descuento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <Label htmlFor="disc-code" className="mb-1 block font-bold text-xs">
                  Código del Cupón *
                </Label>
                <Input
                  id="disc-code"
                  type="text"
                  required
                  placeholder="Ej: BIENVENIDA25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase font-mono h-9.5 text-xs rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="disc-title" className="mb-1 block font-bold text-xs">
                  Título descriptivo *
                </Label>
                <Input
                  id="disc-title"
                  type="text"
                  required
                  placeholder="Ej: 25% de descuento por apertura"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label htmlFor="disc-type" className="mb-1 block font-bold text-xs">
                    Tipo de beneficio
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) =>
                      setFormData({ ...formData, type: val as DiscountType })
                    }
                  >
                    <SelectTrigger id="disc-type" className="w-full h-9.5 text-xs rounded-xl">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE" className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-orange-500" />
                          <span>Porcentaje (%)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="FIXED" className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                          <span>Monto Fijo ($)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="disc-val" className="mb-1 block font-bold text-xs">
                    Valor {formData.type === 'PERCENTAGE' ? '(%)' : '($)'} *
                  </Label>
                  <Input
                    id="disc-val"
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="h-9.5 text-xs rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="disc-min" className="mb-1 block font-bold text-xs">
                  Monto Mínimo de Pedido ($)
                </Label>
                <Input
                  id="disc-min"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: Number(e.target.value) })
                  }
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 rounded-xl shadow-md shadow-orange-600/20 text-xs h-9"
                >
                  Crear Cupón
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
