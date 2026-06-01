'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import KxPill from '@/components/ui/KxPill'
import VideoModal from './VideoModal'

type Tab = 'tanitim' | 'kilavuz'

function VideoCard({
  variant,
  title,
  onClick,
}: {
  variant: Tab
  title: string
  onClick: () => void
}) {
  const isTanitim = variant === 'tanitim'

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl overflow-hidden border border-kx-border hover:border-[#2E75B6] transition-all shadow-sm hover:shadow-md text-left"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-52 flex items-center justify-center ${
          isTanitim ? 'bg-[#1F3864]' : 'bg-[#1a1a2e]'
        }`}
      >
        {isTanitim ? (
          <div className="text-center select-none">
            <div className="text-white font-bold text-[32px] tracking-tight">
              Kurge<span className="text-[#7EB3E8]">m</span>X
            </div>
            <div className="text-white/40 text-[12px] mt-1 font-medium">iş analizi platformu</div>
          </div>
        ) : (
          <div className="flex items-center gap-3 select-none">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold border ${
                    n <= 3
                      ? 'bg-[#2E75B6] text-white border-[#2E75B6]'
                      : 'bg-white/5 text-white/30 border-white/15'
                  }`}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white/25 border border-white/30 flex items-center justify-center transition-all group-hover:scale-110">
            <span className="text-white text-[18px] ml-1">▶</span>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-[14px] text-kx-ink">{title}</span>
        <span className="text-[12px] text-kx-muted">60 sn</span>
      </div>
    </button>
  )
}

export default function VideoSection() {
  const t = useTranslations('landing.videos')
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('tanitim')

  function openModal(tab: Tab) {
    setActiveTab(tab)
    setOpen(true)
  }

  return (
    <>
      <section className="bg-[#EEF4FB] py-20 px-8 border-t border-kx-border">
        <div className="max-w-[1180px] mx-auto">
          <div className="text-center mb-10">
            <KxPill tone="blue">— {t('sectionLabel')}</KxPill>
            <h2 className="font-display text-[42px] tracking-[-0.03em] font-bold text-kx-ink mt-4 mb-3 leading-[1.1]">
              {t('title')}
            </h2>
            <p className="text-[17px] text-kx-body leading-[1.5]">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[800px] mx-auto">
            <VideoCard
              variant="tanitim"
              title={t('card1Title')}
              onClick={() => openModal('tanitim')}
            />
            <VideoCard
              variant="kilavuz"
              title={t('card2Title')}
              onClick={() => openModal('kilavuz')}
            />
          </div>
        </div>
      </section>

      <VideoModal
        open={open}
        onClose={() => setOpen(false)}
        defaultTab={activeTab}
      />
    </>
  )
}
