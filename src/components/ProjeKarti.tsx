import type { ProjeListeRow } from '@/lib/projects/actions'
import { Link } from '@/i18n/navigation'
import KxPill from '@/components/ui/KxPill'

type Props = {
  proje: ProjeListeRow
  href: string
  olusturmaTarihi: string
  hikayeEtiketi: string
  dokumanEtiketi: string
  dilEtiketi: string
}

/**
 * Project card — refreshed.
 * - Avatar (initials in navy), name, language pill
 * - 1–2 line description
 * - Stage progress (5 dots) + hikaye/doküman counts
 * - Status pill on the right
 *
 * Used inside the projects list page when `view=grid`.
 * Stage is derived from existing fields: 0 = brief, 1 = harita, 2 = analiz,
 * 3 = prototip, 4 = test. We approximate from `hikayeler.count` + `analiz_dokumanlari.count`.
 */
function deriveStage(proje: ProjeListeRow): number {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  const dokumanSayisi = proje.analiz_dokumanlari?.[0]?.count ?? 0
  if (proje.durum === 'tamamlandi' || proje.durum === 'arsivlendi') return 5
  if (dokumanSayisi >= 2) return 4
  if (dokumanSayisi >= 1) return 3
  if (hikayeSayisi > 0) return 2
  return 1
}

function StageBar({ n }: { n: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} / 5 adım`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`block h-1 w-4 rounded-sm ${i < n ? 'bg-kx-navy' : 'bg-kx-border-soft'}`}
        />
      ))}
    </div>
  )
}

function ProjeBadge({ proje, label }: { proje: ProjeListeRow; label: string }) {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  const durum = proje.durum

  let tone: 'blue' | 'green' | 'amber' | 'gray' = 'gray'
  if (durum === 'tamamlandi') tone = 'green'
  else if (durum === 'arsivlendi') tone = 'gray'
  else if (hikayeSayisi > 0) tone = 'blue'
  else if (durum === 'aktif') tone = 'amber'

  return (
    <KxPill tone={tone} dot>
      {label}
    </KxPill>
  )
}

export default function ProjeKarti({
  proje,
  href,
  olusturmaTarihi,
  hikayeEtiketi,
  dokumanEtiketi,
  dilEtiketi,
}: Props) {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  const dokumanSayisi = proje.analiz_dokumanlari?.[0]?.count ?? 0
  const stage = deriveStage(proje)
  const initials = proje.ad.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={href as any}
      className="block bg-white border border-kx-border rounded-2xl p-5 relative overflow-hidden cursor-pointer no-underline hover:border-kx-blue hover:shadow-kx-card transition-all"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-kx-navy" />

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-kx-navy text-white grid place-items-center font-brand font-bold text-[15px] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-kx-ink m-0 tracking-tight truncate">
              {proje.ad}
            </h3>
            <span className="text-[9px] font-mono font-bold text-kx-muted bg-kx-bg border border-kx-border-soft px-1.5 py-0.5 rounded shrink-0">
              {dilEtiketi}
            </span>
          </div>
          <div className="text-[11px] text-kx-muted mt-0.5">{olusturmaTarihi}</div>
        </div>
      </div>

      {proje.aciklama && (
        <p className="text-[13px] text-kx-body m-0 mb-4 leading-[1.5] h-9 overflow-hidden line-clamp-2">
          {proje.aciklama}
        </p>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-semibold text-kx-muted tracking-[0.06em] uppercase">
            Pipeline
          </span>
          <span className="text-[11px] text-kx-muted">{stage} / 5 adım</span>
        </div>
        <StageBar n={stage} />
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-kx-border-soft">
        <div className="flex gap-3.5 text-[12px] text-kx-muted">
          <span>
            <strong className="text-kx-ink font-display text-[13px] font-bold">{hikayeSayisi}</strong> {hikayeEtiketi}
          </span>
          <span>
            <strong className="text-kx-ink font-display text-[13px] font-bold">{dokumanSayisi}</strong> {dokumanEtiketi}
          </span>
        </div>
        <ProjeBadge proje={proje} label={proje.durum} />
      </div>
    </Link>
  )
}
