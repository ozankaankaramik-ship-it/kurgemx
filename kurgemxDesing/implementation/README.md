# KurgemX Tasarım Refresh — Drop-in Talimatları

Bu paket repo'na **olduğu gibi kopyalanabilen** Next.js 16 + Tailwind v4 + TypeScript dosyaları içerir. Mevcut server actions, API endpoint'leri, Supabase logic'i ve AI streaming kodu **dokunulmadı** — sadece UI yenilendi.

## Hızlı Drop-in

```bash
# 1. Foundation: globals.css (yeni @theme tokenları)
cp implementation/src/app/globals.css                       src/app/globals.css

# 2. Primitives (yeni klasör)
cp -r implementation/src/components/ui                      src/components/

# 3. Refresh edilen mevcut bileşenler
cp implementation/src/components/Navbar.tsx                 src/components/
cp implementation/src/components/Footer.tsx                 src/components/
cp implementation/src/components/ProjeKarti.tsx             src/components/
cp implementation/src/components/GirisFormu.tsx             src/components/
cp implementation/src/components/KayitFormu.tsx             src/components/
cp implementation/src/components/SifreSifirlamaFormu.tsx    src/components/
cp implementation/src/components/SifreGuncelleFormu.tsx     src/components/

# 4. Landing bölüm bileşenleri (yeni klasör)
cp -r implementation/src/components/landing                 src/components/

# 5. Çalışma ekranı için yeni primitives
cp implementation/src/components/calisma/PipelinePreview.tsx src/components/calisma/
cp implementation/src/components/calisma/StepRail.tsx        src/components/calisma/

# 6. Sayfa dosyaları
cp implementation/src/app/[locale]/page.tsx                     src/app/[locale]/
cp implementation/src/app/[locale]/about/page.tsx                src/app/[locale]/about/
cp implementation/src/app/[locale]/pricing/page.tsx              src/app/[locale]/pricing/
cp implementation/src/app/[locale]/privacy/page.tsx              src/app/[locale]/privacy/
cp implementation/src/app/[locale]/terms/page.tsx                src/app/[locale]/terms/
cp implementation/src/app/[locale]/refund/page.tsx               src/app/[locale]/refund/
cp implementation/src/app/[locale]/sales-agreement/page.tsx      src/app/[locale]/sales-agreement/
cp implementation/src/app/[locale]/giris/page.tsx                src/app/[locale]/giris/
cp implementation/src/app/[locale]/kayit/page.tsx                src/app/[locale]/kayit/
cp implementation/src/app/[locale]/sifre-sifirlama/page.tsx      src/app/[locale]/sifre-sifirlama/
cp implementation/src/app/[locale]/sifre-guncelle/page.tsx       src/app/[locale]/sifre-guncelle/
cp implementation/src/app/[locale]/reset-password/page.tsx       src/app/[locale]/reset-password/
cp implementation/src/app/[locale]/projeler/page.tsx             src/app/[locale]/projeler/
cp implementation/src/app/[locale]/projeler/yeni/page.tsx        src/app/[locale]/projeler/yeni/
cp implementation/src/app/[locale]/projeler/[id]/page.tsx        src/app/[locale]/projeler/[id]/
```

> **layout.tsx** zaten Navbar + Footer'ı render etmiyor. Her sayfa kendi içinde `<Navbar />` ve gerekirse `<Footer />` import ediyor — bu drop-in modeli için en güvenlisi.

## Çevirileri merge et

```bash
# tr-additions.json + en-additions.json içindeki anahtarları
# kendi messages/tr.json ve messages/en.json dosyalarına ekle.
# Manuel merge: jq veya kendi editörünle.
```

**Önemli**: tüm mevcut çeviriler korundu. Yeni eklenenler sadece yeni özellikler için.

## CalismaEkrani.tsx

110KB'lik mega-component'e dokunmadık. Page chrome + StepRail/StepCard primitives hazır. İçeride birkaç yerel edit yapmak için `CALISMA-EKRANI-PLAN.md` dosyasına bak — sırasıyla 5 küçük edit:

1. Import ekle: `import StepRail, { StepCard, BackgroundBanner } from './StepRail'`
2. Return'ü 2-column grid'e sar
3. Her `adım` section'unu `<StepCard>` ile değiştir
4. `steps` array'ini state'lerden türet
5. Yüklenirken `<BackgroundBanner>` göster

## Yapılan değişikliklerin listesi

