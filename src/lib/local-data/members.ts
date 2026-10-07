import type { Member } from "@/lib/cms/types";
import { MEMBER_IMAGES } from "./member-images";

/**
 * CMS 未設定時に使うローカルデータ。提供された情報のみを記載し、
 * 役割・ランク・実績・配信先 URL など未提供の項目は空のまま（推測で埋めない）。
 */

type Seed = Omit<Member, "id" | "avatar"> & { avatarAlt?: string };

const seeds: Seed[] = [
  // ---------------- VALORANT ----------------
  {
    slug: "n4yut4",
    name: "N4YUT4",
    division: "valorant",
    sortOrder: 1,
    socialLinks: [{ service: "x", url: "https://x.com/IAS_nayuta_rrkn" }],
  },
  {
    slug: "findingnimo",
    name: "findingnimo",
    division: "valorant",
    sortOrder: 2,
    socialLinks: [{ service: "x", url: "https://x.com/nimoinitiator" }],
  },
  {
    slug: "kosty",
    name: "kosty",
    division: "valorant",
    sortOrder: 3,
    socialLinks: [{ service: "x", url: "https://x.com/kosty_vl" }],
  },
  {
    slug: "meatoire",
    name: "Meatoire",
    division: "valorant",
    sortOrder: 4,
    socialLinks: [{ service: "x", url: "https://x.com/BenjoMigaki" }],
  },
  {
    slug: "miso",
    name: "みそ",
    division: "valorant",
    sortOrder: 5,
    socialLinks: [{ service: "x", url: "https://x.com/NGCLault_omiso" }],
  },
  {
    slug: "tori",
    name: "鳥",
    division: "valorant",
    sortOrder: 6,
    socialLinks: [{ service: "x", url: "https://x.com/famima0725" }],
  },

  // ---------------- STREAMERS ----------------
  {
    slug: "yowai",
    name: "よわい",
    division: "streamer",
    sortOrder: 1,
    socialLinks: [
      { service: "x", url: "https://x.com/yowasugi_warot" },
      { service: "litlink", label: "関連リンク", url: "https://lit.link/yowai3" },
    ],
  },
  {
    slug: "hanabishi-hachi",
    name: "花菱はち",
    division: "streamer",
    sortOrder: 2,
    shortBio: "道産子VTuber。ブロスタ・VALORANTを中心に活動。",
    games: ["ブロスタ", "VALORANT"],
    socialLinks: [
      { service: "x", url: "https://x.com/hanabc1213" },
      { service: "litlink", label: "関連リンク", url: "https://lit.link/hanabc" },
    ],
  },
  {
    slug: "mashuo55",
    name: "ましゅお55",
    division: "streamer",
    sortOrder: 3,
    socialLinks: [
      { service: "x", url: "https://x.com/masyu_o55" },
      { service: "twitch", url: "https://www.twitch.tv/mash55x" },
    ],
  },
  {
    slug: "nemura",
    name: "清楚系大人大美女ねむら。",
    division: "streamer",
    sortOrder: 4,
    socialLinks: [
      { service: "x", url: "https://x.com/nemura_3" },
      { service: "twitch", url: "https://www.twitch.tv/nemurasan" },
      { service: "youtube", url: "https://www.youtube.com/@nemura_3" },
    ],
  },
  {
    slug: "asty",
    name: "あすてぃ_",
    division: "streamer",
    sortOrder: 5,
    shortBio: "ゲーム配信。APEX・VALORANTを中心にプレイ。",
    games: ["APEX", "VALORANT"],
    socialLinks: [
      { service: "x", url: "https://x.com/xxasti38" },
      { service: "litlink", label: "関連リンク", url: "https://lit.link/xxasti38" },
    ],
  },
  {
    slug: "kiraboshi-stella",
    name: "煌星ステラ",
    division: "streamer",
    sortOrder: 6,
    shortBio: "ストリーマー・動画制作。",
    socialLinks: [
      { service: "x", url: "https://x.com/StelLa_StAR0411" },
      { service: "litlink", label: "関連リンク", url: "https://lit.link/KiraboshiStella" },
    ],
  },
  {
    slug: "mangle",
    name: "宇宙怪獣まんぐる",
    division: "streamer",
    sortOrder: 7,
    shortBio: "ストリーマー兼動画編集者。",
    socialLinks: [
      { service: "x", url: "https://x.com/Galaxyforce2010" },
      { service: "youtube", url: "https://www.youtube.com/@vtubermangle" },
      { service: "twitch", url: "https://www.twitch.tv/katsudonrush" },
    ],
  },
];

export const localMembers: Member[] = seeds.map((s) => {
  const img = MEMBER_IMAGES[s.slug];
  return {
    id: `local-${s.slug}`,
    ...s,
    avatar: img ? { ...img, alt: `${s.name}` } : null,
  };
});
