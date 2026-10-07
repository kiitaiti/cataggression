import "server-only";

/**
 * microCMS の薄いクライアント。
 * - API キーはサーバー側環境変数からのみ読む（クライアントバンドルには含まれない）
 * - fetch には Next.js のキャッシュタグを付け、Webhook から on-demand revalidate できるようにする
 * - リスト API は limit 上限（microCMS は 1 リクエスト最大 100 件）を考慮して全件ページネーションする
 */

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;

/** microCMS が設定されているか（未設定ならローカルデータを使う） */
export function isCmsConfigured(): boolean {
  return Boolean(SERVICE_DOMAIN && API_KEY);
}

export class CmsError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "CmsError";
    this.status = status;
  }
}

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type MicroCMSImage = {
  url: string;
  width?: number;
  height?: number;
};

export type MicroCMSBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
};

type Query = Record<string, string | number | undefined>;

const MAX_LIMIT = 100;
/** ISR の保険としての再検証間隔（秒）。通常は Webhook による on-demand revalidate が先に効く */
export const DEFAULT_REVALIDATE_SECONDS = 60 * 60;

/** テスト用: モックサーバーへ向けたいときだけ設定（通常は未設定） */
const API_BASE = process.env.MICROCMS_API_BASE || `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

function buildUrl(endpoint: string, query: Query = {}, contentId?: string): string {
  const base = `${API_BASE}/${endpoint}${
    contentId ? `/${encodeURIComponent(contentId)}` : ""
  }`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(url: string, tags: string[]): Promise<T> {
  if (!isCmsConfigured()) {
    throw new CmsError("microCMS is not configured");
  }
  const res = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": API_KEY as string },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS, tags },
  });
  if (!res.ok) {
    throw new CmsError(`microCMS request failed: ${res.status} ${res.statusText}`, res.status);
  }
  return (await res.json()) as T;
}

/** リスト API を 1 ページ取得 */
export async function fetchList<T>(
  endpoint: string,
  query: Query = {},
  tags: string[] = [endpoint],
): Promise<MicroCMSListResponse<T>> {
  const limit = Math.min(Number(query.limit ?? MAX_LIMIT), MAX_LIMIT);
  return request<MicroCMSListResponse<T>>(buildUrl(endpoint, { ...query, limit }), tags);
}

/** リスト API を全件取得（offset でページネーション） */
export async function fetchAll<T>(
  endpoint: string,
  query: Query = {},
  tags: string[] = [endpoint],
): Promise<{ contents: T[]; totalCount: number }> {
  const contents: T[] = [];
  let offset = 0;
  let totalCount = 0;
  // 無限ループ防止（最大 50 ページ = 5,000 件）
  for (let page = 0; page < 50; page++) {
    const res = await fetchList<T>(endpoint, { ...query, limit: MAX_LIMIT, offset }, tags);
    contents.push(...res.contents);
    totalCount = res.totalCount;
    offset += res.contents.length;
    if (res.contents.length === 0 || offset >= res.totalCount) break;
  }
  return { contents, totalCount };
}

/** 単一コンテンツ（リスト形式の 1 件、またはオブジェクト形式）を取得 */
export async function fetchObject<T>(
  endpoint: string,
  query: Query = {},
  tags: string[] = [endpoint],
): Promise<T> {
  return request<T>(buildUrl(endpoint, query), tags);
}

/** リスト形式 API から特定フィールド一致の 1 件を取得（slug 検索用） */
export async function fetchOneByField<T>(
  endpoint: string,
  field: string,
  value: string,
  query: Query = {},
  tags: string[] = [endpoint],
): Promise<T | null> {
  const res = await fetchList<T>(
    endpoint,
    { ...query, filters: `${field}[equals]${value}`, limit: 1 },
    tags,
  );
  return res.contents[0] ?? null;
}

export function toImageRef(img?: MicroCMSImage | null) {
  if (!img?.url) return null;
  return {
    url: img.url,
    // microCMS の画像は width/height を返す。欠けていても layout shift を避けるため既定値を入れる
    width: img.width ?? 1200,
    height: img.height ?? 1200,
  };
}
