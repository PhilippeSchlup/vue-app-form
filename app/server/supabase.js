import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
// Use SERVICE_ROLE_KEY for backend operations to bypass RLS, fallback to ANON_KEY
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing. Check your environment variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')
