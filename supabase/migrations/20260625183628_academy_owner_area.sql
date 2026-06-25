-- Academy owner area for IRONFIT.
-- Owners are regular authenticated users with:
--   user_profiles.role = 'academy_owner'
--   academies.owner_user_id = user_profiles.user_id

ALTER TABLE public.academies
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_academies_owner_user_id ON public.academies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_at ON public.subscriptions(next_billing_at);

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('member', 'admin', 'academy_owner'));

CREATE TABLE IF NOT EXISTS public.academy_workout_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'workout_completed',
  title TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (event_type IN ('workout_completed', 'checkin'))
);

CREATE INDEX IF NOT EXISTS idx_academy_workout_events_academy_id
  ON public.academy_workout_events(academy_id);

CREATE INDEX IF NOT EXISTS idx_academy_workout_events_user_id
  ON public.academy_workout_events(user_id);

CREATE INDEX IF NOT EXISTS idx_academy_workout_events_occurred_at
  ON public.academy_workout_events(occurred_at DESC);

ALTER TABLE public.academy_workout_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_private.owns_academy(check_user UUID, check_academy UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.academies
    WHERE id = check_academy
      AND owner_user_id = check_user
      AND status <> 'expired'
  );
$$;

REVOKE ALL ON FUNCTION app_private.owns_academy(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.owns_academy(UUID, UUID) TO authenticated;

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

  IF auth.uid() = OLD.user_id THEN
    NEW.role := OLD.role;
    NEW.account_status := OLD.account_status;
    NEW.plan := OLD.plan;
    NEW.academy_id := OLD.academy_id;
    NEW.blocked_at := OLD.blocked_at;
    NEW.deleted_at := OLD.deleted_at;
    RETURN NEW;
  END IF;

  IF COALESCE(app_private.owns_academy(auth.uid(), OLD.academy_id), FALSE)
     AND NEW.academy_id IS NULL THEN
    NEW.full_name := OLD.full_name;
    NEW.height := OLD.height;
    NEW.weight := OLD.weight;
    NEW.age := OLD.age;
    NEW.gender := OLD.gender;
    NEW.goal := OLD.goal;
    NEW.experience_level := OLD.experience_level;
    NEW.weekly_frequency := OLD.weekly_frequency;
    NEW.chest := OLD.chest;
    NEW.waist := OLD.waist;
    NEW.hip := OLD.hip;
    NEW.arm_r := OLD.arm_r;
    NEW.arm_l := OLD.arm_l;
    NEW.thigh_r := OLD.thigh_r;
    NEW.thigh_l := OLD.thigh_l;
    NEW.calf := OLD.calf;
    NEW.notifications := OLD.notifications;
    NEW.share_progress := OLD.share_progress;
    NEW.email := OLD.email;
    NEW.role := OLD.role;
    NEW.account_status := OLD.account_status;
    NEW.plan := OLD.plan;
    NEW.blocked_at := OLD.blocked_at;
    NEW.deleted_at := OLD.deleted_at;
    NEW.last_seen_at := OLD.last_seen_at;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'not allowed to update this profile';
END;
$$;

DROP POLICY IF EXISTS "Academy owners can select their academy" ON public.academies;
DROP POLICY IF EXISTS "Academy owners can update their academy" ON public.academies;

CREATE POLICY "Academy owners can select their academy"
  ON public.academies FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Academy owners can update their academy"
  ON public.academies FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Academy owners can select their students" ON public.user_profiles;
DROP POLICY IF EXISTS "Academy owners can remove their students" ON public.user_profiles;

CREATE POLICY "Academy owners can select their students"
  ON public.user_profiles FOR SELECT
  USING (
    academy_id IS NOT NULL
    AND app_private.owns_academy(auth.uid(), academy_id)
  );

CREATE POLICY "Academy owners can remove their students"
  ON public.user_profiles FOR UPDATE
  USING (
    academy_id IS NOT NULL
    AND app_private.owns_academy(auth.uid(), academy_id)
  )
  WITH CHECK (academy_id IS NULL);

DROP POLICY IF EXISTS "Academy owners can select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Academy owners can update subscriptions" ON public.subscriptions;

CREATE POLICY "Academy owners can select subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    academy_id IS NOT NULL
    AND app_private.owns_academy(auth.uid(), academy_id)
  );

CREATE POLICY "Academy owners can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (
    academy_id IS NOT NULL
    AND app_private.owns_academy(auth.uid(), academy_id)
  )
  WITH CHECK (
    academy_id IS NOT NULL
    AND app_private.owns_academy(auth.uid(), academy_id)
  );

DROP POLICY IF EXISTS "Users can insert their workout events" ON public.academy_workout_events;
DROP POLICY IF EXISTS "Users can select their workout events" ON public.academy_workout_events;
DROP POLICY IF EXISTS "Academy owners can select workout events" ON public.academy_workout_events;
DROP POLICY IF EXISTS "Admins can select all workout events" ON public.academy_workout_events;

CREATE POLICY "Users can insert their workout events"
  ON public.academy_workout_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.academy_id = academy_workout_events.academy_id
        AND user_profiles.account_status = 'active'
    )
  );

CREATE POLICY "Users can select their workout events"
  ON public.academy_workout_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Academy owners can select workout events"
  ON public.academy_workout_events FOR SELECT
  USING (app_private.owns_academy(auth.uid(), academy_id));

CREATE POLICY "Admins can select all workout events"
  ON public.academy_workout_events FOR SELECT
  USING (app_private.is_admin(auth.uid()));

GRANT SELECT, INSERT ON public.academy_workout_events TO authenticated;
