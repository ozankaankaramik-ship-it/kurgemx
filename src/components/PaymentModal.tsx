'use client'

import { useState } from 'react'

type Props = {
  planId:   string
  planAd:   string
  fiyat:    number
  fiyat_tl: number
  locale:   string
  onClose:  () => void
}

type Step = 'currency' | 'confirm'

export default function PaymentModal({ planId, planAd, fiyat_tl, locale, onClose }: Props) {
  const [step,    setStep]    = useState<Step>('currency')
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function handlePay() {
    setLoading(true)
    setError(null)

    fetch('/api/paytr/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ plan_id: planId, locale }),
    })
      .then(r => r.json())
      .then((data: { token?: string; error?: string }) => {
        if (data.token) setToken(data.token)
        else setError(data.error ?? 'Token alınamadı')
      })
      .catch(() => setError('Bağlantı hatası. Lütfen tekrar deneyin.'))
      .finally(() => setLoading(false))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', margin: 0 }}>
              {planAd} Planı
            </p>
            {step === 'confirm' && (
              <p style={{ fontSize: 20, fontWeight: 700, color: '#1F3864', lineHeight: 1, marginTop: 2 }}>
                ₺{fiyat_tl}
                <span style={{ fontSize: 13, fontWeight: 400, color: '#9CA3AF' }}>/ay</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="Kapat"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#6B7387" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ADIM 1: Para birimi seçimi */}
          {step === 'currency' && (
            <div>
              <p style={{ fontSize: 13, color: '#6B7387', marginBottom: 20, textAlign: 'center' }}>
                Ödeme yapılacak para birimini seçin
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* TL — aktif */}
                <button
                  onClick={() => setStep('confirm')}
                  style={{
                    padding:       '20px 16px',
                    borderRadius:  8,
                    border:        '1.5px solid #2E75B6',
                    background:    '#EEF4FB',
                    cursor:        'pointer',
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           6,
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 600, color: '#1F3864' }}>₺</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1F3864' }}>TL</span>
                  <span style={{ fontSize: 11, color: '#2E75B6' }}>₺{fiyat_tl} / ay</span>
                </button>

                {/* USD — disabled */}
                <div
                  style={{
                    padding:       '20px 16px',
                    borderRadius:  8,
                    border:        '1px solid #E5E7EB',
                    background:    '#F9FAFB',
                    opacity:       0.55,
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           6,
                    cursor:        'default',
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 600, color: '#9CA3AF' }}>$</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>USD</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>Yakında</span>
                </div>
              </div>
            </div>
          )}

          {/* ADIM 2: Fiyat onayı ve ödeme */}
          {step === 'confirm' && (
            <div>
              {error ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 6v5M10 14h.01" stroke="#E63329" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="10" cy="10" r="9" stroke="#E63329" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: '#374151', textAlign: 'center', margin: 0 }}>{error}</p>
                  <button
                    onClick={() => setError(null)}
                    style={{ fontSize: 13, fontWeight: 600, color: '#2E75B6', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Tekrar dene
                  </button>
                </div>
              ) : token ? (
                <iframe
                  src={`https://www.paytr.com/odeme/guvenli/${token}`}
                  style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
                  title="PayTR Güvenli Ödeme"
                  allow="payment"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #2E75B6', borderTopColor: 'transparent' }} className="animate-spin" />
                      <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Ödeme yükleniyor...</p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePay}
                      style={{
                        height:      42,
                        borderRadius: 8,
                        background:  '#1F3864',
                        color:       'white',
                        fontSize:    14,
                        fontWeight:  500,
                        border:      'none',
                        cursor:      'pointer',
                        width:       '100%',
                      }}
                    >
                      PayTR ile Güvenli Öde
                    </button>
                  )}

                  {!loading && (
                    <button
                      onClick={() => setStep('currency')}
                      style={{
                        height:      38,
                        borderRadius: 8,
                        background:  'white',
                        color:       '#1F3864',
                        fontSize:    13,
                        fontWeight:  500,
                        border:      '0.5px solid #2E75B6',
                        cursor:      'pointer',
                        width:       '100%',
                      }}
                    >
                      Geri
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
