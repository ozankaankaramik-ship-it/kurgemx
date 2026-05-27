import type { ReactNode } from 'react'

type Tone = 'blue' | 'red' | 'amber' | 'green' | 'gray' | 'navy'

const TONE: Record<Tone, { bg: string; text: string; dot: string }> = {
  blue:  { bg: 'bg-kx-blue-soft',  text: 'text-[#0C447C]',          dot: 'bg-kx-blue'  },
  red:   { bg: 'bg-kx-red-soft',   text: 'text-[#8A1A11]',          dot: 'bg-kx-red'   },
  amber: { bg: 'bg-kx-amber-soft', text: 'text-kx-amber-ink',       dot: 'bg-[#D97706]'},
  green: { bg: 'bg-kx-green-soft', text: 'text-kx-green-ink',       dot: 'bg-kx-green' },
  gray:  { bg: 'bg-[#F1F2F4]',     text: 'text-kx-body',            dot: 'bg-kx-muted' },
  navy:  { bg: 'bg-kx-navy',       text: 'text-white',              dot: 'bg-white'    },
}

type Props = {
  children: ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
}

export default function KxPill({ children, tone = 'blue', dot = false, className = '' }: Props) {
  const t = TONE[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${t.bg} ${t.text} text-[11px] font-semibold px-2.5 py-1 rounded-full leading-[1.4] tracking-tight ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
