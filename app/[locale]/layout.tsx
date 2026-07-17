import type { Metadata } from "next";
import { Manrope, Oswald, JetBrains_Mono } from "next/font/google";
import "../../assets/styles/globals.css";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";

import { Toaster } from "@/components/ui/toaster";
import { WishlistProvider } from "@/components/shared/product/wishlist-provider";
import CookieConsent from "@/components/shared/cookie-consent";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";

// Body / UI — Manrope: modern semi-geometric, strong Greek support, industrial undertone
const manrope = Manrope({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// Display / headings — Oswald: condensed, industrial-stencil character.
// Latin only — Greek diacritics fall back per-character to Manrope (full Greek coverage).
const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

// Mono — JetBrains Mono for SKU / OEM codes / spec tables
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const localeOgMap: Record<string, string> = {
  el: "el_GR",
  en: "en_US",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      template: "%s | " + APP_NAME,
      default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
    keywords: [...tMeta("seoKeywords").split(","), APP_NAME],
    authors: [{ name: `${APP_NAME} Team` }],
    creator: APP_NAME,
    publisher: APP_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    manifest: "/manifest.json",
    alternates: {
      languages: {
        el: `${SERVER_URL}`,
        en: `${SERVER_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: SERVER_URL,
      title: APP_NAME,
      description: APP_DESCRIPTION,
      siteName: APP_NAME,
      locale: localeOgMap[locale] || "el_GR",
      alternateLocale: Object.values(localeOgMap).filter(
        (l) => l !== (localeOgMap[locale] || "el_GR")
      ),
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: APP_DESCRIPTION,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Ship only the namespaces that client components on the storefront actually
  // use — the full catalog (incl. Admin*/forms/legal) is ~2× the size and admin
  // routes provide their own catalog in app/[locale]/admin/layout.tsx.
  const CLIENT_NAMESPACES = [
    "AddressBook",
    "Announcement",
    "Auth",
    "Cart",
    "Checkout",
    "Common",
    "CookieConsent",
    "DeleteDialog",
    "Footer",
    "LanguageSwitcher",
    "MegaMenu",
    "MobileNav",
    "NotFound",
    "Order",
    "Product",
    "Search",
    "UserNav",
    "UserProfile",
    "Validation",
    "Wishlist",
  ];
  const [allMessagesRaw, session] = await Promise.all([
    getMessages(),
    getAuthSession(),
  ]);
  const allMessages = allMessagesRaw as Record<string, unknown>;
  const messages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in allMessages).map((ns) => [
      ns,
      allMessages[ns],
    ])
  );

  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${oswald.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <WishlistProvider enabled={Boolean(session?.user)}>
            {children}
          </WishlistProvider>
          <CookieConsent />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
