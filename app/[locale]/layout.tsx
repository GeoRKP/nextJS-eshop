import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "../../assets/styles/globals.css";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { WishlistProvider } from "@/components/shared/product/wishlist-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

const roboto = Roboto({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin", "greek"],
  weight: ["600", "700", "800"],
  variable: "--font-roboto-condensed",
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

  return {
    title: {
      template: "%s | " + APP_NAME,
      default: APP_NAME,
    },
    description: APP_DESCRIPTION,
    metadataBase: new URL(SERVER_URL),
    keywords: ["e-commerce", "online store", "shop", "products", "Geo Store"],
    authors: [{ name: "Geo Store Team" }],
    creator: "Geo Store",
    publisher: "Geo Store",
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

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WishlistProvider>
              {children}
            </WishlistProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
