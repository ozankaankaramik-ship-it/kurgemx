'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sifreDegistir, hesapSilTalebi, pazarlamaOnayGuncelle } from '@/lib/auth/actions'
import { Link } from '@/i18n/navigation'
import type { PlanBilgisi } from '@/lib/abonelik'

/* ── Plan badge ──────────────────────────────────────────────── */
const PLAN_BADGE: Record<string, { bg: string; color: string }> = {
  freemium:   { bg: '#F3F4F6', color: '#6B7280' },
  analyst:    { bg: '#B5D4F4', color: '#0C447C' },
  advanced:   { bg: '#C0DD97', color: '#27500A' },
  enterprise: { bg: '#CECBF6', color: '#3C3489' },
}
const SHOW_UPGRADE = new Set(['freemium', 'analyst'])
const PAID_PLANS   = new Set(['analyst', 'advanced', 'enterprise'])

/* ── Types ───────────────────────────────────────────────────── */
type Labels = {
  temelBilgiler: string
  ad: string
  soyad: string
  email: string
  sifreDegistir: string
  yeniSifre: string
  yeniSifreTekrar: string
  kaydet: string
  kaydedildi: string
  bildirimTercihleri: string
  pazarlamaOnay: string
  pazarlamaKaydedildi: string
  pazarlamaHata: string
  abonelik: string
  mevcutPlan: string
  aylikKullanim: string
  planiYukselt: string
  sonrakiOdemeTarihi: string
  aboneligiIptalEt: string
  iptalOnay: string
  iptalEdildi: string
  hesapSilBtn: string
  hesapSilAciklama: string
  hesapSilOnay: string
  hatalar: { sifre_kisa: string; sifre_eslesmiyor: string; genel: string }
}

type Props = {
  user: { id: string; email: string; ad: string; soyad: string; displayName: string; initials: string }
  planBilgisi: PlanBilgisi
  pazarlamaOnay: boolean
  locale: string
  labels: Labels
}

/* ── Section card ────────────────────────────────────────────── */
function Section({ label, danger, children }: { label: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-lg mb-4"
      style={{ border: danger ? '1px solid #FCA5A5' : '0.5px solid #D9DCE3' }}
    >
      <div
        className="px-5 pt-4 pb-2 text-[10.5px] font-bold tracking-[0.09em] uppercase"
        style={{ color: danger ? '#DC2626' : '#9CA3AF' }}
      >
        {label}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  )
}

/* ── Field row ───────────────────────────────────────────────── */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center py-2.5 border-b last:border-0" style={{ borderColor: '#ECEEF2' }}>
      <span className="text-[12.5px] w-28 shrink-0" style={{ color: '#6B7280' }}>{label}</span>
      <span className="text-[13.5px] font-medium" style={{ color: '#1A2C4E' }}>{value || '—'}</span>
    </div>
  )
}

