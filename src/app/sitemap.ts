import type { MetadataRoute } from "next";
import { getAllNewsSlugs, getMembers } from "@/lib/cms/repositories";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  // 本番ドメイン未設定時は空のサイトマップ（架空 URL を出さない）
  if (!base) return [];
  const url = (p: string) => new URL(p, base).toString();
  const now = new Date();
  const [members, newsSlugs] = await Promise.all([getMembers(), getAllNewsSlugs()]);
  return [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/members"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/news"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: url("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/partners"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...members.items.map((m) => ({
      url: url(`/members/${m.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...newsSlugs.map((s) => ({
      url: url(`/news/${s}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
