'use client';

import React, { useState, useEffect } from 'react';
import { getBusiness, updateBusiness, getSettings, updateSettings } from '@/lib/data/store';
import { sendWhatsAppMessage } from '@/lib/whatsapp/service';
import { Business, BusinessSettings } from '@/types';
import {
  Save,
  MessageCircle,
  Building2,
  Phone,
  MapPin,
  Bike,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WhatsApp test dispatch
  const [testPhone, setTestPhone] = useState('+5491155667788');
  const [testStatus, setTestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [b, s] = await Promise.all([getBusiness(), getSettings()]);
        setBusiness(b);
        setSettings(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !settings) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      await Promise.all([updateBusiness(business), updateSettings(settings)]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!business || !settings || !testPhone.trim()) return;
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

  if (loading || !business || !settings) {
    return (
      <div className="py-16 text-center text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-500 animate-spin" />
        <p className="text-xs">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Configuración del Negocio & WhatsApp
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Ajusta los datos del local y las credenciales de WhatsApp Cloud API.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>¡Configuración guardada correctamente!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Business Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Building2 className="w-5 h-5 text-orange-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
              Información del Local
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                WhatsApp del Negocio (Recepción de Pedidos) *
              </label>
              <input
                type="tel"
                required
                value={business.phone_whatsapp}
                onChange={(e) => setBusiness({ ...business, phone_whatsapp: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Dirección Física *
              </label>
              <input
                type="text"
                required
                value={business.address}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Costo de Envío / Delivery ($)
              </label>
              <input
                type="number"
                value={business.delivery_fee}
                onChange={(e) => setBusiness({ ...business, delivery_fee: Number(e.target.value) })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Pedido Mínimo ($)
              </label>
              <input
                type="number"
                value={business.min_order_amount}
                onChange={(e) => setBusiness({ ...business, min_order_amount: Number(e.target.value) })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. WhatsApp Cloud API Configuration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
              WhatsApp Business Cloud API (Meta)
            </h3>
          </div>

          <p className="text-xs text-zinc-500">
            Ingresa las credenciales de tu aplicación en Meta Developers para enviar mensajes oficiales desde tu número verificado. En modo Mock funcionará con el simulador incorporado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                placeholder="Ej: 1082348572910"
                value={settings.whatsapp_cloud_phone_number_id || ''}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_cloud_phone_number_id: e.target.value })
                }
                className="w-full font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                placeholder="Ej: 9948271038"
                value={settings.whatsapp_business_account_id || ''}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_business_account_id: e.target.value })
                }
                className="w-full font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                System User Access Token (Bearer)
              </label>
              <input
                type="password"
                placeholder="EAAG..."
                value={settings.whatsapp_cloud_access_token || ''}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp_cloud_access_token: e.target.value })
                }
                className="w-full font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Automated notifications switches */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">
              Automatizaciones de envío
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_notify_on_new_order}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_notify_on_new_order: e.target.checked })
                  }
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Enviar WhatsApp automático al negocio cuando ingresa un pedido nuevo
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_notify_customer_confirmed}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_notify_customer_confirmed: e.target.checked })
                  }
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Enviar WhatsApp al cliente al confirmar el pedido
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsapp_notify_customer_ready}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_notify_customer_ready: e.target.checked })
                  }
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Enviar WhatsApp al cliente cuando el pedido está listo para retirar
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            {saving ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>

      {/* 3. WhatsApp Live Simulator / Tester */}
      <div className="p-6 rounded-3xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-500" />
          <span>Simulador & Prueba de Envío de WhatsApp</span>
        </h3>
        <p className="text-xs text-zinc-500">
          Envía un mensaje de prueba al teléfono indicado para verificar la conexión o revisar el formato del mensaje simulado.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            placeholder="+5491155667788"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSendTestMessage}
            disabled={testing || !testPhone.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {testing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{testing ? 'Despachando...' : 'Enviar Prueba'}</span>
          </button>
        </div>

        {testStatus && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
              testStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
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
    </div>
  );
}