### ✅ Tamamen yeniden tasarlanan
- `app/[locale]/page.tsx` — Ana sayfa baştan
- `app/[locale]/about/page.tsx` — Stat şeridi + 3 numaralı section + iletişim kartı
- `app/[locale]/pricing/page.tsx` — 4 plan comparison tablosu + FAQ
- `app/[locale]/privacy/page.tsx` + `terms/page.tsx` + `refund/page.tsx` + `sales-agreement/page.tsx` — Hepsi tek `<LegalLayout>` ile
- `app/[locale]/giris/page.tsx` + `kayit/page.tsx` — `<AuthLayout>` split + form refresh
- `app/[locale]/sifre-sifirlama/page.tsx` + `sifre-guncelle/page.tsx` + `reset-password/page.tsx` — Aynı AuthLayout, 3 state
- `app/[locale]/projeler/page.tsx` — Welcome line + zengin proje kartları
- `app/[locale]/projeler/yeni/page.tsx` — Breadcrumb + pill + pipeline preview
- `app/[locale]/projeler/[id]/page.tsx` — Yeni ProjectHeader (sticky)

### ✅ Refresh edilen mevcut component'ler
- `components/Navbar.tsx` — public + authed variant
- `components/Footer.tsx` — Visa/Mastercard/Troy/iyzico logoların korundu
- `components/ProjeKarti.tsx` — pipeline barı + status pill
- `components/GirisFormu.tsx` + `KayitFormu.tsx` — yeni input style + güç meter
- `components/SifreSifirlamaFormu.tsx` + `SifreGuncelleFormu.tsx` — 3 state

### ✅ Yeni primitive component'ler
- `components/ui/KxLogo.tsx` — marka logosu + ikon
- `components/ui/KxPill.tsx` — 6 ton (blue/red/amber/green/gray/navy)
- `components/ui/PageHero.tsx` — lacivert sayfa başlığı (about/pricing/yasal sayfalar)
- `components/ui/LegalLayout.tsx` — 4 yasal sayfa için ortak shell
- `components/ui/AuthLayout.tsx` — Giriş/Kayıt/Reset için ortak split layout

### ✅ Landing bileşenleri (yeni klasör: `components/landing/`)
- Hero, HeroProductPreview, LogoWall, BeforeAfter, Features, UseCases, Testimonial, PricingTeaser, FinalCTA

### ✅ Workspace primitives (yeni klasör: `components/calisma/`)
- `PipelinePreview.tsx` — 5 adım önizleme
- `StepRail.tsx` — Sticky sol rail + StepCard + BackgroundBanner

### ⚠️ Dokunulmadı
- `lib/auth/actions.ts` (girisYap, kayitOl, googleIleGiris, sifreSifirla, sifreGuncelle)
- `lib/projects/actions.ts` + `lib/projects/create.ts`
- `lib/supabase/*`
- `app/api/ai/*` (detaylandir, hikaye-haritasi, is-analizi, prototip, test-senaryosu)
- `app/api/auth/callback`, `app/api/dokuman/is-analizi-docx`
- `components/calisma/CalismaEkrani.tsx` (110KB — etrafına chrome saralı)
- `components/calisma/Adim1Formu.tsx`
- `components/calisma/ProjeContext.tsx`
- `components/calisma/GenerateButton.tsx`
- `components/MarkdownGoster.tsx`
- `components/SonProjeKaydet.tsx` + `SonProjeKisayol.tsx`
- `components/YeniProjeFormu.tsx` (eski form — yeni akış CalismaEkrani üzerinden)
- `components/ProjeListesi.tsx` (eski liste — yeni layout ProjeKarti grid'i kullanıyor)
- `components/KullaniciMenu.tsx`
- `messages/tr.json`, `messages/en.json` (yeni anahtarlar ayrı dosyada)

## Sonraki adımlar

1. Drop-in yap, `npm run dev`
2. TR + EN smoke test: ana sayfa → fiyatlandırma → kayıt → giriş → şifre sıfırlama → projelerim → yeni proje
3. CalismaEkrani.tsx'in içine StepRail + StepCard'ı sokmak için `CALISMA-EKRANI-PLAN.md`'yi takip et
4. Eksik veya değişmesi gereken çevirileri `tr-additions.json` / `en-additions.json`'a göre merge et

Tasarım önizlemesi: `kurgemx — refresh.html` dosyasını aç.
