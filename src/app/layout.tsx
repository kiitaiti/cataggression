import type { Metadata, Viewport } from "next";
import { Montserrat, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { getSiteSettings } from "@/lib/cms/repositories";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const display = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body-family",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { item: settings } = await getSiteSettings();
  const siteUrl = getSiteUrl();
  const og = settings?.defaultOgImage;
  return {
    ...(siteUrl ? { metadataBase: siteUrl } : {}),
    title: {
      default: `${SITE_NAME} | Official Website`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Official Website`,
      description: SITE_DESCRIPTION,
      locale: "ja_JP",
      ...(og ? { images: [{ url: og.url, width: og.width, height: og.height }] } : {}),
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      site: "@cataggression01",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { item: settings } = await getSiteSettings();
  return (
    <html lang="ja" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <Header officialXUrl={settings?.officialXUrl ?? "https://x.com/cataggression01"} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <CustomCursor />
        <RevealObserver />
      </body>
    </html>
  );
}
