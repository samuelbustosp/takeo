'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/data/store';
import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Flame,
  UtensilsCrossed,
  Sandwich,
  CupSoda,
  IceCream,
  Utensils,
  Layers,
} from 'lucide-react';

const ICONS = ['Flame', 'UtensilsCrossed', 'Sandwich', 'CupSoda', 'IceCream', 'Utensils'];

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Utensils',
    display_order: 1,
    is_active: true,
  });

  const loadData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setFormError(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Flame',
      display_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setFormError(null);
    setFormData({
      name: c.name,
      description: c.description || '',
      icon: c.icon || 'Utensils',
      display_order: c.display_order,
      is_active: c.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
      } else {
        await createCategory(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta categoría?')) {
      await deleteCategory(id);
      loadData();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-28 h-5" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
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
            Categorías del Menú
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Organiza las secciones y orden de visualización de tus productos.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Orden: #{cat.display_order} • /{cat.slug}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  cat.is_active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                }`}
              >
                {cat.is_active ? 'Activa' : 'Oculta'}
              </span>
            </div>

            {cat.description && (
              <p className="text-xs text-zinc-500 line-clamp-2">{cat.description}</p>
            )}

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenEdit(cat)}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-orange-600"
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(cat.id)}
                className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Eliminar
              </Button>
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
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                {editingCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <Label htmlFor="cat-name" className="mb-1 block">Nombre *</Label>
                <Input
                  id="cat-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Empanadas Especiales"
                />
              </div>

              <div>
                <Label htmlFor="cat-desc" className="mb-1 block">Descripción</Label>
                <Input
                  id="cat-desc"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve detalle sobre la sección"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cat-order" className="mb-1 block">Orden</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="cat-icon" className="mb-1 block">Icono</Label>
                  <Select
                    id="cat-icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Checkbox
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                  />
                  <span>Mostrar en el catálogo</span>
                </label>
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
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
