import type { Metadata } from "next";
import Link from "next/link";
import { getMembers, getSiteSettings } from "@/lib/cms/repositories";
import { localSettings } from "@/lib/local-data/settings";
import { About } from "@/components/sections/About";
import { Vision } from "@/components/sections/Vision";
import { PageHead } from "@/components/ui/PageHead";
import { ArrowIcon, XIcon } from "@/components/ui/Icons";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About | チームについて",
  description: `${SITE_NAME}はVALORANT部門とストリーマー部門を持つeスポーツチームです。チームの概要を紹介します。`,
  alternates: absoluteUrl("/about") ? { canonical: "/about" } : undefined,
};

export default async function AboutPage() {
  const [settingsRes, membersRes] = await Promise.all([getSiteSettings(), getMembers()]);
  const settings = settingsRes.item ?? localSettings;
  const valorant = membersRes.items.filter((m) => m.division === "valorant").length;
  const streamer = membersRes.items.filter((m) => m.division === "streamer").length;
  return (
    <>
      <PageHead
        eyebrow="About Us"
        title={
          <>
            Who <em>We Are</em>
          </>
        }
        lead="競技と配信、それぞれの舞台で個性を放つeスポーツチーム。"
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
      />
      <About aboutText={settings.aboutText} valorantCount={valorant} streamerCount={streamer} showHead={false} />
      <Vision />
      <section className="section section--alt section--tight" aria-label="関連リンク">
        <div className="container" style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingLeft: 6 }}>
          <Link href="/members" className="btn btn--primary">
            <span>メンバーを見る</span>
            <ArrowIcon className="btn__icon btn__icon--arrow" />
          </Link>
          <a href={settings.officialXUrl} target="_blank" rel="noopener noreferrer" className="btn">
            <XIcon className="btn__icon" />
            <span>公式Xをフォロー</span>
          </a>
        </div>
      </section>
    </>
  );
}
