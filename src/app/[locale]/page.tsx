import { getLocale, getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/navigation"
import type { Metadata } from "next"

// ── Icons ─────────────────────────────────────────────────────────────────────

function StoryMapIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="10" height="7" rx="1.5" stroke="#2E75B6" strokeWidth="1.5" />
      <rect x="16" y="2" width="10" height="7" rx="1.5" stroke="#2E75B6" strokeWidth="1.5" />
      <rect x="2" y="12" width="10" height="7" rx="1.5" stroke="#2E75B6" strokeWidth="1.5" />
      <rect x="16" y="12" width="10" height="7" rx="1.5" stroke="#2E75B6" strokeWidth="1.5" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="2" width="18" height="24" rx="2" stroke="#2E75B6" strokeWidth="1.5" />
      <path d="M9 9h10M9 13h10M9 17h6" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3L25 9l-11 6L3 9l11-6Z" stroke="#2E75B6" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 14l11 6 11-6" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 19l11 6 11-6" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="3" width="22" height="22" rx="3" stroke="#2E75B6" strokeWidth="1.5" />
      <path d="M8 9h8M8 14h12M8 19h6" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 17l2 2 4-4" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3v14M9 12l5 5 5-5" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20v3a2 2 0 002 2h16a2 2 0 002-2v-3" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke="#2E75B6" strokeWidth="1.5" />
      <path d="M14 3c-3 4-3 18 0 22M14 3c3 4 3 18 0 22" stroke="#2E75B6" strokeWidth="1.5" />
      <path d="M3 14h22" stroke="#2E75B6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 9h19M4.5 19h19" stroke="#2E75B6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTarih(dateStr: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta")
  const title = t("title")
  const description = t("description")
  return {
    title,
    description,
    keywords: t("keywords"),
    openGraph: { title, description, type: "website" },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()

  // ── Authenticated: Dashboard ──────────────────────────────────────────────
  if (user) {
    const t = await getTranslations("dashboard")
    const displayName =
      (user.user_metadata?.ad as string | undefined) ||
      user.email?.split("@")[0] ||
      "?"

    const { data: projeler } = await supabase
      .from("projeler")
      .select("id, ad, olusturma_tarihi")
      .order("olusturma_tarihi", { ascending: false })
      .limit(3)

    return (
      <main className="flex-1 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-4 py-10">

          <h1 className="text-xl font-semibold text-[#1F3864] mb-6">
            {t("welcome", { name: displayName })}
          </h1>

          <div className="flex gap-2 mb-10">
            <Link
              href="/projeler/yeni"
              className="inline-flex items-center h-[34px] px-3.5 rounded-md bg-[#1F3864] text-white text-xs font-medium hover:bg-[#2E75B6] transition-colors"
            >
              {t("newProject")}
            </Link>
            <Link
              href="/projeler"
              className="inline-flex items-center h-[34px] px-3.5 rounded-md bg-white text-[#1F3864] text-xs font-medium hover:bg-[#EEF4FB] transition-colors"
              style={{ border: "0.5px solid #2E75B6" }}
            >
              {t("allProjects")}
            </Link>
          </div>

          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.8px] mb-3">
            {t("recentProjects")}
          </p>

          {projeler?.length ? (
            <div className="space-y-1">
              {projeler.map((p) => (
                <Link
                  key={p.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  href={{ pathname: "/projeler/[id]", params: { id: p.id } } as any}
                  className="flex items-center justify-between bg-white rounded-xl px-5 py-[18px] transition-colors hover:border-[#2E75B6]/40"
                  style={{ border: "0.5px solid #E5E7EB" }}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1F3864]">{p.ad}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("created")}{" "}
                      {p.olusturma_tarihi ? formatTarih(p.olusturma_tarihi, locale) : ""}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="bg-white rounded-xl px-5 py-10 text-center"
              style={{ border: "0.5px solid #E5E7EB" }}
            >
              <p className="text-sm text-gray-400">{t("noProjects")}</p>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ── Unauthenticated: Landing page ─────────────────────────────────────────
  const t = await getTranslations("landing")

  const features = [
    { title: t("features.storyMap"),     desc: t("features.storyMapDesc"),     icon: <StoryMapIcon /> },
    { title: t("features.bizAnalysis"),  desc: t("features.bizAnalysisDesc"),  icon: <DocIcon /> },
    { title: t("features.prototype"),    desc: t("features.prototypeDesc"),    icon: <LayersIcon /> },
    { title: t("features.testScenarios"),desc: t("features.testScenariosDesc"),icon: <CheckIcon /> },
    { title: t("features.export"),       desc: t("features.exportDesc"),       icon: <ExportIcon /> },
    { title: t("features.multilang"),    desc: t("features.multilangDesc"),    icon: <GlobeIcon /> },
  ]

  const steps = [
    { title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
    { title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
    { title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
  ]

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ── */}
      <section className="bg-white px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[34px] font-bold text-[#1F3864] leading-tight mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-[15px] text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/kayit"
              className="inline-flex items-center h-[38px] px-5 rounded-md bg-[#1F3864] text-white text-sm font-medium hover:bg-[#2E75B6] transition-colors"
            >
              {t("hero.getStarted")}
            </Link>
            <Link
              href="/giris"
              className="inline-flex items-center h-[38px] px-5 rounded-md bg-white text-[#1F3864] text-sm font-medium hover:bg-[#EEF4FB] transition-colors"
              style={{ border: "0.5px solid #2E75B6" }}
            >
              {t("hero.signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F9FAFB] px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-[#1F3864] text-center mb-12">
            {t("howItWorks.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="flex items-center justify-center rounded-full text-white text-lg font-bold mb-4 shrink-0"
                  style={{ width: 48, height: 48, backgroundColor: "#1F3864" }}
                >
                  {i + 1}
                </div>
                <h3 className="text-sm font-semibold text-[#1F3864] mb-2">{step.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-[#1F3864] text-center mb-10">
            {t("features.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl px-5 py-[18px]"
                style={{ border: "0.5px solid #E5E7EB" }}
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-[#1F3864] mb-1">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 py-6" style={{ backgroundColor: "#1F3864" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-[13px] text-white/70">{t("footer.copyright")}</p>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] text-white/70 hover:text-white transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="text-[13px] text-white/70 hover:text-white transition-colors">
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
