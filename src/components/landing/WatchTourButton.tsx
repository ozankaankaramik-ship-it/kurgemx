'use client'

import { useState } from 'react'
import VideoModal from './VideoModal'

interface WatchTourButtonProps {
  label: string
}

export default function WatchTourButton({ label }: WatchTourButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2.5 bg-white text-kx-ink text-[14px] font-medium px-5 py-3.5 rounded-xl border border-kx-border hover:border-kx-blue transition-colors"
      >
        <span className="w-5 h-5 rounded-full bg-kx-navy text-white grid place-items-center text-[8px]">
          ▶
        </span>
        {label}
      </button>
      <VideoModal open={open} onClose={() => setOpen(false)} defaultTab="tanitim" />
    </>
  )
}
