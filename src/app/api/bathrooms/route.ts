import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/utils/supabaseClient';
import { getAuthenticatedUser, unauthorized } from '@/utils/auth';

// GET /api/bathrooms - fetch all approved bathrooms
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get bathrooms with status = 'approved'
    const { data, error } = await supabase
      .from('bathrooms')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bathrooms:', error);
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ bathrooms: data });
  } catch (error) {
    console.error('Unexpected error in bathrooms GET:', error);
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    );
  }
}

// POST /api/bathrooms - create a new bathroom
export async function POST(req: NextRequest) {
  // Authenticate the user
  const { user, error } = await getAuthenticatedUser(req);
  
  if (error || !user) {
    return unauthorized();
  }
  
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await req.json();
    
    // Validate required fields
    const { name, building, address } = body;
    if (!name || !building || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, building, and address are required' },
        { status: 400 }
      );
    }
    
    // Create new bathroom with status 'pending'
    const { data, error } = await supabase
      .from('bathrooms')
      .insert([
        {
          name,
          building,
          address,
          floor: body.floor || null,
          directions: body.directions || null,
          status: 'pending',
          created_by: user.id,
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating bathroom:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { bathroom: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in bathrooms POST:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 