-- Add category color to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color text DEFAULT 'blue';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add content format type to content table (bullet points vs written)
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'written' CHECK (content_format IN ('written', 'bullet_points'));
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Update categories with colors
UPDATE public.categories SET color = 'blue', description = 'Tech and software content', display_order = 1 WHERE slug = 'technology';
UPDATE public.categories SET color = 'green', description = 'Business strategies and tips', display_order = 2 WHERE slug = 'business';
UPDATE public.categories SET color = 'violet', description = 'Marketing and growth tactics', display_order = 3 WHERE slug = 'marketing';
UPDATE public.categories SET color = 'amber', description = 'Finance and investment tips', display_order = 4 WHERE slug = 'finance';
UPDATE public.categories SET color = 'red', description = 'Health and wellness content', display_order = 5 WHERE slug = 'health';
UPDATE public.categories SET color = 'pink', description = 'Creative content and design', display_order = 6 WHERE slug = 'creative';
UPDATE public.categories SET color = 'cyan', description = 'Education and learning', display_order = 7 WHERE slug = 'education';
UPDATE public.categories SET color = 'emerald', description = 'Lifestyle and personal growth', display_order = 8 WHERE slug = 'lifestyle';

-- Add PayPal credentials columns to payment_gateway_settings
ALTER TABLE public.payment_gateway_settings ADD COLUMN IF NOT EXISTS client_id text;
ALTER TABLE public.payment_gateway_settings ADD COLUMN IF NOT EXISTS client_secret text;
ALTER TABLE public.payment_gateway_settings ADD COLUMN IF NOT EXISTS sandbox_mode boolean DEFAULT true;

-- Create payouts table for tracking creator payouts
CREATE TABLE IF NOT EXISTS public.payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payout_method text NOT NULL CHECK (payout_method IN ('stripe', 'paypal', 'bank_transfer')),
    payout_details jsonb,
    processed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add payout balance tracking to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS available_balance_cents integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pending_balance_cents integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_paid_out_cents integer DEFAULT 0;

-- Create function to update user balances
CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE public.users
        SET 
            pending_balance_cents = pending_balance_cents + ROUND(NEW.amount_paid_cents * 0.85),
            updated_at = now()
        WHERE id = (
            SELECT creator_id FROM public.content WHERE id = NEW.content_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance updates
DROP TRIGGER IF EXISTS update_balance_on_session ON public.reading_sessions;
CREATE TRIGGER update_balance_on_session
AFTER INSERT OR UPDATE ON public.reading_sessions
FOR EACH ROW EXECUTE FUNCTION update_user_balance_on_transaction();
