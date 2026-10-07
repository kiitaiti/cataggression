import type { Metadata } from "next";
import { getMembers } from "@/lib/cms/repositories";
import { MembersSection } from "@/components/members/MembersSection";
import { PageHead } from "@/components/ui/PageHead";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Members | メンバー",
  description: `${SITE_NAME}の所属メンバー一覧。VALORANT部門とストリーマー部門のメンバー、配信・SNSリンクを掲載しています。`,
  alternates: absoluteUrl("/members") ? { canonical: "/members" } : undefined,
};

export default async function MembersPage() {
  const res = await getMembers();
  const valorant = res.items.filter((m) => m.division === "valorant").length;
  const streamer = res.items.filter((m) => m.division === "streamer").length;
  return (
    <>
      <PageHead
        eyebrow="The Roster"
        title="Members"
        lead="配信で、競技で。それぞれの舞台に立つメンバー。気になったら、そのまま配信やSNSへ。"
        crumbs={[{ href: "/", label: "Home" }, { label: "Members" }]}
      >
        {res.source !== "error" && (
          <p className="sec-lead" style={{ margin: 0 }}>
            Streamers {String(streamer).padStart(2, "0")} / Players {String(valorant).padStart(2, "0")}
          </p>
        )}
      </PageHead>
      <div style={{ paddingTop: "clamp(28px, 4vw, 48px)" }}>
        <MembersSection members={res.items} source={res.source} showHead={false} />
      </div>
    </>
  );
}
