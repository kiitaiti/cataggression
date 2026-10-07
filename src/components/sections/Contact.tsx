import type { SiteSettings } from "@/lib/cms/types";
import { ArrowIcon, MailIcon, XIcon } from "@/components/ui/Icons";
import styles from "./Simple.module.css";

export function Contact({ settings }: { settings: SiteSettings }) {
  const email = settings.contactEmail?.trim();
  const url = settings.contactUrl?.trim();
  const xUrl = settings.officialXUrl;

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={styles.contactShape} aria-hidden="true" />
      <div className={`container ${styles.contactInner}`}>
        <p className={`sec-eyebrow ${styles.contactEyebrow}`}>Join Us</p>
        <h2 id="contact-title" className={styles.contactTitle}>
          <span>Leave</span>
          <span className={styles.contactTitleOutline}>Your Mark</span>
        </h2>
        <p className={styles.contactText}>
          スポンサー・協賛、コラボレーション、取材・メディア、その他のご相談を受け付けています。
          {!email && !url && " 現在は公式XのDM・リプライでご連絡ください。"}
        </p>
        <div className={styles.contactActions}>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <span>お問い合わせフォーム</span>
              <ArrowIcon className="btn__icon btn__icon--arrow" />
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className={url ? "btn btn--ghost-light" : "btn btn--primary"}>
              <MailIcon className="btn__icon" />
              <span>{email}</span>
            </a>
          )}
          <a href={xUrl} target="_blank" rel="noopener noreferrer" className={email || url ? "btn btn--ghost-light" : "btn btn--primary"}>
            <XIcon className="btn__icon" />
            <span>{email || url ? "公式X" : "公式Xで問い合わせる"}</span>
          </a>
        </div>
        <ul className={styles.contactTopics} aria-label="お問い合わせ内容">
          <li>Sponsorship</li>
          <li>Collaboration</li>
          <li>Press</li>
          <li>Others</li>
        </ul>
      </div>
    </section>
  );
}
