'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DOKUMAN_TIPLERI } from '@/lib/dokuman-tipleri'

export interface DokumanDurumu {
  storyMap: string | null
  storyMapTarih: string | null
  documentsR1: string | null
  documentsR2: string | null
  documentsR3: string | null
  prototype: string | null
  testScenarios: string | null
  kapsamDoc: string | null
  mimariDoc: string | null
}

type DokumanTur = Exclude<keyof DokumanDurumu, 'storyMapTarih'>

interface ProjeContextValue {
  projeId: string | null
  ad: string
  shortDesc: string | null
  detailedDesc: string | null
  projektDili: string | null
  dokuman: DokumanDurumu
  setProje: (id: string, ad: string, shortDesc: string | null, detailedDesc: string, dil?: string | null) => void
  setDokuman: (tur: DokumanTur, icerik: string) => void
}

const BOŞ: DokumanDurumu = {
  storyMap: null,
  storyMapTarih: null,
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

  useEffect(() => {
    if (!projeId) return
    const supabase = createClient()
    supabase
      .from('dokumanlar')
      .select('tip_id, icerik, created_at')
      .eq('proje_id', projeId)
      .then(({ data }) => {
        if (!data?.length) return
        const next = { ...BOŞ }
        for (const row of data) {
          switch (row.tip_id) {
            case DOKUMAN_TIPLERI.hikaye_haritasi:
              next.storyMap = row.icerik
              next.storyMapTarih = row.created_at
              break
            case DOKUMAN_TIPLERI.test_senaryosu:
              next.testScenarios = row.icerik
              break
            case DOKUMAN_TIPLERI.mimari:
              next.mimariDoc = row.icerik
              break
            case DOKUMAN_TIPLERI.kapsam:
              next.kapsamDoc = row.icerik
              break
            case DOKUMAN_TIPLERI.prototip:
              next.prototype = row.icerik
              break
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

  function setDokuman(tur: DokumanTur, icerik: string) {
    setDokumanState(prev => ({ ...prev, [tur]: icerik }))
  }

  return (
    <ProjeContext.Provider value={{ projeId, ad, shortDesc, detailedDesc, projektDili, dokuman, setProje, setDokuman }}>
      {children}
    </ProjeContext.Provider>
  )
}
