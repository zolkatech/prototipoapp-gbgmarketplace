import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmSignupEmail } from './_templates/confirm-signup.tsx'
import { MagicLinkEmail } from './_templates/magic-link.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
        token_new: string
        token_hash_new: string
      }
    }

    let html: string
    let subject: string
    let templateProps = {
      supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
      token,
      token_hash,
      redirect_to,
      email_action_type,
      user_email: user.email,
    }

    // Determine which template to use based on email action type
    if (email_action_type === 'signup') {
      html = await renderAsync(
        React.createElement(ConfirmSignupEmail, templateProps)
      )
      subject = '🐎 Confirme seu cadastro no Marketplace Equino'
    } else if (email_action_type === 'magiclink') {
      html = await renderAsync(
        React.createElement(MagicLinkEmail, templateProps)
      )
      subject = '🔐 Acesse sua conta no Marketplace Equino'
    } else {
      // Default template for other types
      html = await renderAsync(
        React.createElement(ConfirmSignupEmail, templateProps)
      )
      subject = '📧 Marketplace Equino - Ação necessária'
    }

    const { error } = await resend.emails.send({
      from: 'Marketplace Equino <onboarding@resend.dev>',
      to: [user.email],
      subject,
      html,
    })
    
    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log(`Email sent successfully to ${user.email} for action: ${email_action_type}`)
    
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: responseHeaders,
  })
})