import re
with open('supabase/schema.sql', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add user_id to businesses
schema = schema.replace('slug TEXT UNIQUE NOT NULL,', 'user_id UUID REFERENCES auth.users(id),\n    slug TEXT UNIQUE NOT NULL,')

# RLS for businesses
schema = schema.replace(
    'CREATE POLICY "Full access for authenticated owners" ON businesses FOR ALL TO authenticated USING (true);',
    'CREATE POLICY "Full access for authenticated owners" ON businesses FOR ALL TO authenticated USING (auth.uid() = user_id);'
)

# For other tables, RLS should join with businesses
tables_with_business_id = [
    'categories', 'products', 'orders', 'discounts', 'customers', 'business_settings', 'whatsapp_messages'
]

for table in tables_with_business_id:
    # Let's just do regex for any "Full ... access for owners" ON table
    pattern = re.compile(f'CREATE POLICY ".*?" ON {table} FOR ALL TO authenticated USING \\(true\\);')
    new_policy = f'CREATE POLICY "Full access for authenticated owners" ON {table} FOR ALL TO authenticated USING ( business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) );'
    schema = pattern.sub(new_policy, schema)

# Order items joins with orders
pattern = re.compile(f'CREATE POLICY ".*?" ON order_items FOR ALL TO authenticated USING \\(true\\);')
new_policy = f'CREATE POLICY "Full access for authenticated owners" ON order_items FOR ALL TO authenticated USING ( order_id IN (SELECT id FROM orders WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())) );'
schema = pattern.sub(new_policy, schema)

# Storage policies
storage_sql = """
-- ==============================================================================
-- 7. STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'public-assets' );
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'public-assets' );
"""
if "7. STORAGE BUCKETS" not in schema:
    schema += storage_sql

with open('supabase/schema.sql', 'w', encoding='utf-8') as f:
    f.write(schema)
