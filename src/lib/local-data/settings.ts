import type { SiteSettings } from "@/lib/cms/types";

export const OFFICIAL_X_URL = "https://x.com/cataggression01";

export const localSettings: SiteSettings = {
  teamName: "CAT AGGRESSION",
  logo: {
    url: "/images/logo/cat-aggression-logo-white.png",
    width: 1527,
    height: 1600,
    alt: "CAT AGGRESSION",
  },
  heroCatchcopy: "esportsに、爪痕を。",
  heroDescription: "競技と配信、それぞれの舞台で個性を放つeスポーツチーム。",
  aboutText: [
    "CAT AGGRESSIONは、VALORANT部門とストリーマー部門を持つeスポーツチームです。",
    "競技の舞台で勝負する選手と、配信の舞台で個性を放つストリーマー。異なる舞台に立つメンバーが、ひとつのチームとして活動しています。実力や実績に関係なく「挑戦したい」と思った人が挑戦でき、長く一緒に成長していける場所を目指しています。",
  ].join("\n\n"),
  officialXUrl: OFFICIAL_X_URL,
  contactEmail: undefined,
  contactUrl: undefined,
  defaultOgImage: null,
};
