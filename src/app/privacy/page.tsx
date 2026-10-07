import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_NAME}公式サイトのプライバシーポリシー。`,
  alternates: absoluteUrl("/privacy") ? { canonical: "/privacy" } : undefined,
};

/**
 * 現在の運用（フォーム無し・アクセス解析無し・外部リンクのみ）に合わせた最小構成。
 * アクセス解析や問い合わせフォームを導入した場合は該当項目を追記してください。
 */
export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: "calc(var(--header-h) + clamp(32px, 5vw, 64px)) 0 112px" }}>
      <header style={{ marginBottom: 40 }}>
        <p className="sec-eyebrow">Privacy Policy</p>
        <h1 className="sec-title">Privacy</h1>
        <p className="sec-lead">プライバシーポリシー</p>
      </header>
      <div className="prose" style={{ maxWidth: 720 }}>
        <p>
          {SITE_NAME}（以下「当チーム」）は、本ウェブサイト（以下「本サイト」）における利用者の個人情報の取り扱いについて、以下のとおり定めます。
        </p>
        <h2>1. 収集する情報</h2>
        <p>
          本サイトには、利用者が個人情報を入力する問い合わせフォーム等は設置していません。本サイトの閲覧にあたり、当チームが利用者の個人情報を直接取得することはありません。
        </p>
        <h2>2. アクセス解析ツールについて</h2>
        <p>
          本サイトでは現在、アクセス解析ツールを使用していません。今後導入する場合は、本ページにて使用するツールおよびデータの取り扱いを明記します。
        </p>
        <h2>3. 外部サービスへのリンク</h2>
        <p>
          本サイトには、X、Twitch、YouTubeなどの外部サービスへのリンクが含まれます。リンク先での個人情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。
        </p>
        <h2>4. お問い合わせ</h2>
        <p>本ポリシーに関するお問い合わせは、公式X（@cataggression01）までご連絡ください。</p>
        <h2>5. 改定</h2>
        <p>本ポリシーは、運用内容の変更に応じて予告なく改定されることがあります。改定後の内容は本ページに掲載した時点から適用されます。</p>
      </div>
    </div>
  );
}
