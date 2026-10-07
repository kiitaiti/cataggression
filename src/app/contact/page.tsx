import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cms/repositories";
import { localSettings } from "@/lib/local-data/settings";
import { Contact } from "@/components/sections/Contact";
import { PageHead } from "@/components/ui/PageHead";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact | お問い合わせ",
  description: `${SITE_NAME}へのスポンサー・協賛、コラボレーション、取材・メディアなどのお問い合わせ。`,
  alternates: absoluteUrl("/contact") ? { canonical: "/contact" } : undefined,
};

const TOPICS = [
  { en: "Sponsorship", jp: "スポンサー・協賛", body: "ロゴ掲出、コラボ配信、イベント出演などのご提案・ご相談。" },
  { en: "Collaboration", jp: "コラボレーション", body: "他チーム・配信者・企業とのコラボ企画のご相談。" },
  { en: "Press", jp: "取材・メディア", body: "取材、掲載、出演依頼などメディア関連のご連絡。" },
  { en: "Others", jp: "その他", body: "上記以外のご質問・ご連絡。" },
];

export default async function ContactPage() {
  const { item } = await getSiteSettings();
  const settings = item ?? localSettings;
  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Get In Touch"
        lead="スポンサー、コラボ、取材、その他のご相談を受け付けています。"
        crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]}
      />
      <section className="section" aria-label="お問い合わせ内容">
        <div className="container">
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 1,
              background: "var(--line)",
              border: "1px solid var(--line)",
            }}
          >
            {TOPICS.map((t, i) => (
              <li key={t.en} data-reveal style={{ ["--reveal-delay" as string]: `${i * 0.06}s`, background: "var(--white)", padding: "26px 24px" }}>
                <p className="sec-eyebrow">{String(i + 1).padStart(2, "0")}</p>
                <p
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontStyle: "italic",
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                    color: "var(--fg-strong)",
                  }}
                >
                  {t.en}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{t.jp}</p>
                <p style={{ marginTop: 8, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.8 }}>{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Contact settings={settings} />
    </>
  );
}
