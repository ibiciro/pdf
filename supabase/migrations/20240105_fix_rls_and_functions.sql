-- Fix RLS policies for users table and add missing functions

-- Add missing columns to reading_sessions table if they don't exist
ALTER TABLE public.reading_sessions ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;

-- Drop existing restrictive policy and create better ones
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;

-- Allow users to view all public profiles (for creator pages)
CREATE POLICY "Public users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = user_id OR auth.uid() = id);

-- Allow new user creation via trigger
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() = id);

-- Add missing columns to users table if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'reader' CHECK (role IN ('reader', 'creator', 'admin'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payout_method text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payout_details jsonb DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_earnings_cents integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pending_payout_cents integer DEFAULT 0;

-- Create increment_earnings function
CREATE OR REPLACE FUNCTION public.increment_earnings(content_id uuid, amount integer)
RETURNS void AS $$
DECLARE
  creator_id_var uuid;
BEGIN
  -- Get the creator_id for this content
  SELECT creator_id INTO creator_id_var FROM public.content WHERE id = content_id;
  
  IF creator_id_var IS NOT NULL THEN
    -- Update creator's total earnings
    UPDATE public.users
    SET 
      total_earnings_cents = COALESCE(total_earnings_cents, 0) + amount,
      pending_payout_cents = COALESCE(pending_payout_cents, 0) + amount,
      updated_at = now()
    WHERE id = creator_id_var OR user_id = creator_id_var::text;
    
    -- Update content stats
    UPDATE public.content
    SET 
      total_reads = total_reads + 1,
      total_earnings_cents = total_earnings_cents + amount,
      updated_at = now()
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can access content
CREATE OR REPLACE FUNCTION public.can_access_content(content_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Check for active reading session
  RETURN EXISTS (
    SELECT 1 FROM public.reading_sessions
    WHERE content_id = content_uuid
      AND reader_id = user_uuid
      AND status = 'active'
      AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create function to extend reading session
CREATE OR REPLACE FUNCTION public.extend_reading_session(session_uuid uuid, extension_minutes integer, extension_cost_cents integer)
RETURNS boolean AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record FROM public.reading_sessions WHERE id = session_uuid;
  
  IF session_record IS NULL OR session_record.reader_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  IF session_record.extended_count >= 3 THEN
    RETURN false;
  END IF;
  
  UPDATE public.reading_sessions
  SET 
    expires_at = expires_at + (extension_minutes || ' minutes')::interval,
    extended_count = extended_count + 1,
    amount_paid_cents = amount_paid_cents + extension_cost_cents
  WHERE id = session_uuid;
  
  -- Update creator earnings
  PERFORM public.increment_earnings(session_record.content_id, extension_cost_cents);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix reading_sessions RLS
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.reading_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.reading_sessions;
DROP POLICY IF EXISTS "Creators can view sessions for their content" ON public.reading_sessions;

CREATE POLICY "Users can view own sessions"
  ON public.reading_sessions FOR SELECT
  USING (reader_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (reader_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.reading_sessions FOR UPDATE
  USING (reader_id = auth.uid());

CREATE POLICY "Creators can view sessions for their content"
  ON public.reading_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content 
      WHERE content.id = reading_sessions.content_id 
      AND content.creator_id = auth.uid()
    )
  );

-- Fix content RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published content is viewable by everyone" ON public.content;
DROP POLICY IF EXISTS "Creators can manage own content" ON public.content;
DROP POLICY IF EXISTS "Creators can view own content" ON public.content;

CREATE POLICY "Published content is viewable by everyone"
  ON public.content FOR SELECT
  USING (status = 'published' OR creator_id = auth.uid());

CREATE POLICY "Creators can insert own content"
  ON public.content FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own content"
  ON public.content FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete own content"
  ON public.content FOR DELETE
  USING (creator_id = auth.uid());

-- Fix payments RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (payer_id = auth.uid() OR creator_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (payer_id = auth.uid());

-- Fix reviews RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (reader_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (reader_id = auth.uid());

-- Fix likes RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON public.likes;

CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_status ON public.reading_sessions(status);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_expires ON public.reading_sessions(expires_at);
