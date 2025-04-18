import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './supabaseClient';

// Verify if a user is authenticated
export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  // Check for auth header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized: No token provided', status: 401 };
  }
  
  try {
    // Create server supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Verify the token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, error: 'Unauthorized: Invalid token', status: 401 };
    }
    
    return { user, error: null, status: 200 };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, error: 'Server error during authentication', status: 500 };
  }
}

// Check if the user is an admin
export async function isAdmin(userId: string) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.is_admin;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Helper function to return unauthorized response
export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// Helper function to return forbidden response
export function forbidden() {
  return NextResponse.json(
    { error: 'Forbidden: Admin access required' },
    { status: 403 }
  );
} 