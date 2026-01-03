-- Notifications Table for system-wide activity notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'review', 'like', 'session_start', 'session_end', 'content_published', 'earning', 'download', 'new_follower', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Website Visitors Tracking Table
CREATE TABLE IF NOT EXISTS public.website_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  ip_hash text,
  country text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser text,
  session_id text,
  duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Daily Analytics Summary Table (for faster queries)
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_visitors integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  page_views integer DEFAULT 0,
  total_purchases integer DEFAULT 0,
  total_revenue_cents integer DEFAULT 0,
  new_users integer DEFAULT 0,
  active_sessions integer DEFAULT 0,
  avg_session_duration_seconds integer DEFAULT 0,
  top_content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(date)
);

-- Activity Log Table for comprehensive admin tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'user_signup', 'user_login', 'user_logout',
    'content_create', 'content_update', 'content_delete', 'content_publish',
    'payment_initiated', 'payment_completed', 'payment_failed',
    'session_start', 'session_extend', 'session_end',
    'review_submit', 'like_toggle', 'download_start', 'download_complete',
    'admin_action', 'system_event'
  )),
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_visitors_created ON public.website_visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_session ON public.website_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON public.website_visitors(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

-- Disable RLS for easier access (can be enabled with proper policies later)
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_content_id uuid DEFAULT NULL,
  p_related_user_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, content_id, related_user_id, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_content_id, p_related_user_id, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_action_type text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (user_id, action_type, entity_type, entity_id, description, metadata)
  VALUES (p_user_id, p_action_type, p_entity_type, p_entity_id, p_description, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track page visit
CREATE OR REPLACE FUNCTION public.track_page_visit(
  p_visitor_id text,
  p_page_path text,
  p_user_id uuid DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_device_type text DEFAULT 'unknown',
  p_session_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_visit_id uuid;
BEGIN
  INSERT INTO public.website_visitors (visitor_id, page_path, user_id, referrer, user_agent, device_type, session_id)
  VALUES (p_visitor_id, p_page_path, p_user_id, p_referrer, p_user_agent, p_device_type, p_session_id)
  RETURNING id INTO v_visit_id;
  
  RETURN v_visit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify creator on content purchase
CREATE OR REPLACE FUNCTION public.notify_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  v_content_title text;
  v_creator_id uuid;
  v_buyer_name text;
BEGIN
  SELECT c.title, c.creator_id INTO v_content_title, v_creator_id
  FROM public.content c
  WHERE c.id = NEW.content_id;
  
  SELECT COALESCE(u.full_name, u.email) INTO v_buyer_name
  FROM public.users u
  WHERE u.id = NEW.reader_id;
  
  IF v_creator_id IS NOT NULL THEN
    PERFORM public.create_notification(
      v_creator_id,
      'purchase',
      'New Purchase!',
      v_buyer_name || ' purchased access to "' || v_content_title || '"',
      NEW.content_id,
      NEW.reader_id,
      jsonb_build_object('amount_cents', NEW.amount_paid_cents, 'session_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_purchase_notify ON public.reading_sessions;
CREATE TRIGGER on_purchase_notify
  AFTER INSERT ON public.reading_sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_purchase();

-- Trigger to notify creator on new review
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_content_title text;
  v_creator_id uuid;
  v_reviewer_name text;
BEGIN
  SELECT c.title, c.creator_id INTO v_content_title, v_creator_id
  FROM public.content c
  WHERE c.id = NEW.content_id;
  
  SELECT COALESCE(u.full_name, u.email) INTO v_reviewer_name
  FROM public.users u
  WHERE u.id = NEW.reader_id;
  
  IF v_creator_id IS NOT NULL THEN
    PERFORM public.create_notification(
      v_creator_id,
      'review',
      'New Review',
      v_reviewer_name || ' left a ' || NEW.rating || '-star review on "' || v_content_title || '"',
      NEW.content_id,
      NEW.reader_id,
      jsonb_build_object('rating', NEW.rating, 'review_text', NEW.review_text)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_notify ON public.reviews;
CREATE TRIGGER on_review_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_review();

-- Trigger to notify creator on content like
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  v_content_title text;
  v_creator_id uuid;
  v_liker_name text;
BEGIN
  SELECT c.title, c.creator_id INTO v_content_title, v_creator_id
  FROM public.content c
  WHERE c.id = NEW.content_id;
  
  SELECT COALESCE(u.full_name, u.email) INTO v_liker_name
  FROM public.users u
  WHERE u.id = NEW.user_id;
  
  IF v_creator_id IS NOT NULL AND v_creator_id != NEW.user_id THEN
    PERFORM public.create_notification(
      v_creator_id,
      'like',
      'New Like',
      v_liker_name || ' liked "' || v_content_title || '"',
      NEW.content_id,
      NEW.user_id,
      '{}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_notify ON public.likes;
CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Add bio and avatar_url columns to users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_earnings_cents integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_purchases integer DEFAULT 0;
