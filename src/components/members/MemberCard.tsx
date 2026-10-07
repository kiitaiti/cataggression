import Link from "next/link";
import Image from "next/image";
import type { Member } from "@/lib/cms/types";
import { SocialIcon } from "@/components/ui/Icons";
import { isWatchService, socialLabel } from "@/lib/format";
import styles from "./MemberCard.module.css";

export function MemberAvatar({
  member,
  sizes,
  priority = false,
  className,
}: {
  member: Member;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (member.avatar) {
    return (
      <Image
        src={member.avatar.url}
        alt={member.avatar.alt ?? `${member.name}のアイコン`}
        width={member.avatar.width}
        height={member.avatar.height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={className}
        style={member.avatar.position ? { objectPosition: member.avatar.position } : undefined}
      />
    );
  }
  // 画像未設定時の中立的な仮表示（名前入り）
  const initial = Array.from(member.name)[0] ?? "?";
  return (
    <div className={`${styles.placeholder} ${className ?? ""}`} role="img" aria-label={`${member.name}（画像準備中）`}>
      <span className={styles.placeholderInitial}>{initial}</span>
      <span className={styles.placeholderName}>{member.name}</span>
    </div>
  );
}

export function MemberCard({ member, index }: { member: Member; index: number }) {
  const href = `/members/${member.slug}`;
  return (
    <li className={styles.card} data-reveal style={{ ["--reveal-delay" as string]: `${(index % 4) * 0.06}s` }}>
      <Link href={href} className={styles.media} data-cursor-label="VIEW" aria-label={`${member.name}のプロフィール`}>
        <MemberAvatar member={member} sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 300px" className={styles.img} />
      </Link>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.division}>{member.division === "valorant" ? "VALORANT" : "STREAMER"}</span>
          {member.role && <span className={styles.role}>{member.role}</span>}
        </div>
        <h3 className={styles.name}>
          <Link href={href}>{member.name}</Link>
        </h3>
        {member.shortBio && <p className={styles.bio}>{member.shortBio}</p>}
        <ul className={styles.links} aria-label={`${member.name}のリンク`}>
          {member.socialLinks.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                data-cursor-label={isWatchService(l.service) ? "WATCH" : undefined}
                aria-label={`${member.name}の${socialLabel(l.service, l.label)}（外部サイト）`}
                title={socialLabel(l.service, l.label)}
              >
                <SocialIcon service={l.service} />
                {l.service !== "x" && <span className={styles.socialText}>{socialLabel(l.service, l.label)}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
