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
CREATE POLICY "Public can view available products" ON products FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view active discounts" ON discounts FOR SELECT USING (is_active = true);

-- Public can insert orders and order items
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view their created order" ON orders FOR SELECT USING (true);
CREATE POLICY "Public can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);

-- Authenticated / Service Role can manage all business records
CREATE POLICY "Full access for authenticated owners" ON businesses FOR ALL TO authenticated USING (true);
CREATE POLICY "Full category access for owners" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Full product access for owners" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Full order access for owners" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Full order items access for owners" ON order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Full discount access for owners" ON discounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Full customer access for owners" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Full settings access for owners" ON business_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Full whatsapp log access for owners" ON whatsapp_messages FOR ALL TO authenticated USING (true);

-- ==============================================================================
-- 6. SEED DATA (TAKEO Demo Business & Menu)
-- ==============================================================================
INSERT INTO businesses (
    id, slug, name, tagline, description, logo_url, banner_url,
    phone_whatsapp, address, city, currency, currency_symbol,
    is_open, estimated_delivery_min, estimated_delivery_max,
    estimated_pickup_min, estimated_pickup_max, delivery_fee, min_order_amount,
    allows_delivery, allows_pickup, payment_methods, instagram
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'takeo-express',
    'TAKEO Express',
    'Pedí. Listo.',
    'Especialistas en empanadas artesanales, sándwiches de autor y combos irresistibles.',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    '+5491133445566',
    'Av. Corrientes 1450, CABA',
    'Buenos Aires',
    'ARS',
    '$',
    true,
    30, 45, 15, 25, 1200.00, 3000.00,
    true, true, ARRAY['CASH', 'TRANSFER']::TEXT[],
    '@takeo.express'
) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO business_settings (
    business_id, whatsapp_cloud_phone_number_id, whatsapp_cloud_access_token,
    whatsapp_business_account_id, whatsapp_notify_on_new_order,
    whatsapp_notify_customer_confirmed, whatsapp_notify_customer_ready,
    whatsapp_notify_customer_out_for_delivery
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'mock_phone_number_id_1042',
    'mock_token_takeo_cloud_api_key',
    'mock_waba_id_8899',
    true, true, true, true
) ON CONFLICT (business_id) DO NOTHING;

-- Categories
INSERT INTO categories (id, business_id, name, slug, description, display_order, icon, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Combos', 'combos', 'Las mejores combinaciones para disfrutar y ahorrar', 1, 'Flame', true),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Empanadas', 'empanadas', 'Artesanales, rellenas de verdad, masa casera', 2, 'UtensilsCrossed', true),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Sándwiches', 'sandwiches', 'Panes de masa madre y carnes horneadas lentamente', 3, 'Sandwich', true),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Bebidas', 'bebidas', 'Refrescantes y bien frías', 4, 'CupSoda', true),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Postres', 'postres', 'El toque dulce para terminar', 5, 'IceCream', true)
ON CONFLICT (business_id, slug) DO NOTHING;

-- Products
INSERT INTO products (id, business_id, category_id, name, slug, description, price, compare_at_price, image_url, is_available, is_featured, display_order) VALUES
-- Combos
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Combo 6 Empanadas + Gaseosa', 'combo-6-empanadas-gaseosa', '6 empanadas a elección + 1 bebida de 500ml.', 12500.00, 14500.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80', true, true, 1),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Docena TAKEO Premium', 'docena-takeo-premium', '12 empanadas surtidas de nuestros mejores sabores clásicos y especiales.', 22000.00, 26000.00, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80', true, true, 2),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Combo Sándwich + Papas + Bebida', 'combo-sandwich-papas-bebida', 'Sándwich a elección + papas rústicas crocantes + lata 354ml.', 11500.00, 13200.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', true, true, 3),

