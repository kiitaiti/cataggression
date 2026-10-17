"use client";

import { useEffect, useRef } from "react";

/**
 * 紫の稲妻カーソル演出（落ち着いた表現）。
 * ポインターの軌跡を一定距離ごとにサンプリングし、各点を進行方向と垂直に小さくずらして
 * ジグザグの細い線でつなぐ。線の周りに淡い光（ぼかし）を重ね、ところどころに短い枝分かれを出す。
 * - 線は細く（約 1.4px）、不透明度は最大 65%。約 0.42 秒で薄くなって消える（尾は短め）
 * - ゆっくりとした揺らぎだけ入れ、激しい点滅はしない
 * - 全画面 Canvas（pointer-events: none）。動いているときだけ描き、消えたら描画ループを停止
 * - タッチ端末・reduced-motion では無効
 */

type Pt = { x: number; y: number; t: number; seed: number };

const LIFE = 420; // ms
const STEP = 9; // 何 px ごとにサンプリングするか（小さいほど細かいジグザグ）
const MAX_PTS = 80;
const JITTER = 3.2; // ジグザグの振れ幅（px）
const BRANCH_EVERY = 5; // 何点に 1 回、枝分かれ候補にするか

export function BoltTrail({ enabled = true }: { enabled?: boolean }) {
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

    const pts: Pt[] = [];
    let last: { x: number; y: number } | null = null;
    let acc = 0;
    let count = 0;
    let raf = 0;
    let running = false;

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7138d9";
    // 光用の薄い紫（accent が hex のときだけ rgba を作る。そうでなければそのまま使う）
    const m = /^#([0-9a-f]{6})$/i.exec(accent);
    const rgb = m
      ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)]
      : [113, 56, 217];
    const glow = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.55)`;

    // seed から [-1, 1] の決定的な疑似乱数（毎フレーム形が変わらないように）
    const rnd = (seed: number, k: number) => {
      const v = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
      return (v - Math.floor(v)) * 2 - 1;
    };

    // ジグザグ後の座標（進行方向に垂直にずらす）
    const jittered = (i: number) => {
      const p = pts[i];
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      // 隣同士で符号が入れ替わりやすいよう、交互の基準 + ランダム
      const base = i % 2 === 0 ? 1 : -1;
      const off = (base * 0.6 + rnd(p.seed, 1) * 0.6) * JITTER;
      return { x: p.x + nx * off, y: p.y + ny * off, nx, ny, ux: dx / len, uy: dy / len };
    };

    const draw = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      while (pts.length && now - pts[0].t > LIFE) pts.shift();

      if (pts.length >= 2) {
        const sway = 0.9 + 0.1 * Math.sin(now * 0.012); // ごく緩い揺らぎ
        for (let i = 1; i < pts.length; i++) {
          const p0 = jittered(i - 1);
          const p1 = jittered(i);
          const age = (now - pts[i].t) / LIFE;
          const fade = (1 - age) * (1 - age) * sway;

          // 1) 淡い光（太め・ぼかし・低不透明度）
          ctx.globalAlpha = 0.28 * fade;
          ctx.strokeStyle = glow;
          ctx.shadowColor = glow;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();

          // 2) 芯（細い線）
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.65 * fade;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();

          // 3) 短い枝分かれ（控えめに。候補点のうち約半分だけ）
          const p = pts[i];
          if (p.seed % BRANCH_EVERY === 0 && rnd(p.seed, 2) > 0) {
            const side = rnd(p.seed, 3) > 0 ? 1 : -1;
            const ang = side * (0.55 + rnd(p.seed, 4) * 0.2); // 約 ±30°〜45°
            const ca = Math.cos(ang);
            const sa = Math.sin(ang);
            // 進行方向と逆向き（後ろ）へ伸ばすと稲妻らしく見える
            const bx = -(p1.ux * ca - p1.uy * sa);
            const by = -(p1.ux * sa + p1.uy * ca);
            const blen = 7 + rnd(p.seed, 5) * 3; // 4〜10px
            const mx = p1.x + bx * blen * 0.55 + p1.nx * side * 1.5;
            const my = p1.y + by * blen * 0.55 + p1.ny * side * 1.5;
            ctx.globalAlpha = 0.5 * fade;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mx, my);
            ctx.lineTo(p1.x + bx * blen, p1.y + by * blen);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (pts.length) {
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
        acc += dist;
        if (acc >= STEP) {
          acc = 0;
          count += 1;
          pts.push({ x, y, t: now, seed: count });
          if (pts.length > MAX_PTS) pts.shift();
          ensureLoop();
        }
      } else {
        pts.length = 0;
        count += 1;
        pts.push({ x, y, t: now, seed: count });
      }
      last = { x, y };
    };
    const onLeave = () => {
      last = null;
      acc = 0;
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
      data-bolt-trail=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
}
