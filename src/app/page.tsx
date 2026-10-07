import type { Metadata } from "next";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Vision } from "@/components/sections/Vision";
import { MembersPreview } from "@/components/members/MembersPreview";
import { NewsSection } from "@/components/sections/NewsSection";
import { Partners } from "@/components/sections/Partners";
import { Contact } from "@/components/sections/Contact";
import { getMembers, getNews, getPartners, getSiteSettings } from "@/lib/cms/repositories";
import { localSettings } from "@/lib/local-data/settings";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Official Website`,
  description: SITE_DESCRIPTION,
  alternates: absoluteUrl("/") ? { canonical: "/" } : undefined,
};

export default async function HomePage() {
  const [settingsRes, membersRes, newsRes, partnersRes] = await Promise.all([
    getSiteSettings(),
    getMembers(),
    getNews({ perPage: 3 }),
    getPartners(),
  ]);
  const settings = settingsRes.item ?? localSettings;
  const members = membersRes.items;
  const valorantCount = members.filter((m) => m.division === "valorant").length;
  const streamerCount = members.filter((m) => m.division === "streamer").length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: SITE_NAME,
    sport: "Esports",
    sameAs: [settings.officialXUrl],
    ...(absoluteUrl("/") ? { url: absoluteUrl("/") } : {}),
    ...(absoluteUrl("/images/logo/cat-aggression-logo-white.png")
      ? { logo: absoluteUrl("/images/logo/cat-aggression-logo-white.png") }
      : {}),
    member: members.map((m) => ({
      "@type": "Person",
      name: m.name,
      ...(absoluteUrl(`/members/${m.slug}`) ? { url: absoluteUrl(`/members/${m.slug}`) } : {}),
      sameAs: m.socialLinks.map((l) => l.url),
    })),
  };

  return (
    <>
      <Hero
        catchcopy={settings.heroCatchcopy}
        description={settings.heroDescription}
        officialXUrl={settings.officialXUrl}
        valorantCount={valorantCount}
        streamerCount={streamerCount}
      />
      <MembersPreview members={members} source={membersRes.source} />
      <NewsSection news={newsRes} />
      <About aboutText={settings.aboutText} valorantCount={valorantCount} streamerCount={streamerCount} />
      <Vision compact />
      <Partners partners={partnersRes} />
      <Contact settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
