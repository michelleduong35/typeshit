import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/utils/supabaseClient';
import { getAuthenticatedUser, isAdmin, unauthorized, forbidden } from '@/utils/auth';

// PATCH /api/bathrooms/[id]/approve - update bathroom status to 'approved'
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Authenticate the user
  const { user, error } = await getAuthenticatedUser(req);
  
  if (error || !user) {
    return unauthorized();
  }
  
  // Check if user is admin
  const admin = await isAdmin(user.id);
  if (!admin) {
    return forbidden();
  }
  
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // First check if bathroom exists
    const { data: bathroom, error: checkError } = await supabase
      .from('bathrooms')
      .select('id, status')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Bathroom not found' },
          { status: 404 }
        );
      }
      
      console.error('Error checking bathroom:', checkError);
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }
    
    // If already approved, don't update
    if (bathroom.status === 'approved') {
      return NextResponse.json({ 
        message: 'Bathroom already approved',
        bathroom
      });
    }
    
    // Update the bathroom status to 'approved'
    const { data, error: updateError } = await supabase
      .from('bathrooms')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error approving bathroom:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Bathroom approved successfully',
      bathroom: data
    });
  } catch (error) {
    console.error('Unexpected error in bathroom approval:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 