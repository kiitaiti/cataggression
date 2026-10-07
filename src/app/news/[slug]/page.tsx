import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllNewsSlugs, getNewsBySlug } from "@/lib/cms/repositories";
import { formatDate } from "@/lib/format";
import { ArrowIcon } from "@/components/ui/Icons";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import styles from "../news.module.css";

type Params = { slug: string };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getNewsBySlug(slug);
  if (!item) return { title: "News not found" };
  return {
    title: item.title,
    description: item.excerpt || `${SITE_NAME}のニュース`,
    alternates: absoluteUrl(`/news/${slug}`) ? { canonical: `/news/${slug}` } : undefined,
    openGraph: {
      type: "article",
      title: item.title,
      description: item.excerpt,
      publishedTime: item.date,
      ...(item.thumbnail ? { images: [{ url: item.thumbnail.url, width: item.thumbnail.width, height: item.thumbnail.height }] } : {}),
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { item: article, source } = await getNewsBySlug(slug);
  if (!article) {
    if (source === "error") {
      return (
        <div className={`container ${styles.article}`}>
          <p className="notice" role="alert">
            記事を取得できませんでした。時間をおいて再度お試しください。
          </p>
        </div>
      );
    }
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    datePublished: article.date,
    description: article.excerpt,
    publisher: { "@type": "Organization", name: SITE_NAME },
    ...(article.thumbnail ? { image: [article.thumbnail.url] } : {}),
    ...(absoluteUrl(`/news/${article.slug}`) ? { mainEntityOfPage: absoluteUrl(`/news/${article.slug}`) } : {}),
  };

  return (
    <article className={styles.article}>
      <div className={`container ${styles.articleInner}`}>
        <nav className="crumbs" aria-label="パンくずリスト">
          <Link href="/">HOME</Link>
          <span aria-hidden="true">/</span>
          <Link href="/news">NEWS</Link>
        </nav>
        <header>
          <p className={styles.meta}>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.category && (
              <Link href={`/news?category=${encodeURIComponent(article.category.slug)}`} className="tag">
                {article.category.name}
              </Link>
            )}
          </p>
          <h1 className={styles.title}>{article.title}</h1>
        </header>
        {article.thumbnail && (
          <div className={styles.thumb}>
            <Image
              src={article.thumbnail.url}
              alt=""
              width={article.thumbnail.width}
              height={article.thumbnail.height}
              sizes="(max-width: 800px) 92vw, 760px"
              priority
            />
          </div>
        )}
        <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: article.body }} />

        {article.relatedMembers && article.relatedMembers.length > 0 && (
          <div className={styles.related}>
            <p className={styles.relatedLabel}>Related members</p>
            <ul className={styles.relatedList}>
              {article.relatedMembers.map((m) => (
                <li key={m.id}>
                  <Link href={`/members/${m.slug}`}>{m.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className={styles.back}>
          <Link href="/news" className="link">
            <ArrowIcon style={{ transform: "rotate(180deg)" }} /> Back to news
          </Link>
        </p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
