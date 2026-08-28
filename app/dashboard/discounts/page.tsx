'use client';

import React, { useState, useEffect } from 'react';
import { getDiscounts, createDiscount, updateDiscount } from '@/lib/data/store';
import { Discount, DiscountType } from '@/types';
import {
  Plus,
  Tag,
  Percent,
  DollarSign,
  CheckCircle2,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
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

        <button
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
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cupón</span>
        </button>
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
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Código del Cupón *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BIENVENIDA25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full uppercase font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Título descriptivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 25% de descuento por apertura"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Valor {formData.type === 'PERCENTAGE' ? '(%)' : '($)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Monto Mínimo de Pedido ($)
                </label>
                <input
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
