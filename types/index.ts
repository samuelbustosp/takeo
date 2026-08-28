export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type DeliveryType = 'PICKUP' | 'DELIVERY';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'MERCADO_PAGO' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type WhatsAppMsgStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url: string;
  phone_whatsapp: string;
  address: string;
  city: string;
  currency: string;
  currency_symbol: string;
  is_open: boolean;
  estimated_delivery_min: number;
  estimated_delivery_max: number;
  estimated_pickup_min: number;
  estimated_pickup_max: number;
  delivery_fee: number;
  min_order_amount: number;
  allows_delivery: boolean;
  allows_pickup: boolean;
  payment_methods: PaymentMethod[];
  instagram: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  business_id: string;
  whatsapp_cloud_phone_number_id?: string;
  whatsapp_cloud_access_token?: string;
  whatsapp_business_account_id?: string;
  whatsapp_notify_on_new_order: boolean;
  whatsapp_notify_customer_confirmed: boolean;
  whatsapp_notify_customer_ready: boolean;
  whatsapp_notify_customer_out_for_delivery: boolean;
  whatsapp_template_confirmed: string;
  whatsapp_template_ready: string;
  whatsapp_template_out_delivery: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  address?: string;
  address_notes?: string;
  total_orders: number;
  last_order_at: string;
  created_at: string;
}

export interface Discount {
  id: string;
  business_id: string;
  code: string;
  title: string;
  type: DiscountType;
  value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: number;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_notes?: string;
  delivery_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string;
  notes?: string;
  subtotal: number;
  discount_code?: string;
  discount_total: number;
  total: number;
  items: OrderItem[];
  whatsapp_business_sent: boolean;
  whatsapp_business_error?: string;
  cancelled_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  business_id: string;
  order_id?: string;
  recipient_phone: string;
  recipient_type: 'BUSINESS' | 'CUSTOMER';
  event_type: 'NEW_ORDER' | 'CONFIRMED' | 'READY' | 'OUT_FOR_DELIVERY' | 'CANCELLED';
  message_text: string;
  status: WhatsAppMsgStatus;
  attempts: number;
  last_error?: string;
  cloud_message_id?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface CartState {
  items: CartItem[];
  discount: Discount | null;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  deliveryNotes: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  orderNotes: string;
}

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
