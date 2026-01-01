-- SuperAdmin Schema and User Tracking

-- Update users table to include superadmin role
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'reader' CHECK (role IN ('reader', 'creator', 'admin', 'superadmin'));

-- Create user activity tracking table
CREATE TABLE IF NOT EXISTS public.user_activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type text NOT NULL CHECK (activity_type IN ('login', 'logout', 'content_view', 'content_create', 'content_purchase', 'profile_update')),
    metadata jsonb DEFAULT '{}',
    ip_address text,
    user_agent text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create platform statistics table for admin dashboard
CREATE TABLE IF NOT EXISTS public.platform_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    total_users integer DEFAULT 0,
    total_creators integer DEFAULT 0,
    total_readers integer DEFAULT 0,
    total_content integer DEFAULT 0,
    total_sessions integer DEFAULT 0,
    total_revenue_cents integer DEFAULT 0,
    new_users_today integer DEFAULT 0,
    new_content_today integer DEFAULT 0,
    active_sessions_today integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create admin audit log for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    old_value jsonb,
    new_value jsonb,
    reason text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create reports table for content/user reporting
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_type text NOT NULL CHECK (reported_type IN ('content', 'user', 'review')),
    reported_id uuid NOT NULL,
    reason text NOT NULL,
    details text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON public.user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Function to update platform stats
CREATE OR REPLACE FUNCTION public.update_platform_stats()
RETURNS void AS $$
DECLARE
    today_date date := CURRENT_DATE;
BEGIN
    INSERT INTO public.platform_stats (stat_date, total_users, total_creators, total_readers, total_content, total_sessions, total_revenue_cents, new_users_today, new_content_today, active_sessions_today)
    SELECT 
        today_date,
        (SELECT COUNT(*) FROM public.users),
        (SELECT COUNT(*) FROM public.users WHERE role = 'creator'),
        (SELECT COUNT(*) FROM public.users WHERE role = 'reader'),
        (SELECT COUNT(*) FROM public.content),
        (SELECT COUNT(*) FROM public.reading_sessions),
        (SELECT COALESCE(SUM(total_earnings_cents), 0) FROM public.content),
        (SELECT COUNT(*) FROM public.users WHERE DATE(created_at) = today_date),
        (SELECT COUNT(*) FROM public.content WHERE DATE(created_at) = today_date),
        (SELECT COUNT(*) FROM public.reading_sessions WHERE DATE(created_at) = today_date)
    ON CONFLICT (stat_date) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        total_creators = EXCLUDED.total_creators,
        total_readers = EXCLUDED.total_readers,
        total_content = EXCLUDED.total_content,
        total_sessions = EXCLUDED.total_sessions,
        total_revenue_cents = EXCLUDED.total_revenue_cents,
        new_users_today = EXCLUDED.new_users_today,
        new_content_today = EXCLUDED.new_content_today,
        active_sessions_today = EXCLUDED.active_sessions_today,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id uuid,
    p_activity_type text,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_activity (user_id, activity_type, metadata)
    VALUES (p_user_id, p_activity_type, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_uuid uuid)
RETURNS boolean AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE id = user_uuid AND role = 'superadmin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user is admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.users 
        WHERE id = user_uuid AND role IN ('admin', 'superadmin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Row Level Security Policies

-- Enable RLS on new tables
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- User activity policies
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

-- Platform stats policies
CREATE POLICY "Admins can view platform stats" ON public.platform_stats
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can manage platform stats" ON public.platform_stats
    FOR ALL USING (true);

-- Admin audit log policies
CREATE POLICY "Superadmins can view audit log" ON public.admin_audit_log
    FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Reports policies
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reports" ON public.reports
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Add thumbnail generation trigger for content
CREATE OR REPLACE FUNCTION public.set_default_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.thumbnail_url IS NULL THEN
        NEW.thumbnail_url := 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_default_thumbnail_trigger ON public.content;
CREATE TRIGGER set_default_thumbnail_trigger
    BEFORE INSERT ON public.content
    FOR EACH ROW EXECUTE FUNCTION public.set_default_thumbnail();
