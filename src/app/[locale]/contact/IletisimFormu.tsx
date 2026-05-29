'use client'

import { useActionState } from 'react'
import { iletisimFormuGonder } from '@/lib/iletisim/actions'

type Props = {
  labels: {
    ad: string
    email: string
    mesaj: string
    gonder: string
    basari: string
    hatalar: { eksik_alan: string; genel: string }
  }
}

export default function IletisimFormu({ labels: L }: Props) {
  const [state, action, isPending] = useActionState(iletisimFormuGonder, null)

  const hataMesaji = state?.error
    ? (L.hatalar as Record<string, string>)[state.error] ?? L.hatalar.genel
    : null

  if (state?.success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-[14px] text-green-800 font-medium">
        {L.basari}
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5">{L.ad}</label>
          <input
            name="ad"
            type="text"
            required
            className="w-full h-[42px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-kx-ink mb-1.5">{L.email}</label>
          <input
            name="email"
            type="email"
            required
            className="w-full h-[42px] px-3 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-kx-ink mb-1.5">{L.mesaj}</label>
        <textarea
          name="mesaj"
          rows={5}
          required
          className="w-full px-3 py-2.5 rounded-xl border border-kx-border text-[14px] text-kx-ink bg-white outline-none focus:ring-2 focus:ring-kx-blue/30 transition resize-none"
        />
      </div>
      {hataMesaji && <p className="text-[13px] text-red-600">{hataMesaji}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-kx-navy text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 transition"
      >
        {isPending ? '...' : L.gonder}
      </button>
    </form>
  )
}
