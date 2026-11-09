'use client';

import React, { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/data/store';
import { Category } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Flame,
  UtensilsCrossed,
  Sandwich,
  CupSoda,
  IceCream,
  Utensils,
  Pizza,
  Coffee,
  Tag,
  Hash,
  Eye,
  EyeOff,
  FolderOpen,
  AlignLeft,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const CATEGORY_ICONS = [
  { id: 'Flame', label: 'Promos', icon: Flame },
  { id: 'Utensils', label: 'Platos', icon: Utensils },
  { id: 'Sandwich', label: 'Burgers', icon: Sandwich },
  { id: 'CupSoda', label: 'Bebidas', icon: CupSoda },
  { id: 'Pizza', label: 'Pizzas', icon: Pizza },
  { id: 'IceCream', label: 'Postres', icon: IceCream },
];

export const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Sandwich,
  CupSoda,
  Pizza,
  Coffee,
  Flame,
  IceCream,
  UtensilsCrossed,
};

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
    icon: 'Flame',
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

  const applyNewOrder = async (reordered: Category[]) => {
    const withUpdatedOrder = reordered.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1,
    }));
    setCategories(withUpdatedOrder);

    try {
      await reorderCategories(
        withUpdatedOrder.map((c) => ({ id: c.id, display_order: c.display_order }))
      );
    } catch (e) {
      console.error('Error reordering categories:', e);
      loadData();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const srcIdx = result.source.index;
    const destIdx = result.destination.index;
    if (srcIdx === destIdx) return;

    const updated = Array.from(categories);
    const [moved] = updated.splice(srcIdx, 1);
    updated.splice(destIdx, 0, moved);
    applyNewOrder(updated);
  };

  const handleMoveIndex = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const updated = Array.from(categories);
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    applyNewOrder(updated);
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
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-20 rounded-2xl" />
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
            Arrastrá las tarjetas o usá las flechas para cambiar el orden en el catálogo.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      {/* Draggable List of Categories */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {categories.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border border-zinc-200/70 dark:border-zinc-800/80 text-center space-y-2">
                  <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                    No hay categorías creadas
                  </p>
                  <p className="text-xs text-zinc-400">
                    Creá tu primera sección para organizar los productos de tu carta.
                  </p>
                </div>
              ) : (
                categories.map((cat, index) => {
                  const IconComp =
                    (cat.icon && CATEGORY_ICON_MAP[cat.icon]) || Utensils;

                  return (
                    <Draggable key={cat.id} draggableId={cat.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group relative rounded-2xl bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl border transition-colors overflow-hidden ${
                            snapshot.isDragging
                              ? 'border-orange-500 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-500/30 z-30'
                              : 'border-zinc-200/70 dark:border-zinc-800/80 hover:border-orange-500/40 shadow-xs'
                          }`}
                        >
                          {/* Subtle Left Orange Accent Bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500 opacity-75 group-hover:opacity-100 transition-opacity" />

                          <div className="p-3.5 sm:p-4 pl-4 sm:pl-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left: Drag Handle + Order Badge + Icon + Title */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                {...provided.dragHandleProps}
                                title="Arrastrar para reordenar"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
                                #{index + 1}
                              </span>

                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-2xs">
                                <IconComp className="w-5 h-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                                    {cat.name}
                                  </h3>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${
                                      cat.is_active
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                    }`}
                                  >
                                    {cat.is_active ? (
                                      <Eye className="w-2.5 h-2.5" />
                                    ) : (
                                      <EyeOff className="w-2.5 h-2.5" />
                                    )}
                                    <span>{cat.is_active ? 'Activa' : 'Oculta'}</span>
                                  </span>
                                </div>

                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                  {cat.description || `Sección /${cat.slug}`}
                                </p>
                              </div>
                            </div>

                            {/* Right: Up/Down + Edit + Delete */}
                            <div className="flex items-center justify-end gap-1.5 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-200/50 dark:border-zinc-800/60">
                              <div className="flex items-center gap-1 mr-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveIndex(index, 'up')}
                                  title="Subir posición"
                                  className="w-8 h-8 rounded-lg border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === categories.length - 1}
                                  onClick={() => handleMoveIndex(index, 'down')}
                                  title="Bajar posición"
                                  className="w-8 h-8 rounded-lg border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(cat)}
                                className="h-8 px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 rounded-lg flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cat.id)}
                                className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Compact Mobile-First Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Compact Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <FolderOpen className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                  {editingCat ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* 1-Row Icon Picker (6 options including Flame / Fueguito) */}
              <div>
                <Label className="mb-1.5 block font-bold text-zinc-700 dark:text-zinc-300 text-xs">
                  Icono de la categoría
                </Label>
                <div className="grid grid-cols-6 gap-1.5">
                  {CATEGORY_ICONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-600/25'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-500/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold leading-none truncate w-full text-center">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Order in 1 row */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="col-span-3">
                  <Label
                    htmlFor="cat-name"
                    className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs"
                  >
                    Nombre *
                  </Label>
                  <div className="relative">
                    <Input
                      id="cat-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Promos, Hamburguesas..."
                      className="pl-8 h-9.5 text-xs rounded-xl"
                    />
                    <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="col-span-1">
                  <Label
                    htmlFor="cat-order"
                    className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs"
                  >
                    Orden
                  </Label>
                  <div className="relative">
                    <Input
                      id="cat-order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: Number(e.target.value),
                        })
                      }
                      className="pl-6 pr-2 h-9.5 text-xs rounded-xl text-center"
                    />
                    <Hash className="w-3 h-3 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="cat-desc"
                  className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Descripción <span className="font-normal text-zinc-400">(opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cat-desc"
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Breve detalle de la sección..."
                    className="pl-8 h-9.5 text-xs rounded-xl"
                  />
                  <AlignLeft className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Compact Visibility Toggle */}
              <label className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 cursor-pointer">
                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  Mostrar categoría en la tienda
                </span>
                <Checkbox
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: !!checked })
                  }
                />
              </label>

              {/* Actions */}
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
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 rounded-xl shadow-md shadow-orange-600/20 text-xs h-9"
                >
                  {saving ? 'Guardando...' : editingCat ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
