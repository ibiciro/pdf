-- Quality ratings table for content feedback
CREATE TABLE IF NOT EXISTS public.quality_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating_type text NOT NULL CHECK (rating_type IN ('facts', 'works', 'elite', 'expert', 'doesnt_work')),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(content_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quality_ratings_content ON public.quality_ratings(content_id);
CREATE INDEX IF NOT EXISTS idx_quality_ratings_type ON public.quality_ratings(rating_type);

CREATE OR REPLACE FUNCTION public.get_quality_rating_counts(content_uuid uuid)
RETURNS json AS $$
    SELECT json_build_object(
        'facts', COUNT(*) FILTER (WHERE rating_type = 'facts'),
        'works', COUNT(*) FILTER (WHERE rating_type = 'works'),
        'elite', COUNT(*) FILTER (WHERE rating_type = 'elite'),
        'expert', COUNT(*) FILTER (WHERE rating_type = 'expert'),
        'doesnt_work', COUNT(*) FILTER (WHERE rating_type = 'doesnt_work')
    )
    FROM public.quality_ratings
    WHERE content_id = content_uuid;
$$ LANGUAGE sql STABLE;

ALTER TABLE public.content ADD COLUMN IF NOT EXISTS allow_download boolean DEFAULT false;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS download_price_cents integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.content_downloads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    download_token text NOT NULL UNIQUE,
    watermark_data jsonb NOT NULL,
    downloaded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    amount_paid_cents integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_downloads_content ON public.content_downloads(content_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.content_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON public.content_downloads(download_token);
