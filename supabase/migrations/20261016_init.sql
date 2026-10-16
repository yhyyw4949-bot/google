-- Migration: 20261016_init.sql
-- Complete Supabase Schema for Google AI Pro Subscription Store

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 2500 CHECK (price_cents >= 0), -- e.g. 2500 = 25.00 EGP
  currency TEXT NOT NULL DEFAULT 'EGP',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  duration_ar TEXT NOT NULL,
  duration_en TEXT NOT NULL,
  delivery_target_mins INTEGER NOT NULL DEFAULT 5,
  disclaimer_ar TEXT NOT NULL,
  disclaimer_en TEXT NOT NULL,
  feature_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PAYMENT METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  account_identifier TEXT NOT NULL,
  instructions_ar TEXT NOT NULL,
  instructions_en TEXT NOT NULL,
  qr_code_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, -- Formatted: GAP-YYYYMMDD-XXXX
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_method_id TEXT REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  payment_method_name TEXT,
  payment_status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (
    payment_status IN ('awaiting_payment', 'receipt_submitted', 'under_review', 'approved', 'rejected', 'more_info_required')
  ),
  fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    fulfillment_status IN ('pending', 'processing', 'invitation_sent', 'completed', 'cancelled', 'refunded')
  ),
  rejection_reason TEXT,
  invitation_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  actual_dispatch_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. PAYMENT PROOFS (RECEIPTS)
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  transaction_reference TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'superseded')),
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_timestamp TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_order_id ON public.payment_proofs(order_id);

-- 6. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_payment_status TEXT NOT NULL,
  new_payment_status TEXT NOT NULL,
  previous_fulfillment_status TEXT NOT NULL,
  new_fulfillment_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_status_history_order_id ON public.order_status_history(order_id);

-- 7. ADMIN NOTES
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  note TEXT NOT NULL,
  is_internal_only BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_order_id ON public.admin_notes(order_id);

-- 8. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 9. EMAIL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  template_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_order_id ON public.email_notifications(order_id);

-- 10. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_name_ar TEXT NOT NULL DEFAULT 'متجر Google AI Pro',
  brand_name_en TEXT NOT NULL DEFAULT 'Google AI Pro Store',
  logo_url TEXT,
  contact_email TEXT NOT NULL DEFAULT 'support@googleaipro.eg',
  support_phone TEXT NOT NULL DEFAULT '+20 100 000 0000',
  whatsapp_number TEXT NOT NULL DEFAULT '+20 100 000 0000',
  announcement_ar TEXT NOT NULL DEFAULT 'مرحباً بكم في المتجر الرسمي المستقل لتوفير دعوات Google AI Pro في مصر.',
  announcement_en TEXT NOT NULL DEFAULT 'Welcome to the independent store for Google AI Pro invitations in Egypt.',
  is_announcement_active BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Products & Payment Methods: Publicly readable for active items
CREATE POLICY "Public products readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public payment methods readable" ON public.payment_methods FOR SELECT USING (is_enabled = true);
CREATE POLICY "Public site settings readable" ON public.site_settings FOR SELECT USING (true);

-- Customer orders isolation: Customer can view their own orders
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Customers can view their own proofs
CREATE POLICY "Customers can view their own proofs" ON public.payment_proofs FOR SELECT USING (
  order_id IN (
    SELECT id FROM public.orders WHERE customer_id = auth.uid() OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);

-- Admin Full Access Policy helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_suspended = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "Admins full access orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access proofs" ON public.payment_proofs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access history" ON public.order_status_history FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access notes" ON public.admin_notes FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access audit" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access emails" ON public.email_notifications FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Admins full access payment_methods" ON public.payment_methods FOR ALL USING (public.is_admin());
