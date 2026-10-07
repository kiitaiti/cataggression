"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * [data-reveal] 要素が画面に入ったら .is-visible を付ける軽量スクロール演出。
 * IntersectionObserver 非対応 / reduced-motion では即座に表示。
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add("js");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((el) => {
      if (!el.classList.contains("is-visible")) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
