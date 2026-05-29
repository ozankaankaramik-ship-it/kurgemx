'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sifreDegistir, hesapSilTalebi, cikisYap } from '@/lib/auth/actions'
import { Link } from '@/i18n/navigation'
import type { PlanBilgisi } from '@/lib/abonelik'

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
  abonelik: string
  mevcutPlan: string
  aylikKullanim: string
  planiYukselt: string
  hesapSil: string
  hesapSilAciklama: string
  hesapSilBtn: string
  hesapSilOnay: string
  hatalar: { sifre_kisa: string; sifre_eslesmiyor: string; genel: string }
}

type Props = {
  user: { id: string; email: string; ad: string; soyad: string }
  planBilgisi: PlanBilgisi
  locale: string
  labels: Labels
}

const PLAN_BADGE: Record<string, string> = {
  freemium:   'bg-gray-100 text-gray-600',
  analyst:    'bg-[#EEF4FB] text-[#1F3864]',
  advanced:   'bg-[#EDE9FE] text-[#5B21B6]',
  enterprise: 'bg-[#FEF3C7] text-[#92400E]',
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-kx-border rounded-xl p-5 mb-3">
      <h2 className="text-[13px] font-semibold text-kx-muted uppercase tracking-[0.06em] mb-4">{title}</h2>
      {children}
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-kx-border-soft last:border-0">
      <span className="text-[12px] text-kx-muted w-24 shrink-0">{label}</span>
      <span className="text-[13px] text-kx-ink font-medium">{value || '—'}</span>
    </div>
  )
}

export default function HesapIstemci({ user, planBilgisi, locale, labels: L }: Props) {
  const router = useRouter()
  const [sifreState, setSifreState] = useState<{ error?: string; success?: string } | null>(null)
  const [sifrePending, startSifreTrans] = useTransition()

  const { plan, abonelik } = planBilgisi
  const showUpgrade = !['advanced', 'enterprise'].includes(plan.kod)
  const limit = plan.aylik_proje_limiti
  const kullanim = abonelik?.aylik_proje_sayaci ?? 0

  function handleSifreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setSifreState(null)
    startSifreTrans(async () => {
      const result = await sifreDegistir(null, fd)
      setSifreState(result)
    })
  }

  function handleHesapSil() {
    const onay = window.confirm(L.hesapSilOnay)
    if (!onay) return
    const fd = new FormData()
    fd.append('locale', locale)
    startSifreTrans(async () => {
      await hesapSilTalebi(null, fd)
      router.push(`/${locale}`)
    })
  }

  const sifreHata = sifreState?.error
    ? (L.hatalar as Record<string, string>)[sifreState.error] ?? L.hatalar.genel
    : null

  return (
    <>
      {/* Temel Bilgiler */}
      <Card title={L.temelBilgiler}>
        <FieldRow label={L.ad} value={user.ad} />
        <FieldRow label={L.soyad} value={user.soyad} />
        <FieldRow label={L.email} value={user.email} />
      </Card>

      {/* Şifre Değiştir */}
      <Card title={L.sifreDegistir}>
        <form onSubmit={handleSifreSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-medium text-kx-ink mb-1.5">
              {L.yeniSifre}
            </label>
            <input
              name="yeniSifre"
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
              className="w-full h-[40px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-kx-ink mb-1.5">
              {L.yeniSifreTekrar}
            </label>
            <input
              name="yeniSifreTekrar"
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
              className="w-full h-[40px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
            />
          </div>
          {sifreHata && <p className="text-[13px] text-red-600">{sifreHata}</p>}
          {sifreState?.success === 'ok' && (
            <p className="text-[13px] text-green-700">{L.kaydedildi}</p>
          )}
          <button
            type="submit"
            disabled={sifrePending}
            className="bg-kx-navy text-white text-[13px] font-semibold px-5 py-2 rounded-xl disabled:opacity-50 transition"
          >
            {sifrePending ? '...' : L.kaydet}
          </button>
        </form>
      </Card>

      {/* Abonelik */}
      <Card title={L.abonelik}>
        <div className="flex justify-between items-center py-2.5 border-b border-kx-border-soft">
          <span className="text-[13px] text-kx-muted">{L.mevcutPlan}</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${PLAN_BADGE[plan.kod] ?? 'bg-gray-100 text-gray-600'}`}>
            {plan.ad}
          </span>
        </div>
        {limit !== null && (
          <div className="flex justify-between items-center py-2.5 border-b border-kx-border-soft">
            <span className="text-[13px] text-kx-muted">{L.aylikKullanim}</span>
            <span className="text-[13px] text-kx-ink font-medium">{kullanim} / {limit}</span>
          </div>
        )}
        {showUpgrade && (
          <div className="pt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center text-[13px] font-semibold text-kx-blue no-underline hover:underline"
            >
              {L.planiYukselt}
            </Link>
          </div>
        )}
      </Card>

      {/* Hesap Sil */}
      <div className="bg-white border border-red-200 rounded-2xl p-6 mt-6">
        <h2 className="text-[15px] font-semibold text-red-700 mb-1">{L.hesapSil}</h2>
        <p className="text-[13px] text-kx-muted mb-4">{L.hesapSilAciklama}</p>
        <button
          onClick={handleHesapSil}
          disabled={sifrePending}
          className="text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-5 py-2 rounded-xl transition"
        >
          {L.hesapSilBtn}
        </button>
      </div>
    </>
  )
}
