"use client";

import { useEffect, useRef } from "react";

/**
 * 猫の爪痕カーソル演出。
 * ポインターの軌跡に沿って 3 本の平行な引っかき線（爪痕）を描き、約 0.55 秒で細くなりながら消える（最大 70% 不透明の控えめな表現）。
 * - 全画面の Canvas（pointer-events: none）に描画。DOM/操作を妨げない
 * - 動いているときだけ描く（停止中に跡は残らない）。速いほど太く長い爪痕になる
 * - 動きが止まって跡が消えたら描画ループを停止（無駄な描画をしない）
 * - タッチ端末・reduced-motion では無効
 */

type Seg = { x0: number; y0: number; x1: number; y1: number; t: number; w: number };

const LIFE = 550; // ms（控えめに: 残る長さを短く）
const CLAWS = [-11, 0, 11]; // 爪の間隔（px）

export function ClawTrail({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!finePointer || reduced || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    const segs: Seg[] = [];
    let last: { x: number; y: number; t: number } | null = null;
    let raf = 0;
    let running = false;

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7138d9";

    const draw = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // 古いものから削除
      while (segs.length && now - segs[0].t > LIFE) segs.shift();
      for (const s of segs) {
        const age = (now - s.t) / LIFE; // 0 → 1
        const alpha = 0.7 * (1 - age) * (1 - age); // 最大 70% の不透明度。後半で速く消える
        const dx = s.x1 - s.x0;
        const dy = s.y1 - s.y0;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len; // 進行方向に垂直な単位ベクトル
        const ny = dx / len;
        CLAWS.forEach((off, i) => {
          // 3 本のうち中央をやや太く・外側は少しずらして有機的に
          const o = off * (0.92 + 0.08 * Math.sin(s.t * 0.01 + i));
          // 時間とともに細くなる（引っかき傷が閉じていくイメージ）
          const w = s.w * (i === 1 ? 1 : 0.85) * (1 - age * 0.5);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = alpha * (i === 1 ? 1 : 0.8);
          ctx.lineWidth = Math.max(0.8, w);
          ctx.beginPath();
          ctx.moveTo(s.x0 + nx * o, s.y0 + ny * o);
          ctx.lineTo(s.x1 + nx * o, s.y1 + ny * o);
          ctx.stroke();
        });
      }
      ctx.globalAlpha = 1;
      if (segs.length) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };
    const ensureLoop = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const dt = Math.max(1, now - last.t);
        // 一定以上動いたときだけ爪痕を刻む（停止中は描かない）
        if (dist > 2.5) {
          const speed = dist / dt; // px/ms
          const w = 2.8 + Math.min(3.2, speed * 3); // 速いほど太い（2.8〜6px）
          segs.push({ x0: last.x, y0: last.y, x1: x, y1: y, t: now, w });
          if (segs.length > 240) segs.shift();
          ensureLoop();
        }
      }
      last = { x, y, t: now };
    };
    const onLeave = () => {
      last = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-claw-trail=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
        mixBlendMode: "multiply",
      }}
    />
  );
}
