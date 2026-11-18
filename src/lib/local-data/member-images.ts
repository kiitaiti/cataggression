/**
 * メンバー画像の対応表（ローカルデータ用）。
 * microCMS 接続後は CMS の avatar フィールドが優先され、このファイルは使われません。
 *
 * - 6 名は依頼者から提供された立ち絵 / キービジュアルを `public/images/members/` に保存（2026-09-29）
 * - 立ち絵 5 名分は、ましゅお55 と同じバストアップの画角に揃えた正方形版を `icon/` に用意（2026-11-18）
 * - それ以外は `public/images/members/unassigned/` の X アイコン画像（400×400、依頼者指定の対応）
 */

export type LocalImage = { url: string; width: number; height: number; position?: string };

const ICON = (f: string): LocalImage => ({ url: `/images/members/unassigned/${f}`, width: 400, height: 400 });

export const MEMBER_IMAGES: Partial<Record<string, LocalImage>> = {
  // ---- VALORANT（X アイコン）----
  n4yut4: ICON("02-glasses-gun-black.jpg"),
  // kosty / meatoire: 版権物アイコンのため画像を表示しない（2026-11-18 依頼者指示）
  miso: ICON("15-miso.jpg"),
  tori: ICON("16-tori.jpg"),
  pechiko: { url: "/images/members/pechiko.jpg", width: 1280, height: 1280 },
  seta: { url: "/images/members/seta.jpg", width: 400, height: 400 },
  // ---- STREAMERS（提供素材）----
  yowai: { url: "/images/members/icon/yowai.jpg", width: 800, height: 800 },
  "hanabishi-hachi": { url: "/images/members/hanabishi-hachi.jpg", width: 1600, height: 900, position: "34% 40%" },
  mashuo55: { url: "/images/members/mashuo55.png", width: 1218, height: 1400, position: "50% 20%" },
  nemura: { url: "/images/members/icon/nemura.png", width: 800, height: 800 },
  asty: { url: "/images/members/icon/asty.png", width: 800, height: 800 },
  "kiraboshi-stella": { url: "/images/members/icon/kiraboshi-stella.png", width: 800, height: 800 },
  mangle: { url: "/images/members/icon/mangle.png", width: 800, height: 800 },
  garyu: { url: "/images/members/garyu.jpg", width: 400, height: 400 },
  mage: { url: "/images/members/mage.png", width: 1024, height: 1024 },
  mogumogu: { url: "/images/members/mogumogu.png", width: 1000, height: 1000, position: "50% 30%" },
};
