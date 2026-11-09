'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TakeoLogo } from '@/components/ui/TakeoLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building2,
  Phone,
  MapPin,
  Bike,
  Store,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Wizard step: 1 = User data, 2 = Business data
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: User fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Business fields
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Buenos Aires');
  const [allowsDelivery, setAllowsDelivery] = useState(true);
  const [allowsPickup, setAllowsPickup] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('1200');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-generate slug when businessName changes
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresá un email válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!businessName.trim()) {
      setError('Por favor ingresá el nombre de tu negocio.');
      setLoading(false);
      return;
    }

    if (!phoneWhatsApp.trim()) {
      setError('El WhatsApp de recepción de pedidos es obligatorio.');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Por favor ingresá la dirección de tu local.');
      setLoading(false);
      return;
    }

    const cleanSlug =
      slug.trim() ||
      businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    const cleanPhone = phoneWhatsApp.trim();

    try {
      const supabase = createClient();

      // 1. SignUp User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: ownerName.trim() || undefined,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;

      if (userId) {
        // 2. Create the Business
        const { data: businessData, error: dbError } = await supabase
          .from('businesses')
          .insert({
            user_id: userId,
            name: businessName.trim(),
            slug: cleanSlug || `business-${Date.now()}`,
            tagline: 'Pedí. Listo.',
            phone_whatsapp: cleanPhone,
            address: address.trim(),
            city: city.trim() || 'Buenos Aires',
            currency: 'ARS',
            currency_symbol: '$',
            is_open: true,
            estimated_delivery_min: 30,
            estimated_delivery_max: 45,
            estimated_pickup_min: 15,
            estimated_pickup_max: 25,
            allows_delivery: allowsDelivery,
            allows_pickup: allowsPickup,
            delivery_fee: allowsDelivery ? Number(deliveryFee) || 0 : 0,
            payment_methods: ['CASH', 'TRANSFER'],
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error creating business:', dbError);
        } else if (businessData?.id) {
          // 3. Create default business_settings
          await supabase.from('business_settings').upsert(
            {
              business_id: businessData.id,
              whatsapp_notify_on_new_order: true,
              whatsapp_notify_customer_confirmed: true,
              whatsapp_notify_customer_ready: true,
              whatsapp_notify_customer_out_for_delivery: true,
              whatsapp_template_confirmed: `¡Hola {{customer_name}}! ✅ Tu pedido #{{order_number}} fue confirmado por ${businessName.trim()}.`,
              whatsapp_template_ready: `¡Hola {{customer_name}}! 🟢 Tu pedido #{{order_number}} está listo para retirar en ${address.trim()}.`,
              whatsapp_template_out_delivery: `¡Hola {{customer_name}}! 🛵 Tu pedido #{{order_number}} va en camino a tu dirección.`,
            },
            { onConflict: 'business_id' }
          );

          // 4. Create initial default starter categories
          await supabase.from('categories').insert([
            {
              business_id: businessData.id,
              name: 'Destacados',
              slug: 'destacados',
              display_order: 1,
              is_active: true,
            },
            {
              business_id: businessData.id,
              name: 'Bebidas',
              slug: 'bebidas',
              display_order: 2,
              is_active: true,
            },
          ]);
        }
      }

      if (authData.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error al procesar el registro.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#0d0e12] p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              ¡Tu negocio ha sido creado!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Revisá tu casilla de correo (
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {email}
              </span>
              ) para confirmar tu cuenta y luego iniciá sesión.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-orange-600/20"
          >
            Ir al Inicio de Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-[#0d0e12] p-4 sm:p-6 py-10 overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[560px] h-[340px] bg-orange-500/10 dark:bg-orange-500/15 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-lg space-y-5">
        {/* Back to Landing */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-900/95 p-6 sm:p-9 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
          {/* Header with Animated Logo */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <Link href="/" className="group inline-flex flex-col items-center gap-1.5">
              <TakeoLogo
                variant="rounded"
                size={50}
                animated
                className="rounded-2xl shadow-lg shadow-orange-500/30 ring-1 ring-orange-400/20 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-extrabold text-[11px] tracking-[0.2em] uppercase text-orange-600 dark:text-orange-400">
                TAKEO
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {step === 1 ? 'Creá tu cuenta' : 'Configurá tu negocio'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              {step === 1
                ? 'Paso 1 de 2 · Ingresá tus datos de acceso para administrar tu local.'
                : 'Paso 2 de 2 · Definí el nombre, enlace y modalidades de tu tienda.'}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-3 px-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => step === 2 && setStep(1)}
              className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                step === 1
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-emerald-600 dark:text-emerald-400 cursor-pointer'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                  step === 1
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </span>
              <span>Usuario</span>
            </button>

            {/* Connector Bar */}
            <div className="flex-1 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 ${
                  step === 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                step === 2
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                  step === 2
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                2
              </span>
              <span>Negocio</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: USER CREDENTIALS */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="reg-owner">Tu Nombre</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="reg-owner"
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="pl-10"
                    placeholder="Ej: Samuel"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email de Acceso *</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="admin@tunegocio.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>Continuar con datos del negocio</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: BUSINESS DETAILS */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-bname">Nombre del Local *</Label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="reg-bname"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => handleBusinessNameChange(e.target.value)}
                      className="pl-10"
                      placeholder="Ej: Empanadas Don Carlos"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-slug">Link de tu Tienda *</Label>
                  <div className="flex items-center h-10 bg-zinc-50/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 transition-all">
                    <span className="text-zinc-400 select-none text-xs font-mono">takeo/</span>
                    <input
                      id="reg-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))
                      }
                      className="w-full bg-transparent focus:outline-none text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold pl-0.5"
                      placeholder="don-carlos"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-phone">WhatsApp de Pedidos *</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phoneWhatsApp}
                      onChange={(e) => setPhoneWhatsApp(e.target.value)}
                      className="pl-10"
                      placeholder="+54 9 11 5566-7788"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-city">Ciudad *</Label>
                  <Input
                    id="reg-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Buenos Aires"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="reg-addr">Dirección del Local *</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="reg-addr"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      placeholder="Av. Corrientes 1234, CABA"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Pickup */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <Label className="text-xs uppercase tracking-wider text-zinc-400">
                  Modalidades de Entrega
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-orange-500/40 transition-colors">
                    <Checkbox
                      checked={allowsDelivery}
                      onCheckedChange={(checked) => setAllowsDelivery(!!checked)}
                    />
                    <div className="text-xs">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">
                        Envío a Domicilio
                      </div>
                      <div className="text-[11px] text-zinc-400">Delivery propio</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-orange-500/40 transition-colors">
                    <Checkbox
                      checked={allowsPickup}
                      onCheckedChange={(checked) => setAllowsPickup(!!checked)}
                    />
                    <div className="text-xs">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">
                        Retiro en Local
                      </div>
                      <div className="text-[11px] text-zinc-400">Take Away</div>
                    </div>
                  </label>
                </div>

                {allowsDelivery && (
                  <div className="pt-1 space-y-1.5">
                    <Label htmlFor="reg-fee">Costo Base de Envío ($)</Label>
                    <Input
                      id="reg-fee"
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="1200"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11 px-4 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>
                    {loading ? 'Creando tu tienda...' : 'Crear Negocio y Comenzar'}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              ¿Ya tenés una cuenta?{' '}
              <Link
                href="/login"
                className="text-orange-600 dark:text-orange-400 hover:underline font-bold"
              >
                Iniciá Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
