import { createClient } from '@supabase/supabase-js'

// TODO define type for env variables?
export const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_KEY,
)
