import {
  Business,
  BusinessSettings,
  Category,
  Product,
  Discount,
  Order,
  OrderStatus,
  WhatsAppMessage,
  OrderItem,
} from '@/types';
import {
  INITIAL_BUSINESS,
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DISCOUNTS,
  INITIAL_ORDERS,
  INITIAL_MESSAGES,
} from './mock-data';
import { isSupabaseConfigured, supabase } from '../supabase/client';
import { serverSupabase, isServerSupabaseConfigured } from '../supabase/server';
import { sendWhatsAppMessage } from '../whatsapp/service';

const STORAGE_KEYS = {
  BUSINESS: 'takeo_business',
  SETTINGS: 'takeo_settings',
  CATEGORIES: 'takeo_categories',
  PRODUCTS: 'takeo_products',
  DISCOUNTS: 'takeo_discounts',
  ORDERS: 'takeo_orders',
  MESSAGES: 'takeo_messages',
};

// In-memory singletons for server runtime
let memoryBusiness: Business = { ...INITIAL_BUSINESS };
let memorySettings: BusinessSettings = { ...INITIAL_SETTINGS };
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryDiscounts: Discount[] = [...INITIAL_DISCOUNTS];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memoryMessages: WhatsAppMessage[] = [...INITIAL_MESSAGES];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getStored<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

// -----------------------------------------------------------------------------
// BUSINESS & SETTINGS
// -----------------------------------------------------------------------------
export async function getBusiness(slug: string = 'takeo-express'): Promise<Business> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('businesses').select('*').eq('slug', slug).single();
    if (data) return data as Business;
  }
  return isBrowser() ? getStored<Business>(STORAGE_KEYS.BUSINESS, memoryBusiness) : memoryBusiness;
}

export async function updateBusiness(updates: Partial<Business>): Promise<Business> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', updates.id || memoryBusiness.id)
      .select()
      .single();
    if (data) return data as Business;
  }

  const current = isBrowser() ? getStored<Business>(STORAGE_KEYS.BUSINESS, memoryBusiness) : memoryBusiness;
  const updated: Business = { ...current, ...updates, updated_at: new Date().toISOString() };
  if (isBrowser()) {
    setStored(STORAGE_KEYS.BUSINESS, updated);
  }
  memoryBusiness = updated;
  return updated;
}

export async function getSettings(businessId: string = memoryBusiness.id): Promise<BusinessSettings> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('business_settings').select('*').eq('business_id', businessId).single();
    if (data) return data as BusinessSettings;
  }
  return isBrowser() ? getStored<BusinessSettings>(STORAGE_KEYS.SETTINGS, memorySettings) : memorySettings;
}

export async function updateSettings(updates: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb
      .from('business_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('business_id', updates.business_id || memoryBusiness.id)
      .select()
      .single();
    if (data) return data as BusinessSettings;
  }

  const current = isBrowser() ? getStored<BusinessSettings>(STORAGE_KEYS.SETTINGS, memorySettings) : memorySettings;
  const updated: BusinessSettings = { ...current, ...updates, updated_at: new Date().toISOString() };
  if (isBrowser()) {
    setStored(STORAGE_KEYS.SETTINGS, updated);
  }
  memorySettings = updated;
  return updated;
}

