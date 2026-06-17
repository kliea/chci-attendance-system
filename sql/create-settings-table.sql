-- Create settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
    ('work_start_time', '"08:00"'),
    ('work_end_time', '"17:00"'),
    ('grace_period_minutes', '30')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if present to avoid duplicate-policy errors
DROP POLICY IF EXISTS "Public read access to settings" ON public.settings;
DROP POLICY IF EXISTS "Manager update access to settings" ON public.settings;
DROP POLICY IF EXISTS "Manager insert access to settings" ON public.settings;

-- RLS Policies: All authenticated users can read settings
CREATE POLICY "Public read access to settings" ON public.settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies: Only managers and admins can update settings
CREATE POLICY "Manager update access to settings" ON public.settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies: Only managers and admins can insert settings
CREATE POLICY "Manager insert access to settings" ON public.settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Function to get settings value
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT value 
        FROM public.settings 
        WHERE key = setting_key
    );
END;
$$;

-- Function to update setting
CREATE OR REPLACE FUNCTION public.update_setting(setting_key TEXT, setting_value JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.settings 
    SET value = setting_value, updated_at = now()
    WHERE key = setting_key;
    
    RETURN FOUND;
END;
$$;
