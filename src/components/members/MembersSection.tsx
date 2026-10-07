"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DataSource, Division, Member } from "@/lib/cms/types";
import { MemberCard } from "./MemberCard";
import styles from "./MembersSection.module.css";

type Props = {
  members: Member[];
  source: DataSource;
  /** ページ内のセクションとして見出しを付けるか（/members ではページ見出しを別に持つ） */
  showHead?: boolean;
};

const TABS: { key: Division; label: string; jp: string; hash: string }[] = [
  { key: "streamer", label: "STREAMERS", jp: "ストリーマー部門", hash: "streamers" },
  { key: "valorant", label: "VALORANT", jp: "VALORANT部門", hash: "valorant" },
];

export function MembersSection({ members, source, showHead = true }: Props) {
  // 初期表示は STREAMERS（ファン獲得を優先）
  const [active, setActive] = useState<Division>("streamer");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  // URL ハッシュ（#members-valorant など）で部門を指定できる
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      const t = TABS.find((t) => `members-${t.hash}` === h || t.hash === h);
      if (t) setActive(t.key);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // タブ切り替え後、カードの reveal を即時表示
  useEffect(() => {
    listRef.current?.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const counts = {
    valorant: members.filter((m) => m.division === "valorant").length,
    streamer: members.filter((m) => m.division === "streamer").length,
  };

  return (
    <section id="members" className={showHead ? "section section--alt" : styles.bare} aria-labelledby={showHead ? "members-title" : undefined} aria-label={showHead ? undefined : "メンバー一覧"}>
      <span id="members-streamers" className={styles.anchor} aria-hidden="true" />
      <span id="members-valorant" className={styles.anchor} aria-hidden="true" />
      <span id="streamers" className={styles.anchor} aria-hidden="true" />
      <span id="valorant" className={styles.anchor} aria-hidden="true" />
      <div className="container">
        {showHead && (
        <div className="sec-head" data-reveal>
          <div>
            <p className="sec-eyebrow">The Roster</p>
            <h2 className="sec-title" id="members-title">
              Members
            </h2>
          </div>
          <p className={`sec-lead sec-head__aside ${styles.lead}`}>
            配信で、競技で。それぞれの舞台に立つメンバー。気になったら、そのまま配信やSNSへ。
          </p>
        </div>
        )}

        <div className={styles.tabs} role="tablist" aria-label="部門を選択">
          {TABS.map((t, i) => {
            const selected = t.key === active;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${baseId}-tab-${t.key}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.key}`}
                tabIndex={selected ? 0 : -1}
                className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
                onClick={() => setActive(t.key)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className={styles.tabEn}>{t.label}</span>
                <span className={styles.tabJp}>
                  {t.jp}
                  {counts[t.key] > 0 && <span className={styles.count}>{counts[t.key]}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {TABS.map((t) => {
          const list = members
            .filter((m) => m.division === t.key)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          const selected = t.key === active;
          // 両部門を DOM に出力し（SEO / JS 無効時のため）、非表示側は hidden にする
          return (
            <div
              key={t.key}
              id={`${baseId}-panel-${t.key}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${t.key}`}
              className={styles.panel}
              tabIndex={0}
              hidden={!selected}
            >
              {source === "error" ? (
                <p className="notice" role="status">
                  メンバー情報を取得できませんでした。時間をおいて再度お試しください。
                </p>
              ) : list.length === 0 ? (
                <p className="notice" role="status">
                  この部門のメンバーは準備中です。
                </p>
              ) : (
                <ul ref={selected ? listRef : undefined} className={styles.grid} aria-label={t.jp}>
                  {list.map((m, i) => (
                    <MemberCard key={m.id} member={m} index={i} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
