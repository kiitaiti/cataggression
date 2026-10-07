/**
 * サイト全体で使うドメイン型。
 * microCMS のレスポンス（raw 型）は client 側で正規化してこの型に揃える。
 * ローカルフォールバックデータも同じ型を使う。
 */

export type Division = "valorant" | "streamer";

export type ImageRef = {
  url: string;
  width: number;
  height: number;
  /** 代替テキストが未設定なら呼び出し側で補う */
  alt?: string;
  /** object-position（顔の位置を合わせたいとき。例: "36% 30%"） */
  position?: string;
};

export type SocialService =
  | "x"
  | "twitch"
  | "youtube"
  | "litlink"
  | "tiktok"
  | "instagram"
  | "other";

export type SocialLink = {
  service: SocialService;
  /** 表示ラベル（未指定なら service から自動生成） */
  label?: string;
  url: string;
};

export type Member = {
  id: string;
  slug: string;
  name: string;
  division: Division;
  sortOrder: number;
  avatar: ImageRef | null;
  coverImage?: ImageRef | null;
  shortBio?: string;
  /** サニタイズ済み HTML（microCMS リッチエディタ） */
  body?: string;
  games?: string[];
  role?: string;
  socialLinks: SocialLink[];
  featuredVideoUrl?: string;
};

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory | null;
  thumbnail?: ImageRef | null;
  excerpt: string;
  /** サニタイズ済み HTML */
  body: string;
  /** ISO 8601。記事日付（articleDate）があればそれ、無ければ publishedAt */
  date: string;
  relatedMembers?: Pick<Member, "id" | "slug" | "name">[];
};

export type Partner = {
  id: string;
  name: string;
  logo: ImageRef | null;
  url?: string;
  sortOrder: number;
  description?: string;
};

export type SiteSettings = {
  teamName: string;
  logo: ImageRef | null;
  heroCatchcopy: string;
  heroDescription: string;
  /** サニタイズ済み HTML または改行区切りテキスト */
  aboutText: string;
  officialXUrl: string;
  contactEmail?: string;
  contactUrl?: string;
  defaultOgImage?: ImageRef | null;
};

/**
 * 取得結果の状態。
 * - "cms":     microCMS から正常取得（0 件もここに含まれる。items.length で判定）
 * - "local":   CMS 未設定のためローカルデータを表示
 * - "error":   CMS 設定済みだが取得に失敗（0 件と区別するため）
 */
export type DataSource = "cms" | "local" | "error";

export type ListResult<T> = {
  items: T[];
  totalCount: number;
  source: DataSource;
  error?: string;
};

export type ItemResult<T> = {
  item: T | null;
  source: DataSource;
  error?: string;
};