// -----------------------------------------------------------------------------
// CATEGORIES
// -----------------------------------------------------------------------------
export async function getCategories(businessId: string = memoryBusiness.id): Promise<Category[]> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('categories').select('*').eq('business_id', businessId).order('display_order', { ascending: true });
    if (data && data.length > 0) return data as Category[];
  }
  const cats = isBrowser() ? getStored<Category[]>(STORAGE_KEYS.CATEGORIES, memoryCategories) : memoryCategories;
  return [...cats].sort((a, b) => a.display_order - b.display_order);
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: `c_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    business_id: cat.business_id || memoryBusiness.id,
    name: cat.name || 'Nueva Categoría',
    slug: cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : 'categoria'),
    description: cat.description || '',
    display_order: cat.display_order || 99,
    icon: cat.icon || 'Utensils',
    is_active: cat.is_active !== undefined ? cat.is_active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = await getCategories(newCat.business_id);
  const updatedList = [...list, newCat];
  if (isBrowser()) setStored(STORAGE_KEYS.CATEGORIES, updatedList);
  memoryCategories = updatedList;
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const list = await getCategories();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Categoría no encontrada');

  const updated: Category = { ...list[index], ...updates, updated_at: new Date().toISOString() };
  list[index] = updated;
  if (isBrowser()) setStored(STORAGE_KEYS.CATEGORIES, list);
  memoryCategories = list;
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  const list = await getCategories();
  const filtered = list.filter((c) => c.id !== id);
  if (isBrowser()) setStored(STORAGE_KEYS.CATEGORIES, filtered);
  memoryCategories = filtered;
}

// -----------------------------------------------------------------------------
// PRODUCTS
// -----------------------------------------------------------------------------
export async function getProducts(businessId: string = memoryBusiness.id): Promise<Product[]> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('products').select('*').eq('business_id', businessId).order('display_order', { ascending: true });
    if (data && data.length > 0) return data as Product[];
  }
  const prods = isBrowser() ? getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts) : memoryProducts;
  return [...prods].sort((a, b) => a.display_order - b.display_order);
}

export async function createProduct(prod: Partial<Product>): Promise<Product> {
  const newProd: Product = {
    id: `p_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    business_id: prod.business_id || memoryBusiness.id,
    category_id: prod.category_id,
    name: prod.name || 'Nuevo Producto',
    slug: prod.slug || (prod.name ? prod.name.toLowerCase().replace(/\s+/g, '-') : 'producto'),
    description: prod.description || '',
    price: Number(prod.price) || 0,
    compare_at_price: prod.compare_at_price ? Number(prod.compare_at_price) : null,
    image_url: prod.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    is_available: prod.is_available !== undefined ? prod.is_available : true,
    is_featured: Boolean(prod.is_featured),
    display_order: prod.display_order || 99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = await getProducts(newProd.business_id);
  const updatedList = [...list, newProd];
  if (isBrowser()) setStored(STORAGE_KEYS.PRODUCTS, updatedList);
  memoryProducts = updatedList;
  return newProd;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const list = await getProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Producto no encontrado');

  const updated: Product = { ...list[index], ...updates, updated_at: new Date().toISOString() };
  list[index] = updated;
  if (isBrowser()) setStored(STORAGE_KEYS.PRODUCTS, list);
  memoryProducts = list;
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const list = await getProducts();
  const filtered = list.filter((p) => p.id !== id);
  if (isBrowser()) setStored(STORAGE_KEYS.PRODUCTS, filtered);
  memoryProducts = filtered;
}

// -----------------------------------------------------------------------------
// DISCOUNTS
// -----------------------------------------------------------------------------
export async function getDiscounts(businessId: string = memoryBusiness.id): Promise<Discount[]> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('discounts').select('*').eq('business_id', businessId);
    if (data && data.length > 0) return data as Discount[];
  }
  return isBrowser() ? getStored<Discount[]>(STORAGE_KEYS.DISCOUNTS, memoryDiscounts) : memoryDiscounts;
}

