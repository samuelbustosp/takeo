import {
  Business, BusinessSettings, Category, Product, Discount, Order, OrderStatus, WhatsAppMessage, OrderItem
} from '@/types';
import { createClient } from '../supabase/client';

export async function getBusiness(slugOrId?: string | null): Promise<Business | null> {
  const supabase = createClient();
  
  if (slugOrId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    let query = supabase.from('businesses').select('*');
    if (isUuid) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('slug', slugOrId);
    }
    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as unknown as Business;
  }

  // If no slug or id, try to get the business of the logged in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('businesses').select('*').eq('user_id', user.id).maybeSingle();
  if (error || !data) {
    return null;
  }
  return data as unknown as Business;
}

export async function createBusiness(payload: Partial<Business>): Promise<Business | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('businesses')
    .insert([{
      ...payload,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;

  // Ensure default settings exist
  if (data?.id) {
    await supabase.from('business_settings').upsert({
      business_id: data.id,
      whatsapp_notify_on_new_order: true,
      whatsapp_notify_customer_confirmed: true,
      whatsapp_notify_customer_ready: true,
      whatsapp_notify_customer_out_for_delivery: true,
      whatsapp_template_confirmed: '¡Hola {{customer_name}}! ✅ Tu pedido #{{order_number}} ha sido confirmado por {{business_name}}.',
      whatsapp_template_ready: '¡Hola {{customer_name}}! 🟢 Tu pedido #{{order_number}} está listo para retirar en {{business_address}}.',
      whatsapp_template_out_delivery: '¡Hola {{customer_name}}! 🛵 Tu pedido #{{order_number}} va en camino a tu dirección.',
    }, { onConflict: 'business_id' });
  }

  return data as unknown as Business;
}

export async function updateBusiness(updates: Partial<Business>): Promise<Business | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if business exists
  if (updates.id) {
    const { data, error } = await supabase
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', updates.id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Business;
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Business;
}

async function resolveBusinessId(providedId?: string): Promise<string | null> {
  if (providedId) return providedId;
  const b = await getBusiness();
  return b ? b.id : null;
}

export async function getSettings(businessId?: string): Promise<BusinessSettings | null> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return null;

  const { data, error } = await supabase.from('business_settings').select('*').eq('business_id', bId).maybeSingle();
  if (error && error.code !== 'PGRST116') console.error('Error fetching settings', error);

  if (data) return data as unknown as BusinessSettings;

  // Default settings fallback
  return {
    id: '',
    business_id: bId,
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
}

export async function updateSettings(updates: Partial<BusinessSettings>): Promise<BusinessSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('business_settings')
    .upsert({ ...updates, updated_at: new Date().toISOString() }, { onConflict: 'business_id' })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as BusinessSettings;
}

// Categories
export async function getCategories(businessId?: string): Promise<Category[]> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return [];

  const { data, error } = await supabase.from('categories').select('*').eq('business_id', bId).order('display_order', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as Category[];
}

// Helpers
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function generateUniqueCategorySlug(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
  baseName: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(baseName) || 'categoria';
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('business_id', businessId)
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();
    if (error && error.code !== 'PGRST116') {
      return `${base}-${Date.now().toString(36)}`;
    }
    if (!data) {
      return slug;
    }
    counter++;
    slug = `${base}-${counter}`;
  }
}

