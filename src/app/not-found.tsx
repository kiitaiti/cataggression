import Link from "next/link";
import type { Metadata } from "next";
import { ArrowIcon } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "404 Not Found", robots: { index: false } };

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: "80vh",
        display: "grid",
        alignContent: "center",
        padding: "calc(var(--header-h) + 40px) 0 80px",
      }}
    >
      <div className="container">
        <p className="sec-eyebrow">404</p>
        <h1 className="sec-title" style={{ fontSize: "clamp(64px, 14vw, 180px)" }}>
          Not <em>Found</em>
        </h1>
        <p className="sec-lead" style={{ marginTop: 20, maxWidth: "40em" }}>
          お探しのページは見つかりませんでした。移動または削除された可能性があります。
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap", paddingLeft: 6 }}>
          <Link href="/" className="btn btn--primary">
            <span>ホームへ戻る</span>
            <ArrowIcon className="btn__icon btn__icon--arrow" />
          </Link>
          <Link href="/members" className="btn">
            <span>メンバーを見る</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
