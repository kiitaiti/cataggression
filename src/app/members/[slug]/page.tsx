import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberBySlug, getMembers } from "@/lib/cms/repositories";
import { MemberAvatar } from "@/components/members/MemberCard";
import { SocialIcon, ArrowIcon } from "@/components/ui/Icons";
import { isWatchService, socialLabel } from "@/lib/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

type Params = { slug: string };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const { items } = await getMembers();
  return items.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getMemberBySlug(slug);
  if (!item) return { title: "Member not found" };
  const division = item.division === "valorant" ? "VALORANT部門" : "ストリーマー部門";
  const description =
    item.shortBio ??
    `${item.name}は${SITE_NAME}の${division}に所属するメンバーです。配信・SNSリンクを掲載しています。`;
  return {
    title: `${item.name} | ${division}`,
    description,
    alternates: absoluteUrl(`/members/${slug}`) ? { canonical: `/members/${slug}` } : undefined,
    openGraph: {
      title: `${item.name} | ${SITE_NAME}`,
      description,
      type: "profile",
      ...(item.avatar ? { images: [{ url: item.avatar.url, width: item.avatar.width, height: item.avatar.height }] } : {}),
    },
  };
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) return url;
  } catch {
    /* ignore */
  }
  return null;
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { item: member, source, error } = await getMemberBySlug(slug);
  if (!member) {
    if (source === "error") {
      // 取得失敗と 404 を区別する
      return (
        <div className={`container ${styles.errorWrap}`}>
          <p className="notice" role="alert">
            メンバー情報を取得できませんでした。時間をおいて再度お試しください。
            {process.env.NODE_ENV !== "production" && error ? ` (${error})` : ""}
          </p>
        </div>
      );
    }
    notFound();
  }

  const divisionJp = member.division === "valorant" ? "VALORANT部門" : "ストリーマー部門";
  const watch = member.socialLinks.filter((l) => isWatchService(l.service));
  const others = member.socialLinks.filter((l) => !isWatchService(l.service));
  const embed = member.featuredVideoUrl ? toEmbedUrl(member.featuredVideoUrl) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    memberOf: { "@type": "SportsTeam", name: SITE_NAME },
    sameAs: member.socialLinks.map((l) => l.url),
    ...(member.shortBio ? { description: member.shortBio } : {}),
    ...(absoluteUrl(`/members/${member.slug}`) ? { url: absoluteUrl(`/members/${member.slug}`) } : {}),
  };

  return (
    <article className={styles.page}>
      <div className="container">
        <nav className="crumbs" aria-label="パンくずリスト">
          <Link href="/">HOME</Link>
          <span aria-hidden="true">/</span>
          <Link href={member.division === "valorant" ? "/members#valorant" : "/members#streamers"}>MEMBERS</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{member.name}</span>
        </nav>

        <div className={styles.grid}>
          <div className={styles.media}>
            <MemberAvatar member={member} sizes="(max-width: 840px) 92vw, 480px" priority className={styles.avatar} />
          </div>

          <div className={styles.info}>
            <p className="sec-eyebrow">{member.division === "valorant" ? "Valorant Division" : "Streamer Division"}</p>
            <h1 className={styles.name}>{member.name}</h1>
            <p className={styles.divisionJp}>{divisionJp}</p>
            {(member.role || member.games?.length) && (
              <dl className={styles.facts}>
                {member.role && (
                  <div>
                    <dt>Role</dt>
                    <dd>{member.role}</dd>
                  </div>
                )}
                {member.games?.length ? (
                  <div>
                    <dt>Games</dt>
                    <dd>{member.games.join(" / ")}</dd>
                  </div>
                ) : null}
              </dl>
            )}
            {member.shortBio && <p className={styles.bio}>{member.shortBio}</p>}

            {watch.length > 0 && (
              <div className={styles.watch}>
                <p className={styles.groupLabel}>Watch</p>
                <ul className={styles.btnRow}>
                  {watch.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn--primary" data-cursor-label="WATCH">
                        <SocialIcon service={l.service} className="btn__icon" />
                        <span>{socialLabel(l.service, l.label)}で見る</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {others.length > 0 && (
              <div className={styles.watch}>
                <p className={styles.groupLabel}>Follow</p>
                <ul className={styles.btnRow}>
                  {others.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn" data-cursor-label="OPEN">
                        <SocialIcon service={l.service} className="btn__icon" />
                        <span>{l.service === "x" ? "Xをフォロー" : socialLabel(l.service, l.label)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {embed && (
          <div className={styles.video}>
            <iframe
              src={embed}
              title={`${member.name}の動画`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {member.body && <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: member.body }} />}

        <div className={styles.back}>
          <Link href={member.division === "valorant" ? "/members#valorant" : "/members#streamers"} className="link">
            <ArrowIcon style={{ transform: "rotate(180deg)" }} /> Back to members
          </Link>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
