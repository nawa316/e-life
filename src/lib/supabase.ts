import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://psfnjihjfmlwcyawyiwh.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZm5qaWhqZm1sd2N5YXd5aXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUzOTcsImV4cCI6MjEwNDA4MTM5N30.fhdylmlpmxfBDM3kQcs4jFumHTE6YDGlwpiSZmRy9GU";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key-here"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
