"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import KullaniciMenu from "./KullaniciMenu";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = locale === "tr" ? "en" : "tr";

  const switchLanguage = () => {
    // next-intl typed router.replace requires params for dynamic routes, but
    // usePathname() returns the resolved path — cast to bypass the template literal check.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathname as any, { locale: otherLocale });
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            Kurgemx
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/projeler"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {t("nav.projeler")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={switchLanguage}
            className="text-sm border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t("language.switchTo")}
          </button>
          <KullaniciMenu />
        </div>
      </div>
    </nav>
  );
}
