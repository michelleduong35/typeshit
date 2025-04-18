import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Database = {
  public: {
    Tables: {
      bathrooms: {
        Row: {
          id: number
          name: string
          rating: number
          created_at?: string
        }
        Insert: {
          id?: number
          name: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          rating?: number
          created_at?: string
        }
      }
    }
  }
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey
      }
    }
  }
) 