/* ── Toggle switch ───────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0, border: 'none',
        background: checked ? '#1F3864' : '#D1D5DB',
        position: 'relative', transition: 'background 0.2s',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: checked ? 19 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        display: 'block',
      }} />
    </button>
  )
}

/* ── Component ───────────────────────────────────────────────── */
export default function HesapIstemci({ user, planBilgisi, pazarlamaOnay, locale, labels: L }: Props) {
  const router = useRouter()
  const [sifreState, setSifreState]         = useState<{ error?: string; success?: string } | null>(null)
  const [iptalMesaj, setIptalMesaj]         = useState<string | null>(null)
  const [iptalPending, setIptalPending]     = useState(false)
  const [pending, startTrans]               = useTransition()
  const [pazarlamaChecked, setPazarlama]    = useState(pazarlamaOnay)
  const [pazarlamaMsg, setPazarlamaMsg]     = useState<{ text: string; ok: boolean } | null>(null)
  const [pazarlama_pending, setPazPending]  = useState(false)

  const { plan, abonelik } = planBilgisi
  const badge    = PLAN_BADGE[plan.kod] ?? PLAN_BADGE.freemium
  const limit    = plan.aylik_proje_limiti
  const kullanim = abonelik?.aylik_proje_sayaci ?? 0
  const progress = limit ? Math.min((kullanim / limit) * 100, 100) : 0

  const isTR          = locale === 'tr'
  const isPaidPlan    = PAID_PLANS.has(plan.kod)
  const sonrakiOdeme  = abonelik?.sonraki_odeme_tarihi ?? null

  async function handlePazarlamaToggle(yeniDeger: boolean) {
    setPazarlama(yeniDeger)
    setPazarlamaMsg(null)
    setPazPending(true)
    const result = await pazarlamaOnayGuncelle(yeniDeger)
    setPazPending(false)
    if (result.error) {
      setPazarlama(!yeniDeger)
      setPazarlamaMsg({ text: L.pazarlamaHata, ok: false })
    } else {
      setPazarlamaMsg({ text: L.pazarlamaKaydedildi, ok: true })
    }
  }

  function handleSifreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setSifreState(null)
    startTrans(async () => {
      const result = await sifreDegistir(null, fd)
      setSifreState(result)
      if (result?.success) (e.target as HTMLFormElement).reset()
    })
  }

  function handleHesapSil() {
    const onay = window.confirm(L.hesapSilOnay)
    if (!onay) return
    const fd = new FormData()
    fd.append('locale', locale)
    startTrans(async () => {
      await hesapSilTalebi(null, fd)
      router.push(`/${locale}`)
    })
  }

  async function handleIptal() {
    const onay = window.confirm(L.iptalOnay)
    if (!onay) return
    setIptalPending(true)
    setIptalMesaj(null)
    try {
      const res  = await fetch('/api/paytr/cancel', { method: 'POST' })
      const data = await res.json() as { error?: string }
      if (data.error) {
        setIptalMesaj(data.error)
      } else {
        setIptalMesaj(L.iptalEdildi)
        router.refresh()
      }
    } catch {
      setIptalMesaj(L.hatalar.genel)
    } finally {
      setIptalPending(false)
    }
  }

  const sifreHata = sifreState?.error
    ? (L.hatalar as Record<string, string>)[sifreState.error] ?? L.hatalar.genel
    : null

  return (
    <div>
      {/* ── Avatar header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="grid place-items-center rounded-full shrink-0 text-white font-bold text-[20px] tracking-wide"
          style={{ width: 56, height: 56, backgroundColor: '#1F3864' }}
        >
          {user.initials}
        </div>
        <div>
          <div className="text-[18px] font-medium leading-snug" style={{ color: '#1A2C4E' }}>
            {user.displayName}
          </div>
          <div className="text-[13px] mt-0.5" style={{ color: '#9CA3AF' }}>
            {user.email}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left column ── */}
        <div>
          <Section label={L.temelBilgiler}>
            <FieldRow label={L.ad}    value={user.ad} />
            <FieldRow label={L.soyad} value={user.soyad} />
            <FieldRow label={L.email} value={user.email} />
          </Section>

          <Section label={L.bildirimTercihleri}>
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-[13px] leading-snug" style={{ color: '#374151' }}>
                {L.pazarlamaOnay}
              </span>
              <Toggle
                checked={pazarlamaChecked}
                onChange={handlePazarlamaToggle}
                disabled={pazarlama_pending}
              />
            </div>
            {pazarlamaMsg && (
              <p className="text-[12px] mt-2" style={{ color: pazarlamaMsg.ok ? '#27500A' : '#DC2626' }}>
                {pazarlamaMsg.text}
              </p>
            )}
          </Section>

          <Section label={L.sifreDegistir}>
            <form onSubmit={handleSifreSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: '#374151' }}>
                  {L.yeniSifre}
                </label>
                <input
                  name="yeniSifre"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  required
                  className="w-full h-[38px] px-3 rounded-lg text-[13.5px] outline-none transition"
                  style={{ border: '1px solid #D1D5DB', color: '#1A2C4E', background: '#fff' }}
                  onFocus={e => (e.target.style.borderColor = '#2E75B6')}
                  onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: '#374151' }}>
                  {L.yeniSifreTekrar}
                </label>
                <input
                  name="yeniSifreTekrar"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  required
                  className="w-full h-[38px] px-3 rounded-lg text-[13.5px] outline-none transition"
                  style={{ border: '1px solid #D1D5DB', color: '#1A2C4E', background: '#fff' }}
                  onFocus={e => (e.target.style.borderColor = '#2E75B6')}
                  onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
                />
              </div>

              {sifreHata && (
                <p className="text-[12.5px]" style={{ color: '#DC2626' }}>{sifreHata}</p>
              )}
              {sifreState?.success === 'ok' && (
                <p className="text-[12.5px]" style={{ color: '#27500A' }}>{L.kaydedildi}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="text-[13px] font-semibold text-white px-5 py-2 rounded-lg transition disabled:opacity-50"
                style={{ background: '#1F3864' }}
              >
                {pending ? '…' : L.kaydet}
              </button>
            </form>
          </Section>
        </div>

        {/* ── Right column ── */}
        <div>
          <Section label={L.abonelik}>
            {/* Mevcut plan */}
            <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#ECEEF2' }}>
              <span className="text-[13px]" style={{ color: '#6B7280' }}>{L.mevcutPlan}</span>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: badge.bg, color: badge.color }}
              >
                {plan.ad}
              </span>
            </div>

            {/* Aylık kullanım */}
            {limit !== null && (
              <div className="py-3 border-b" style={{ borderColor: '#ECEEF2' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px]" style={{ color: '#6B7280' }}>{L.aylikKullanim}</span>
                  <span className="text-[13px] font-medium" style={{ color: '#1A2C4E' }}>
                    {kullanim} / {limit} {isTR ? 'proje' : 'projects'}
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: '#E5E7EB' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: '#2E75B6' }}
                  />
                </div>
              </div>
            )}

            {/* Sonraki ödeme tarihi */}
            {isPaidPlan && sonrakiOdeme && (
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#ECEEF2' }}>
                <span className="text-[13px]" style={{ color: '#6B7280' }}>{L.sonrakiOdemeTarihi}</span>
                <span className="text-[13px] font-medium" style={{ color: '#1A2C4E' }}>
                  {new Date(sonrakiOdeme).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Planı Yükselt */}
            {SHOW_UPGRADE.has(plan.kod) && (
              <div className="pt-3.5 flex items-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline transition-opacity hover:opacity-75"
                  style={{ color: '#2E75B6' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  {L.planiYukselt}
                </Link>
              </div>
            )}

            {/* Aboneliği İptal Et */}
            {isPaidPlan && (
              <div className="pt-3 border-t mt-3" style={{ borderColor: '#ECEEF2' }}>
                {iptalMesaj && (
                  <p
                    className="text-[12.5px] mb-2"
                    style={{ color: iptalMesaj === L.iptalEdildi ? '#27500A' : '#DC2626' }}
                  >
                    {iptalMesaj}
                  </p>
                )}
                <button
                  onClick={handleIptal}
                  disabled={iptalPending}
                  className="text-[12.5px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
                  style={{ color: '#9CA3AF' }}
                >
                  {iptalPending ? '…' : L.aboneligiIptalEt}
                </button>
              </div>
            )}
          </Section>

          <Section label={isTR ? 'TEHLİKELİ ALAN' : 'DANGER ZONE'} danger>
            <p className="text-[13px] mb-4" style={{ color: '#9CA3AF' }}>{L.hesapSilAciklama}</p>
            <button
              onClick={handleHesapSil}
              disabled={pending}
              className="text-[13px] font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
              style={{ background: '#DC2626', color: '#fff' }}
            >
              {L.hesapSilBtn}
            </button>
          </Section>
        </div>
      </div>
    </div>
  )
}
