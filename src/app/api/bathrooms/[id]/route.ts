import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/utils/supabaseClient';

// GET /api/bathrooms/[id] - get bathroom by ID with images and ratings
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get bathroom details
    const { data: bathroom, error: bathroomError } = await supabase
      .from('bathrooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (bathroomError) {
      if (bathroomError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Bathroom not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching bathroom:', bathroomError);
      return NextResponse.json(
        { error: bathroomError.message },
        { status: 500 }
      );
    }
    
    // Get images for this bathroom
    const { data: images, error: imagesError } = await supabase
      .from('bathroom_images')
      .select('*')
      .eq('bathroom_id', id);
      
    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      // Continue - we'll return bathroom with empty images array
    }
    
    // Get average rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('bathroom_id', id);
    
    if (ratingError) {
      console.error('Error fetching ratings:', ratingError);
      // Continue - we'll return bathroom with null averageRating
    }
    
    // Calculate average rating
    let averageRating = null;
    if (ratingData && ratingData.length > 0) {
      const sum = ratingData.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / ratingData.length;
    }
    
    // Return combined bathroom data
    return NextResponse.json({
      bathroom,
      images: images || [],
      reviewCount: ratingData?.length || 0,
      averageRating
    });
  } catch (error) {
    console.error('Unexpected error in bathroom GET:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 