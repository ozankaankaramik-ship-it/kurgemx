'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PlanBilgisi } from '@/lib/abonelik'

export interface DokumanDurumu {
  storyMap: string | null
  storyMapTarih: string | null
  isAnalizi: string | null
  documentsR1: string | null
  documentsR2: string | null
  documentsR3: string | null
  prototype: string | null
  prototipTarih: string | null
  testScenarios: string | null
  kapsamDoc: string | null
  mimariDoc: string | null
}

type DokumanTur = Exclude<keyof DokumanDurumu, 'storyMapTarih' | 'prototipTarih'>

export type ProjeBuyuklugu = 'Küçük' | 'Orta' | 'Büyük'

interface ProjeContextValue {
  projeId: string | null
  ad: string
  shortDesc: string | null
  detailedDesc: string | null
  projektDili: string | null
  projeBuyuklugu: ProjeBuyuklugu | null
  hikayeSayisiTahmini: number | null
  dokuman: DokumanDurumu
  kullaniciPlan: PlanBilgisi | null
  setProje: (id: string, ad: string, shortDesc: string | null, detailedDesc: string, dil?: string | null) => void
  setProjeBuyuklugu: (val: ProjeBuyuklugu) => void
  setHikayeSayisiTahmini: (n: number) => void
  setDokuman: (tur: DokumanTur, icerik: string) => void
  setKullaniciPlan: (p: PlanBilgisi) => void
}

const BOŞ: DokumanDurumu = {
  storyMap: null,
  storyMapTarih: null,
  isAnalizi: null,
  documentsR1: null,
  documentsR2: null,
  documentsR3: null,
  prototype: null,
  prototipTarih: null,
  testScenarios: null,
  kapsamDoc: null,
  mimariDoc: null,
}

export interface InitialProje {
  id: string
  ad: string
  aciklama: string | null
  dil: string
  projeBuyuklugu?: ProjeBuyuklugu | null
  storyMapIcerik?: unknown
  storyMapTarih?: string | null
  isAnaliziStr?: string | null
  prototipIcerik?: string | null
  prototipTarih?: string | null
  testSenaryosuIcerik?: string | null
}

const ProjeContext = createContext<ProjeContextValue | null>(null)

export function useProje() {
  const ctx = useContext(ProjeContext)
  if (!ctx) throw new Error('useProje must be used within ProjeProvider')
  return ctx
}

function icerikStr(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'string') return v
  return JSON.stringify(v)
}

export function ProjeProvider({ children, initialProje, initialPlan }: { children: ReactNode; initialProje?: InitialProje; initialPlan?: PlanBilgisi }) {
  const [projeId, setProjeId] = useState<string | null>(initialProje?.id ?? null)
  const [ad, setAd] = useState(initialProje?.ad ?? '')
  const [shortDesc, setShortDesc] = useState<string | null>(null)
  const [detailedDesc, setDetailedDesc] = useState<string | null>(initialProje?.aciklama ?? null)
  const [projektDili, setProjektDili] = useState<string | null>(initialProje?.dil ?? null)
  const [projeBuyuklugu, setProjeBuyukluguState] = useState<ProjeBuyuklugu | null>(
    initialProje?.projeBuyuklugu ?? null
  )
  const [hikayeSayisiTahmini, setHikayeSayisiTahminiState] = useState<number | null>(null)
  const [kullaniciPlan, setKullaniciPlanState] = useState<PlanBilgisi | null>(initialPlan ?? null)
  const [dokuman, setDokumanState] = useState<DokumanDurumu>({
    ...BOŞ,
    storyMap: icerikStr(initialProje?.storyMapIcerik),
    storyMapTarih: initialProje?.storyMapTarih ?? null,
    isAnalizi: initialProje?.isAnaliziStr ?? null,
    prototype: initialProje?.prototipIcerik ?? null,
    prototipTarih: initialProje?.prototipTarih ?? null,
    testScenarios: initialProje?.testSenaryosuIcerik ?? null,
  })

  function setProje(id: string, projeAd: string, short: string | null, detailed: string, dil?: string | null) {
    setProjeId(id)
    setAd(projeAd)
    setShortDesc(short)
    setDetailedDesc(detailed)
    if (dil !== undefined) setProjektDili(dil ?? null)
  }

  function setProjeBuyuklugu(val: ProjeBuyuklugu) {
    setProjeBuyukluguState(val)
  }

  function setHikayeSayisiTahmini(n: number) {
    setHikayeSayisiTahminiState(n)
  }

  function setDokuman(tur: DokumanTur, icerik: string) {
    setDokumanState(prev => ({ ...prev, [tur]: icerik }))
  }

  return (
    <ProjeContext.Provider value={{
      projeId, ad, shortDesc, detailedDesc, projektDili,
      projeBuyuklugu, hikayeSayisiTahmini,
      dokuman,
      kullaniciPlan,
      setProje, setProjeBuyuklugu, setHikayeSayisiTahmini, setDokuman,
      setKullaniciPlan: setKullaniciPlanState,
    }}>
      {children}
    </ProjeContext.Provider>
  )
}
