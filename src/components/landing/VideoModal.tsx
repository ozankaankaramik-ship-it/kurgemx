'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type Tab = 'tanitim' | 'kilavuz'

interface VideoModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: Tab
}

export default function VideoModal({ open, onClose, defaultTab = 'tanitim' }: VideoModalProps) {
  const t = useTranslations('landing.videos')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  useEffect(() => {
    if (open) setActiveTab(defaultTab)
  }, [open, defaultTab])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const videoSrc = {
    tanitim: locale === 'tr' ? '/videos/tanitim.html' : '/videos/tanitim-en.html',
    kilavuz: locale === 'tr' ? '/videos/kilavuz.html' : '/videos/kilavuz-en.html',
  }
  const src = videoSrc[activeTab]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tanitim', label: t('tab1') },
    { key: 'kilavuz', label: t('tab2') },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#111] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <div className="flex gap-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-[13px] font-medium rounded-t-md transition-colors border-b-2 ${
                  activeTab === key
                    ? 'text-white border-[#2E75B6] bg-white/5'
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-[18px] leading-none w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* iframe */}
        <div className="bg-black">
          <iframe
            key={`${activeTab}-${open}`}
            src={src}
            className="w-full"
            style={{ height: '500px', border: 'none', display: 'block' }}
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex justify-end">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#7EB3E8] hover:underline"
          >
            {t('openNewTab')} ↗
          </a>
        </div>
      </div>
    </div>
  )
}
