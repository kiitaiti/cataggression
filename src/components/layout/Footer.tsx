import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/lib/cms/types";
import { NAV_ITEMS } from "@/lib/site";
import { XIcon } from "@/components/ui/Icons";
import styles from "./Footer.module.css";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const xUrl = settings?.officialXUrl ?? "https://x.com/cataggression01";
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.stripe} aria-hidden="true" />
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Image
              src="/images/logo/cat-aggression-mark-white.png"
              alt="CAT AGGRESSION"
              width={1012}
              height={1117}
              className={styles.logo}
              sizes="64px"
              loading="lazy"
            />
            <p className={styles.teamName}>
              CAT <b>AGGRESSION</b>
            </p>
            <p className={styles.tagline}>競技と配信、それぞれの舞台で個性を放つeスポーツチーム。</p>
          </div>

          <nav aria-label="フッターナビゲーション" className={styles.col}>
            <p className={styles.colTitle}>Menu</p>
            <ul className={styles.navList}>
              <li>
                <Link href="/">Home</Link>
              </li>
              {NAV_ITEMS.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.jp}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <p className={styles.colTitle}>Connect</p>
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className={styles.xBtn}>
              <XIcon />
              <span>公式X @cataggression01</span>
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© {year} CAT AGGRESSION. All rights reserved.</p>
          <Link href="/privacy" className={styles.legal}>
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
