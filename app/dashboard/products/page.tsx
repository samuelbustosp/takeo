'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/data/store';
import { compressAndUploadImage } from '@/lib/utils/image-compression';
import { Product, Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Tag,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    description: '',
    image_url: '',
    is_available: true,
    is_featured: false,
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const { url, error } = await compressAndUploadImage(file, 'public-assets', 'products');
    setUploadingImage(false);

    if (url) {
      setFormData({ ...formData, image_url: url });
    } else {
      alert('Error uploading image: ' + error);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormError(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      compare_at_price: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      is_available: true,
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormError(null);
    setFormData({
      name: p.name,
      category_id: p.category_id || '',
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      description: p.description || '',
      image_url: p.image_url || '',
      is_available: p.is_available,
      is_featured: p.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_available: !product.is_available });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          category_id: formData.category_id || undefined,
          price: Number(formData.price),
          compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
          description: formData.description,
          image_url: formData.image_url,
          is_available: formData.is_available,
          is_featured: formData.is_featured,
        });
      } else {
        await createProduct({
          name: formData.name,
          category_id: formData.category_id || undefined,
          price: Number(formData.price),
          compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
          description: formData.description,
          image_url: formData.image_url,
          is_available: formData.is_available,
          is_featured: formData.is_featured,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const matchSearch = searchQuery.trim()
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-72 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="w-48 h-10 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-900 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="w-36 h-4" />
                  <Skeleton className="w-24 h-3" />
                </div>
              </div>
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-16 h-5" />
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
            Catálogo de Productos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Administra los platos, precios, fotos y disponibilidad en tiempo real.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 text-xs">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.category_id);
                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-zinc-900 dark:text-white">
                              {prod.name}
                            </p>
                            {prod.is_featured && (
                              <span className="text-[9px] bg-orange-100 dark:bg-orange-950 text-orange-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                Destacado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 max-w-xs">
                            {prod.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                        {cat?.name || 'General'}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-white">
                        ${prod.price.toLocaleString('es-AR')}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleAvailability(prod)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                            prod.is_available
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                          }`}
                        >
                          {prod.is_available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{prod.is_available ? 'Disponible' : 'Agotado'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-orange-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <Label htmlFor="prod-name" className="mb-1 block">
                  Nombre del plato/producto *
                </Label>
                <Input
                  id="prod-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Empanada de Carne Cortada a Cuchillo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prod-cat" className="mb-1 block">
                    Categoría
                  </Label>
                  <Select
                    id="prod-cat"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prod-price" className="mb-1 block">
                    Precio ($) *
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="prod-desc" className="mb-1 block">
                  Descripción
                </Label>
                <Textarea
                  id="prod-desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredientes, elaboración, detalles..."
                />
              </div>

              <div>
                <Label htmlFor="prod-image" className="mb-1 block">
                  Imagen del producto
                </Label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800" />
                  )}
                  <div className="flex-1">
                    <Input
                      id="prod-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <p className="text-xs text-orange-500 mt-1 font-medium">Subiendo y comprimiendo imagen...</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Checkbox
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: !!checked })}
                  />
                  <span>Disponible para pedir</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Checkbox
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                  />
                  <span>Destacar en portada</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
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
                  {saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Producto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
