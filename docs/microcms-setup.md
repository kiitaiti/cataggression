# microCMS セットアップ手順

実装（`src/lib/cms/repositories.ts` の raw 型）に合わせた API とフィールドの定義です。
フィールド ID は **完全一致** で作成してください。
（フィールド型の名称・仕様は作成時点の microCMS 管理画面で確認してください。以下は 2026 年時点の一般的な型名です）

## 0. サービス作成と API キー

1. microCMS でサービスを作成（サービス ID = `MICROCMS_SERVICE_DOMAIN`）
2. 「API キー」で **GET のみ許可** したキーを発行 → `MICROCMS_API_KEY`
   - このキーはサーバー側でしか使いません。`NEXT_PUBLIC_` を付けないでください
3. 「画像 API」の配信ドメインは `images.microcms-assets.io`（`next.config.ts` の `remotePatterns` に設定済み）

## 1. `categories`（リスト形式）— ニュースのカテゴリ

| フィールド ID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `name` | カテゴリ名 | テキストフィールド | ○ |
| `slug` | スラッグ | テキストフィールド（半角英数とハイフン） | ○ |

## 2. `members`（リスト形式）

| フィールド ID | 表示名 | 種類 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| `name` | 名前 | テキストフィールド | ○ | 表示名 |
| `slug` | スラッグ | テキストフィールド | ○ | URL `/members/<slug>`。半角英数とハイフン。**ユニーク** |
| `division` | 部門 | セレクトフィールド（単一選択） | ○ | 選択肢の値: `valorant` / `streamer` |
| `sortOrder` | 並び順 | 数字 | ○ | 小さい順に表示 |
| `avatar` | アイコン画像 | 画像 | 任意 | 正方形推奨（最低 400×400）。未設定時は名前入りの仮表示 |
| `coverImage` | カバー画像 | 画像 | 任意 | 現状の UI では未使用（将来の詳細ページ拡張用） |
| `shortBio` | 短い紹介 | テキストエリア | 任意 | 一覧・詳細・meta description に使用 |
| `body` | 詳細本文 | リッチエディタ | 任意 | 詳細ページに表示（サニタイズ済み） |
| `games` | ゲームタイトル | テキストフィールド | 任意 | カンマ区切り（例: `VALORANT, APEX`） |
| `role` | 役割 | テキストフィールド | 任意 | 例: Duelist |
| `socialLinks` | SNS・配信リンク | 繰り返しフィールド | 任意 | 下記カスタムフィールド `socialLink` を繰り返し |
| `featuredVideoUrl` | 注目動画 URL | テキストフィールド | 任意 | YouTube の URL（watch / youtu.be / embed）を埋め込み |

### カスタムフィールド `socialLink`

| フィールド ID | 表示名 | 種類 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| `service` | サービス | セレクトフィールド（単一選択） | ○ | 値: `x` / `twitch` / `youtube` / `litlink` / `tiktok` / `instagram` / `other` |
| `label` | 表示ラベル | テキストフィールド | 任意 | 未設定時はサービス名から自動（`litlink` は「関連リンク」） |
| `url` | URL | テキストフィールド | ○ | 完全な URL |

> `twitch` / `youtube` は「WATCH」導線（視聴ボタン）として、それ以外は「FOLLOW」導線として表示されます。
> 未確認の配信先 URL は登録しないでください（推測で埋めない）。

### 初期登録データ（提供情報）
`src/lib/local-data/members.ts` と同じ内容を登録してください。並び順・リンクは以下のとおりです。

VALORANT（`division = valorant`）
1. N4YUT4 — X: https://x.com/IAS_nayuta_rrkn
2. findingnimo — X: https://x.com/nimoinitiator
3. kosty — X: https://x.com/kosty_vl
4. Meatoire — X: https://x.com/BenjoMigaki
5. みそ — X: https://x.com/NGCLault_omiso
6. 鳥 — X: https://x.com/famima0725

STREAMERS（`division = streamer`）
1. よわい — X: https://x.com/yowasugi_warot / 関連リンク: https://lit.link/yowai3
2. 花菱はち — X: https://x.com/hanabc1213 / 関連リンク: https://lit.link/hanabc（道産子VTuber、ブロスタ・VALORANT）
3. ましゅお55 — X: https://x.com/masyu_o55 / Twitch: https://www.twitch.tv/mash55x
4. 清楚系大人大美女ねむら。 — X: https://x.com/nemura_3 / Twitch: https://www.twitch.tv/nemurasan / YouTube: https://www.youtube.com/@nemura_3
5. あすてぃ_ — X: https://x.com/xxasti38 / 関連リンク: https://lit.link/xxasti38（APEX・VALORANT）
6. 煌星ステラ — X: https://x.com/StelLa_StAR0411 / 関連リンク: https://lit.link/KiraboshiStella（ストリーマー・動画制作）
7. 宇宙怪獣まんぐる — X: https://x.com/Galaxyforce2010 / YouTube: https://www.youtube.com/@vtubermangle / Twitch: https://www.twitch.tv/katsudonrush（ストリーマー兼動画編集者）

