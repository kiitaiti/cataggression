import Link from "next/link";
import Image from "next/image";
import { XIcon, ArrowIcon } from "@/components/ui/Icons";
import styles from "./Hero.module.css";

type Props = {
  catchcopy: string;
  /** 現在 Hero では非表示（meta description 等で使用）。互換のため受け取る */
  description?: string;
  officialXUrl: string;
  valorantCount: number;
  streamerCount: number;
};

/**
 * Hero: 白いキャンバスに大きな黒 × 紫のチーム名、右側に紫の斜めパネル + エンブレム。
 * 画像はロゴのエンブレム 1 枚のみ。WebGL / Canvas / シェーダーは無し。
 */
export function Hero({ catchcopy, officialXUrl, valorantCount, streamerCount }: Props) {
  const divisions = (valorantCount > 0 ? 1 : 0) + (streamerCount > 0 ? 1 : 0);
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <Image
            src="/images/logo/cat-aggression-mark-black.png"
            alt=""
            width={977}
            height={1078}
            priority
            sizes="48px"
            className={styles.emblem}
          />
          <p className="sec-eyebrow">Esports Team</p>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.titleLine}>CAT</span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>AGGRESSION</span>
          </h1>
          <p className={styles.catch}>
            <span className={styles.catchMark}>{catchcopy}</span>
          </p>

          <div className={styles.actions}>
            <Link href="/members" className="btn btn--primary" data-cursor-label="VIEW">
              <span>メンバーを見る</span>
              <ArrowIcon className="btn__icon btn__icon--arrow" />
            </Link>
            <a href={officialXUrl} target="_blank" rel="noopener noreferrer" className="btn" data-cursor-label="FOLLOW">
              <XIcon className="btn__icon" />
              <span>公式Xをフォロー</span>
            </a>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>Divisions</dt>
              <dd>{String(divisions).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Players</dt>
              <dd>{String(valorantCount).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Streamers</dt>
              <dd>{String(streamerCount).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Title</dt>
              <dd className={styles.statText}>VALORANT</dd>
            </div>
          </dl>
        </div>

      </div>

      {/* 右側の淡い斜めパネル + 紫 / 黒の斜線 + 透かし文字（装飾） */}
      <div className={styles.panel} aria-hidden="true">
        <div className={styles.panelPlane} />
        <div className={styles.watermarkClip}>
          <span className={styles.watermark}>AGGRESSION</span>
        </div>
        <div className={`${styles.line} ${styles.lineAccent}`} />
        <div className={`${styles.line} ${styles.lineBlack}`} />
        <p className={styles.vertical}>CAT AGGRESSION — VALORANT — STREAMERS</p>
      </div>
    </section>
  );
}
