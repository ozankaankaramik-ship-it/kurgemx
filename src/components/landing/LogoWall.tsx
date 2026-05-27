/**
 * Logo wall — single row of customer logos with an "X+ projects" headline.
 * Placeholder text for now; replace with real logos when available.
 */

const LOGOS = [
  'Garanti BBVA',
  'Turkcell',
  'Migros',
  'Yapı Kredi',
  'Trendyol',
  'Hepsiburada',
  'Akbank',
  'Vodafone',
] as const

export default function LogoWall() {
  return (
    <section className="bg-white py-10 px-8 border-y border-kx-border">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center text-[12px] font-semibold text-kx-muted tracking-[0.1em] uppercase mb-6">
          1.200+ proje · 23.000+ hikaye · Türkiye'nin lider iş analisti ekipleri kullanıyor
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 items-center">
          {LOGOS.map((l) => (
            <div
              key={l}
              className="font-brand text-[15px] font-bold text-kx-muted tracking-tight text-center opacity-65"
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
