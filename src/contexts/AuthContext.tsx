'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import { syncUserProfile } from '@/utils/profileSync'

// Define the profile type based on the schema
type Profile = {
  id: string
  is_admin: boolean
  full_name: string | null
}

// Define the context type
type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isAuthenticated: false,
  isAdmin: false,
})

// Export the useAuth hook
export const useAuth = () => useContext(AuthContext)

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Function to handle sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase.auth.token')
    setUser(null)
    setSession(null)
    setProfile(null)
    router.push('/')
  }

  // Fetch and sync user profile
  const handleUserChanged = async (newUser: User | null) => {
    if (newUser) {
      // Sync profile and fetch the result
      const userProfile = await syncUserProfile(newUser)
      setProfile(userProfile)
    } else {
      setProfile(null)
    }
  }

  // Check for session on initial load and set up auth listener
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Save the token for API calls
          localStorage.setItem('supabase.auth.token', initialSession.access_token)
          
          // Sync the user profile
          await handleUserChanged(initialSession.user)
        }

        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            setSession(newSession)
            const newUser = newSession?.user || null
            setUser(newUser)

            if (newSession) {
              localStorage.setItem('supabase.auth.token', newSession.access_token)
              // Sync profile on auth events
              await handleUserChanged(newUser)
            } else {
              localStorage.removeItem('supabase.auth.token')
              setProfile(null)
            }
          }
        )

        setLoading(false)
        
        // Clean up the subscription
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Handle redirects based on auth state
  useEffect(() => {
    if (loading) return

    // If authenticated and on auth page, redirect to home
    if (session && pathname === '/auth') {
      router.push('/')
    }
  }, [session, loading, pathname, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        isAuthenticated: !!session,
        isAdmin: !!profile?.is_admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 