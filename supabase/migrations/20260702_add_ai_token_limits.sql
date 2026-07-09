-- Add AI token limits and tracking for IRONFIT
-- Supports plan-based rate limiting for IA usage

-- Add token limit and usage tracking to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS ai_monthly_tokens_limit INTEGER DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS ai_tokens_used_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_tokens_reset_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Create table to track AI usage per user
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'claude-3.5-sonnet',
  request_type TEXT NOT NULL DEFAULT 'chat',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_academy_id ON public.ai_usage_logs(academy_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON public.ai_usage_logs(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs
DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Academy owners can view their students AI usage" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Admins can view all AI usage" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Service role can insert AI usage logs" ON public.ai_usage_logs;

-- Users can view their own usage logs
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Academy owners can view their students' usage logs
CREATE POLICY "Academy owners can view their students AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (
    academy_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.academies
      WHERE id = ai_usage_logs.academy_id
        AND owner_user_id = auth.uid()
    )
  );

-- Admins can view all usage logs
CREATE POLICY "Admins can view all AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (app_private.is_admin(auth.uid()));

-- Service role can insert usage logs (from Edge Functions)
CREATE POLICY "Service role can insert AI usage logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (TRUE);

-- Create function to reset monthly token usage
CREATE OR REPLACE FUNCTION public.reset_monthly_ai_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_profiles
  SET 
    ai_tokens_used_this_month = 0,
    ai_tokens_reset_at = CURRENT_TIMESTAMP
  WHERE 
    ai_tokens_reset_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    OR ai_tokens_reset_at IS NULL;
$$;

-- Create function to get user token usage
CREATE OR REPLACE FUNCTION public.get_user_ai_token_usage(p_user_id UUID)
RETURNS TABLE (
  tokens_limit INTEGER,
  tokens_used INTEGER,
  tokens_remaining INTEGER,
  reset_at TIMESTAMPTZ,
  percentage_used NUMERIC
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ai_monthly_tokens_limit,
    ai_tokens_used_this_month,
    GREATEST(0, ai_monthly_tokens_limit - ai_tokens_used_this_month),
    ai_tokens_reset_at,
    ROUND(
      CASE 
        WHEN ai_monthly_tokens_limit > 0 THEN 
          (ai_tokens_used_this_month::NUMERIC / ai_monthly_tokens_limit) * 100
        ELSE 0
      END, 
      2
    )
  FROM public.user_profiles
  WHERE user_id = p_user_id;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.reset_monthly_ai_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_ai_token_usage(UUID) TO authenticated;

-- Add comment to tables
COMMENT ON TABLE public.ai_usage_logs IS 'Tracks AI API usage per user for rate limiting and analytics';
COMMENT ON COLUMN public.user_profiles.ai_monthly_tokens_limit IS 'Maximum tokens allowed per month based on plan';
COMMENT ON COLUMN public.user_profiles.ai_tokens_used_this_month IS 'Tokens consumed in current billing period';
COMMENT ON COLUMN public.user_profiles.ai_tokens_reset_at IS 'When the monthly token counter was last reset';
