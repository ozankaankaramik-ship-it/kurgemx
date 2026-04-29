'use client'

import { useEffect } from 'react'

const LS_KEY = 'kurgemx_son_proje'

type Props = { id: string; ad: string }

export default function SonProjeKaydet({ id, ad }: Props) {
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ id, ad }))
    } catch {}
  }, [id, ad])

  return null
}
