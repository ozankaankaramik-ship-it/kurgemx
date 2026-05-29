'use server'

export type IletisimState = { error?: string; success?: boolean } | null

export async function iletisimFormuGonder(
  prevState: IletisimState,
  formData: FormData
): Promise<IletisimState> {
  const ad = (formData.get('ad') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const mesaj = (formData.get('mesaj') as string)?.trim()

  if (!ad || !email || !mesaj) return { error: 'eksik_alan' }

  try {
    const { sendSupportMail } = await import('@/lib/email')
    await sendSupportMail(
      `[İletişim Formu] ${ad} — ${email}`,
      `<p><strong>Ad:</strong> ${ad}</p><p><strong>E-posta:</strong> ${email}</p><p><strong>Mesaj:</strong></p><p style="white-space:pre-wrap">${mesaj}</p>`,
    )
    return { success: true }
  } catch (err) {
    console.error('[iletisimFormuGonder]', err)
    return { error: 'genel' }
  }
}
