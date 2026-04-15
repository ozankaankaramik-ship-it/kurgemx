import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/about": "/about",
    "/contact": "/contact",
    "/giris": {
      tr: "/giris",
      en: "/login",
    },
    "/kayit": {
      tr: "/kayit",
      en: "/register",
    },
    "/sifre-sifirlama": {
      tr: "/sifre-sifirlama",
      en: "/forgot-password",
    },
    "/sifre-guncelle": {
      tr: "/sifre-guncelle",
      en: "/reset-password",
    },
  },
});
