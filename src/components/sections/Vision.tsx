import { teamVision } from "@/lib/local-data/vision";
import styles from "./Vision.module.css";

/**
 * チームの目標・大切にしていること。
 * compact=true はトップ用（3 つの価値観のみ）、false は ABOUT ページ用（目標 / 価値観 / ロードマップ / 締め）。
 */
export function Vision({ compact = false }: { compact?: boolean }) {
  const v = teamVision;
  return (
    <section className={`section ${compact ? "section--tight" : ""} ${styles.section}`} aria-labelledby="vision-title">
      <div className="container">
        {!compact && (
          <div className={styles.goal} data-reveal>
            <p className="sec-eyebrow">{v.goal.label}</p>
            <h2 id="vision-title" className={styles.goalTitle}>
              {v.goal.title}
            </h2>
            <p className={styles.goalBody}>{v.goal.body}</p>
          </div>
        )}

        <div className={styles.valuesHead} data-reveal>
          <p className="sec-eyebrow">What We Value</p>
          {compact ? (
            <h2 id="vision-title" className={styles.valuesTitle}>
              {v.statement}
            </h2>
          ) : (
            <p className={styles.valuesTitle}>{v.statement}</p>
          )}
        </div>
        <ol className={styles.values}>
          {v.values.map((item, i) => (
            <li key={item.title} className={styles.value} data-reveal style={{ ["--reveal-delay" as string]: `${i * 0.08}s` }}>
              <span className={styles.valueNo}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.valueTitle}>{item.title}</h3>
              <p className={styles.valueBody}>{item.body}</p>
            </li>
          ))}
        </ol>

        {!compact && (
          <>
            <div className={styles.roadHead} data-reveal>
              <p className="sec-eyebrow">Roadmap</p>
              <h2 className={styles.roadTitle}>
                VCJを、<em>その先</em>への一歩に。
              </h2>
            </div>
            <ol className={styles.road}>
              {v.roadmap.map((r, i) => (
                <li key={r.step} className={styles.roadItem} data-reveal style={{ ["--reveal-delay" as string]: `${i * 0.08}s` }}>
                  <span className={styles.roadStep}>{r.step}</span>
                  <div>
                    <h3 className={styles.roadItemTitle}>{r.title}</h3>
                    <p className={styles.roadItemBody}>{r.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.closing} data-reveal>
              {v.closing}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