export async function createDiscount(disc: Partial<Discount>): Promise<Discount> {
  const newDisc: Discount = {
    id: `d_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    business_id: disc.business_id || memoryBusiness.id,
    code: (disc.code || 'PROMO').toUpperCase().trim(),
    title: disc.title || 'Promoción especial',
    type: disc.type || 'PERCENTAGE',
    value: Number(disc.value) || 10,
    min_order_amount: Number(disc.min_order_amount) || 0,
    is_active: disc.is_active !== undefined ? disc.is_active : true,
    usage_limit: disc.usage_limit ? Number(disc.usage_limit) : undefined,
    usage_count: 0,
    created_at: new Date().toISOString(),
  };

  const list = await getDiscounts(newDisc.business_id);
  const updatedList = [...list, newDisc];
  if (isBrowser()) setStored(STORAGE_KEYS.DISCOUNTS, updatedList);
  memoryDiscounts = updatedList;
  return newDisc;
}

export async function updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
  const list = await getDiscounts();
  const index = list.findIndex((d) => d.id === id);
  if (index === -1) throw new Error('Descuento no encontrado');

  const updated: Discount = { ...list[index], ...updates };
  list[index] = updated;
  if (isBrowser()) setStored(STORAGE_KEYS.DISCOUNTS, list);
  memoryDiscounts = list;
  return updated;
}

export async function validateDiscountCode(
  code: string,
  subtotal: number,
  businessId: string = memoryBusiness.id
): Promise<{ valid: boolean; discount?: Discount; discountAmount: number; message: string }> {
  const discounts = await getDiscounts(businessId);
  const cleanCode = code.trim().toUpperCase();
  const match = discounts.find((d) => d.code === cleanCode && d.is_active);

  if (!match) {
    return { valid: false, discountAmount: 0, message: 'Código de descuento inválido o vencido' };
  }

  if (match.min_order_amount > 0 && subtotal < match.min_order_amount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `El pedido mínimo para aplicar este cupón es de $${match.min_order_amount.toLocaleString('es-AR')}`,
    };
  }

  let amount = 0;
  if (match.type === 'PERCENTAGE') {
    amount = Math.round((subtotal * match.value) / 100);
    if (match.max_discount_amount && amount > match.max_discount_amount) {
      amount = match.max_discount_amount;
    }
  } else {
    amount = Math.min(match.value, subtotal);
  }

  return {
    valid: true,
    discount: match,
    discountAmount: amount,
    message: `¡Cupón ${match.code} aplicado con éxito!`,
  };
}

// -----------------------------------------------------------------------------
// ORDERS
// -----------------------------------------------------------------------------
export async function getOrders(businessId: string = memoryBusiness.id): Promise<Order[]> {
  const sb = isBrowser() ? (isSupabaseConfigured ? supabase : null) : (isServerSupabaseConfigured ? serverSupabase : null);
  if (sb) {
    const { data } = await sb.from('orders').select('*, items:order_items(*)').eq('business_id', businessId).order('created_at', { ascending: false });
    if (data && data.length > 0) return data as Order[];
  }
  const orders = isBrowser() ? getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders) : memoryOrders;
  return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id || String(o.order_number) === id) || null;
}

export interface CreateOrderPayload {
  businessId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'MERCADO_PAGO' | 'OTHER';
  notes?: string;
  discountCode?: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const business = await getBusiness(payload.businessId);
  const products = await getProducts(payload.businessId);

  // 1. Validate prices server-side
  let calculatedSubtotal = 0;
  const orderItems: OrderItem[] = [];
  const orderId = `o_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  for (const item of payload.items) {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) continue;
    const itemSubtotal = prod.price * item.quantity;
    calculatedSubtotal += itemSubtotal;
    orderItems.push({
      id: `i_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      order_id: orderId,
      product_id: prod.id,
      product_name: prod.name,
      product_image_url: prod.image_url,
      quantity: item.quantity,
      unit_price: prod.price,
      subtotal: itemSubtotal,
      notes: item.notes,
    });
  }

  // 2. Validate discount
  let discountTotal = 0;
  if (payload.discountCode) {
    const discResult = await validateDiscountCode(payload.discountCode, calculatedSubtotal, business.id);
    if (discResult.valid) {
      discountTotal = discResult.discountAmount;
    }
  }

  const deliveryFee = payload.deliveryType === 'DELIVERY' ? business.delivery_fee : 0;
  const total = Math.max(0, calculatedSubtotal - discountTotal + deliveryFee);

  // Generate sequential order number
  const allOrders = await getOrders(business.id);
  const maxNumber = allOrders.reduce((max, o) => Math.max(max, o.order_number), 1000);
  const orderNumber = maxNumber + 1;

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    business_id: business.id,
    customer_name: payload.customerName.trim(),
    customer_phone: payload.customerPhone.trim(),
    status: 'PENDING',
    delivery_type: payload.deliveryType,
    delivery_address: payload.deliveryAddress,
    delivery_notes: payload.deliveryNotes,
    delivery_fee: deliveryFee,
    payment_method: payload.paymentMethod,
    payment_status: 'PENDING',
    notes: payload.notes,
    subtotal: calculatedSubtotal,
    discount_code: payload.discountCode,
    discount_total: discountTotal,
    total,
    items: orderItems,
    whatsapp_business_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 3. Dispatch WhatsApp to Business
  const settings = await getSettings(business.id);
  try {
    const waResult = await sendWhatsAppMessage({
      business,
      settings,
      order: newOrder,
      eventType: 'NEW_ORDER',
      target: 'BUSINESS',
    });

    newOrder.whatsapp_business_sent = waResult.success;
    if (!waResult.success) {
      newOrder.whatsapp_business_error = waResult.error;
    }

    // Log message
    await recordWhatsAppMessage({
      business_id: business.id,
      order_id: newOrder.id,
      recipient_phone: business.phone_whatsapp,
      recipient_type: 'BUSINESS',
      event_type: 'NEW_ORDER',
      message_text: waResult.messageText,
      status: waResult.success ? 'SENT' : 'FAILED',
      attempts: 1,
      last_error: waResult.error,
      cloud_message_id: waResult.messageId,
    });
  } catch (err: any) {
    console.error('WhatsApp business notification error:', err);
  }

  // 4. Save order to storage
  const updatedOrders = [newOrder, ...allOrders];
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updatedOrders);
  }
  memoryOrders = updatedOrders;

  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  triggerWhatsApp: boolean = true
): Promise<Order> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId || String(o.order_number) === orderId);
  if (index === -1) throw new Error('Pedido no encontrado');

  const order = orders[index];
  const updatedOrder: Order = {
    ...order,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // If status is DELIVERED and payment was pending with cash, mark as paid
  if (newStatus === 'DELIVERED') {
    updatedOrder.payment_status = 'PAID';
  }

  // Dispatch WhatsApp to customer on relevant status change
  if (triggerWhatsApp && ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(newStatus)) {
    const business = await getBusiness(order.business_id);
    const settings = await getSettings(order.business_id);

    try {
      const waResult = await sendWhatsAppMessage({
        business,
        settings,
        order: updatedOrder,
        eventType: newStatus as any,
        target: 'CUSTOMER',
      });

      await recordWhatsAppMessage({
        business_id: business.id,
        order_id: updatedOrder.id,
        recipient_phone: updatedOrder.customer_phone,
        recipient_type: 'CUSTOMER',
        event_type: newStatus as any,
        message_text: waResult.messageText,
        status: waResult.success ? 'SENT' : 'FAILED',
        attempts: 1,
        last_error: waResult.error,
        cloud_message_id: waResult.messageId,
      });
    } catch (err) {
      console.error('Failed sending customer WhatsApp update', err);
    }
  }

  orders[index] = updatedOrder;
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, orders);
  }
  memoryOrders = orders;
  return updatedOrder;
}

// -----------------------------------------------------------------------------
// WHATSAPP LOGS & RETRY
// -----------------------------------------------------------------------------
export async function getWhatsAppMessages(businessId: string = memoryBusiness.id): Promise<WhatsAppMessage[]> {
  const msgs = isBrowser() ? getStored<WhatsAppMessage[]>(STORAGE_KEYS.MESSAGES, memoryMessages) : memoryMessages;
  return [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function recordWhatsAppMessage(
  msg: Omit<WhatsAppMessage, 'id' | 'created_at'>
): Promise<WhatsAppMessage> {
  const newMsg: WhatsAppMessage = {
    id: `m_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    created_at: new Date().toISOString(),
    ...msg,
  };

  const list = await getWhatsAppMessages(msg.business_id);
  const updatedList = [newMsg, ...list];
  if (isBrowser()) {
    setStored(STORAGE_KEYS.MESSAGES, updatedList);
  }
  memoryMessages = updatedList;
  return newMsg;
}

export async function retryWhatsAppMessage(messageId: string): Promise<WhatsAppMessage> {
  const list = await getWhatsAppMessages();
  const index = list.findIndex((m) => m.id === messageId);
  if (index === -1) throw new Error('Mensaje no encontrado');

  const msg = list[index];
  const business = await getBusiness(msg.business_id);
  const settings = await getSettings(msg.business_id);

  let order: Order | null = null;
  if (msg.order_id) {
    order = await getOrderById(msg.order_id);
  }

  if (!order) {
    throw new Error('Pedido asociado no encontrado');
  }

  const result = await sendWhatsAppMessage({
    business,
    settings,
    order,
    eventType: msg.event_type as any,
    target: msg.recipient_type,
    customMessage: msg.message_text,
  });

  const updatedMsg: WhatsAppMessage = {
    ...msg,
    status: result.success ? 'SENT' : 'FAILED',
    attempts: msg.attempts + 1,
    last_error: result.error,
    cloud_message_id: result.messageId || msg.cloud_message_id,
  };

  list[index] = updatedMsg;
  if (isBrowser()) {
    setStored(STORAGE_KEYS.MESSAGES, list);
  }
  memoryMessages = list;
  return updatedMsg;
}

// -----------------------------------------------------------------------------
// METRICS
// -----------------------------------------------------------------------------
export interface MetricsSummary {
  todaySales: number;
  todayOrdersCount: number;
  averageTicket: number;
  totalProductsCount: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  deliveredCount: number;
  topProducts: { name: string; salesCount: number; revenue: number }[];
  salesByHour: { hour: string; count: number; total: number }[];
  salesByDay: { day: string; dateStr: string; total: number; count: number }[];
}

export async function getMetrics(businessId: string = memoryBusiness.id): Promise<MetricsSummary> {
  const orders = await getOrders(businessId);
  const products = await getProducts(businessId);

  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');

  const todayStr = new Date().toDateString();
  const todayOrders = activeOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr);

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrdersCount = todayOrders.length;
  const averageTicket = todayOrdersCount > 0 ? Math.round(todaySales / todayOrdersCount) : 0;

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length;
  const readyCount = orders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Top products
  const productSalesMap: Record<string, { name: string; salesCount: number; revenue: number }> = {};
  for (const order of activeOrders) {
    for (const item of order.items) {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = {
          name: item.product_name,
          salesCount: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.product_name].salesCount += item.quantity;
      productSalesMap[item.product_name].revenue += item.subtotal;
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  // Hourly distribution for today / recent
  const hourlyMap: Record<number, { count: number; total: number }> = {};
  for (let h = 11; h <= 23; h++) {
    hourlyMap[h] = { count: 0, total: 0 };
  }

  for (const order of activeOrders) {
    const hour = new Date(order.created_at).getHours();
    if (hourlyMap[hour]) {
      hourlyMap[hour].count += 1;
      hourlyMap[hour].total += order.total;
    }
  }

  const salesByHour = Object.entries(hourlyMap).map(([h, data]) => ({
    hour: `${h}:00`,
    count: data.count,
    total: data.total,
  }));

  // Last 7 days
  const daysMap: Record<string, { total: number; count: number }> = {};
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toDateString();
    daysMap[key] = { total: 0, count: 0 };
  }

  for (const order of activeOrders) {
    const key = new Date(order.created_at).toDateString();
    if (daysMap[key]) {
      daysMap[key].total += order.total;
      daysMap[key].count += 1;
    }
  }

  const salesByDay = Object.entries(daysMap).map(([dateStr, data]) => {
    const d = new Date(dateStr);
    return {
      day: dayNames[d.getDay()],
      dateStr: `${d.getDate()}/${d.getMonth() + 1}`,
      total: data.total,
      count: data.count,
    };
  });

  return {
    todaySales,
    todayOrdersCount,
    averageTicket,
    totalProductsCount: products.filter((p) => p.is_available).length,
    pendingCount,
    preparingCount,
    readyCount,
    deliveredCount,
    topProducts,
    salesByHour,
    salesByDay,
  };
}
