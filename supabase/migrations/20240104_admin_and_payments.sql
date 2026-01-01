-- Payment Gateway Settings Table
CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_id text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  public_key text,
  webhook_secret text,
  test_mode boolean DEFAULT true,
  supported_currencies text[] DEFAULT ARRAY['USD'],
  min_amount_cents integer DEFAULT 100,
  max_amount_cents integer DEFAULT 10000000,
  fee_percentage numeric(5,2) DEFAULT 2.9,
  fee_fixed_cents integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  gateway_id text NOT NULL,
  external_id text,
  amount_cents integer NOT NULL,
  fee_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_type text DEFAULT 'purchase' CHECK (transaction_type IN ('purchase', 'download', 'subscription', 'payout')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  completed_at timestamp with time zone
);

-- Device Fingerprints Table
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  device_name text,
  last_seen timestamp with time zone DEFAULT timezone('utc', now()),
  is_trusted boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(user_id, fingerprint)
);

-- Download Records Table (for protected downloads)
CREATE TABLE IF NOT EXISTS public.download_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES public.content(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  encryption_key_hash text NOT NULL,
  download_count integer DEFAULT 1,
  max_downloads integer DEFAULT 3,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  last_download_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions jsonb DEFAULT '["read"]',
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  created_by uuid REFERENCES auth.users(id)
);

-- Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert default gateway settings
INSERT INTO public.payment_gateway_settings (gateway_id, is_enabled, fee_percentage, fee_fixed_cents) VALUES
  ('stripe', false, 2.9, 30),
  ('paystack', false, 1.5, 100),
  ('flutterwave', false, 1.4, 0),
  ('alipay', false, 2.2, 0),
  ('momo', false, 1.0, 0),
  ('manual', true, 0, 0)
ON CONFLICT (gateway_id) DO NOTHING;

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('content_protection', '{"copy_protection": true, "screenshot_blur": true, "device_binding": true, "pdf_encryption": true}', 'Content protection settings'),
  ('session_settings', '{"timeout_minutes": 30, "max_extensions": 3}', 'Reading session settings'),
  ('download_settings', '{"max_downloads_per_purchase": 3, "expire_days": 30}', 'Download limit settings')
ON CONFLICT (key) DO NOTHING;

-- RLS Policies
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Payment Gateway Settings: Only admins can view/modify
CREATE POLICY "Admins can manage gateway settings"
  ON public.payment_gateway_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Allow all users to view enabled gateways
CREATE POLICY "Users can view enabled gateways"
  ON public.payment_gateway_settings FOR SELECT
  USING (is_enabled = true);

-- Payment Transactions: Users can view their own
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Device Fingerprints: Users can manage their own
CREATE POLICY "Users can manage own devices"
  ON public.device_fingerprints FOR ALL
  USING (user_id = auth.uid());

-- Download Records: Users can manage their own
CREATE POLICY "Users can view own downloads"
  ON public.download_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create downloads"
  ON public.download_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admin Users: Only super admins can manage
CREATE POLICY "Super admins can manage admins"
  ON public.admin_users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin'));

-- Platform Settings: Admins can read, super admins can modify
CREATE POLICY "Admins can view settings"
  ON public.platform_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'super_admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_content ON public.payment_transactions(content_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_fingerprints_user ON public.device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.download_records(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_content ON public.download_records(content_id);
