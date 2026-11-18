# CAT AGGRESSION — 公式サイト

eスポーツチーム「CAT AGGRESSION」の公式 Web サイト。
Next.js 15（App Router / TypeScript）+ microCMS 構成です。

- 公式 X: https://x.com/cataggression01
- 設計方針・技術詳細: 本 README
- microCMS の API / フィールド設定: [`docs/microcms-setup.md`](docs/microcms-setup.md)
- 使用素材と不足素材: [`docs/assets.md`](docs/assets.md)
- 実施した検証と未確認事項: [`docs/verification.md`](docs/verification.md)

---

## 1. 起動・ビルド

```bash
# Node.js 20 以上（開発時は 22 で確認）
npm install
cp .env.example .env.local   # 必要に応じて値を設定（未設定でも起動可）

npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # 本番ビルド
npm run start      # 本番サーバー
```

`MICROCMS_*` が未設定のときは **ローカルデータ（`src/lib/local-data/`）** で表示されます
（提供情報に基づくメンバー 13 名、ニュース 0 件、パートナー 0 件）。

## 2. 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | 本番 | microCMS のサービス ID（`xxxx.microcms.io` の `xxxx`） |
| `MICROCMS_API_KEY` | 本番 | GET 権限の API キー。**サーバー側でのみ使用**し、クライアントには配信されません |
| `REVALIDATE_SECRET` | 本番 | microCMS Webhook → `/api/revalidate` 認証用のランダム文字列 |
| `NEXT_PUBLIC_SITE_URL` | 本番ドメイン決定後 | canonical / OGP / sitemap / 構造化データの絶対 URL 生成。未設定時は絶対 URL を出力しません（架空ドメインを埋め込まない） |
| `MICROCMS_API_BASE` | 開発用 | モックサーバー検証用。通常は未設定 |

> 現時点で **API キー・本番ドメインは未提供** のため、いずれも「設定待ち」です。接続・公開はまだ行っていません。

## 3. 更新の本番反映（Webhook）

ページは ISR（静的生成 + 1 時間ごとの保険的再検証）で配信し、microCMS の公開 / 更新 / 削除は Webhook で即時反映します。

1. Vercel 等のホスティングで環境変数を設定してデプロイ
2. microCMS 管理画面 → 各 API → **API 設定 → Webhook → カスタム通知** を追加
   - URL: `https://<本番ドメイン>/api/revalidate?secret=<REVALIDATE_SECRET>`
   - 通知タイミング: コンテンツの公開・更新・削除（すべてチェック）
3. `members` / `news` / `categories` / `partners` / `site-settings` の各 API に同じ Webhook を登録

`/api/revalidate` はペイロードの `api` と `id` を読み、該当キャッシュタグ（例: `news`, `news:<id>`）と主要パス（`/`, `/news`, `/sitemap.xml`）を再検証します。
静的ホスティング（`output: "export"`）で運用する場合は、代わりに Webhook でホスティング側の再ビルドフックを叩いてください（その場合 `/api/revalidate` は不要）。

## 4. ディレクトリ構成

```
src/
  app/
    layout.tsx / page.tsx          ルート・トップ
    members/[slug]/                メンバー詳細（個別 URL）
    news/  news/[slug]/            ニュース一覧（カテゴリ絞り込み・ページネーション）/ 詳細
    privacy/  not-found.tsx        プライバシーポリシー / 404
    sitemap.ts  robots.ts          サイトマップ / robots
    api/revalidate/route.ts        microCMS Webhook 受信
    globals.css                    デザイントークン（CSS 変数）と基本スタイル
  components/
    hero/Hero.tsx, Hero.module.css 静的 Hero（タイポグラフィ + 紫の斜めパネル + ロゴ）
    layout/  Header / Footer       固定ヘッダー、モバイルメニュー（フォーカス管理）、フッター
    members/                       部門タブ・メンバーカード
    news/  sections/  ui/          ニュースカード、各セクション、カスタムカーソル等
  lib/
    cms/client.ts                  microCMS クライアント（server-only、ページネーション、キャッシュタグ）
    cms/repositories.ts            取得・正規化・状態判定（cms / local / error）
    cms/sanitize.ts                CMS 本文 HTML のサニタイズ
    cms/types.ts                   ドメイン型
    local-data/                    CMS 未設定時のローカルデータ（メンバー・設定・画像対応表）
    site.ts / format.ts            公開 URL、ナビ、フォーマッタ
public/images/
  logo/                            正式ロゴ（白・黒、透過 PNG）
  members/unassigned/              提供アイコン 14 点（member-images.ts で割り当て済み）
docs/                              セットアップ・素材・検証ドキュメント
```

## 5. デザイン（2026-09 リニューアル: 白 × 黒 × 紫）

参考: https://team-onyx.co.jp/ の「白背景に大きなタイポグラフィ、要所のアクセントカラー、斜めの平面図形」という構成を、
CAT AGGRESSION では **白・黒・紫** で再構成しています（ロゴ・文章・写真・コードは流用していません）。

- 配色は `src/app/globals.css` の `:root` に集約
  `--bg #FFFFFF` / `--bg-alt #F5F4F7` / `--black #111114` / `--fg #25252B` / `--fg-muted #66636F` /
  `--accent #7138D9` / `--accent-hover #5925B6` / `--accent-soft #F0EAFB` / `--line #E4E1E9`