async function generateUniqueProductSlug(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
  baseName: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(baseName) || 'producto';
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase
      .from('products')
      .select('id')
      .eq('business_id', businessId)
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();
    if (error && error.code !== 'PGRST116') {
      return `${base}-${Date.now().toString(36)}`;
    }
    if (!data) {
      return slug;
    }
    counter++;
    slug = `${base}-${counter}`;
  }
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const supabase = createClient();
  let bId = cat.business_id;
  if (!bId) {
    bId = (await resolveBusinessId()) || undefined;
  }
  if (!bId) throw new Error('No se pudo identificar el negocio');

  const slug = cat.slug?.trim()
    ? slugify(cat.slug)
    : await generateUniqueCategorySlug(supabase, bId, cat.name || 'categoria');

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...cat, slug, business_id: bId }])
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const supabase = createClient();
  const payload: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.slug !== undefined) {
    payload.slug = slugify(updates.slug);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// Products
export async function getProducts(businessId?: string): Promise<Product[]> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return [];

  const { data, error } = await supabase.from('products').select('*').eq('business_id', bId).order('display_order', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as Product[];
}

export async function createProduct(prod: Partial<Product>): Promise<Product> {
  const supabase = createClient();
  let bId = prod.business_id;
  if (!bId) {
    bId = (await resolveBusinessId()) || undefined;
  }
  if (!bId) throw new Error('No se pudo identificar el negocio');

  const slug = prod.slug?.trim()
    ? slugify(prod.slug)
    : await generateUniqueProductSlug(supabase, bId, prod.name || 'producto');

  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...prod,
      slug,
      business_id: bId,
      category_id: prod.category_id || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = createClient();
  const payload: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.category_id !== undefined) {
    payload.category_id = updates.category_id || null;
  }

  if (updates.slug !== undefined) {
    payload.slug = slugify(updates.slug);
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// Discounts
export async function getDiscounts(businessId?: string): Promise<Discount[]> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return [];

  const { data, error } = await supabase.from('discounts').select('*').eq('business_id', bId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Discount[];
}

export async function createDiscount(discount: Partial<Discount>): Promise<Discount> {
  const supabase = createClient();
  let bId = discount.business_id;
  if (!bId) {
    bId = (await resolveBusinessId()) || undefined;
  }
  const { data, error } = await supabase.from('discounts').insert([{ ...discount, business_id: bId }]).select().single();
  if (error) throw error;
  return data as unknown as Discount;
}

export async function updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
  const supabase = createClient();
  const { data, error } = await supabase.from('discounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as Discount;
}

export async function deleteDiscount(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('discounts').delete().eq('id', id);
  if (error) throw error;
}

export async function validateDiscountCode(
  code: string,
  subtotal: number,
  businessId?: string
): Promise<{ valid: boolean; discount?: Discount; discountAmount: number; message: string }> {
  const discounts = await getDiscounts(businessId);
  const match = discounts.find(
    (d) => d.code.toUpperCase() === code.toUpperCase() && d.is_active
  );

  if (!match) return { valid: false, discountAmount: 0, message: 'Código inválido o vencido' };
  if (match.min_order_amount > 0 && subtotal < match.min_order_amount) {
    return { valid: false, discountAmount: 0, message: `El pedido mínimo es de $${match.min_order_amount}` };
  }

  let amount = match.type === 'PERCENTAGE' ? Math.round((subtotal * match.value) / 100) : Math.min(match.value, subtotal);
  if (match.type === 'PERCENTAGE' && match.max_discount_amount && amount > match.max_discount_amount) {
    amount = match.max_discount_amount;
  }
  return { valid: true, discount: match, discountAmount: amount, message: '¡Cupón aplicado!' };
}

// Orders
export async function getOrders(businessId?: string): Promise<Order[]> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return [];

  const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('business_id', bId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single();
  if (error) return null;
  return data as unknown as Order;
}

export async function createOrder(payload: any): Promise<Order> {
  const supabase = createClient();
  const businessIdentifier = payload.businessId || payload.businessSlug;
  const business = await getBusiness(businessIdentifier);
  if (!business) throw new Error('Negocio no encontrado');

  const products = await getProducts(business.id);
  let calculatedSubtotal = 0;
  
  const orderItemsData = payload.items.map((item: any) => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) throw new Error('Product not found');
    const itemSubtotal = prod.price * item.quantity;
    calculatedSubtotal += itemSubtotal;
    return {
      product_id: prod.id,
      product_name: prod.name,
      product_image_url: prod.image_url,
      quantity: item.quantity,
      unit_price: prod.price,
      subtotal: itemSubtotal,
      notes: item.notes,
    };
  });

  let discountTotal = 0;
  if (payload.discountCode) {
    const disc = await validateDiscountCode(payload.discountCode, calculatedSubtotal, business.id);
    if (disc.valid) discountTotal = disc.discountAmount;
  }
  
  const deliveryFee = payload.deliveryType === 'DELIVERY' ? business.delivery_fee : 0;
  const total = Math.max(0, calculatedSubtotal - discountTotal + deliveryFee);

  const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
    business_id: business.id,
    customer_name: payload.customerName.trim(),
    customer_phone: payload.customerPhone.trim(),
    status: 'PENDING',
    delivery_type: payload.deliveryType,
    delivery_address: payload.deliveryAddress,
    delivery_notes: payload.deliveryNotes,
    delivery_fee: deliveryFee,
    payment_method: payload.paymentMethod,
    notes: payload.notes,
    subtotal: calculatedSubtotal,
    discount_code: payload.discountCode,
    discount_total: discountTotal,
    total,
  }]).select().single();
  
  if (orderError) throw orderError;

  const itemsToInsert = orderItemsData.map((item: any) => ({ ...item, order_id: orderData.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return orderData as unknown as Order;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, notifyWhatsApp: boolean = false): Promise<Order> {
  const supabase = createClient();
  const { data, error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
  if (error) throw error;
  return data as unknown as Order;
}

// Metrics
export async function getMetrics(businessId?: string): Promise<any> {
  const orders = await getOrders(businessId);
  const products = await getProducts(businessId);
  
  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const todayStr = new Date().toDateString();
  const todayOrders = activeOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr);

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayOrdersCount = todayOrders.length;

  return {
    todaySales,
    todayOrdersCount,
    averageTicket: todayOrdersCount > 0 ? Math.round(todaySales / todayOrdersCount) : 0,
    totalProductsCount: products.filter((p) => p.is_available).length,
    pendingCount: orders.filter((o) => o.status === 'PENDING').length,
    preparingCount: orders.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length,
    readyCount: orders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY').length,
    deliveredCount: orders.filter((o) => o.status === 'DELIVERED').length,
    topProducts: [],
    salesByHour: [],
    salesByDay: [],
  };
}

export async function getWhatsAppMessages(businessId?: string): Promise<WhatsAppMessage[]> {
  const supabase = createClient();
  const bId = await resolveBusinessId(businessId);
  if (!bId) return [];

  const { data, error } = await supabase.from('whatsapp_messages').select('*').eq('business_id', bId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as WhatsAppMessage[];
}

export async function recordWhatsAppMessage(msg: any): Promise<WhatsAppMessage> {
  const supabase = createClient();
  const { data, error } = await supabase.from('whatsapp_messages').insert([msg]).select().single();
  if (error) throw error;
  return data as unknown as WhatsAppMessage;
}

export async function retryWhatsAppMessage(messageId: string): Promise<WhatsAppMessage> {
  throw new Error("Not implemented in Supabase version yet");
}
