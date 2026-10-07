# 使用素材と不足素材

## 使用している素材

| 素材 | 場所 | 出所 / 加工 |
| --- | --- | --- |
| 正式ロゴ（白） | `public/images/logo/cat-aggression-logo-white.png` | 提供 PNG（6000×6000）を余白トリミングし 1527×1600 に縮小。文字「Cat Aggression」は画像のまま保持 |
| 正式ロゴ（黒） | `public/images/logo/cat-aggression-logo-black.png` | 同上（1478×1600）。現状の UI では未使用（白背景用に同梱） |
| ファビコン / Apple アイコン | `src/app/icon.png`, `src/app/apple-icon.png` | 白ロゴのエンブレム部分を切り出し、背景 #08090B に配置して生成 |
| メンバーアイコン 14 点 | `public/images/members/unassigned/` | 提供画像（400×400）をそのまま保存。`member-images.ts` で割り当て済み（下記） |
| ロスター告知スクリーンショット | `docs/reference/roster-screenshot.png` | 参考資料。サイトには掲載していません |

## メンバー画像（2026-09-29 更新）

提供された立ち絵 / キービジュアル 6 点を `public/images/members/` に保存し、以下に差し替えました
（`member-images.ts` の `position` で顔位置に合わせたトリミングを指定）。

| メンバー | ファイル | 元サイズ → 保存 |
| --- | --- | --- |
| 煌星ステラ | `kiraboshi-stella.png`（透過） | 1700×4000 → 591×1400 |
| よわい | `yowai.jpg` | 3399×4496 → 1210×1600 |
| 清楚系大人大美女ねむら。 | `nemura.png`（透過） | 1536×2048 → 985×1400 |
| あすてぃ_ | `asty.png`（透過） | 708×1080 → 708×1070 |
| 花菱はち | `hanabishi-hachi.jpg` | 1920×1080 → 1600×900 |
| 宇宙怪獣まんぐる | `mangle.png`（透過） | 5000×8000 → 余白トリム後 525×1400（2026-10-07 提供） |

残り 7 名（VALORANT 6 名 + ましゅお55）は引き続き X アイコン（400×400）です。

## X アイコンの対応（依頼者指定）

| メンバー | slug | ファイル |
| --- | --- | --- |
| N4YUT4 | `n4yut4` | `02-glasses-gun-black.jpg` |
| findingnimo | `findingnimo` | `01-cat-photo.jpg` |
| kosty | `kosty` | `14-spider-comic.jpg` |
| Meatoire | `meatoire` | `12-pink-hair-grin.jpg` |
| みそ | `miso` | `15-miso.jpg`（2026-10-02 提供） |
| 鳥 | `tori` | `16-tori.jpg`（2026-10-02 提供） |
| よわい | `yowai` | `05-white-beanie-cat-plush.jpg` |
| 花菱はち | `hanabishi-hachi` | `11-orange-hair-chibi.jpg` **※要照合** |
| ましゅお55 | `mashuo55` | `10-white-hair-black-cat-plush.jpg` |
| 清楚系大人大美女ねむら。 | `nemura` | `09-blue-hair-chibi-hoodie.jpg` |
| あすてぃ_ | `asty` | `07-lightblue-short-hair.jpg` |
| 煌星ステラ | `kiraboshi-stella` | `06-glasses-wafuku-pink.jpg` **※要照合** |

※ 2 名は X のプロフィール画像を直接取得して照合できなかったため、指示どおりに割り当てています。相違があれば
`src/lib/local-data/member-images.ts` を修正してください。microCMS 接続後は CMS の `avatar` が優先されます。

## 不足している素材・情報（設定待ち）

| 項目 | 状態 | 影響 |
| --- | --- | --- |
| microCMS の API キー / サービス ID | 未提供 | ローカルデータで表示中。接続後に CMS 運用へ |
| 本番ドメイン | 未提供 | canonical / OGP 絶対 URL / sitemap は未出力（設定後に自動生成） |
| メンバー画像の高解像度版 | 未提供（400×400） | Retina で甘く見える。800px 以上推奨 |
| 既定 OGP 画像（1200×630） | 未提供 | X カードは `summary`（画像なし）。`site-settings.defaultOgImage` に登録で切り替え |
| 問い合わせメール / フォーム URL | 未提供 | CONTACT は公式 X への導線のみ |
| 実在スポンサー | 未提供 | PARTNERS はロゴ無し・募集案内のみ |
| ニュース記事 | 未提供 | 0 件表示（架空記事は作成していません） |
| メンバーの役割 / ランク / 実績 / 配信先 | 未提供 | 空欄。CMS から後入力可能 |
