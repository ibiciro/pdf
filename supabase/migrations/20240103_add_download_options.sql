-- Add download options to content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS allow_download boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS download_price_cents integer DEFAULT 0;

-- Add duration_minutes to reading_sessions if missing
ALTER TABLE public.reading_sessions 
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;

-- Update the reading sessions status check
ALTER TABLE public.reading_sessions 
DROP CONSTRAINT IF EXISTS reading_sessions_status_check;

ALTER TABLE public.reading_sessions 
ADD CONSTRAINT reading_sessions_status_check 
CHECK (status IN ('active', 'expired', 'completed', 'cancelled'));
