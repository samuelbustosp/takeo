-- ==============================================================================
-- TAKEO — Migration: User & Business Onboarding
-- Ejecutar en Supabase SQL Editor para habilitar la vinculación automática
-- ==============================================================================

-- 1. Asegurar que businesses tenga la columna user_id
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Trigger para crear automáticamente la fila de business_settings cuando se crea un negocio
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

-- 3. Políticas RLS para permitir a los usuarios autenticados crear y gestionar su negocio y configuración
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Full access for authenticated owners" ON businesses;
CREATE POLICY "Full access for authenticated owners" ON businesses 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Full access for authenticated owners" ON business_settings;
CREATE POLICY "Full access for authenticated owners" ON business_settings 
    FOR ALL TO authenticated 
    USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()))
    WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
