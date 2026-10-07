type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  id?: string;
  as?: "h1" | "h2";
  children?: React.ReactNode;
};

/** 紫のダッシュ + 小ラベル / 大きな英字見出し / 右側に補足やボタン */
export function SectionHead({ eyebrow, title, lead, id, as: Tag = "h2", children }: Props) {
  return (
    <div className="sec-head" data-reveal>
      <div>
        <p className="sec-eyebrow">{eyebrow}</p>
        <Tag className="sec-title" id={id}>
          {title}
        </Tag>
        {lead && <p className="sec-lead">{lead}</p>}
      </div>
      {children && <div className="sec-head__aside">{children}</div>}
    </div>
  );
}
