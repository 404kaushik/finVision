import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const supabase = createClient()

    try {
      const { error } = await (await supabase).auth.verifyOtp({
        type,
        token_hash,
      })

      if (!error) {
        redirectTo.searchParams.delete('next')
        return NextResponse.redirect(redirectTo)
      }

      // Handle specific error cases
      if (error.message.includes('expired')) {
        redirectTo.pathname = '/error'
        redirectTo.searchParams.set('error', 'Link expired. Please request a new one.')
        return NextResponse.redirect(redirectTo)
      }

      if (error.message.includes('invalid')) {
        redirectTo.pathname = '/error'
        redirectTo.searchParams.set('error', 'Invalid link. Please try again.')
        return NextResponse.redirect(redirectTo)
      }
    } catch (error) {
      redirectTo.pathname = '/error'
      redirectTo.searchParams.set('error', 'An unexpected error occurred.')
      return NextResponse.redirect(redirectTo)
    }
  }

  // Invalid or missing parameters
  redirectTo.pathname = '/error'
  redirectTo.searchParams.set('error', 'Invalid confirmation link.')
  return NextResponse.redirect(redirectTo)
}