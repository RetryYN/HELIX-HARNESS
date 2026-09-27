# 外部監査2件の訂正記録（G20）

status: candidate_correction_record
authority_effect: none

## 起点と範囲

POは外部監査レビューを共有し「これらを踏まて進めてくれ」と指示した。共有監査の本文SHA-256は `1c06f42f63b06f636df3fbfc5903bbcc24596d4e8d421ab97b2263769bd32f1c`。監査はmain `45cf39e4`を基準とし、G9〜G13を処理能力の実装と混同しないこと、LABO-059の過剰な比較条件とCONNECTの一覧矛盾を直すことを指摘した。この訂正はG15統合後のmain `28b1cca62057bdb35e63d9d233f3c22eb659db5c`で行う。監査の進捗・CI状態は当時の観測であり現在状態へ転用しない。

[保存PO原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第5項の「HELIXなし／旧版／新版などの比較から効果を確認する」と[起点判断記録](body-reinforcement-po-decisions-2026-09-27.md)を再照合した。一律の三者必須を求める根拠はない。要求採択や実装許可は本記録から生成しない。

## LABO-059：目的別の対照群

- 保持：必要品質を先に確認し、総費用・所要時間・人間介入を同条件で比較する。救援・再作業・人修正を除外しない。歴史結果をcurrent性能へ転用せず、欠測と比較不能を表示する。優先・許容値は有効な判断を再利用する。
- 訂正：導入効果はHELIXあり／なし、改訂効果は旧版／新版、三者の関係を主張する場合だけ三者を要求する。目的と群を比較前に固定する。三者未実施と、条件を満たす二者で確認できた効果を分ける。未選択の群を観測済みとはしない。
- 対応：HELIXLABO-L2-059の比較軸・原文要求・欠落範囲、対L11の一覧と具体例。既存の三者一律必須を新候補として保存する必要はなく、誤導出を原文へ合わせる訂正である。
- 旧起点：`LEGACY-ASSET-28FB139B26CD61CC51EE`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76–147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`。R-03〜08は比較軸・同一snapshot/protocol・費用・履歴を規定するが、三者を一律必須にしていない。
- 対の受入：`LEGACY-ASSET-A952A3A175EB82A4781B`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30–41`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`。AC-003〜014の条件違い・欠測・歴史証拠の流用拒否を保持する。旧test/CIは実行しない。

## CONNECT：端点共有とidentity衝突

HELIXCONNECT-L2-001と対L11詳細節は、同じ端点を共有しても接続identity・意味契約・scopeを識別できれば登録可能としている。一覧だけの「重複端点」を「同一接続identityの異なる宣言による重複・identity衝突」へ訂正する。L2意味は変えず、別接続の端点共有を拒否しないことを一覧にも示す。

旧起点は `LEGACY-ASSET-C3DE79BA9451172F3E43`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md:61–91`、SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`、および `LEGACY-ASSET-DD66C1B6B7BE234B37E6`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/product-data-connector.md:35–62`、SHA-256 `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42`。identityと版/digestの衝突を拒否する意味を保持する。旧product-dataのactive version制限やCAS実装を、内部CONNECTの端点共有禁止へ一般化しない。G7の[既存照合記録](../audits/g7-connect-source-connection-inventory.md)も参照する。

## 記録・検証・残る判断

監査が特定した現行の誤記だけを同じ行数で訂正し、後続の行位置を保つ。旧判断記録・receipt・register既存行・captureは変更せず、訂正registerと新receiptを追記する。LABOは変更後L2 digest、CONNECTは不変L2 digestと訂正L11全体digestを束縛する。current pinを追随させ、共通手順8で変更前後を検証する。

本文revisionの採択、比較目的ごとの具体的な優先値・許容悪化、段階収載、実装は別判断のままである。この訂正は新しい比較実験の実施や、旧runtime起動の許可を作らない。G15〜G19の具体的処理能力の起草を継続し、候補文書・検証件数・CI状態を稼働するパックやv0.1成立としない。
