-- Admin area data model for IRONFIT.
-- Apply this migration, then promote the first owner manually, for example:
-- update public.user_profiles set role = 'admin' where email = 'voce@exemplo.com';

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;

CREATE TABLE IF NOT EXISTS public.academies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  access_code TEXT NOT NULL UNIQUE,
  student_limit INTEGER NOT NULL DEFAULT 100,
  validity_months INTEGER NOT NULL DEFAULT 12,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (status IN ('active', 'suspended', 'expired')),
  CHECK (student_limit >= 0),
  CHECK (validity_months > 0)
);

CREATE INDEX IF NOT EXISTS idx_academies_status ON public.academies(status);
CREATE INDEX IF NOT EXISTS idx_academies_access_code ON public.academies(access_code);

ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_role_check'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('member', 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_account_status_check'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_account_status_check CHECK (account_status IN ('active', 'blocked', 'deleted'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_plan_check'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_plan_check CHECK (plan IN ('free', 'basic', 'pro', 'enterprise'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_academy_id ON public.user_profiles(academy_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL DEFAULT 'basic',
  monthly_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (status IN ('active', 'canceled', 'past_due')),
  CHECK (plan IN ('basic', 'pro', 'enterprise')),
  CHECK (monthly_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_academy_id ON public.subscriptions(academy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_private.is_admin(check_user UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = check_user
      AND role = 'admin'
      AND account_status = 'active'
      AND deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION app_private.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.is_admin(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION app_private.guard_user_profile_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(app_private.is_admin(auth.uid()), FALSE) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'member';
    NEW.account_status := COALESCE(NEW.account_status, 'active');
    NEW.plan := COALESCE(NEW.plan, 'free');
    NEW.blocked_at := NULL;
    NEW.deleted_at := NULL;
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  NEW.account_status := OLD.account_status;
  NEW.plan := OLD.plan;
  NEW.academy_id := OLD.academy_id;
  NEW.blocked_at := OLD.blocked_at;
  NEW.deleted_at := OLD.deleted_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_profile_admin_fields ON public.user_profiles;
CREATE TRIGGER protect_user_profile_admin_fields
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app_private.guard_user_profile_admin_fields();

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app_private.handle_new_user();

UPDATE public.user_profiles profile
SET
  email = auth_user.email,
  full_name = COALESCE(
    profile.full_name,
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    split_part(auth_user.email, '@', 1)
  )
FROM auth.users auth_user
WHERE profile.user_id = auth_user.id;

DROP POLICY IF EXISTS "Users can select their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

CREATE POLICY "Users can select their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id AND account_status <> 'deleted');

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id AND account_status = 'active')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can select all profiles"
  ON public.user_profiles FOR SELECT
  USING (app_private.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (app_private.is_admin(auth.uid()))
  WITH CHECK (app_private.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (app_private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage academies" ON public.academies;
DROP POLICY IF EXISTS "Authenticated users can read their academy" ON public.academies;

CREATE POLICY "Admins can manage academies"
  ON public.academies FOR ALL
  USING (app_private.is_admin(auth.uid()))
  WITH CHECK (app_private.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read their academy"
  ON public.academies FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.academy_id = academies.id
        AND user_profiles.account_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can select their own subscriptions" ON public.subscriptions;

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (app_private.is_admin(auth.uid()))
  WITH CHECK (app_private.is_admin(auth.uid()));

CREATE POLICY "Users can select their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can select all chat messages" ON public.chat_messages;
CREATE POLICY "Admins can select all chat messages"
  ON public.chat_messages FOR SELECT
  USING (app_private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can select all body metrics" ON public.body_metrics;
CREATE POLICY "Admins can select all body metrics"
  ON public.body_metrics FOR SELECT
  USING (app_private.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.academies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
