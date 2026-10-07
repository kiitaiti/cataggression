import "server-only";
import {
  fetchAll,
  fetchList,
  fetchObject,
  fetchOneByField,
  isCmsConfigured,
  toImageRef,
  type MicroCMSBase,
  type MicroCMSImage,
} from "./client";
import { sanitizeCmsHtml } from "./sanitize";
import type {
  Division,
  ItemResult,
  ListResult,
  Member,
  NewsArticle,
  NewsCategory,
  Partner,
  SiteSettings,
  SocialLink,
  SocialService,
} from "./types";
import { localMembers } from "@/lib/local-data/members";
import { localSettings } from "@/lib/local-data/settings";

/* ------------------------------------------------------------------ */
/* microCMS の raw 型（docs/microcms-setup.md のフィールド定義と対応）     */
/* ------------------------------------------------------------------ */

type RawSocialLink = { fieldId?: string; service?: string[] | string; label?: string; url: string };

type RawMember = MicroCMSBase & {
  name: string;
  slug: string;
  division: string[] | string; // セレクトフィールドは配列で返る
  sortOrder?: number;
  avatar?: MicroCMSImage;
  coverImage?: MicroCMSImage;
  shortBio?: string;
  body?: string;
  games?: string; // カンマ区切りテキスト
  role?: string;
  socialLinks?: RawSocialLink[];
  featuredVideoUrl?: string;
};

type RawCategory = MicroCMSBase & { name: string; slug: string };

type RawNews = MicroCMSBase & {
  title: string;
  slug: string;
  category?: RawCategory;
  thumbnail?: MicroCMSImage;
  excerpt?: string;
  body?: string;
  articleDate?: string;
  relatedMembers?: Pick<RawMember, "id" | "slug" | "name">[];
};

type RawPartner = MicroCMSBase & {
  name: string;
  logo?: MicroCMSImage;
  url?: string;
  sortOrder?: number;
  description?: string;
};

type RawSiteSettings = MicroCMSBase & {
  teamName?: string;
  logo?: MicroCMSImage;
  heroCatchcopy?: string;
  heroDescription?: string;
  aboutText?: string;
  officialXUrl?: string;
  contactEmail?: string;
  contactUrl?: string;
  defaultOgImage?: MicroCMSImage;
};

/* ------------------------------------------------------------------ */
/* 正規化                                                                */
/* ------------------------------------------------------------------ */

function first(v: string[] | string | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function toDivision(v: string[] | string | undefined): Division {
  return first(v) === "valorant" ? "valorant" : "streamer";
}

function toService(v: string[] | string | undefined): SocialService {
  const s = (first(v) ?? "other").toLowerCase();
  const known: SocialService[] = ["x", "twitch", "youtube", "litlink", "tiktok", "instagram"];
  return (known as string[]).includes(s) ? (s as SocialService) : "other";
}

function normalizeMember(raw: RawMember): Member {
  const socialLinks: SocialLink[] = (raw.socialLinks ?? [])
    .filter((l) => l?.url)
    .map((l) => ({ service: toService(l.service), label: l.label || undefined, url: l.url }));
  const games = (raw.games ?? "")
    .split(/[,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    division: toDivision(raw.division),
    sortOrder: raw.sortOrder ?? 9999,
    avatar: toImageRef(raw.avatar),
    coverImage: toImageRef(raw.coverImage),
    shortBio: raw.shortBio || undefined,
    body: raw.body ? sanitizeCmsHtml(raw.body) : undefined,
    games: games.length ? games : undefined,
    role: raw.role || undefined,
    socialLinks,
    featuredVideoUrl: raw.featuredVideoUrl || undefined,
  };
}

function normalizeCategory(raw?: RawCategory): NewsCategory | null {
  if (!raw) return null;
  return { id: raw.id, name: raw.name, slug: raw.slug };
}

function normalizeNews(raw: RawNews): NewsArticle {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    category: normalizeCategory(raw.category),
    thumbnail: toImageRef(raw.thumbnail),
    excerpt: raw.excerpt ?? "",
    body: sanitizeCmsHtml(raw.body),
    date: raw.articleDate || raw.publishedAt || raw.createdAt,
    relatedMembers: raw.relatedMembers?.map((m) => ({ id: m.id, slug: m.slug, name: m.name })),
  };
}

function normalizePartner(raw: RawPartner): Partner {
  return {
    id: raw.id,
    name: raw.name,
    logo: toImageRef(raw.logo),
    url: raw.url || undefined,
    sortOrder: raw.sortOrder ?? 9999,
    description: raw.description || undefined,
  };
}

function normalizeSettings(raw: RawSiteSettings): SiteSettings {
  return {
    teamName: raw.teamName || localSettings.teamName,
    logo: toImageRef(raw.logo) ?? localSettings.logo,
    heroCatchcopy: raw.heroCatchcopy || localSettings.heroCatchcopy,
    heroDescription: raw.heroDescription || localSettings.heroDescription,
    aboutText: raw.aboutText || localSettings.aboutText,
    officialXUrl: raw.officialXUrl || localSettings.officialXUrl,
    contactEmail: raw.contactEmail || undefined,
    contactUrl: raw.contactUrl || undefined,
    defaultOgImage: toImageRef(raw.defaultOgImage),
  };
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

/* ------------------------------------------------------------------ */
/* Members                                                               */
/* ------------------------------------------------------------------ */

export async function getMembers(): Promise<ListResult<Member>> {
  if (!isCmsConfigured()) {
    const items = [...localMembers].sort(bySort);
    return { items, totalCount: items.length, source: "local" };
  }
  try {
    const { contents, totalCount } = await fetchAll<RawMember>("members", {
      orders: "sortOrder",
      fields:
        "id,name,slug,division,sortOrder,avatar,shortBio,games,role,socialLinks,featuredVideoUrl",
    });
    return { items: contents.map(normalizeMember).sort(bySort), totalCount, source: "cms" };
  } catch (e) {
    return { items: [], totalCount: 0, source: "error", error: errorMessage(e) };
  }
}

export async function getMemberBySlug(slug: string): Promise<ItemResult<Member>> {
  if (!isCmsConfigured()) {
    return { item: localMembers.find((m) => m.slug === slug) ?? null, source: "local" };
  }
  try {
    const raw = await fetchOneByField<RawMember>("members", "slug", slug, {}, [
      "members",
      `members:${slug}`,
    ]);
    return { item: raw ? normalizeMember(raw) : null, source: "cms" };
  } catch (e) {
    return { item: null, source: "error", error: errorMessage(e) };
  }
}

/* ------------------------------------------------------------------ */
/* News                                                                  */
/* ------------------------------------------------------------------ */

export type NewsListOptions = {
  page?: number;
  perPage?: number;
  categorySlug?: string;
};

export async function getNews(opts: NewsListOptions = {}): Promise<ListResult<NewsArticle>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 12));
  if (!isCmsConfigured()) {
    // CMS 未設定時は記事 0 件（架空記事は表示しない）
    return { items: [], totalCount: 0, source: "local" };
  }
  try {
    const filters = opts.categorySlug ? `category.slug[equals]${opts.categorySlug}` : undefined;
    const res = await fetchList<RawNews>("news", {
      orders: "-articleDate,-publishedAt",
      limit: perPage,
      offset: (page - 1) * perPage,
      filters,
      fields: "id,title,slug,category,thumbnail,excerpt,articleDate,publishedAt,createdAt",
    });
    return {
      items: res.contents.map(normalizeNews),
      totalCount: res.totalCount,
      source: "cms",
    };
  } catch (e) {
    return { items: [], totalCount: 0, source: "error", error: errorMessage(e) };
  }
}

