import { Link } from '@/i18n/navigation'

/**
 * Final CTA strip — warm bg, big heading, primary + secondary CTAs.
 */
export default function FinalCTA() {
  return (
    <section className="bg-kx-bg-warm py-24 px-8 text-center">
      <div className="max-w-[720px] mx-auto">
        <h2 className="font-display text-[60px] tracking-[-0.035em] font-bold text-kx-ink mb-4 leading-[1.05] text-balance">
          İlk projeni <span className="text-kx-red">30 saniyede</span> başlat.
        </h2>
        <p className="text-[18px] text-kx-body mb-9 leading-[1.5]">
          Bir cümle yaz — gerisini Kurgemx halletsin. Memnun kalmazsan, hiçbir yere bir şey ödemeden çıkabilirsin.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          <Link
            href="/kayit"
            className="bg-kx-red text-white text-[15px] font-semibold px-7 py-4 rounded-xl no-underline shadow-kx-red transition-all hover:bg-kx-red-hover"
          >
            Hesabımı şimdi aç →
          </Link>
          <a
            href="mailto:destek@kurgemx.com"
            className="bg-white text-kx-ink text-[15px] font-medium px-6 py-4 rounded-xl no-underline border border-kx-border"
          >
            Demo iste
          </a>
        </div>
        <div className="text-[13px] text-kx-muted">
          Kart gerekmez · 14 günlük profesyonel deneme · İptal tek tıkla
        </div>
      </div>
    </section>
  )
}
