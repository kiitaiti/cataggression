/**
 * メンバー画像の対応表（ローカルデータ用）。
 * microCMS 接続後は CMS の avatar フィールドが優先され、このファイルは使われません。
 *
 * - 6 名は依頼者から提供された立ち絵 / キービジュアルを `public/images/members/` に保存（2026-09-29）
 * - それ以外は `public/images/members/unassigned/` の X アイコン画像（400×400、依頼者指定の対応）
 */

export type LocalImage = { url: string; width: number; height: number; position?: string };

const ICON = (f: string): LocalImage => ({ url: `/images/members/unassigned/${f}`, width: 400, height: 400 });

export const MEMBER_IMAGES: Partial<Record<string, LocalImage>> = {
  // ---- VALORANT（X アイコン）----
  n4yut4: ICON("02-glasses-gun-black.jpg"),
  findingnimo: ICON("01-cat-photo.jpg"),
  kosty: ICON("14-spider-comic.jpg"),
  meatoire: ICON("12-pink-hair-grin.jpg"),
  miso: ICON("15-miso.jpg"),
  tori: ICON("16-tori.jpg"),
  // ---- STREAMERS（提供素材）----
  yowai: { url: "/images/members/yowai.jpg", width: 1210, height: 1600, position: "50% 12%" },
  "hanabishi-hachi": { url: "/images/members/hanabishi-hachi.jpg", width: 1600, height: 900, position: "34% 40%" },
  mashuo55: ICON("10-white-hair-black-cat-plush.jpg"),
  nemura: { url: "/images/members/nemura.png", width: 985, height: 1400, position: "55% 8%" },
  asty: { url: "/images/members/asty.png", width: 708, height: 1070 },
  "kiraboshi-stella": { url: "/images/members/kiraboshi-stella.png", width: 591, height: 1400, position: "50% 6%" },
  mangle: { url: "/images/members/mangle.png", width: 525, height: 1400, position: "50% 6%" },
};
