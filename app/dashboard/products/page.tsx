'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '@/lib/data/store';
import { compressAndUploadImage } from '@/lib/utils/image-compression';
import { Product, Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ICON_MAP } from '@/components/ui/CategoryTabs';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ImagePlus,
  FolderOpen,
  DollarSign,
  AlignLeft,
  Loader2,
  Utensils,
  Upload,
} from 'lucide-react';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const processFile = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setFormError(null);
    try {
      const { url, error } = await compressAndUploadImage(file, 'public-assets', 'products');
      if (url) {
        setFormData((prev) => ({ ...prev, image_url: url }));
      } else {
        setFormError('Error al subir la imagen: ' + (error || 'formato no soportado'));
      }
    } catch (e: any) {
      setFormError('Error al procesar la imagen: ' + (e?.message || 'intenta nuevamente'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
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

    if (!formData.name.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      setSaving(false);
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Por favor ingresá un precio válido mayor a 0.');
      setSaving(false);
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          category_id: formData.category_id || undefined,
          price: Number(formData.price),
          compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
          description: formData.description.trim(),
          image_url: formData.image_url,
          is_available: formData.is_available,
          is_featured: formData.is_featured,
        });
      } else {
        await createProduct({
          name: formData.name.trim(),
          category_id: formData.category_id || undefined,
          price: Number(formData.price),
          compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
          description: formData.description.trim(),
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
    <div className="relative space-y-6">
      {/* Ambient Orange Glow */}
      <div className="pointer-events-none fixed top-24 right-12 w-96 h-96 rounded-full bg-orange-500/8 dark:bg-orange-500/10 blur-3xl -z-10" />

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
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Filters (Using Shadcn Select) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 h-10 rounded-xl"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {categories.map((c) => {
                const CatIcon = (c.icon && ICON_MAP[c.icon]) || Utensils;
                return (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <CatIcon className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/75 dark:bg-zinc-900/65 backdrop-blur-xl rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Producto</th>
                <th className="px-5 py-3.5">Categoría</th>
                <th className="px-5 py-3.5">Precio</th>
                <th className="px-5 py-3.5">Disponibilidad</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/70">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                    <p className="font-semibold text-sm">No se encontraron productos</p>
                    <p className="text-xs mt-1">Probá ajustando la búsqueda o agregá uno nuevo.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.category_id);
                  const CatIcon = (cat?.icon && ICON_MAP[cat.icon]) || Utensils;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-orange-500/[0.04] dark:hover:bg-orange-500/[0.06] transition-colors"
                    >
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-zinc-900 dark:text-white">
                              {prod.name}
                            </p>
                            {prod.is_featured && (
                              <span className="text-[9px] bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider inline-flex items-center gap-1 border border-orange-200 dark:border-orange-900/60">
                                <Sparkles className="w-2.5 h-2.5" />
                                Destacado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 max-w-xs mt-0.5">
                            {prod.description || 'Sin descripción'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
                          <CatIcon className="w-3.5 h-3.5 text-orange-500" />
                          <span>{cat?.name || 'General'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          ${prod.price.toLocaleString('es-AR')}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleAvailability(prod)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                            prod.is_available
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                          }`}
                        >
                          {prod.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{prod.is_available ? 'Disponible' : 'Agotado'}</span>
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 rounded-xl text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                          title="Eliminar producto"
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

      {/* Compact Mobile-First Create / Edit Modal */}
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
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* Row 1: Product Name */}
              <div>
                <Label htmlFor="prod-name" className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs">
                  Nombre del plato *
                </Label>
                <div className="relative">
                  <Input
                    id="prod-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Hamburguesa Doble Cheddar"
                    className="pl-8 h-9.5 text-xs rounded-xl"
                  />
                  <Utensils className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Row 2: Category (Shadcn Select) & Price side-by-side even on mobile */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label htmlFor="prod-cat" className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-zinc-400" />
                    <span>Categoría</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                  >
                    <SelectTrigger id="prod-cat" className="w-full h-9.5 text-xs rounded-xl px-2.5">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => {
                        const CatIcon = (c.icon && ICON_MAP[c.icon]) || Utensils;
                        return (
                          <SelectItem key={c.id} value={c.id} className="text-xs py-2">
                            <div className="flex items-center gap-2">
                              <CatIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prod-price" className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-zinc-400" />
                    <span>Precio ($) *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="prod-price"
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="2500"
                      className="pl-7 h-9.5 text-xs rounded-xl font-bold"
                    />
                    <span className="text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs">$</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <Label htmlFor="prod-desc" className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1">
                  <AlignLeft className="w-3 h-3 text-zinc-400" />
                  <span>Descripción</span>
                </Label>
                <Textarea
                  id="prod-desc"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredientes, detalles..."
                  className="rounded-xl resize-none text-xs py-2 min-h-[52px]"
                />
              </div>

              {/* Row 4: Compact Horizontal Image Uploader */}
              <div>
                <Label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-zinc-400" />
                  <span>Imagen del producto</span>
                </Label>

                <input
                  ref={fileInputRef}
                  id="prod-image-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />

                <div
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-orange-500/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {formData.image_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImagePlus className="w-4 h-4" />
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {uploadingImage
                          ? 'Subiendo foto...'
                          : formData.image_url
                          ? 'Cambiar foto'
                          : 'Subir foto del plato'}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        JPG, PNG o WEBP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2.5 text-[11px] rounded-lg gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Elegir</span>
                    </Button>
                    {formData.image_url && (
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Quitar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 5: Slim 2-Column Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 cursor-pointer">
                  <Checkbox
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: !!checked })}
                  />
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1 truncate">
                    <Eye className="w-3 h-3 text-emerald-500 shrink-0" />
                    Disponible
                  </span>
                </label>

                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 cursor-pointer">
                  <Checkbox
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                  />
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1 truncate">
                    <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                    Destacar
                  </span>
                </label>
              </div>

              {/* Compact Footer Actions */}
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
                  disabled={saving || uploadingImage}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 rounded-xl shadow-md shadow-orange-600/20 text-xs h-9"
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
