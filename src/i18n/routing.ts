import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
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
  },
});
