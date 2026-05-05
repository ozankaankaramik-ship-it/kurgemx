import { getLocale, getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import { Link, redirect } from "@/i18n/navigation"
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

  // ── Authenticated: redirect to projects list ─────────────────────────────
  if (user) {
    redirect({ href: "/projeler", locale })
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
