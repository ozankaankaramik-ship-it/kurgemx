'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { onaylariKaydet } from '@/lib/auth/actions'

export default function OnayModal({ locale }: { locale: string }) {
  const t = useTranslations('onayModal')
  const router = useRouter()
  const [kvkk,  setKvkk]  = useState(false)
  const [terms, setTerms] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  // ESC tuşunu engelle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.stopPropagation()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [])

  if (accepted) return null

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await onaylariKaydet()
      if (result.error) {
        setError(locale === 'tr' ? 'Bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred. Please try again.')
        return
      }
      setAccepted(true)
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[460px] mx-4 overflow-hidden">

        {/* Header */}
        <div style={{ background: '#1F3864', padding: '18px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            KurgemX
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: '4px 0 0' }}>
            {t('baslik')}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: 13, color: '#6B7387', marginBottom: 20, lineHeight: 1.55 }}>
            {t('aciklama')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* KVKK */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={kvkk}
                onChange={e => setKvkk(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#1F3864' }}
              />
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.55 }}>
                {t('kvkk')}
              </span>
            </label>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#1F3864' }}
              />
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.55 }}>
                {t('termsPrefix')}
                <Link
                  href="/terms"
                  target="_blank"
                  style={{ color: '#2E75B6', textDecoration: 'underline' }}
                >
                  {t('termsLinkText')}
                </Link>
                {t('termsSuffix')}
              </span>
            </label>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#DC2626', marginTop: 12 }}>{error}</p>
          )}

          <button
            onClick={handleAccept}
            disabled={!kvkk || !terms || isPending}
            style={{
              marginTop:    20,
              width:        '100%',
              height:       42,
              borderRadius: 8,
              background:   '#1F3864',
              color:        'white',
              fontSize:     14,
              fontWeight:   500,
              border:       'none',
              cursor:       (!kvkk || !terms || isPending) ? 'not-allowed' : 'pointer',
              opacity:      (!kvkk || !terms || isPending) ? 0.55 : 1,
              transition:   'opacity 0.15s',
            }}
          >
            {isPending ? t('kaydediliyor') : t('kabul')}
          </button>
        </div>
      </div>
    </div>
  )
}
