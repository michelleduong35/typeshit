import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/utils/supabaseClient';
import { getAuthenticatedUser, unauthorized } from '@/utils/auth';

// GET /api/bathrooms/[id]/reviews - fetch all reviews for a bathroom
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if bathroom exists
    const { error: bathroomError } = await supabase
      .from('bathrooms')
      .select('id')
      .eq('id', id)
      .single();
    
    if (bathroomError) {
      if (bathroomError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Bathroom not found' },
          { status: 404 }
        );
      }
      
      console.error('Error checking bathroom:', bathroomError);
      return NextResponse.json(
        { error: bathroomError.message },
        { status: 500 }
      );
    }
    
    // Get reviews for this bathroom
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('bathroom_id', id)
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: reviewsError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Unexpected error in reviews GET:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/bathrooms/[id]/reviews - create a new review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Authenticate the user
  const { user, error } = await getAuthenticatedUser(req);
  
  if (error || !user) {
    return unauthorized();
  }
  
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const body = await req.json();
    
    // Validate required fields
    const { rating } = body;
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Check if bathroom exists
    const { error: bathroomError } = await supabase
      .from('bathrooms')
      .select('id')
      .eq('id', id)
      .single();
    
    if (bathroomError) {
      if (bathroomError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Bathroom not found' },
          { status: 404 }
        );
      }
      
      console.error('Error checking bathroom:', bathroomError);
      return NextResponse.json(
        { error: bathroomError.message },
        { status: 500 }
      );
    }
    
    // Create new review
    const { data, error: createError } = await supabase
      .from('reviews')
      .insert([
        {
          bathroom_id: id,
          user_id: user.id,
          rating,
          comment: body.comment || null
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating review:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { review: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in review POST:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 