-- Empanadas
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Empanada de Carne Cortada a Cuchillo', 'empanada-carne-cuchillo', 'Carne tierna seleccionada, cebolla de verdeo, huevo de campo y pimentón ahumado.', 2100.00, NULL, 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80', true, true, 4),
('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Empanada Jamón y Queso Cremoso', 'empanada-jamon-queso', 'Doble mozzarella hilada, jamón cocido natural y toque de orégano.', 1950.00, NULL, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80', true, false, 5),
('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Empanada de Pollo al Verdeo', 'empanada-pollo-verdeo', 'Pechuga desmenuzada con crema de verdeo suave y especias.', 2000.00, NULL, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80', true, false, 6),
('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Empanada Cuatro Quesos & Cebolla Caramelizada', 'empanada-cuatro-quesos', 'Mozzarella, provolone, roquefort, parmesano y cebolla caramelizada.', 2200.00, NULL, 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&auto=format&fit=crop&q=80', true, false, 7),

-- Sándwiches
('p0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sándwich de Vacío Braseado', 'sandwich-vacio-braseado', 'Vacío cocido 6hs con hierbas, queso provolone fundido y chimichurri casero en pan ciabatta.', 8900.00, 9800.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80', true, true, 8),
('p0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sándwich Milanesa Completo TAKEO', 'sandwich-milanesa-completo', 'Milanesa de lomo crocante, lechuga mantecosa, tomate, jamón, queso y huevo frito.', 8400.00, NULL, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&auto=format&fit=crop&q=80', true, true, 9),
('p0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Sándwich Pollo Crispy & Coleslaw', 'sandwich-pollo-crispy', 'Pollo super crujiente, ensalada coleslaw fresca, pepinillos y salsa honey mustard.', 7900.00, NULL, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&auto=format&fit=crop&q=80', true, false, 10),

-- Bebidas
('p0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Coca-Cola Original 500ml', 'coca-cola-500ml', 'Botella 500ml fría.', 2200.00, NULL, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80', true, false, 11),
('p0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Coca-Cola Sin Azúcar 500ml', 'coca-cola-zero-500ml', 'Botella 500ml fría.', 2200.00, NULL, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&auto=format&fit=crop&q=80', true, false, 12),
('p0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Agua Mineral con/sin gas 500ml', 'agua-mineral-500ml', 'Botella 500ml.', 1600.00, NULL, 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800&auto=format&fit=crop&q=80', true, false, 13),
('p0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Cerveza IPA Artesanal 473ml', 'cerveza-ipa-473ml', 'Lata 473ml bien helada.', 3200.00, NULL, 'https://images.unsplash.com/photo-1608270199120-f56e9c60e334?w=800&auto=format&fit=crop&q=80', true, false, 14),

-- Postres
('p0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Flan Casero con Dulce de Leche', 'flan-casero-dulce-de-leche', 'Flan con abundante dulce de leche repostero y crema.', 3500.00, NULL, 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800&auto=format&fit=crop&q=80', true, true, 15),
('p0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Chocotorta en Vaso', 'chocotorta-vaso', 'Capas de galletitas Chocolinas con crema de dulce de leche.', 3800.00, NULL, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80', true, false, 16)
ON CONFLICT (business_id, slug) DO NOTHING;

-- Discounts
INSERT INTO discounts (id, business_id, code, title, type, value, min_order_amount, is_active, usage_limit, usage_count) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'TAKEO20', '20% OFF de Bienvenida', 'PERCENTAGE', 20.00, 5000.00, true, 500, 14),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'PROMO2000', '$2.000 OFF en tu pedido', 'FIXED', 2000.00, 8000.00, true, 200, 8)
ON CONFLICT (business_id, code) DO NOTHING;

-- Sample Orders
INSERT INTO orders (
    id, order_number, business_id, customer_name, customer_phone,
    status, delivery_type, delivery_address, delivery_notes, delivery_fee,
    payment_method, payment_status, subtotal, discount_code, discount_total, total,
    whatsapp_business_sent, created_at
) VALUES
('o0000000-0000-0000-0000-000000000001', 1040, 'a0000000-0000-0000-0000-000000000001', 'Ana Martínez', '+5491144332211', 'READY', 'PICKUP', NULL, NULL, 0.00, 'TRANSFER', 'PAID', 8500.00, NULL, 0.00, 8500.00, true, NOW() - INTERVAL '45 minutes'),
('o0000000-0000-0000-0000-000000000002', 1042, 'a0000000-0000-0000-0000-000000000001', 'Pedro Gómez', '+5491155667788', 'PREPARING', 'DELIVERY', 'Av. Santa Fe 3200 4B', 'Tocar timbre 4B', 1200.00, 'CASH', 'PENDING', 22300.00, 'TAKEO20', 4460.00, 19040.00, true, NOW() - INTERVAL '25 minutes'),
('o0000000-0000-0000-0000-000000000003', 1045, 'a0000000-0000-0000-0000-000000000001', 'Juan Pérez', '+5491166778899', 'PENDING', 'PICKUP', NULL, 'Sin cebolla si es posible', 0.00, 'CASH', 'PENDING', 15000.00, 'PROMO2000', 2000.00, 13000.00, true, NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
('i0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000004', 'Empanada de Carne Cortada a Cuchillo', 2, 2100.00, 4200.00),
('i0000000-0000-0000-0000-000000000002', 'o0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000008', 'Sándwich de Vacío Braseado', 1, 8900.00, 8900.00),
('i0000000-0000-0000-0000-000000000003', 'o0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000011', 'Coca-Cola Original 500ml', 1, 2200.00, 2200.00)
ON CONFLICT (id) DO NOTHING;
