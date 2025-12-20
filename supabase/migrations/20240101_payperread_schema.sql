-- PayPerRead Platform Schema

-- Content table for storing creator content
CREATE TABLE IF NOT EXISTS public.content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    content_type text NOT NULL CHECK (content_type IN ('text', 'pdf')),
    content_body text,
    pdf_url text,
    thumbnail_url text,
    price_cents integer NOT NULL DEFAULT 299,
    session_duration_minutes integer NOT NULL DEFAULT 30,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    total_reads integer NOT NULL DEFAULT 0,
    total_earnings_cents integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Reading sessions table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    reader_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at timestamp with time zone NOT NULL,
    extended_count integer NOT NULL DEFAULT 0,
    amount_paid_cents integer NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
    pages_read integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    reader_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id uuid REFERENCES public.reading_sessions(id) ON DELETE SET NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(content_id, reader_id)
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(content_id, user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Content categories junction table
CREATE TABLE IF NOT EXISTS public.content_categories (
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);

-- Payments table for tracking transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES public.reading_sessions(id) ON DELETE SET NULL,
    payer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    amount_cents integer NOT NULL,
    stripe_payment_intent_id text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'reader' CHECK (role IN ('reader', 'creator', 'admin'));

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
    ('Technology', 'technology'),
    ('Business', 'business'),
    ('Science', 'science'),
    ('Health', 'health'),
    ('Finance', 'finance'),
    ('Education', 'education'),
    ('Entertainment', 'entertainment'),
    ('Lifestyle', 'lifestyle')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_creator ON public.content(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_sessions_reader ON public.reading_sessions(reader_id);
CREATE INDEX IF NOT EXISTS idx_sessions_content ON public.reading_sessions(content_id);
CREATE INDEX IF NOT EXISTS idx_reviews_content ON public.reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_content ON public.likes(content_id);

-- Function to update content stats after a session
CREATE OR REPLACE FUNCTION public.update_content_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.content
    SET 
        total_reads = total_reads + 1,
        total_earnings_cents = total_earnings_cents + NEW.amount_paid_cents,
        updated_at = now()
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_session_created ON public.reading_sessions;
CREATE TRIGGER on_session_created
    AFTER INSERT ON public.reading_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_content_stats();

-- Function to calculate average rating for content
CREATE OR REPLACE FUNCTION public.get_content_avg_rating(content_uuid uuid)
RETURNS numeric AS $$
    SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
    FROM public.reviews
    WHERE content_id = content_uuid;
$$ LANGUAGE sql STABLE;

-- Function to get review count for content
CREATE OR REPLACE FUNCTION public.get_content_review_count(content_uuid uuid)
RETURNS integer AS $$
    SELECT COUNT(*)::integer
    FROM public.reviews
    WHERE content_id = content_uuid;
$$ LANGUAGE sql STABLE;

-- Function to get like count for content
CREATE OR REPLACE FUNCTION public.get_content_like_count(content_uuid uuid)
RETURNS integer AS $$
    SELECT COUNT(*)::integer
    FROM public.likes
    WHERE content_id = content_uuid;
$$ LANGUAGE sql STABLE;
