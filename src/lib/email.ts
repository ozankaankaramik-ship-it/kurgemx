import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'KurgemX <noreply@kurgemx.com>'
const SUPPORT = 'support@kurgemx.com'

export async function sendSupportMail(subject: string, html: string) {
  await resend.emails.send({ from: FROM, to: SUPPORT, subject, html })
}

export async function sendUserMail(to: string, subject: string, html: string) {
  await resend.emails.send({ from: FROM, to, subject, html })
}

export { SUPPORT }
