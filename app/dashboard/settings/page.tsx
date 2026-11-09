'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getBusiness,
  updateBusiness,
  createBusiness,
  getSettings,
  updateSettings,
  DEFAULT_BUSINESS_SCHEDULE,
  isScheduleCurrentlyOpen,
} from '@/lib/data/store';
import { compressAndUploadImage } from '@/lib/utils/image-compression';
import { sendWhatsAppMessage } from '@/lib/whatsapp/service';
import { Business, BusinessSettings, BusinessScheduleConfig, DaySchedule } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Save,
  MessageCircle,
  Building2,
  Bike,
  CheckCircle2,
  AlertCircle,
  Send,
  Store,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const emptyBusinessTemplate: Business = {
  id: '',
  name: '',
  slug: '',
  tagline: 'Pedí. Listo.',
  description: '',
  logo_url: '',
  banner_url: '',
  phone_whatsapp: '',
  address: '',
  city: 'Buenos Aires',
  currency: 'ARS',
  currency_symbol: '$',
  is_open: true,
  estimated_delivery_min: 30,
  estimated_delivery_max: 45,
  estimated_pickup_min: 15,
  estimated_pickup_max: 25,
  delivery_fee: 1200,
  min_order_amount: 0,
  allows_delivery: true,
  allows_pickup: true,
  payment_methods: ['CASH', 'TRANSFER'],
  instagram: '',
  opening_hours: DEFAULT_BUSINESS_SCHEDULE,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const emptySettingsTemplate: BusinessSettings = {
  id: '',
  business_id: '',
  whatsapp_notify_on_new_order: true,
  whatsapp_notify_customer_confirmed: true,
  whatsapp_notify_customer_ready: true,
  whatsapp_notify_customer_out_for_delivery: true,
  whatsapp_template_confirmed: '¡Hola {{customer_name}}! ✅ Tu pedido #{{order_number}} ha sido confirmado por {{business_name}}.',
  whatsapp_template_ready: '¡Hola {{customer_name}}! 🟢 Tu pedido #{{order_number}} está listo para retirar en {{business_address}}.',
  whatsapp_template_out_delivery: '¡Hola {{customer_name}}! 🛵 Tu pedido #{{order_number}} va en camino a tu dirección.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp test dispatch
  const [testPhone, setTestPhone] = useState('+5491155667788');
  const [testStatus, setTestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [b, s] = await Promise.all([getBusiness(), getSettings()]);
        const bData = b || { ...emptyBusinessTemplate };
        const sData = s || { ...emptySettingsTemplate, business_id: bData.id || '' };
        setBusiness(bData);
        setSettings(sData);
        setOriginalSnapshot(JSON.stringify({ business: bData, settings: sData }));
      } catch (e) {
        console.error(e);
        const bData = { ...emptyBusinessTemplate };
        const sData = { ...emptySettingsTemplate };
        setBusiness(bData);
        setSettings(sData);
        setOriginalSnapshot(JSON.stringify({ business: bData, settings: sData }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute dirty state (button enabled only when there are changes)
  const isDirty = useMemo(() => {
    if (!business || !settings || !originalSnapshot) return false;
    const current = JSON.stringify({ business, settings });
    return current !== originalSnapshot;
  }, [business, settings, originalSnapshot]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    setUploadingLogo(true);
    setErrorMsg('');
    try {
      const { url, error } = await compressAndUploadImage(file, 'public-assets', 'businesses/logo');
      if (error) {
        setErrorMsg(`Error al subir logo: ${error}`);
      } else if (url) {
        setBusiness({ ...business, logo_url: url });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar la imagen');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    setUploadingBanner(true);
    setErrorMsg('');
    try {
      const { url, error } = await compressAndUploadImage(file, 'public-assets', 'businesses/banner');
      if (error) {
        setErrorMsg(`Error al subir banner: ${error}`);
      } else if (url) {
        setBusiness({ ...business, banner_url: url });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar la imagen');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !isDirty) return;

    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      let activeBusiness = business;

      if (!business.id) {
        const cleanSlug = business.slug?.trim() || business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const created = await createBusiness({
          ...business,
          slug: cleanSlug || `business-${Date.now()}`,
        });
        if (!created) throw new Error('No se pudo crear el negocio');
        activeBusiness = created;
        setBusiness(created);
      } else {
        const updated = await updateBusiness(business);
        if (updated) setBusiness(updated);
      }

      if (settings && activeBusiness.id) {
        const updatedSettings = await updateSettings({
          ...settings,
          business_id: activeBusiness.id,
        });
        if (updatedSettings) setSettings(updatedSettings);
      }

      setOriginalSnapshot(JSON.stringify({ business: activeBusiness, settings }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!business || !settings || !testPhone.trim() || !business.id) return;
    setTesting(true);
    setTestStatus(null);

    try {
      const res = await sendWhatsAppMessage({
        business,
        settings,
        order: {
          id: 'test_order',
          order_number: 9999,
          business_id: business.id,
          customer_name: 'Cliente de Prueba',
          customer_phone: testPhone,
          status: 'READY',
          delivery_type: 'PICKUP',
          delivery_fee: 0,
          payment_method: 'CASH',
          payment_status: 'PENDING',
          subtotal: 10000,
          discount_total: 0,
          total: 10000,
          items: [],
          whatsapp_business_sent: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        eventType: 'READY',
        target: 'CUSTOMER',
      });

      if (res.success) {
        setTestStatus({
          success: true,
          msg: `¡Mensaje despachado con éxito! ID: ${res.messageId}`,
        });
      } else {
        setTestStatus({
          success: false,
          msg: res.error || 'Error enviando mensaje de prueba',
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        msg: err?.message || 'Error en el envío',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 pb-14 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <div className="space-y-2">
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-64 h-8" />
          </div>
          <Skeleton className="w-44 h-10 rounded-xl" />
        </div>
        <Skeleton className="w-full max-w-xl h-11 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!business || !settings) return null;

  const isNewBusiness = !business.id;
  const scheduleConfig: BusinessScheduleConfig = business.opening_hours || DEFAULT_BUSINESS_SCHEDULE;
  const autoEvaluatedOpen = isScheduleCurrentlyOpen(scheduleConfig);

  const handleToggleAutoSchedule = (auto: boolean) => {
    const nextSchedule: BusinessScheduleConfig = {
      ...scheduleConfig,
      autoSchedule: auto,
    };
    setBusiness({
      ...business,
      opening_hours: nextSchedule,
      is_open: auto ? isScheduleCurrentlyOpen(nextSchedule) : business.is_open,
    });
  };

  const handleUpdateDaySchedule = (dayOfWeek: number, patch: Partial<DaySchedule>) => {
    const nextDays = scheduleConfig.days.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d
    );
    const nextSchedule: BusinessScheduleConfig = {
      ...scheduleConfig,
      days: nextDays,
    };
    setBusiness({
      ...business,
      opening_hours: nextSchedule,
      is_open: nextSchedule.autoSchedule ? isScheduleCurrentlyOpen(nextSchedule) : business.is_open,
    });
  };

  const handleApplyMondayToAll = () => {
    const monday = scheduleConfig.days.find((d) => d.dayOfWeek === 1) || scheduleConfig.days[0];
    if (!monday) return;
    const nextDays = scheduleConfig.days.map((d) => ({
      ...d,
      openTime: monday.openTime,
      closeTime: monday.closeTime,
    }));
    const nextSchedule: BusinessScheduleConfig = {
      ...scheduleConfig,
      days: nextDays,
    };
    setBusiness({
      ...business,
      opening_hours: nextSchedule,
      is_open: nextSchedule.autoSchedule ? isScheduleCurrentlyOpen(nextSchedule) : business.is_open,
    });
  };

  return (
    <div className="w-full space-y-6 pb-14">
      {/* Top Header Bar with Sticky Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Ajustes del Negocio & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Personalizá tu marca, banner, horarios de apertura, envíos y conexión a WhatsApp.
          </p>
        </div>

        {/* Global Save Button (Enabled only when changes are made) */}
        <div className="flex items-center gap-3 shrink-0">
          {isDirty && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Cambios pendientes
            </span>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`transition-all ${
              isDirty
                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 scale-[1.02]'
                : 'opacity-40 cursor-not-allowed bg-zinc-300 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-none'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </Button>
        </div>
      </div>

      {isNewBusiness && (
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 text-xs sm:text-sm flex items-start gap-3">
          <Store className="w-5 h-5 shrink-0 text-orange-600 mt-0.5" />
          <div>
            <div className="font-bold">Completá el perfil de tu negocio</div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
              Ingresá los datos a continuación y hacé clic en &ldquo;Guardar Cambios&rdquo; para activar tu catálogo digital.
            </p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">¡Configuración guardada correctamente!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="perfil" icon={<Building2 className="w-4 h-4" />}>
            Perfil & Marca
          </TabsTrigger>
          <TabsTrigger value="contacto" icon={<MapPin className="w-4 h-4" />}>
            Contacto & Ubicación
          </TabsTrigger>
          <TabsTrigger value="entregas" icon={<Bike className="w-4 h-4" />}>
            Envíos & Horarios
          </TabsTrigger>
          <TabsTrigger value="whatsapp" icon={<MessageCircle className="w-4 h-4" />}>
            WhatsApp Cloud API
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PERFIL & MARCA (Logo, Banner, Datos Principales) */}
        <TabsContent value="perfil" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  Identidad Visual & Estado
                </h3>
                <p className="text-xs text-zinc-500">
                  Imágenes de portada, foto de perfil y disponibilidad del local.
                </p>
              </div>

              {/* Open / Closed Switch */}
              <div className="flex flex-wrap items-center gap-3">
                {scheduleConfig.autoSchedule && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span>Horario Automático</span>
                  </span>
                )}
                <span className={`text-xs font-bold ${business.is_open ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  {business.is_open ? 'Local Abierto' : 'Local Cerrado'}
                </span>
                <Switch
                  checked={business.is_open}
                  onCheckedChange={(val) => {
                    // Switching manually turns off autoSchedule so manual override sticks
                    setBusiness({
                      ...business,
                      is_open: val,
                      opening_hours: {
                        ...scheduleConfig,
                        autoSchedule: false,
                      },
                    });
                  }}
                />
              </div>
            </div>

            {/* Banner & Logo Media Upload Section */}
            <div className="space-y-4">
              <Label>Banner de Portada del Menú</Label>
              <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 group">
                {business.banner_url ? (
                  <img
                    src={business.banner_url}
                    alt="Banner de portada"
                    className="w-full h-full object-cover transition-transform group-hover:scale-[1.01]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <ImageIcon className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-semibold">Sin imagen de portada</span>
                  </div>
                )}

                {/* Banner Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBanner}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={uploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingBanner ? 'Comprimiendo...' : 'Cambiar Banner'}</span>
                  </Button>

                  {business.banner_url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setBusiness({ ...business, banner_url: '' })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                Recomendado: 1200x400 px o proporción 3:1 (JPG o PNG optimizado automáticamente).
              </p>
            </div>

            {/* Logo / Profile Picture */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 shadow-sm shrink-0 group">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt="Logo del negocio"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl">
                    {business.name ? business.name.slice(0, 2).toUpperCase() : 'TK'}
                  </div>
                )}
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white"
                >
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Subiendo...' : 'Subir Foto de Perfil'}</span>
                  </Button>
                  {business.logo_url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setBusiness({ ...business, logo_url: '' })}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Logo cuadrado o isotipo del local (se mostrará en el carrito y cabecera del menú).
                </p>
              </div>
            </div>

            {/* General Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Nombre del Negocio *</Label>
                <Input
                  id="biz-name"
                  required
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  placeholder="Ej: Empanadas Don Carlos"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-slug">Enlace / Slug de tu Carta *</Label>
                <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 px-3.5 py-1 focus-within:ring-2 focus-within:ring-orange-500">
                  <span className="text-zinc-400 select-none text-xs font-mono">takeo.app/</span>
                  <input
                    id="biz-slug"
                    required
                    value={business.slug}
                    onChange={(e) =>
                      setBusiness({
                        ...business,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''),
                      })
                    }
                    className="w-full bg-transparent focus:outline-none text-sm font-semibold text-zinc-900 dark:text-zinc-100 px-1 py-1"
                    placeholder="don-carlos"
                  />
                  {business.slug && (
                    <a
                      href={`/${business.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-500 hover:text-orange-600 p-1"
                      title="Ver carta online"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-tagline">Slogan / Tagline</Label>
                <Input
                  id="biz-tagline"
                  value={business.tagline || ''}
                  onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                  placeholder="Pedí. Listo."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-instagram">Usuario de Instagram</Label>
                <Input
                  id="biz-instagram"
                  value={business.instagram || ''}
                  onChange={(e) => setBusiness({ ...business, instagram: e.target.value })}
                  placeholder="@tunegocio"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="biz-desc">Descripción del Local</Label>
                <Textarea
                  id="biz-desc"
                  rows={3}
                  value={business.description || ''}
                  onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                  placeholder="Especialistas en empanadas artesanales al horno de barro..."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CONTACTO & UBICACIÓN */}
        <TabsContent value="contacto" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                Canales de Atención & Ubicación
              </h3>
              <p className="text-xs text-zinc-500">
                Dónde está ubicado el local y en qué WhatsApp se reciben los pedidos directos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-phone">WhatsApp para Recepción de Pedidos *</Label>
                <Input
                  id="biz-phone"
                  type="tel"
                  required
                  value={business.phone_whatsapp}
                  onChange={(e) => setBusiness({ ...business, phone_whatsapp: e.target.value })}
                  placeholder="+54 9 11 5566-7788"
                />
                <span className="text-[11px] text-zinc-400 block">
                  Número principal donde entrará el detalle de cada comanda de cliente.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-city">Ciudad / Localidad *</Label>
                <Input
                  id="biz-city"
                  required
                  value={business.city || 'Buenos Aires'}
                  onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                  placeholder="Buenos Aires"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="biz-addr">Dirección Física del Local *</Label>
                <Input
                  id="biz-addr"
                  required
                  value={business.address}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  placeholder="Av. Corrientes 1234, Almagro"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: ENVÍOS & HORARIOS */}
        <TabsContent value="entregas" className="space-y-6">
          {/* Horarios y Días de Apertura */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                    Horarios y Días de Apertura
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Configurá tus días y franjas de atención para que el catálogo muestre automáticamente si el negocio está abierto o cerrado.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/70 px-3.5 py-2.5 rounded-2xl">
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Modo Automático
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    {scheduleConfig.autoSchedule
                      ? autoEvaluatedOpen
                        ? 'Abierto ahora por horario'
                        : 'Cerrado ahora por horario'
                      : 'Control manual activo'}
                  </span>
                </div>
                <Switch
                  checked={scheduleConfig.autoSchedule}
                  onCheckedChange={handleToggleAutoSchedule}
                />
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2.5 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    business.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  Estado actual en el catálogo:{' '}
                  <strong className={business.is_open ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                    {business.is_open ? 'Abierto ahora' : 'Cerrado'}
                  </strong>
                </span>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleApplyMondayToAll}
                className="text-xs h-8 rounded-xl border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Copiar horario del Lunes a toda la semana</span>
              </Button>
            </div>

            {/* Days list */}
            <div className="grid grid-cols-1 gap-2.5">
              {scheduleConfig.days.map((dayItem) => (
                <div
                  key={dayItem.dayOfWeek}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors ${
                    dayItem.isOpen
                      ? 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800/90'
                      : 'bg-zinc-100/40 dark:bg-zinc-900/30 border-zinc-200/40 dark:border-zinc-800/40 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between sm:justify-start gap-3.5 min-w-[170px]">
                    <Switch
                      checked={dayItem.isOpen}
                      onCheckedChange={(val) =>
                        handleUpdateDaySchedule(dayItem.dayOfWeek, { isOpen: val })
                      }
                    />
                    <div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                        {dayItem.day}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          dayItem.isOpen
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {dayItem.isOpen ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>

                  {dayItem.isOpen ? (
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                          Abre
                        </span>
                        <input
                          type="time"
                          value={dayItem.openTime}
                          onChange={(e) =>
                            handleUpdateDaySchedule(dayItem.dayOfWeek, {
                              openTime: e.target.value,
                            })
                          }
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>

                      <span className="text-zinc-400 font-bold">—</span>

                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                          Cierra
                        </span>
                        <input
                          type="time"
                          value={dayItem.closeTime}
                          onChange={(e) =>
                            handleUpdateDaySchedule(dayItem.dayOfWeek, {
                              closeTime: e.target.value,
                            })
                          }
                          className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-zinc-400 italic">
                      Sin atención al público este día
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                Modalidades de Despacho & Tiempos
              </h3>
              <p className="text-xs text-zinc-500">
                Habilitá delivery o retiro en mostrador y configurá costos y demoras estimadas.
              </p>
            </div>

            {/* Delivery Switch & Settings */}
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Envío a Domicilio (Delivery)</Label>
                    <p className="text-xs text-zinc-400">Permite a los clientes pedir con entrega</p>
                  </div>
                </div>
                <Switch
                  checked={business.allows_delivery}
                  onCheckedChange={(val) => setBusiness({ ...business, allows_delivery: val })}
                />
              </div>

              {business.allows_delivery && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="space-y-1.5">
                    <Label htmlFor="del-fee">Costo Base de Envío ($)</Label>
                    <Input
                      id="del-fee"
                      type="number"
                      value={business.delivery_fee}
                      onChange={(e) => setBusiness({ ...business, delivery_fee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="del-min">Demora Mínima (min)</Label>
                    <Input
                      id="del-min"
                      type="number"
                      value={business.estimated_delivery_min}
                      onChange={(e) => setBusiness({ ...business, estimated_delivery_min: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="del-max">Demora Máxima (min)</Label>
                    <Input
                      id="del-max"
                      type="number"
                      value={business.estimated_delivery_max}
                      onChange={(e) => setBusiness({ ...business, estimated_delivery_max: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Switch & Settings */}
            <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Retiro en Local (Take Away)</Label>
                    <p className="text-xs text-zinc-400">El cliente retira personalmente en mostrador</p>
                  </div>
                </div>
                <Switch
                  checked={business.allows_pickup}
                  onCheckedChange={(val) => setBusiness({ ...business, allows_pickup: val })}
                />
              </div>

              {business.allows_pickup && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="space-y-1.5">
                    <Label htmlFor="pick-min">Listo para retirar mín. (min)</Label>
                    <Input
                      id="pick-min"
                      type="number"
                      value={business.estimated_pickup_min}
                      onChange={(e) => setBusiness({ ...business, estimated_pickup_min: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pick-max">Listo para retirar máx. (min)</Label>
                    <Input
                      id="pick-max"
                      type="number"
                      value={business.estimated_pickup_max}
                      onChange={(e) => setBusiness({ ...business, estimated_pickup_max: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Minimum Order */}
            <div className="space-y-1.5 max-w-sm">
              <Label htmlFor="min-order">Pedido Mínimo ($)</Label>
              <Input
                id="min-order"
                type="number"
                value={business.min_order_amount}
                onChange={(e) => setBusiness({ ...business, min_order_amount: Number(e.target.value) })}
                placeholder="0 para sin mínimo"
              />
              <span className="text-[11px] text-zinc-400 block">
                Monto mínimo que el carrito debe sumar para permitir confirmar la compra.
              </span>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: WHATSAPP CLOUD API */}
        <TabsContent value="whatsapp" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                  WhatsApp Business Cloud API (Meta)
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Credenciales de tu app en Meta Developers para notificaciones transaccionales automáticas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="wa-phone-id">Phone Number ID</Label>
                <Input
                  id="wa-phone-id"
                  className="font-mono"
                  placeholder="Ej: 1082348572910"
                  value={settings.whatsapp_cloud_phone_number_id || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_cloud_phone_number_id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wa-waba-id">WABA ID (WhatsApp Business Account)</Label>
                <Input
                  id="wa-waba-id"
                  className="font-mono"
                  placeholder="Ej: 2948572019485"
                  value={settings.whatsapp_business_account_id || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_business_account_id: e.target.value })
                  }
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="wa-token">Permanent Access Token (Meta Graph)</Label>
                <Input
                  id="wa-token"
                  type="password"
                  className="font-mono"
                  placeholder="EAAB..."
                  value={settings.whatsapp_cloud_access_token || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_cloud_access_token: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Notification Automation Toggles */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Label className="text-sm font-bold text-zinc-900 dark:text-white">
                Disparadores de Notificación Automática
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Aviso al recibir nuevo pedido
                  </span>
                  <Switch
                    checked={settings.whatsapp_notify_on_new_order}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, whatsapp_notify_on_new_order: val })
                    }
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Aviso al confirmar comanda
                  </span>
                  <Switch
                    checked={settings.whatsapp_notify_customer_confirmed}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, whatsapp_notify_customer_confirmed: val })
                    }
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Aviso cuando está listo para retirar
                  </span>
                  <Switch
                    checked={settings.whatsapp_notify_customer_ready}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, whatsapp_notify_customer_ready: val })
                    }
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Aviso cuando sale el delivery en camino
                  </span>
                  <Switch
                    checked={settings.whatsapp_notify_customer_out_for_delivery}
                    onCheckedChange={(val) =>
                      setSettings({ ...settings, whatsapp_notify_customer_out_for_delivery: val })
                    }
                  />
                </label>
              </div>
            </div>

            {/* Test WhatsApp message */}
            {business.id && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <Label className="text-xs font-bold">Probar Conexión de WhatsApp</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input
                    type="tel"
                    placeholder="+54911..."
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="sm:max-w-xs font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendTestMessage}
                    disabled={testing}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testing ? 'Enviando...' : 'Enviar Mensaje de Prueba'}</span>
                  </Button>
                </div>

                {testStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testStatus.success
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {testStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testStatus.msg}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
