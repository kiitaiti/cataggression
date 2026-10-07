import type { Metadata } from "next";
import Link from "next/link";
import { getPartners } from "@/lib/cms/repositories";
import { Partners } from "@/components/sections/Partners";
import { PageHead } from "@/components/ui/PageHead";
import { ArrowIcon } from "@/components/ui/Icons";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Partners | パートナー",
  description: `${SITE_NAME}のオフィシャルパートナーと、協賛・コラボレーションのご案内。`,
  alternates: absoluteUrl("/partners") ? { canonical: "/partners" } : undefined,
};

export default async function PartnersPage() {
  const partners = await getPartners();
  return (
    <>
      <PageHead
        eyebrow="Official Partners"
        title="Partners"
        lead="チームの活動を支えてくださるパートナー。協賛・コラボレーションのご相談を受け付けています。"
        crumbs={[{ href: "/", label: "Home" }, { label: "Partners" }]}
      >
        <Link href="/contact" className="btn btn--primary">
          <span>協賛のご相談</span>
          <ArrowIcon className="btn__icon btn__icon--arrow" />
        </Link>
      </PageHead>
      <Partners partners={partners} showHead={false} />
      <section className="section section--alt" aria-labelledby="sponsor-title">
        <div className="container">
          <p className="sec-eyebrow">Sponsorship</p>
          <h2 id="sponsor-title" className="sec-title" style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
            Partner <em>With Us</em>
          </h2>
          <div style={{ display: "grid", gap: 16, maxWidth: "44em", marginTop: 20 }}>
            <p style={{ fontSize: 16, lineHeight: 1.9 }}>
              CAT AGGRESSIONは、VALORANT部門の競技活動とストリーマー部門の配信活動という2つの接点を持っています。
              ユニフォームや配信画面へのロゴ掲出、コラボ配信、イベント出演など、ブランドとファンをつなぐ取り組みをご一緒できるパートナーを募集しています。
            </p>
            <p style={{ fontSize: 14, color: "var(--fg-muted)" }}>
              具体的なメニュー・条件は、お問い合わせ後にご相談のうえご提案します。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
