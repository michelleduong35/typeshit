import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/utils/supabaseClient';
import { getAuthenticatedUser, unauthorized } from '@/utils/auth';

// GET /api/bathrooms/[id]/images - fetch all images for a bathroom
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
    
    // Get images for this bathroom
    const { data: images, error: imagesError } = await supabase
      .from('bathroom_images')
      .select('*')
      .eq('bathroom_id', id)
      .order('created_at', { ascending: false });
    
    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      return NextResponse.json(
        { error: imagesError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ images: images || [] });
  } catch (error) {
    console.error('Unexpected error in images GET:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/bathrooms/[id]/images - create a new image
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
    const { url } = body;
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
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
    
    // Create new image
    const { data, error: createError } = await supabase
      .from('bathroom_images')
      .insert([
        {
          bathroom_id: id,
          url,
          caption: body.caption || null,
          uploaded_by: user.id
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating image record:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { image: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in image POST:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 