import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { textToParagraphs } from "@/lib/cms/sanitize";
import { ArrowIcon } from "@/components/ui/Icons";
import styles from "./About.module.css";

type Props = {
  aboutText: string;
  valorantCount: number;
  streamerCount: number;
  showHead?: boolean;
};

export function About({ aboutText, valorantCount, streamerCount, showHead = true }: Props) {
  const paragraphs = textToParagraphs(aboutText);
  const [lead, ...rest] = paragraphs;
  return (
    <section id="about" className="section" aria-labelledby={showHead ? "about-title" : undefined} aria-label={showHead ? undefined : "チーム紹介"}>
      <div className="container">
        {showHead && (
          <SectionHead
            eyebrow="About Us"
            title={
              <>
                Who <em>We Are</em>
              </>
            }
            id="about-title"
          >
            <Link href="/about" className="link">
              More about us <ArrowIcon />
            </Link>
          </SectionHead>
        )}
        <div className={styles.grid}>
          <div className={styles.text} data-reveal>
            {lead && <p className={styles.lead}>{lead}</p>}
            {rest.map((p, i) => (
              <p key={i} className={styles.body}>
                {p}
              </p>
            ))}
          </div>
          <ul className={styles.divisions} aria-label="部門">
            <li className={styles.division} data-reveal style={{ ["--reveal-delay" as string]: "0.08s" }}>
              <span className={styles.divisionNo}>01</span>
              <div>
                <span className={styles.divisionName}>Valorant</span>
                <span className={styles.divisionMeta}>
                  競技部門{valorantCount > 0 ? ` — ${valorantCount} players` : ""}
                </span>
              </div>
              <Link href="/members#valorant" className={styles.divisionLink} aria-label="VALORANT部門のメンバーへ">
                <ArrowIcon />
              </Link>
            </li>
            <li className={styles.division} data-reveal style={{ ["--reveal-delay" as string]: "0.16s" }}>
              <span className={styles.divisionNo}>02</span>
              <div>
                <span className={styles.divisionName}>Streamers</span>
                <span className={styles.divisionMeta}>
                  ストリーマー部門{streamerCount > 0 ? ` — ${streamerCount} members` : ""}
                </span>
              </div>
              <Link href="/members#streamers" className={styles.divisionLink} aria-label="ストリーマー部門のメンバーへ">
                <ArrowIcon />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
