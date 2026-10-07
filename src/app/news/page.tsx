import type { Metadata } from "next";
import Link from "next/link";
import { getNews, getNewsCategories } from "@/lib/cms/repositories";
import { NewsState } from "@/components/sections/NewsSection";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import styles from "./news.module.css";

export const revalidate = 3600;

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "News",
  description: `${SITE_NAME}のニュース一覧。チームからのお知らせや活動のアップデートを掲載しています。`,
  alternates: absoluteUrl("/news") ? { canonical: "/news" } : undefined,
};

type SearchParams = Promise<{ category?: string; page?: string }>;

export default async function NewsIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const categorySlug = sp.category?.trim() || undefined;

  const [news, categories] = await Promise.all([
    getNews({ page, perPage: PER_PAGE, categorySlug }),
    getNewsCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(news.totalCount / PER_PAGE));
  const pageHref = (p: number) => {
    const q = new URLSearchParams();
    if (categorySlug) q.set("category", categorySlug);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/news?${s}` : "/news";
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.head}>
          <nav className="crumbs" aria-label="パンくずリスト">
            <Link href="/">HOME</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">NEWS</span>
          </nav>
          <p className="sec-eyebrow">Latest</p>
          <h1 className="sec-title">News</h1>
          <p className="sec-lead">チームからのお知らせ、活動のアップデート。</p>
        </header>

        {categories.items.length > 0 && (
          <nav aria-label="カテゴリで絞り込み" className={styles.filters}>
            <Link href="/news" className={`${styles.filter} ${!categorySlug ? styles.filterActive : ""}`} aria-current={!categorySlug ? "page" : undefined}>
              <span>ALL</span>
            </Link>
            {categories.items.map((c) => (
              <Link
                key={c.id}
                href={`/news?category=${encodeURIComponent(c.slug)}`}
                className={`${styles.filter} ${categorySlug === c.slug ? styles.filterActive : ""}`}
                aria-current={categorySlug === c.slug ? "page" : undefined}
              >
                <span>{c.name}</span>
              </Link>
            ))}
          </nav>
        )}

        <NewsState
          news={news}
          emptyText={
            categorySlug
              ? "このカテゴリの記事はまだありません。"
              : "現在公開中のニュースはありません。最新情報は公式Xでお知らせします。"
          }
        />

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="ページ送り">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="btn btn--sm" rel="prev">
                <span>前へ</span>
              </Link>
            ) : (
              <span />
            )}
            <span className={styles.pageInfo}>
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="btn btn--sm" rel="next">
                <span>次へ</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
