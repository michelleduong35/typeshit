import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

/**
 * Creates or updates a profile for a Supabase auth user
 * Ensures every authenticated user has a corresponding profile entry
 */
export async function syncUserProfile(user: User) {
  if (!user) return null;

  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows returned - expected if profile doesn't exist yet
      console.error('Error checking for existing profile:', fetchError);
      return null;
    }

    // If profile exists, no need to create it
    if (existingProfile) {
      return existingProfile;
    }

    // Create profile if it doesn't exist
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          is_admin: false, // New users are not admins by default
          full_name: user.user_metadata?.full_name || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
}

/**
 * Gets a user's profile
 */
export async function getUserProfile(userId: string) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
} 