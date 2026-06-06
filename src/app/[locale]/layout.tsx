import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsentGate from "@/components/ConsentGate";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: 'KurgemX — %s',
    default: 'KurgemX',
  },
  description: "KurgemX - AI-Powered Business Analysis Platform",
  icons: {
    icon: '/kurgemx-icon.svg',
    apple: '/kurgemx-icon.svg',
  },
  openGraph: {
    title: 'KurgemX — AI-Powered Business Analysis',
    description: 'KurgemX — AI-Powered Business Analysis',
    url: 'https://kurgemx.com',
    siteName: 'KurgemX',
    images: [
      {
        url: 'https://kurgemx.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KurgemX',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://kurgemx.com/og-image.png'],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <Footer />
          <ConsentGate locale={locale} />
        </NextIntlClientProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17855392608"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17855392608');
          `}
        </Script>
      </body>
    </html>
  );
}
