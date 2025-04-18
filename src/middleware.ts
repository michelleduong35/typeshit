import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Check if the user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If trying to access admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Not logged in - redirect to login
    if (!session) {
      const redirectUrl = new URL('/auth', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    // Not an admin - redirect to home
    if (!profile?.is_admin) {
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Match all request paths except for static files, api routes, and _next
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 