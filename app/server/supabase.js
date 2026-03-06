import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing. Check your environment variables.')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')
