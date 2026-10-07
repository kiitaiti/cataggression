"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/site";
import { XIcon } from "@/components/ui/Icons";
import styles from "./Header.module.css";

type Props = { officialXUrl: string };

export function Header({ officialXUrl }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // スクロール後に背景を付ける
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ルート変更で閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // 開いている間: Esc で閉じる / フォーカスをパネル内に閉じ込める / 背面スクロールを止める
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <header className={`${styles.header} ${scrolled && !open ? styles.scrolled : ""} ${open ? styles.open : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="CAT AGGRESSION ホーム">
          <Image
            src="/images/logo/cat-aggression-mark-black.png"
            alt="CAT AGGRESSION"
            width={977}
            height={1078}
            priority
            className={styles.logo}
            sizes="36px"
          />
          <span className={styles.brandText} aria-hidden="true">
            CAT <b>AGGRESSION</b>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="メインナビゲーション">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={officialXUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.xLink}
            aria-label="公式X（外部サイト）"
          >
            <XIcon />
          </a>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleBar} />
          <span className={styles.toggleBar} />
        </button>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className={styles.panelList}>
          {NAV_ITEMS.map((item, i) => (
            <li key={item.href} style={{ transitionDelay: `${0.05 + i * 0.05}s` }}>
              <Link href={item.href} className={styles.panelLink} onClick={() => setOpen(false)}>
                <span className={styles.panelLinkEn}>{item.label}</span>
                <span className={styles.panelLinkJp}>{item.jp}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.panelFoot}>
          <a
            href={officialXUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            <XIcon className="btn__icon" />
            <span>公式Xをフォロー</span>
          </a>
          <button type="button" className={`btn btn--sm ${styles.panelClose}`} onClick={close}>
            <span>閉じる</span>
          </button>
        </div>
      </div>
    </header>
  );
}
