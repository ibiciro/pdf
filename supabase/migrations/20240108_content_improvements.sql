-- Add total_likes to content table for tracking likes
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS total_likes integer DEFAULT 0;

-- Add creator_avatar to track creator profile pictures
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS creator_avatar text;

-- Add columns for user payout methods
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS paypal_email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_routing text;

-- Create saved_content table for bookmarking
CREATE TABLE IF NOT EXISTS public.saved_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- Create content_likes table for tracking likes
CREATE TABLE IF NOT EXISTS public.content_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- Function to update content like count
CREATE OR REPLACE FUNCTION update_content_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.content
        SET total_likes = total_likes + 1
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.content
        SET total_likes = GREATEST(0, total_likes - 1)
        WHERE id = OLD.content_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count updates
DROP TRIGGER IF EXISTS update_likes_on_content ON public.content_likes;
CREATE TRIGGER update_likes_on_content
AFTER INSERT OR DELETE ON public.content_likes
FOR EACH ROW EXECUTE FUNCTION update_content_like_count();

-- Create payment gateway settings table if not exists
CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_id text UNIQUE NOT NULL,
    is_enabled boolean DEFAULT false,
    public_key text,
    webhook_secret text,
    client_id text,
    client_secret text,
    sandbox_mode boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
