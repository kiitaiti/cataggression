import Link from "next/link";
import type { ListResult, NewsArticle } from "@/lib/cms/types";
import { SectionHead } from "@/components/ui/SectionHead";
import { NewsList } from "@/components/news/NewsCard";
import { ArrowIcon } from "@/components/ui/Icons";

export function NewsSection({ news }: { news: ListResult<NewsArticle> }) {
  const hasItems = news.source !== "error" && news.items.length > 0;
  return (
    <section id="news" className={`section ${hasItems ? "" : "section--tight"}`} aria-labelledby="news-title">
      <div className="container">
        <SectionHead eyebrow="Latest" title="News" id="news-title">
          {hasItems && (
            <Link href="/news" className="link">
              View all <ArrowIcon />
            </Link>
          )}
        </SectionHead>
        <NewsState news={news} />
      </div>
    </section>
  );
}

export function NewsState({ news, emptyText }: { news: ListResult<NewsArticle>; emptyText?: string }) {
  if (news.source === "error") {
    return (
      <p className="notice" role="status" data-reveal>
        ニュースを取得できませんでした。時間をおいて再度お試しください。
      </p>
    );
  }
  if (news.items.length === 0) {
    return (
      <p className="notice" role="status" data-reveal>
        {emptyText ?? "現在公開中のニュースはありません。最新情報は公式Xでお知らせします。"}
      </p>
    );
  }
  return <NewsList articles={news.items} />;
}
