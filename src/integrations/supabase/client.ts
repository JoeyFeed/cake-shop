import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nccaqtilctwygxwmugmo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tjho-TWdnukZ9-nAQYmuKg_rKaxkq8c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
