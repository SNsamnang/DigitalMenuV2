import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qolchjbwpywbqssounnx.supabase.co"; // Replace with your Supabase URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGNoamJ3cHl3YnFzc291bm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMDM2MzksImV4cCI6MjA1NzU3OTYzOX0.bU7UKxaX_-aT2Aif5E4-4n5_Z59MlMAC2ExVIPzQ3eE"; // Replace with your Supabase API Key

const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGNoamJ3cHl3YnFzc291bm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjAwMzYzOSwiZXhwIjoyMDU3NTc5NjM5fQ.y6lrOO9qBhDCe9uUJ8TLisYarI1wPzUNqy4I0nBrPbY"; // Replace with your Supabase Service Role Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);
