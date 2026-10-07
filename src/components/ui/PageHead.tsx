import Link from "next/link";

type Crumb = { href?: string; label: string };
type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
};

/** 下層ページ共通の見出しブロック（パンくず + ラベル + 大見出し + 補足） */
export function PageHead({ eyebrow, title, lead, crumbs, children }: Props) {
  return (
    <header className="page-head">
      <div className="container">
        <nav className="crumbs" aria-label="パンくずリスト">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "contents" }}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="sec-head" style={{ marginBottom: 0 }}>
          <div>
            <p className="sec-eyebrow">{eyebrow}</p>
            <h1 className="sec-title">{title}</h1>
            {lead && <p className="sec-lead">{lead}</p>}
          </div>
          {children && <div className="sec-head__aside">{children}</div>}
        </div>
      </div>
    </header>
  );
}
