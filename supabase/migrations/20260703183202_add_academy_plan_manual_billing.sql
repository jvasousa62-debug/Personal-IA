-- Manual billing: the admin chooses the plan directly on each academy.
ALTER TABLE public.academies
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'basic';

ALTER TABLE public.academies DROP CONSTRAINT IF EXISTS academies_plan_check;
ALTER TABLE public.academies
  ADD CONSTRAINT academies_plan_check
  CHECK (plan IN ('basic', 'pro', 'premium', 'enterprise'));

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_plan_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_plan_check
  CHECK (plan IN ('free', 'basic', 'pro', 'premium', 'enterprise'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('basic', 'pro', 'premium', 'enterprise'));

CREATE INDEX IF NOT EXISTS idx_academies_plan ON public.academies(plan);

CREATE OR REPLACE FUNCTION app_private.ai_token_limit_for_plan(plan_name TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE LOWER(COALESCE(plan_name, 'basic'))
    WHEN 'enterprise' THEN 300000
    WHEN 'premium' THEN 75000
    WHEN 'pro' THEN 20000
    ELSE 5000
  END;
$$;

REVOKE ALL ON FUNCTION app_private.ai_token_limit_for_plan(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.ai_token_limit_for_plan(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  academy_code_input TEXT;
  matched_academy public.academies%ROWTYPE;
  active_students INTEGER := 0;
  profile_name TEXT;
  profile_plan TEXT := 'basic';
BEGIN
  profile_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );

  academy_code_input := NULLIF(UPPER(BTRIM(COALESCE(
    NEW.raw_user_meta_data ->> 'academy_code',
    NEW.raw_user_meta_data ->> 'academyCode',
    ''
  ))), '');

  IF academy_code_input IS NOT NULL THEN
    SELECT *
    INTO matched_academy
    FROM public.academies
    WHERE UPPER(access_code) = academy_code_input
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Codigo de academia nao encontrado.';
    END IF;

    IF matched_academy.status <> 'active' THEN
      RAISE EXCEPTION 'Esta academia nao esta ativa. Fale com o responsavel.';
    END IF;

    SELECT COUNT(*)
    INTO active_students
    FROM public.user_profiles
    WHERE academy_id = matched_academy.id
      AND account_status = 'active';

    IF matched_academy.student_limit IS NOT NULL
       AND active_students >= matched_academy.student_limit THEN
      RAISE EXCEPTION 'Esta academia atingiu o limite de alunos.';
    END IF;

    profile_plan := COALESCE(matched_academy.plan, 'basic');
  END IF;

  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    academy_id,
    role,
    account_status,
    plan,
    ai_monthly_tokens_limit,
    ai_tokens_used_this_month,
    ai_tokens_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    profile_name,
    CASE WHEN academy_code_input IS NULL THEN NULL ELSE matched_academy.id END,
    'member',
    'active',
    profile_plan,
    app_private.ai_token_limit_for_plan(profile_plan),
    0,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name),
    academy_id = COALESCE(public.user_profiles.academy_id, EXCLUDED.academy_id),
    plan = CASE
      WHEN public.user_profiles.academy_id IS NULL THEN EXCLUDED.plan
      ELSE public.user_profiles.plan
    END,
    ai_monthly_tokens_limit = CASE
      WHEN public.user_profiles.academy_id IS NULL THEN EXCLUDED.ai_monthly_tokens_limit
      ELSE public.user_profiles.ai_monthly_tokens_limit
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Keep existing academy users aligned with the academy's selected manual plan.
ALTER TABLE public.user_profiles DISABLE TRIGGER protect_user_profile_admin_fields;

UPDATE public.user_profiles profile
SET
  plan = academy.plan,
  ai_monthly_tokens_limit = app_private.ai_token_limit_for_plan(academy.plan),
  updated_at = NOW()
FROM public.academies academy
WHERE profile.academy_id = academy.id
  AND profile.role = 'member'
  AND profile.account_status <> 'deleted';

ALTER TABLE public.user_profiles ENABLE TRIGGER protect_user_profile_admin_fields;
