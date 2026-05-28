import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Rebeca Learning <noreply@rebecalearning.com.br>'

const subjects: Record<string, string> = {
  new_exercise: '📚 Novo exercício disponível',
  submission_received: '📬 Aluno enviou uma resposta',
  feedback_received: '✅ Feedback da professora',
}

function emailHtml(title: string, body: string, link: string, linkLabel: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;background:#f8fafc;margin:0;padding:32px 16px">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#4f46e5;color:#fff;padding:8px 16px;border-radius:12px;font-weight:600;font-size:14px">
            Rebeca Learning
          </div>
        </div>
        <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px">${title}</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px">${body}</p>
        <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">
          ${linkLabel}
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0">Rebeca Learning · Você recebeu este e-mail porque tem uma conta na plataforma.</p>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, recipientId, title, body, link } = await request.json() as {
    type: string
    recipientId: string
    title: string
    body: string
    link: string
  }

  // Create in-app notification
  await supabase.from('notifications').insert({ user_id: recipientId, type, title, body, link })

  // Send email if Resend is configured
  if (resend) {
    const { data: recipient } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', recipientId)
      .single()

    if (recipient?.email) {
      const linkLabel = type === 'new_exercise' ? 'Ver exercício'
        : type === 'submission_received' ? 'Dar feedback'
        : 'Ver feedback'

      const fullLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rebecaqlopes.vercel.app'}${link}`

      await resend.emails.send({
        from: FROM,
        to: recipient.email,
        subject: subjects[type] ?? title,
        html: emailHtml(title, body, fullLink, linkLabel),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
