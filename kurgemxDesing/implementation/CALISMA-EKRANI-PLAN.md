# Çalışma Ekranı (CalismaEkrani.tsx) refresh — Strategy

The repo's `src/components/calisma/CalismaEkrani.tsx` is **~110 KB** and contains
all the AI streaming logic, document state, Supabase upsert calls, XLSX/DOCX
exports, batch screen generation for prototypes, and so on. Rewriting it would
be high risk.

## What this batch does

Instead of touching that file, we apply the design refresh in **three
non-invasive moves**:

### 1. Page chrome (already done)

`src/app/[locale]/projeler/[id]/page.tsx` now wraps CalismaEkrani in:

- The new `<Navbar />` (in-app variant)
- A sticky `<ProjectHeader>` showing avatar, name, status pill, language tag,
  size tag, description and timestamps
- A `<main>` with the new background and `max-w-[1280px]` container

This is enough to make the workspace feel modernised without code changes
inside CalismaEkrani.

### 2. Reusable workspace primitives (already done)

`src/components/calisma/StepRail.tsx` exports:

- `<StepRail />` — sticky left navigation with 5 step statuses (done/active/running/pending),
  progress bars, "Bu projede" stats card and "Tamamlayıcı" extras section.
  Smooth-scrolls to `#adim1..#adim5` on click (no `scrollIntoView`).
- `<StepCard />` — refreshed card wrapper with a status-coloured number badge,
  status pill (✓ Hazır / ● Üretiliyor / Beklemede), optional time/action slot,
  and an inner content area.
- `<BackgroundBanner />` — "Üretim arka planda devam ediyor" callout shown at
  the top of the workspace while AI is producing.
- `formatSure(saniye, dil)` — duration formatter matching the existing helper.

These primitives are designed to **drop in** to CalismaEkrani.tsx incrementally.

### 3. Incremental refactor of CalismaEkrani.tsx (next step)

The minimal edits to apply inside CalismaEkrani.tsx — in order — are:

1. **Add imports**:
   ```ts
   import StepRail, { StepCard, BackgroundBanner } from './StepRail'
   ```

2. **Wrap the existing return in a 2-column grid**:
   ```tsx
   <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-start">
     <StepRail steps={steps} activeId={…} extrasYakinda={['Kapsam dokümanı','Mimari doküman']} />
     <div className="flex flex-col gap-4">
       {/* existing top banner + adım1..adım5 markup */}
     </div>
   </div>
   ```

3. **Replace each adım's `<section>` wrapper with `<StepCard>`**:
   ```tsx
   <StepCard
     id="adim1"
     no={1}
     title={t('adim1.baslik')}
     status={ /* derive from existing state */ }
     time={ adim1Metrigi ? `${formatSure(adim1Metrigi.sure, projektDili)} · ~${adim1Metrigi.token} token` : undefined }
     subtitle={ /* "Orta büyüklük · TR" etc. */ }
   >
     {/* existing inner markup */}
   </StepCard>
   ```

4. **Compute `steps` from existing state**:
   ```ts
   const steps: StepState[] = [
     {
       no: 1, label: t('adim1.baslik'),
       status: projeId ? 'done' : 'active',
       time: adim1Metrigi ? formatSure(adim1Metrigi.sure, projektDili) : undefined,
     },
     {
       no: 2, label: t('adim2.baslik'),
       status: adim2Yukleniyor ? 'running' : storyMapData ? 'done' : projeId ? 'active' : 'pending',
       time: adim2Metrigi ? formatSure(adim2Metrigi.sure, projektDili) : undefined,
       progress: adim2Yukleniyor ? (adim2MesajIdx + 1) / 4 : undefined,
     },
     // ...
   ]
   ```

5. **Add the background banner once** at the top of the content column:
   ```tsx
   {(adim3Yukleniyor || adim4Yukleniyor) && (
     <BackgroundBanner message={t('uretimNotu')} />
   )}
   ```

Buton durum mesajları (already in `messages/tr.json` → `calismaEkrani.*`)
and the metric line (`uretimMetrigi: "Üretim süresi: {sure} · Tahmini token: ~{token}"`)
**remain unchanged** — they are rendered inside the existing buttons and below
each step's output panel. Both are preserved exactly.

## What does NOT change

- All API endpoints (`/api/ai/*`)
- All Supabase upserts
- XLSX / DOCX export logic
- Prototip skeleton + batch generation
- ProjeContext, GenerateButton, ProgressBar
- Adim1Formu's AI streaming + project creation

The visible difference is purely chrome and step layout.
