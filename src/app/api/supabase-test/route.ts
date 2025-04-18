import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Test connection to Supabase with a simple query
    const { data, error } = await supabase.from('bathrooms').select('count');
    
    if (error) {
      console.error('Supabase test API error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Supabase', 
      data,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  } catch (error) {
    console.error('Unexpected error in Supabase test API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 