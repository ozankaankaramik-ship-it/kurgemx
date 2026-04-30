import type { ProjeListeRow } from '@/lib/projects/actions'
import Link from 'next/link'

type Props = {
  proje: ProjeListeRow
  href: string
  olusturmaTarihi: string
  hikayeEtiketi: string
  dokumanEtiketi: string
  dilEtiketi: string
}

const DURUM_RENK: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  arsivlendi: 'bg-gray-100 text-gray-500',
  tamamlandi: 'bg-blue-100 text-blue-700',
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
  const durumRenk = DURUM_RENK[proje.durum] ?? 'bg-gray-100 text-gray-500'

  return (
    <Link
      href={href}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition-all bg-white dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {proje.ad}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${durumRenk}`}>
            {proje.durum}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {dilEtiketi}
          </span>
        </div>
      </div>

      {proje.aciklama && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {proje.aciklama}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span>{hikayeSayisi} {hikayeEtiketi}</span>
        <span>{dokumanSayisi} {dokumanEtiketi}</span>
        <span className="ml-auto">{olusturmaTarihi}</span>
      </div>
    </Link>
  )
}
