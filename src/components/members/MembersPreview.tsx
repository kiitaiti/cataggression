import Link from "next/link";
import type { DataSource, Member } from "@/lib/cms/types";
import { SectionHead } from "@/components/ui/SectionHead";
import { MemberCard } from "./MemberCard";
import { ArrowIcon } from "@/components/ui/Icons";
import styles from "./MembersPreview.module.css";

type Props = { members: Member[]; source: DataSource; perDivision?: number };

/** トップ用: 各部門の先頭数名を横並びで見せ、一覧ページへ誘導する */
export function MembersPreview({ members, source, perDivision = 4 }: Props) {
  const groups = [
    { key: "streamer", en: "Streamers", jp: "ストリーマー部門", href: "/members#streamers" },
    { key: "valorant", en: "Valorant", jp: "VALORANT部門", href: "/members#valorant" },
  ] as const;

  return (
    <section id="members" className="section section--alt" aria-labelledby="members-title">
      <div className="container">
        <SectionHead
          eyebrow="The Roster"
          title="Members"
          id="members-title"
          lead="配信で、競技で。それぞれの舞台に立つメンバー。"
        >
          <Link href="/members" className="btn">
            <span>メンバー一覧</span>
            <ArrowIcon className="btn__icon btn__icon--arrow" />
          </Link>
        </SectionHead>

        {source === "error" ? (
          <p className="notice" role="status">
            メンバー情報を取得できませんでした。時間をおいて再度お試しください。
          </p>
        ) : (
          groups.map((g) => {
            const list = members
              .filter((m) => m.division === g.key)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            if (list.length === 0) return null;
            const shown = list.slice(0, perDivision);
            return (
              <div key={g.key} className={styles.group}>
                <div className={styles.groupHead} data-reveal>
                  <h3 className={styles.groupTitle}>
                    {g.en}
                    <span className={styles.groupJp}>
                      {g.jp} — {list.length}
                    </span>
                  </h3>
                  <Link href={g.href} className="link">
                    All {g.en} <ArrowIcon />
                  </Link>
                </div>
                <ul className={styles.grid} aria-label={g.jp}>
                  {shown.map((m, i) => (
                    <MemberCard key={m.id} member={m} index={i} />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
