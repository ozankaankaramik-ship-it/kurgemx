'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DokumanDurumu {
  storyMap: string | null
  documentsR1: string | null
  documentsR2: string | null
  documentsR3: string | null
  prototype: string | null
  testScenarios: string | null
  kapsamDoc: string | null
  mimariDoc: string | null
}

interface ProjeContextValue {
  projeId: string | null
  ad: string
  shortDesc: string | null
  detailedDesc: string | null
  projektDili: string | null
  dokuman: DokumanDurumu
  setProje: (id: string, ad: string, shortDesc: string | null, detailedDesc: string, dil?: string | null) => void
  setDokuman: (tur: keyof DokumanDurumu, icerik: string) => void
}

const BOŞ: DokumanDurumu = {
  storyMap: null,
  documentsR1: null,
  documentsR2: null,
  documentsR3: null,
  prototype: null,
  testScenarios: null,
  kapsamDoc: null,
  mimariDoc: null,
}

export interface InitialProje {
  id: string
  ad: string
  aciklama: string | null
  dil: string
}

const ProjeContext = createContext<ProjeContextValue | null>(null)

export function useProje() {
  const ctx = useContext(ProjeContext)
  if (!ctx) throw new Error('useProje must be used within ProjeProvider')
  return ctx
}

export function ProjeProvider({ children, initialProje }: { children: ReactNode; initialProje?: InitialProje }) {
  const [projeId, setProjeId] = useState<string | null>(initialProje?.id ?? null)
  const [ad, setAd] = useState(initialProje?.ad ?? '')
  const [shortDesc, setShortDesc] = useState<string | null>(null)
  const [detailedDesc, setDetailedDesc] = useState<string | null>(initialProje?.aciklama ?? null)
  const [projektDili, setProjektDili] = useState<string | null>(initialProje?.dil ?? null)
  const [dokuman, setDokumanState] = useState<DokumanDurumu>(BOŞ)

  // Proje ID değişince Supabase'den mevcut dokümanları yükle
  useEffect(() => {
    if (!projeId) return
    const supabase = createClient()
    supabase
      .from('analiz_dokumanlari')
      .select('tur, icerik')
      .eq('proje_id', projeId)
      .then(({ data }) => {
        if (!data?.length) return
        const next = { ...BOŞ }
        for (const row of data) {
          switch (row.tur as string) {
            case 'hikaye_haritasi': next.storyMap = row.icerik; break
            case 'r1': next.documentsR1 = row.icerik; break
            case 'r2': next.documentsR2 = row.icerik; break
            case 'r3': next.documentsR3 = row.icerik; break
            case 'prototip': next.prototype = row.icerik; break
            case 'test_senaryosu': next.testScenarios = row.icerik; break
            case 'kapsam': next.kapsamDoc = row.icerik; break
            case 'mimari': next.mimariDoc = row.icerik; break
          }
        }
        setDokumanState(next)
      })
  }, [projeId])

  function setProje(id: string, projeAd: string, short: string | null, detailed: string, dil?: string | null) {
    setProjeId(id)
    setAd(projeAd)
    setShortDesc(short)
    setDetailedDesc(detailed)
    if (dil !== undefined) setProjektDili(dil ?? null)
  }

  function setDokuman(tur: keyof DokumanDurumu, icerik: string) {
    setDokumanState(prev => ({ ...prev, [tur]: icerik }))
  }

  return (
    <ProjeContext.Provider value={{ projeId, ad, shortDesc, detailedDesc, projektDili, dokuman, setProje, setDokuman }}>
      {children}
    </ProjeContext.Provider>
  )
}