役割・ランク・得意エージェント・大会実績は未提供のため空欄で登録し、判明次第 `role` / `games` / `body` に入力してください。

## 3. `news`（リスト形式）

| フィールド ID | 表示名 | 種類 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| `title` | タイトル | テキストフィールド | ○ | |
| `slug` | スラッグ | テキストフィールド | ○ | URL `/news/<slug>`。ユニーク |
| `category` | カテゴリ | コンテンツ参照（`categories`） | 任意 | 一覧の絞り込みに使用 |
| `thumbnail` | サムネイル | 画像 | 任意 | 16:9 推奨 |
| `excerpt` | 抜粋 | テキストエリア | ○ | 一覧と meta description |
| `body` | 本文 | リッチエディタ | ○ | サニタイズ済みで表示（script / iframe は除去） |
| `articleDate` | 記事日付 | 日時 | 任意 | **未設定なら `publishedAt`（公開日時）を使用**。並び順もこの優先で統一 |
| `relatedMembers` | 関連メンバー | 複数コンテンツ参照（`members`） | 任意 | 詳細ページに名前リンクを表示 |

- 一覧は `articleDate` → `publishedAt` の降順、12 件ごとのページネーション
- 取得上限（1 リクエスト 100 件）を考慮し、サイトマップ生成などの全件取得は offset で自動ページネーションします
- **記事が 0 件のときは「現在公開中のニュースはありません」を表示**し、デモ記事には切り替えません
- API 障害時は「取得できませんでした」を表示し、0 件表示と区別します

## 4. `partners`（リスト形式）

| フィールド ID | 表示名 | 種類 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| `name` | 名称 | テキストフィールド | ○ | ロゴ未設定時はテキスト表示 |
| `logo` | ロゴ | 画像 | 任意 | 透過 PNG / SVG 推奨 |
| `url` | URL | テキストフィールド | 任意 | |
| `sortOrder` | 並び順 | 数字 | ○ | |
| `description` | 説明 | テキストエリア | 任意 | |

登録 0 件のときはロゴ一覧を出さず、協賛募集の案内と問い合わせ導線のみを表示します。

## 5. `site-settings`（オブジェクト形式）

エンドポイント名は **`site-settings`** で作成してください（`repositories.ts` で参照）。

| フィールド ID | 表示名 | 種類 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| `teamName` | チーム名 | テキストフィールド | ○ | `CAT AGGRESSION` |
| `logo` | ロゴ | 画像 | 任意 | 未設定時は同梱の白ロゴ |
| `heroCatchcopy` | メインコピー | テキストフィールド | ○ | 初期値: esportsに、爪痕を。 |
| `heroDescription` | 補助コピー | テキストエリア | ○ | 初期値: 競技と配信、それぞれの舞台で個性を放つeスポーツチーム。 |
| `aboutText` | ABOUT 本文 | テキストエリア | ○ | 空行で段落区切り |
| `officialXUrl` | 公式 X URL | テキストフィールド | ○ | https://x.com/cataggression01 |
| `contactEmail` | 問い合わせメール | テキストフィールド | 任意 | 設定すると CONTACT に mailto を表示 |
| `contactUrl` | 問い合わせフォーム URL | テキストフィールド | 任意 | 外部フォーム（Google フォーム等）の URL |
| `defaultOgImage` | 既定 OGP 画像 | 画像 | 任意 | 1200×630 推奨 |

## 6. Webhook（更新反映）

各 API（`members` / `news` / `categories` / `partners` / `site-settings`）の **API 設定 → Webhook** に
「カスタム通知」を追加します。

- URL: `https://<本番ドメイン>/api/revalidate?secret=<REVALIDATE_SECRET>`
- 通知タイミング: コンテンツの公開 / 更新 / 公開終了 / 削除 すべて
- （代替）カスタムヘッダー `X-REVALIDATE-SECRET: <REVALIDATE_SECRET>` でも可

受信側はペイロードの `api` / `id` から該当キャッシュタグのみ再検証し、トップ・ニュース一覧・サイトマップも再検証します。

## 7. 動作の切り替え

| 状態 | 挙動 |
| --- | --- |
| `MICROCMS_*` 未設定（開発環境） | ローカルデータ（提供情報）で表示。ニュース 0 件、パートナー 0 件 |
| 接続済み・正常 | CMS の内容を表示。人数は登録データから算出、並びは `sortOrder` |
| 接続済み・0 件 | 「準備中 / ありません」の案内を表示（デモには切り替えない） |
| 接続済み・取得失敗 | 「取得できませんでした」を表示。サイト設定のみローカル既定値で継続 |

## 8. 開発時のモック検証（任意）

`MICROCMS_API_BASE` を設定すると API のベース URL を差し替えられます。
納品時の検証では、上記スキーマを返すローカルモックサーバーで「正常 / 0 件 / 500 エラー」の 3 状態を確認しました。
