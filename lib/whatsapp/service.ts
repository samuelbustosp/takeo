import { Business, BusinessSettings, Order, WhatsAppMessage, OrderStatus } from '@/types';

export interface SendWhatsAppParams {
  business: Business;
  settings?: BusinessSettings;
  order: Order;
  eventType: 'NEW_ORDER' | 'CONFIRMED' | 'READY' | 'OUT_FOR_DELIVERY' | 'CANCELLED';
  target: 'BUSINESS' | 'CUSTOMER';
  customMessage?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  messageText: string;
  recipientPhone: string;
}

export function formatBusinessNewOrderMessage(order: Order, business: Business): string {
  const itemsText = order.items
    .map(
      (item) =>
        `${item.quantity} × ${item.product_name} — $${(item.unit_price * item.quantity).toLocaleString('es-AR')}${
          item.notes ? ` (${item.notes})` : ''
        }`
    )
    .join('\n');

  const deliveryInfo =
    order.delivery_type === 'DELIVERY'
      ? `🛵 Delivery a: ${order.delivery_address || 'Sin dirección'}${
          order.delivery_notes ? `\n📝 Ref: ${order.delivery_notes}` : ''
        }`
      : `📍 Retiro en local`;

  const paymentText =
    order.payment_method === 'CASH'
      ? '💵 Efectivo al recibir/retirar'
      : order.payment_method === 'TRANSFER'
      ? '💳 Transferencia bancaria'
      : '📱 Pago online';

  const discountText =
    order.discount_total > 0
      ? `\n🎟️ Descuento (${order.discount_code || 'Promo'}): -$${order.discount_total.toLocaleString('es-AR')}`
      : '';

  return (
    `🛎️ *NUEVO PEDIDO #${order.order_number}*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Cliente:* ${order.customer_name}\n` +
    `📱 *Teléfono:* ${order.customer_phone}\n\n` +
    `📋 *DETALLE:*\n${itemsText}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `Subtotal: $${order.subtotal.toLocaleString('es-AR')}` +
    `${discountText}\n` +
    (order.delivery_fee > 0 ? `Envío: $${order.delivery_fee.toLocaleString('es-AR')}\n` : '') +
    `*TOTAL: $${order.total.toLocaleString('es-AR')}*\n\n` +
    `${deliveryInfo}\n` +
    `${paymentText}\n` +
    (order.notes ? `💬 *Observaciones:* ${order.notes}\n\n` : '\n') +
    `👉 Gestionar en TAKEO: /dashboard/orders`
  );
}

export function formatCustomerStatusMessage(
  order: Order,
  business: Business,
  status: OrderStatus,
  settings?: BusinessSettings
): string {
  switch (status) {
    case 'CONFIRMED':
      return (
        settings?.whatsapp_template_confirmed
          ?.replace('{{customer_name}}', order.customer_name)
          ?.replace('{{order_number}}', String(order.order_number))
          ?.replace('{{business_name}}', business.name) ||
        `¡Hola ${order.customer_name}! ✅ Tu pedido #${order.order_number} en *${business.name}* ha sido confirmado. Te avisaremos cuando esté listo.`
      );
    case 'PREPARING':
      return `¡Hola ${order.customer_name}! 👨‍🍳 Tu pedido #${order.order_number} ya se encuentra en preparación en *${business.name}*.`;
    case 'READY':
      return (
        settings?.whatsapp_template_ready
          ?.replace('{{customer_name}}', order.customer_name)
          ?.replace('{{order_number}}', String(order.order_number))
          ?.replace('{{business_address}}', business.address) ||
        `¡Hola ${order.customer_name}! 🟢 Tu pedido #${order.order_number} está *LISTO* para retirar en *${business.address}*. ¡Te esperamos!`
      );
    case 'OUT_FOR_DELIVERY':
      return (
        settings?.whatsapp_template_out_delivery
          ?.replace('{{customer_name}}', order.customer_name)
          ?.replace('{{order_number}}', String(order.order_number)) ||
        `¡Hola ${order.customer_name}! 🛵 Tu pedido #${order.order_number} va en camino a tu domicilio (${order.delivery_address || ''}).`
      );
    case 'DELIVERED':
      return `¡Hola ${order.customer_name}! 🎉 Tu pedido #${order.order_number} fue entregado. ¡Muchas gracias por elegir *${business.name}*! Que lo disfrutes.`;
    case 'CANCELLED':
      return `Hola ${order.customer_name}. Lamentamos informarte que tu pedido #${order.order_number} ha sido cancelado.${
        order.cancelled_reason ? ` Motivo: ${order.cancelled_reason}` : ''
      }`;
    default:
      return `Hola ${order.customer_name}, el estado de tu pedido #${order.order_number} se ha actualizado a: ${status}.`;
  }
}

/**
 * Dispatch or simulate WhatsApp message
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppParams
): Promise<SendWhatsAppResult> {
  const { business, settings, order, eventType, target, customMessage } = params;

  let messageText = customMessage || '';
  let recipientPhone = '';

  if (target === 'BUSINESS') {
    recipientPhone = business.phone_whatsapp;
    if (!messageText) {
      messageText = formatBusinessNewOrderMessage(order, business);
    }
  } else {
    recipientPhone = order.customer_phone;
    if (!messageText) {
      messageText = formatCustomerStatusMessage(order, business, order.status, settings);
    }
  }

  // Format phone (remove +, spaces, dashes for API)
  const cleanPhone = recipientPhone.replace(/\D/g, '');

  const phoneId = settings?.whatsapp_cloud_phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = settings?.whatsapp_cloud_access_token || process.env.WHATSAPP_ACCESS_TOKEN;

  // Check if real WhatsApp credentials are configured
  const isRealApiConfigured = Boolean(
    phoneId &&
    accessToken &&
    !phoneId.includes('mock_') &&
    !accessToken.includes('mock_')
  );

  if (isRealApiConfigured) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error?.message || 'Error en WhatsApp Cloud API',
          messageText,
          recipientPhone,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id || `wamid.${Date.now()}`,
        messageText,
        recipientPhone,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error conectando a WhatsApp Cloud API',
        messageText,
        recipientPhone,
      };
    }
  }

  // Simulated / Mock WhatsApp Cloud API dispatch
  return {
    success: true,
    messageId: `wamid.sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    messageText,
    recipientPhone,
  };
}
