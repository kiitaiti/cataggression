import Image from "next/image";
import Link from "next/link";
import type { ListResult, Partner } from "@/lib/cms/types";
import { SectionHead } from "@/components/ui/SectionHead";
import { ArrowIcon } from "@/components/ui/Icons";
import styles from "./Simple.module.css";

export function Partners({ partners, showHead = true }: { partners: ListResult<Partner>; showHead?: boolean }) {
  const hasItems = partners.source !== "error" && partners.items.length > 0;
  return (
    <section id="partners" className={`section ${showHead ? "section--alt" : ""} ${hasItems ? "" : "section--tight"}`} aria-labelledby={showHead ? "partners-title" : undefined} aria-label={showHead ? undefined : "パートナー一覧"}>
      <div className="container">
        {showHead && (
          <SectionHead eyebrow="Official Partners" title="Partners" id="partners-title">
            <Link href="/partners" className="link">
              Sponsorship <ArrowIcon />
            </Link>
          </SectionHead>
        )}

        {partners.source === "error" && (
          <p className="notice" role="status" data-reveal>
            パートナー情報を取得できませんでした。
          </p>
        )}

        {hasItems ? (
          <ul className={styles.partnerGrid} aria-label="パートナー一覧">
            {partners.items.map((p, i) => {
              const inner = p.logo ? (
                <Image
                  src={p.logo.url}
                  alt={p.name}
                  width={p.logo.width}
                  height={p.logo.height}
                  sizes="(max-width: 720px) 45vw, 240px"
                  loading="lazy"
                  className={styles.partnerLogo}
                />
              ) : (
                <span className={styles.partnerName}>{p.name}</span>
              );
              return (
                <li key={p.id} className={styles.partner} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 0.06}s` }}>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`${p.name}（外部サイト）`} className={styles.partnerLink}>
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                  {p.description && <p className={styles.partnerDesc}>{p.description}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          partners.source !== "error" && (
            <div className={styles.partnerOpen} data-reveal>
              <div>
                <p className={styles.partnerOpenTitle}>Partner Slot Open</p>
                <p className={styles.partnerOpenText}>
                  競技と配信の両面から、ブランドとファンをつなぐ取り組みをご提案します。
                </p>
              </div>
              <Link href="/contact" className="btn btn--sm">
                <span>お問い合わせ</span>
                <ArrowIcon className="btn__icon btn__icon--arrow" />
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  );
}
