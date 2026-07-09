-- Validate academy access codes during Auth signup without exposing academies to anon.
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
    'basic',
    5000,
    0,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name),
    academy_id = COALESCE(public.user_profiles.academy_id, EXCLUDED.academy_id),
    updated_at = NOW();

  RETURN NEW;
END;
$$;
