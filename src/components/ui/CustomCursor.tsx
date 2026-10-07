"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.css";
import { CURSOR_VARIANT, type CursorVariant } from "@/lib/site";
import { ClawTrail } from "./ClawTrail";

/**
 * サイト全体のカスタムカーソル。
 * - 中央の白い点は即時追従、4本のブラケットは緩やかに追従
 * - リンク/ボタン上でブラケットが少し開く
 * - data-cursor-label="VIEW" 等を持つ要素上では短いラベルを表示
 * - テキスト入力・テキスト選択中は標準カーソルを優先
 * - タッチ端末・reduced-motion では無効
 * - 初期化に成功したときだけ html.has-custom-cursor を付けて標準カーソルを隠す
 *
 * 見た目は 3 種類:
 *   claw    : 紫の点 + 軌跡に猫の爪痕（3 本の引っかき線）が残って消える（ClawTrail.tsx）
 *   ring    : 紫の点 + 細い円。リンク上で円が広がり薄い紫で塗られ、ラベルは円の中に表示
 *   bracket : 紫の点 + 4 本のブラケット。リンク上でブラケットが開く
 * 既定は lib/site.ts の CURSOR_VARIANT。比較用に URL の ?cursor=claw|ring|bracket でも切り替え可能。
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [variant, setVariant] = useState<CursorVariant>(CURSOR_VARIANT);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("cursor");
    if (q === "ring" || q === "bracket" || q === "claw") {
      setVariant(q);
      try {
        sessionStorage.setItem("cursor-variant", q);
      } catch {
        /* ignore */
      }
    } else {
      try {
        const saved = sessionStorage.getItem("cursor-variant");
        if (saved === "ring" || saved === "bracket" || saved === "claw") setVariant(saved);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!finePointer || reduced || !dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let visible = false;
    let raf = 0;
    let idle = true;

    const setState = (mode: "default" | "link" | "text" | "hidden", text = "") => {
      ring.dataset.mode = mode;
      dot.dataset.mode = mode;
      if (text) {
        label.textContent = text;
        ring.dataset.label = "true";
      } else {
        delete ring.dataset.label;
      }
    };

    const resolveTarget = (el: Element | null) => {
      if (!el) return setState("default");
      if (
        el.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']")
      ) {
        return setState("text");
      }
      const labeled = el.closest<HTMLElement>("[data-cursor-label]");
      if (labeled) return setState("link", labeled.dataset.cursorLabel);
      if (el.closest("a, button, [role='button'], summary, label")) return setState("link");
      setState("default");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        rx = tx;
        ry = ty;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      resolveTarget(e.target as Element | null);
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      // ブラケットは緩やかに追従（遅れすぎるとクリック位置が分からなくなるので係数は高め）
      const k = variant === "ring" ? 0.22 : variant === "claw" ? 0.35 : 0.28;
      rx += (tx - rx) * k;
      ry += (ty - ry) * k;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(tx - rx) < 0.1 && Math.abs(ty - ry) < 0.1) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onDown = () => ring.classList.add(styles.pressed);
    const onUp = () => ring.classList.remove(styles.pressed);

    // テキスト選択中は標準カーソル
    const onSelection = () => {
      const sel = document.getSelection();
      const selecting = !!sel && sel.type === "Range";
      root.classList.toggle("has-custom-cursor", !selecting);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("selectionchange", onSelection);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("selectionchange", onSelection);
      root.classList.remove("has-custom-cursor");
    };
  }, [variant]);

  return (
    <>
    <ClawTrail enabled={variant === "claw"} />
    <div className={styles.layer} aria-hidden="true" data-variant={variant}>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={variant === "ring" ? styles.circle : styles.ring}>
        {variant === "bracket" && (
          <>
            <span className={`${styles.br} ${styles.tl}`} />
            <span className={`${styles.br} ${styles.tr}`} />
            <span className={`${styles.br} ${styles.bl}`} />
            <span className={`${styles.br} ${styles.brc}`} />
          </>
        )}
        <span ref={labelRef} className={styles.label} />
      </div>
    </div>
    </>
  );
}