- 紫はボタン・下線・小見出し・番号・Hero と CONTACT の斜め面に限定。全面塗り・発光・グラデーションは不使用
- 英字見出し: Barlow Condensed 800 Italic、日本語: Noto Sans JP
- ボタン・タブ・矢印ボックスは `skewX(-8deg)` の平行四辺形で統一（`--skew` で調整可）
- 黒背景を使うのは CONTACT 帯とフッターのみ。ページ全体は白基調

### ページ構成（複数ページ）
| URL | 内容 |
| --- | --- |
| `/` | Hero → メンバー（各部門の先頭 4 名のプレビュー）→ 最新ニュース → About 概要 → パートナー → Contact 帯 |
| `/members` | 部門タブ付きの全メンバー一覧（`#streamers` / `#valorant` で初期タブ指定） |
| `/members/[slug]` | メンバー詳細 |
| `/news`, `/news/[slug]` | ニュース一覧（カテゴリ絞り込み・ページネーション）/ 詳細 |
| `/about` | チーム紹介、目標（VCJ 出場）、価値観、ロードマップ（`src/lib/local-data/vision.ts` で編集） |
| `/partners` | パートナー一覧 + 協賛案内 |
| `/contact` | 問い合わせ内容の一覧 + 連絡導線 |
| `/privacy` | プライバシーポリシー |

- 英字見出し: **Montserrat 900 Italic**（参考サイトに近い、太く傾いたワイドなサンセリフ）、日本語: Noto Sans JP
- ロゴは提供 PNG からエンブレム部分のみを切り出した `cat-aggression-mark-{white,black}.png` を主に使用し、
  チーム名はサイトの書体で組んでいます（ロゴ内の文字は改変していません。フル版ロゴも `logo/` に同梱）

## 6. Hero

`src/components/hero/Hero.tsx` + `Hero.module.css` のみ（画像は正式ロゴ 1 枚、WebGL / Canvas / シェーダーは無し）。

- 左: 紫ダッシュ + 「ESPORTS TEAM」、大きな「CAT」（黒）/「AGGRESSION」（紫）— 単語単位で 2 行、途中折り返し無し
- コピー「esportsに、爪痕を。」（説明文は Hero では非表示）、紫のメインボタン「メンバーを見る」と白のサブボタン「公式Xをフォロー」
- 下部に Divisions / Players / Streamers / Titles のファクト行（人数は登録データから算出）
- 右: 淡いグレーの斜面（画面右端まで）+ 紫 / 黒の細い斜線 + 薄い透かし文字 + 縦書きラベル。色を抑えて右寄りの構図を目立たせない
- PC は `min-height: 84vh`、モバイルは自然高（コピー → ボタン → ファクト → ロゴ帯の順）
- 動きは CSS のフェード + 上方向移動のみ。`prefers-reduced-motion` で停止

### 旧 3D Hero について
前バージョンの WebGL 猫（`HeroCanvas.tsx` / `catHeroRenderer.ts` / `shaders.ts`）と静止画 `public/images/hero/cat-fallback.png` は
**削除済み**です。参照・イベント登録・画像取得は残っていません。

## 7. カスタムカーソル（3 種類）
- `claw`（既定）: 紫の点 + **猫の爪痕**。マウスの軌跡に沿って 3 本の平行な引っかき線が短く残り、約 0.55 秒で細くなりながら消えます（不透明度は最大 70% の控えめな表現）
  （`src/components/ui/ClawTrail.tsx`）。速く動かすほど太い爪痕になり、止まっている間は何も描きません。
  全画面の 2D Canvas（`pointer-events: none`、`mix-blend-mode: multiply`）に描画し、跡が消えたら描画ループを止めます。
  太さ・間隔・持続時間は同ファイル冒頭の `LIFE` / `CLAWS` と `onMove` 内の太さ式で調整できます
- `ring`: 紫の点 + 細い円。リンク上で円が広がり薄紫に、ラベル付き要素では白い円の中に「VIEW / WATCH / READ」を表示
- `bracket`: 紫の点 + 4 本のブラケット。リンク上でブラケットが開き、下にラベルを表示
- 既定は `src/lib/site.ts` の `CURSOR_VARIANT`。比較用に URL に `?cursor=claw` / `?cursor=ring` / `?cursor=bracket` を付けると
  そのセッションの間だけ切り替わります
- 初期化に成功した場合のみ `html.has-custom-cursor` を付与して標準カーソルを隠す
- 入力欄・テキスト選択中は標準カーソル。タッチ端末・reduced-motion では無効

## 8. メンバー画像
`src/lib/local-data/member-images.ts` に slug → `public/images/members/unassigned/*.jpg` の対応を登録済み（依頼者指定）。
microCMS 接続後は CMS の `avatar` が優先されます。花菱はち / 煌星ステラ の 2 名は「要照合」の注記付きです（[`docs/assets.md`](docs/assets.md)）。
提供画像は 400×400 のため、高解像度ディスプレイではやや甘く見えます。可能であれば 800px 以上の画像を CMS に登録してください。

## 9. 表記ルール
- サイト内のテキストは「CAT AGGRESSION」で統一（ロゴ画像内の「Cat Aggression」は画像のまま）
- 設立年・所在地・戦績・実績数値・LIVE 表示など、提供のない情報は掲載していません