export async function getAllNewsSlugs(): Promise<string[]> {
  if (!isCmsConfigured()) return [];
  try {
    const { contents } = await fetchAll<Pick<RawNews, "slug">>("news", { fields: "slug" });
    return contents.map((c) => c.slug);
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<ItemResult<NewsArticle>> {
  if (!isCmsConfigured()) return { item: null, source: "local" };
  try {
    const raw = await fetchOneByField<RawNews>("news", "slug", slug, {}, ["news", `news:${slug}`]);
    return { item: raw ? normalizeNews(raw) : null, source: "cms" };
  } catch (e) {
    return { item: null, source: "error", error: errorMessage(e) };
  }
}

export async function getNewsCategories(): Promise<ListResult<NewsCategory>> {
  if (!isCmsConfigured()) return { items: [], totalCount: 0, source: "local" };
  try {
    const { contents, totalCount } = await fetchAll<RawCategory>("categories", {
      fields: "id,name,slug",
    });
    return {
      items: contents.map((c) => normalizeCategory(c) as NewsCategory),
      totalCount,
      source: "cms",
    };
  } catch (e) {
    return { items: [], totalCount: 0, source: "error", error: errorMessage(e) };
  }
}

/* ------------------------------------------------------------------ */
/* Partners                                                              */
/* ------------------------------------------------------------------ */

export async function getPartners(): Promise<ListResult<Partner>> {
  if (!isCmsConfigured()) {
    // 提供済みスポンサー無し → 空（架空ロゴを並べない）
    return { items: [], totalCount: 0, source: "local" };
  }
  try {
    const { contents, totalCount } = await fetchAll<RawPartner>("partners", {
      orders: "sortOrder",
    });
    return { items: contents.map(normalizePartner).sort(bySort), totalCount, source: "cms" };
  } catch (e) {
    return { items: [], totalCount: 0, source: "error", error: errorMessage(e) };
  }
}

/* ------------------------------------------------------------------ */
/* Site settings                                                         */
/* ------------------------------------------------------------------ */

export async function getSiteSettings(): Promise<ItemResult<SiteSettings>> {
  if (!isCmsConfigured()) return { item: localSettings, source: "local" };
  try {
    const raw = await fetchObject<RawSiteSettings>("site-settings", {}, ["site-settings"]);
    return { item: normalizeSettings(raw), source: "cms" };
  } catch (e) {
    // 設定取得失敗時もサイトが崩れないようローカル既定値で表示
    return { item: localSettings, source: "error", error: errorMessage(e) };
  }
}
