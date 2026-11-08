'use client';

import React, { useState, useEffect } from 'react';
import { getDiscounts, createDiscount, updateDiscount } from '@/lib/data/store';
import { Discount, DiscountType } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Tag,
  Percent,
  DollarSign,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export default function DiscountsManagementPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Cupones y Descuentos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Crea promociones para fidelizar clientes y aumentar tus ventas.
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
          className="flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </Button>
      </div>

      {/* Grid of Discounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {discounts.map((d) => (
          <div
            key={d.id}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between gap-4 relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-black">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono font-black text-base text-zinc-900 dark:text-white tracking-wide">
                    {d.code}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleToggle(d)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  d.is_active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800'
                }`}
              >
                {d.is_active ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{d.title}</h4>
              <div className="mt-2 text-2xl font-black text-orange-600 dark:text-orange-400">
                {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `$${d.value.toLocaleString('es-AR')} OFF`}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
              <span>
                {d.min_order_amount > 0
                  ? `Mínimo: $${d.min_order_amount.toLocaleString('es-AR')}`
                  : 'Sin monto mínimo'}
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {d.usage_count} usos
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">Nuevo Cupón</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <Label htmlFor="disc-code" className="mb-1 block">
                  Código del Cupón *
                </Label>
                <Input
                  id="disc-code"
                  type="text"
                  required
                  placeholder="Ej: BIENVENIDA25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase font-mono"
                />
              </div>

              <div>
                <Label htmlFor="disc-title" className="mb-1 block">Título descriptivo</Label>
                <Input
                  id="disc-title"
                  type="text"
                  required
                  placeholder="Ej: 25% de descuento por apertura"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="disc-type" className="mb-1 block">Tipo</Label>
                  <Select
                    id="disc-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo ($)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="disc-val" className="mb-1 block">
                    Valor {formData.type === 'PERCENTAGE' ? '(%)' : '($)'} *
                  </Label>
                  <Input
                    id="disc-val"
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="disc-min" className="mb-1 block">
                  Monto Mínimo de Pedido ($)
                </Label>
                <Input
                  id="disc-min"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
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
