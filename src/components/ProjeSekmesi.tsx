'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Props = {
  aktifLabel: string
  arsivLabel: string
  aktifSayi: number
  arsivSayi: number
}

export default function ProjeSekmesi({ aktifLabel, arsivLabel, aktifSayi, arsivSayi }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sekme = searchParams.get('sekme') ?? 'aktif'

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sekme', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const tabs = [
    { value: 'aktif', label: aktifLabel, sayi: aktifSayi },
    { value: 'arsiv', label: arsivLabel, sayi: arsivSayi },
  ]

  return (
    <div className="flex gap-1 mb-6 border-b border-kx-border-soft">
      {tabs.map((tab) => {
        const isActive = sekme === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => handleClick(tab.value)}
            className={[
              'px-4 py-2.5 text-[13px] font-medium transition-colors -mb-px border-b-2',
              isActive
                ? 'border-kx-navy text-kx-navy'
                : 'border-transparent text-kx-muted hover:text-kx-ink',
            ].join(' ')}
          >
            {tab.label}
            {tab.sayi > 0 && (
              <span
                className={[
                  'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                  isActive ? 'bg-kx-navy text-white' : 'bg-kx-bg text-kx-muted',
                ].join(' ')}
              >
                {tab.sayi}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
