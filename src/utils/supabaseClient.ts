import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Database = {
  public: {
    Tables: {
      bathrooms: {
        Row: {
          id: string
          name: string
          building: string
          address: string
          floor: string | null
          directions: string | null
          status: 'pending' | 'approved'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          building: string
          address: string
          floor?: string | null
          directions?: string | null
          status?: 'pending' | 'approved'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          building?: string
          address?: string
          floor?: string | null
          directions?: string | null
          status?: 'pending' | 'approved'
          created_by?: string
          created_at?: string
        }
      },
      bathroom_images: {
        Row: {
          id: string
          bathroom_id: string
          url: string
          caption: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          bathroom_id: string
          url: string
          caption?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          bathroom_id?: string
          url?: string
          caption?: string | null
          uploaded_by?: string
          created_at?: string
        }
      },
      reviews: {
        Row: {
          id: string
          bathroom_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bathroom_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bathroom_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      },
      profiles: {
        Row: {
          id: string
          is_admin: boolean
          full_name: string | null
        }
        Insert: {
          id: string
          is_admin?: boolean
          full_name?: string | null
        }
        Update: {
          id?: string
          is_admin?: boolean
          full_name?: string | null
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