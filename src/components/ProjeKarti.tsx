import type { ProjeListeRow } from '@/lib/projects/actions'
import Link from 'next/link'

type Props = {
  proje: ProjeListeRow
  href: string
  sonGuncellemeMesaj: string
  hikayeEtiketi: string
  dokumanEtiketi: string
  dilEtiketi: string
}

export default function ProjeKarti({
  proje,
  href,
  sonGuncellemeMesaj,
  hikayeEtiketi,
  dokumanEtiketi,
  dilEtiketi,
}: Props) {
  const hikayeSayisi = proje.hikayeler?.[0]?.count ?? 0
  const dokumanSayisi = proje.analiz_dokumanlari?.[0]?.count ?? 0

  return (
    <Link
      href={href}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition-all bg-white dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {proje.ad}
        </h2>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {dilEtiketi}
        </span>
      </div>
      {proje.aciklama && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {proje.aciklama}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>{hikayeSayisi} {hikayeEtiketi}</span>
        <span>{dokumanSayisi} {dokumanEtiketi}</span>
        <span className="ml-auto">{sonGuncellemeMesaj}</span>
      </div>
    </Link>
  )
}
