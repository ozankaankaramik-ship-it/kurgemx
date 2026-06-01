'use client'

import { useEffect, useState } from 'react'

type Props = {
  planId: string
  planAd: string
  fiyat: number
  locale: string
  onClose: () => void
}

export default function PaymentModal({ planId, planAd, fiyat, locale, onClose }: Props) {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/paytr/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, locale }),
    })
      .then(r => r.json())
      .then((data: { token?: string; error?: string }) => {
        if (cancelled) return
        if (data.token) setToken(data.token)
        else setError(data.error ?? 'Token alınamadı')
      })
      .catch(() => {
        if (!cancelled) setError('Bağlantı hatası. Lütfen tekrar deneyin.')
      })

    return () => { cancelled = true }
  }, [planId, locale])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kx-border">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-kx-muted">
              {planAd} Planı
            </p>
            <p className="text-[20px] font-bold text-kx-navy leading-none mt-0.5">
              ${fiyat}
              <span className="text-[13px] font-normal text-kx-muted">/ay</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-kx-bg transition-colors"
            aria-label="Kapat"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="#6B7387" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-kx-red-soft flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 6v5M10 14h.01" stroke="#E63329" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="10" cy="10" r="9" stroke="#E63329" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-[14px] text-kx-body text-center">{error}</p>
              <button
                onClick={onClose}
                className="mt-1 text-[13px] font-semibold text-kx-blue hover:underline"
              >
                Kapat
              </button>
            </div>
          ) : !token ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-9 h-9 rounded-full border-[3px] border-kx-blue border-t-transparent animate-spin" />
              <p className="text-[13px] text-kx-muted">Ödeme yükleniyor...</p>
            </div>
          ) : (
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${token}`}
              style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
              title="PayTR Güvenli Ödeme"
              allow="payment"
            />
          )}
        </div>
      </div>
    </div>
  )
}
