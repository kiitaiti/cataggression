/** 公開 URL 関連。NEXT_PUBLIC_SITE_URL 未設定時は絶対 URL を生成しない（架空ドメインを埋め込まない）。 */

export const SITE_NAME = "CAT AGGRESSION";
export const SITE_DESCRIPTION =
  "CAT AGGRESSION（キャットアグレッション）はVALORANT部門とストリーマー部門を持つeスポーツチームです。メンバー情報、配信・SNSリンク、ニュースを掲載しています。";

export function getSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function absoluteUrl(path: string): string | undefined {
  const base = getSiteUrl();
  return base ? new URL(path, base).toString() : undefined;
}

export const NAV_ITEMS = [
  { href: "/members", label: "MEMBERS", jp: "メンバー" },
  { href: "/news", label: "NEWS", jp: "ニュース" },
  { href: "/about", label: "ABOUT", jp: "チームについて" },
  { href: "/partners", label: "PARTNERS", jp: "パートナー" },
  { href: "/contact", label: "CONTACT", jp: "お問い合わせ" },
] as const;

/**
 * カスタムカーソルの見た目:
 *   "claw"    : 紫の点 + 動きに沿って 3 本の爪痕が残り、約 0.9 秒で消える（既定）
 *   "ring"    : 紫の点 + 細い円
 *   "bracket" : 紫の点 + 4 本のブラケット
 * URL に ?cursor=claw|ring|bracket を付けるとそのセッション中だけ切り替わる。
 */
export type CursorVariant = "claw" | "ring" | "bracket";
export const CURSOR_VARIANT: CursorVariant = "claw";
