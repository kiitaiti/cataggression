"use client";

import { useEffect, useRef } from "react";

/**
 * 猫の爪痕カーソル演出。
 * ポインターが一定距離（SPACING）進むごとに、進行方向に沿った「引っかき傷」を 1 セット刻む。
 * 1 セット = 3 本の爪痕。各爪痕は両端が尖り、頭側（進行方向）が太く尾側が細い三日月状の塗り形で、
 * わずかに弧を描き、位置・角度・長さに微妙なバラつきを入れて「線」ではなく「傷」に見せる。
 * - 全画面の Canvas（pointer-events: none）に描画。DOM/操作を妨げない
 * - 動いているときだけ刻む（停止中に跡は残らない）。速いほど長く太い
 * - 約 0.4 秒で薄く・短くなりながら消える（尾は短め）
 * - 跡が消えたら描画ループを停止
 * - タッチ端末・reduced-motion では無効
 */

type Mark = {
  x: number;
  y: number;
  ux: number; // 進行方向の単位ベクトル
  uy: number;
  len: number; // 爪痕の全長（px）
  w: number; // 最大幅（px）
  t: number;
  seed: number;
};

const LIFE = 380; // ms（残る時間。短めにして尾を短く）
const SPACING = 26; // 何 px 進むごとに 1 セット刻むか
const CLAWS = [-7, 0, 7]; // 3 本の爪の間隔（px）
const MAX_MARKS = 90;

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

    const marks: Mark[] = [];
    let last: { x: number; y: number; t: number } | null = null;
    let acc = 0; // 前回刻んでからの移動距離
    let raf = 0;
    let running = false;

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7138d9";

    // seed から [-1, 1] の決定的な疑似乱数（描画ごとにブレないように）
    const rnd = (seed: number, k: number) => {
      const v = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
      return (v - Math.floor(v)) * 2 - 1;
    };

    const drawClaw = (
      cx: number,
      cy: number,
      ux: number,
      uy: number,
      len: number,
      w: number,
      bend: number,
    ) => {
      const nx = -uy;
      const ny = ux;
      // 頭（進行方向側）と尾
      const hx = cx + ux * len * 0.5;
      const hy = cy + uy * len * 0.5;
      const tx = cx - ux * len * 0.5;
      const ty = cy - uy * len * 0.5;
      // 最も太くなる位置は頭寄り（傷は入り口が深く、抜けていくほど細い）
      const px = cx + ux * len * 0.18 + nx * bend;
      const py = cy + uy * len * 0.18 + ny * bend;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(px + nx * w, py + ny * w, hx, hy);
      ctx.quadraticCurveTo(px - nx * w * 0.55, py - ny * w * 0.55, tx, ty);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = accent;
      while (marks.length && now - marks[0].t > LIFE) marks.shift();
      for (const m of marks) {
        const age = (now - m.t) / LIFE; // 0 → 1
        const fade = (1 - age) * (1 - age);
        const shrink = 1 - age * 0.35; // 消えながら少し短く・細く（傷が閉じる）
        CLAWS.forEach((off, i) => {
          const r0 = rnd(m.seed, i);
          const r1 = rnd(m.seed, i + 3);
          const r2 = rnd(m.seed, i + 6);
          // 爪ごとの微妙なズレ：横位置・前後位置・角度・長さ
          const side = off + r0 * 1.2;
          const along = r1 * 2.5 + (i === 1 ? 1.5 : -1.5); // 中央の爪がやや前に出る
          const ang = r2 * 0.12 + (i - 1) * 0.06; // 外側の爪はわずかに扇状に開く
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const ux = m.ux * ca - m.uy * sa;
          const uy = m.ux * sa + m.uy * ca;
          const nx = -m.uy;
          const ny = m.ux;
          const cx = m.x + nx * side + m.ux * along;
          const cy = m.y + ny * side + m.uy * along;
          const len = m.len * (i === 1 ? 1 : 0.82 + r1 * 0.06) * shrink;
          const w = m.w * (i === 1 ? 1 : 0.8) * shrink;
          ctx.globalAlpha = 0.85 * fade * (i === 1 ? 1 : 0.85);
          drawClaw(cx, cy, ux, uy, len, w, (i - 1) * 0.6 + r0 * 0.4);
        });
      }
      ctx.globalAlpha = 1;
      if (marks.length) {
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
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const dt = Math.max(1, now - last.t);
        if (dist > 1) {
          acc += dist;
          if (acc >= SPACING) {
            acc = 0;
            const speed = dist / dt; // px/ms
            const ux = dx / dist;
            const uy = dy / dist;
            const len = 14 + Math.min(10, speed * 8); // 14〜24px（速いほど長い）
            const w = 2.2 + Math.min(1.3, speed * 1.3); // 2.2〜3.5px（最大幅の半分）
            marks.push({ x, y, ux, uy, len, w, t: now, seed: now % 10000 });
            if (marks.length > MAX_MARKS) marks.shift();
            ensureLoop();
          }
        }
      }
      last = { x, y, t: now };
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
