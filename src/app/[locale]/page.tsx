import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
        {t("description")}
      </p>
      <Link
        href="/"
        className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg font-medium hover:opacity-80 transition-opacity"
      >
        {t("getStarted")}
      </Link>
    </main>
  );
}
