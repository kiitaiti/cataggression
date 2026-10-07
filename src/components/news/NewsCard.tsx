import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/cms/types";
import { formatDate } from "@/lib/format";
import { ArrowIcon } from "@/components/ui/Icons";
import styles from "./NewsCard.module.css";

export function NewsCard({ article, index = 0 }: { article: NewsArticle; index?: number }) {
  const href = `/news/${article.slug}`;
  return (
    <li className={styles.card} data-reveal style={{ ["--reveal-delay" as string]: `${(index % 4) * 0.06}s` }}>
      <Link href={href} className={`${styles.inner} ${article.thumbnail ? "" : styles.innerNoThumb}`} data-cursor-label="READ">
        {article.thumbnail && (
          <span className={styles.thumb}>
            <Image
              src={article.thumbnail.url}
              alt=""
              width={article.thumbnail.width}
              height={article.thumbnail.height}
              sizes="(max-width: 760px) 92vw, 200px"
              loading="lazy"
              className={styles.thumbImg}
            />
          </span>
        )}
        <span className={styles.text}>
          <span className={styles.meta}>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.category && <span className="tag">{article.category.name}</span>}
          </span>
          <span className={styles.title}>{article.title}</span>
          {article.excerpt && <span className={styles.excerpt}>{article.excerpt}</span>}
        </span>
        <span className={styles.more} aria-hidden="true">
          <ArrowIcon />
        </span>
      </Link>
    </li>
  );
}

export function NewsList({ articles }: { articles: NewsArticle[] }) {
  return (
    <ul className={styles.list}>
      {articles.map((a, i) => (
        <NewsCard key={a.id} article={a} index={i} />
      ))}
    </ul>
  );
}
