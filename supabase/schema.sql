-- ==============================================================================
-- TAKEO Database Schema & Initial Data
-- Food Ordering Platform & Management Dashboard
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ENUMS
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type AS ENUM (
        'PICKUP',
        'DELIVERY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'CASH',
        'TRANSFER',
        'MERCADO_PAGO',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM (
        'PERCENTAGE',
        'FIXED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE whatsapp_msg_status AS ENUM (
        'QUEUED',
        'SENT',
        'DELIVERED',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- Businesses / Gastronomic Venues
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT 'Pedí. Listo.',
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    phone_whatsapp TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Buenos Aires',
    currency TEXT DEFAULT 'ARS',
    currency_symbol TEXT DEFAULT '$',
    is_open BOOLEAN DEFAULT true,
    estimated_delivery_min INT DEFAULT 30,
    estimated_delivery_max INT DEFAULT 45,
    estimated_pickup_min INT DEFAULT 15,
    estimated_pickup_max INT DEFAULT 25,
    delivery_fee NUMERIC(10, 2) DEFAULT 1200.00,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    allows_delivery BOOLEAN DEFAULT true,
    allows_pickup BOOLEAN DEFAULT true,
    payment_methods TEXT[] DEFAULT ARRAY['CASH', 'TRANSFER']::TEXT[],
    instagram TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Settings (e.g. WhatsApp Automation, Push Prep)
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
    whatsapp_cloud_phone_number_id TEXT,
    whatsapp_cloud_access_token TEXT,
    whatsapp_business_account_id TEXT,
    whatsapp_notify_on_new_order BOOLEAN DEFAULT true,
    whatsapp_notify_customer_confirmed BOOLEAN DEFAULT true,
    whatsapp_notify_customer_ready BOOLEAN DEFAULT true,
    whatsapp_notify_customer_out_for_delivery BOOLEAN DEFAULT true,
    whatsapp_template_confirmed TEXT DEFAULT '¡Hola {{customer_name}}! ✅ Tu pedido #{{order_number}} ha sido confirmado por {{business_name}}.',
    whatsapp_template_ready TEXT DEFAULT '¡Hola {{customer_name}}! 🟢 Tu pedido #{{order_number}} está listo para retirar en {{business_address}}.',
    whatsapp_template_out_delivery TEXT DEFAULT '¡Hola {{customer_name}}! 🛵 Tu pedido #{{order_number}} va en camino a tu dirección.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    address_notes TEXT,
    total_orders INT DEFAULT 1,
    last_order_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discounts & Promo Codes
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    type discount_type NOT NULL DEFAULT 'PERCENTAGE',
    value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, code)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number INT NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    delivery_type delivery_type NOT NULL DEFAULT 'PICKUP',
    delivery_address TEXT,
    delivery_notes TEXT,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    payment_method payment_method NOT NULL DEFAULT 'CASH',
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_reference TEXT,
    notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_code TEXT,
    discount_total NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    whatsapp_business_sent BOOLEAN DEFAULT false,
    whatsapp_business_error TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items (Historical Snapshot)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Messages Log & Retry Queue
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    recipient_phone TEXT NOT NULL,
    recipient_type TEXT NOT NULL, -- 'BUSINESS' or 'CUSTOMER'
    event_type TEXT NOT NULL,    -- 'NEW_ORDER', 'CONFIRMED', 'READY', 'OUT_FOR_DELIVERY', 'CANCELLED'
    message_text TEXT NOT NULL,
    status whatsapp_msg_status DEFAULT 'SENT',
    attempts INT DEFAULT 1,
    last_error TEXT,
    cloud_message_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_business_created ON orders(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_products_business_category ON products(business_id, category_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_order ON whatsapp_messages(order_id);

-- ==============================================================================
-- 4. ORDER NUMBER GENERATOR TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_next_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INT;
BEGIN
    SELECT COALESCE(MAX(order_number), 1000) + 1 INTO next_num
    FROM orders
    WHERE business_id = NEW.business_id;
    
    NEW.order_number := next_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL OR NEW.order_number = 0)
EXECUTE FUNCTION set_next_order_number();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Public can read businesses, active categories and available products
CREATE POLICY "Public can view businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view available products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view active discounts" ON discounts FOR SELECT USING (is_active = true);

-- Public can insert orders and order items
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view their created order" ON orders FOR SELECT USING (true);
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);

-- Authenticated / Service Role can manage all business records
-- Trigger to auto-create business_settings when a business is created
CREATE OR REPLACE FUNCTION handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO business_settings (business_id)
    VALUES (NEW.id)
    ON CONFLICT (business_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created ON businesses;
CREATE TRIGGER on_business_created
    AFTER INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_business();

CREATE POLICY "Full access for authenticated owners" ON businesses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Full access for authenticated owners" ON categories FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON products FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON orders FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON order_items FOR ALL TO authenticated USING ( order_id IN (SELECT id FROM orders WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())) );
CREATE POLICY "Full access for authenticated owners" ON discounts FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON customers FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON business_settings FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) ) WITH CHECK ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );
CREATE POLICY "Full access for authenticated owners" ON whatsapp_messages FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );

-- ==============================================================================
-- 7. STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'public-assets' );
