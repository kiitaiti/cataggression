export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function socialLabel(service: string, label?: string): string {
  if (label) return label;
  switch (service) {
    case "x": return "X";
    case "twitch": return "Twitch";
    case "youtube": return "YouTube";
    case "litlink": return "関連リンク";
    case "tiktok": return "TikTok";
    case "instagram": return "Instagram";
    default: return "リンク";
  }
}

/** 配信先（視聴に直結するもの） */
export function isWatchService(service: string): boolean {
  return service === "twitch" || service === "youtube";
}
