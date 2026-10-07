import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * microCMS Webhook 受信エンドポイント。
 * 設定: microCMS 管理画面 > API 設定 > Webhook > カスタム通知
 *   URL: https://<本番ドメイン>/api/revalidate?secret=<REVALIDATE_SECRET>
 *   （または カスタムヘッダー X-REVALIDATE-SECRET に同じ値）
 *
 * microCMS の通知ペイロードには `api`（エンドポイント名）と `id` が含まれるので、
 * 該当タグのみ再検証する。ペイロードが読めない場合は全体を再検証する。
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, message: "REVALIDATE_SECRET is not set" }, { status: 500 });
  }
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, message: "Invalid secret" }, { status: 401 });
  }

  let api: string | undefined;
  let contentId: string | undefined;
  try {
    const body = (await req.json()) as { api?: string; id?: string };
    api = body.api;
    contentId = body.id;
  } catch {
    // ペイロード無し（手動実行など）
  }

  const tags = new Set<string>();
  if (api) {
    tags.add(api);
    if (contentId) tags.add(`${api}:${contentId}`);
  } else {
    ["members", "news", "categories", "partners", "site-settings"].forEach((t) => tags.add(t));
  }
  for (const t of tags) revalidateTag(t);
  // slug ベースのページは tag で拾いきれないケースがあるため主要パスも再検証
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true, revalidated: [...tags], at: new Date().toISOString() });
}
