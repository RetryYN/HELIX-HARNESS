---
title: "GitHub 運用投影 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-20
updated: 2026-07-20
owner: Claude / TL
pair_artifact: docs/test-design/helix/github-operations-projection-acceptance.md
---

# GitHub 運用投影 要件定義

- 文書層: L3 要件定義
- status: draft（PLAN-L3-19 Step 2-3 起草分、confirm は review evidence 後）
- 対応上位: `docs/plans/PLAN-L3-19-github-operations-projection.md`、
  `docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`（GH-FR-001〜016）
- PO 方針 (2026-07-20): Forward / Scrum 以外の駆動モデルは Issue 起票で Forward 再合流の流れを可視化し、
  工程表を GitHub Projects と連携し、Issue を階層化し、人間は GitHub を見れば工程のすべてが分かる状態にする。
- CI 軽量化方針 (PO): 内部 CI はしっかり、外部 CI は軽く重要部分のみ。CI 速度は実装速度に直結する。

## §1 拘束原則

正本は `harness.db` / repo-owned ledger のままとする。GitHub Projects と sub-issue 階層は
**read 側 projection (一方向同期)** であり、GitHub 側の直接編集を正本へ逆流させない。GitHub 側の編集を
反映したい場合は、`github-autonomous-operations-requirements.md` の GH-FR-001 Issue 受付ゲートを経由する
command candidate としてのみ取り込む（正本を直接書き換える経路は存在しない）。

GitHub 側の緑表示 (Projects board のステータス色、Issue close 状態、CI check 表示) を completion の根拠に
しない。これは同要件定義 §1 の「GitHub 上の緑表示だけでは完了にしない」という完了契約を projection 層にも継承する。

## §2 API 制約表 (2026-07-21 公式資料確認)

本表は projection 設計の入力となる既知の GitHub API 制約であり、FR/AC の前提として扱う。

| 制約 | 内容 | 設計への含意 |
|---|---|---|
| Projects v2 item 上限 | 1 project あたり item 50,000 件 | projection 対象は roadmap gate/span と active PLAN/Issue に限定し、無制限追加をしない |
| Projects v2 field 上限 | 1 project あたり field 50 個 | field 設計は roadmap の状態/layer/route 等の必須列に絞り、動的増殖を許可しない |
| single-select option 上限 | 1 field あたり option 50 個 | status/route などの列挙値は既定の固定語彙内に収める。超過が見込まれる場合は事前 fail-close する |
| sub-issue 階層制約 | 1 親あたり子 100 件、階層深さ最大 8 | PLAN 親子写像は 8 階層を超えない設計とし、100 件超過時は分割/ページングする |
| workflow token の権限境界 | repository scoped の既定 `GITHUB_TOKEN` だけで Projects 操作権限が得られるとは仮定しない。Projects API は必要権限を持つ GitHub App installation/user token または project scope の token を使う | secret 管理設計を別途持つ (§GOP-FR-10)。実装前に対象 endpoint の最小権限を検証する |
| `updateProjectV2Field` のフル置換 | option 定義の更新は、値を渡すと既存 option を上書きする。既存 option の `id` を入力へ含めれば identity と item value を維持できる | 更新前に既存 option を取得し、既存 `id` を保持する。名前は照合キーに使えるが、IDを無条件に捨てて再生成しない |
| rate limit | GraphQL 5,000 point/時・2,000 point/分、REST は secondary rate limit あり | bulk sync は batching + backoff を必須にし、単発ループでの全件同期を禁止する |
| 書込み後の整合性 | mutation の成功応答だけでは projection 全体の field 値・階層・正本 snapshot との一致を証明しない | 書込み後に read-back 検証を必須のステップとして設計する (§GOP-FR-09) |

公式 source ledger（確認日 2026-07-21）:

| 一次資料 | 採否 | workflow 影響 |
|---|---|---|
| https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/archiving-items-from-your-project | 採用: active + archive 合計 50,000 item 上限 | 同期前の件数 gate と retention 設計へ反映 |
| https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-issue-fields / https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-single-select-fields | 採用: project 50 field、single-select 50 option 上限 | schema生成前の上限 gate へ反映 |
| https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues | 採用: 親ごと100件、最大8階層 | Issue階層の分割・事前拒否へ反映 |
| https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects | 採用: Projects API の token/scope 選択 | endpoint単位の最小権限検証とsecret境界へ反映 |
| https://docs.github.com/en/graphql/reference/projects | 採用: field update は既存定義取得が必要、option `id` 指定で identity を保持 | option更新を read-modify-write + read-back に変更 |
| https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api | 採用: user primary 5,000 point/時、GraphQL secondary 2,000 point/分等 | batching/backoffとrate-limit receiptへ反映 |

## §3 機能要件 (FR)

### GOP-FR-01 正本境界の明示

GitHub Projects の item/field/view と sub-issue 階層は read 側 projection と定義し、`harness.db` /
repo-owned ledger を唯一の正本とする。projection 生成物のどのフィールドも書込み優先度で正本を上書きしない。

### GOP-FR-02 GitHub 側編集の逆流禁止

Projects board 上の status 変更や sub-issue の手動追加/削除など、GitHub UI/API から行われた変更を
そのまま正本へ反映しない。反映したい変更は `github-autonomous-operations-requirements.md` GH-FR-001 の
Issue 受付ゲートを通る command candidate として正規化されて初めて admission される。

### GOP-FR-03 completion 根拠の分離

`helix doctor` / `helix status` 等の completion 判定は GitHub 側の表示 (緑チェック、closed 状態、board
列位置) を入力にしない。GitHub 表示はあくまで人間可観測性のための派生物であり、判定は `harness.db` の
event/projection を正本として行う。

### GOP-FR-04 roadmap gate/span の Projects 投影

roadmap の gate / span (`src/lint/roadmap-registry.ts` 系のロードマップ状態) を GitHub Projects の
view / status field / iteration へ一方向で投影する。投影対象の状態遷移は roadmap 側の正本更新に追従し、
Projects 側の手動移動では戻らない (次回同期で正本値へ再収束する)。

### GOP-FR-05 PLAN 親子・駆動モデル別 Issue の階層写像

PLAN の親子構造および駆動モデル (`forward` / `reverse` / `scrum_reverse` / `redesign` / `recovery` /
`incident` 等、GH-FR-002 分類体系) ごとの Issue を、次の規則で parent / sub-issue へ写像する。

- 層 PLAN (親 PLAN、または route 上位の PLAN) は parent issue。
- step、派生 Issue、Reverse/Redesign/Recovery/Incident 等の下位 episode は sub-issue。
- 1 親あたり sub-issue 100 件、階層深さ 8 を超える写像は行わず、超過が見込まれる場合は §2 の上限に従って
  分割する。

### GOP-FR-06 API 制約の設計反映

§2 の API 制約 (item/field/option 上限、sub-issue 上限、workflow token の権限境界、option 定義の
上書き semantics、rate limit) を設計に反映する。特に option 同期は更新前に既存定義を取得し、同一 option の
`id` を入力へ引き継ぐ。名前照合だけで既存IDを捨てる更新や、stale ID の無検証再利用を禁止する。

### GOP-FR-07 人間可観測性

`helix status` が示す active frontier (workflow-next-action 相当) を、GitHub 側 (Projects board の
現在列 + Issue 階層の open/closed 状態) から追加ツールなしで読める状態にする。Projects board と Issue
階層だけを見れば、現在どの roadmap gate/span が進行中で、どの Issue が Forward 再合流待ちかが分かる。

### GOP-FR-08 projection drift 検出

projection (Projects item/field 値、sub-issue 階層) と `harness.db` の正本値との不一致を `helix doctor`
gate で検出し、stale / 不一致を fail-visible にする。drift 検出は silent に無視されず、doctor の
non-zero exit または明示 finding として報告される。

### GOP-FR-09 read-back 検証

Projects API への書込み (`addProjectV2ItemById` 等) の後、読み取り API で反映内容を検証する read-back
ステップを必須とする。書込み呼び出しが成功応答を返しただけでは projection 完了とみなさない。

### GOP-FR-10 secret 境界

Projects API は対象 endpoint に必要な最小権限を持つ GitHub App installation/user token または project scope の
token を使う。repository scoped の既定 `GITHUB_TOKEN` に未検証の Projects 権限を仮定しない。追加 token が
必要な場合は分離した secret として管理し、secret の実値・token 例をドキュメント内に書かず、参照先
(secret store の name/key) のみを記述する。

### GOP-FR-11 3 段 CI の重み配分 (HIL-BR-16 整合)

`infinity-loop-requirement-definition-ledger.md` の HIL-BR-16 (prejoin → postjoin → 外部 CI/PR の順)
を前提に、外部 (GitHub 上の) PR CI の重みを次のとおり要件化する。

- 外部 PR CI = typecheck + 変更影響範囲の targeted test (dependent-regression mapping を流用した
  差分ベース選択) + critical gate のみを実行する。
- 全回帰 (full regression) と全 doctor gate は、merge 後の内部 CI と nightly 実行に置く。

実測根拠 (PO 提供、2026-07 時点観測): 外部 CI `harness-check` の実測所要時間が約 1,300 秒のうち、
Vitest の全回帰実行が約 1,179 秒 (全体の約 91%) を占める。この配分により外部 PR CI の待ち時間を
支配的に決めているのが full regression であることを実測根拠とし、外部レーンから重量回帰を切り出す。

### GOP-FR-12 内部 CI での full 回帰保証

merge 後内部 CI と nightly は、外部 PR CI で省略した full regression と全 doctor gate を必ず実行する。
外部レーンで targeted test に絞ったことによるカバレッジ欠落を内部レーンが相殺し、どの commit も
最終的に full regression を通過した記録を持つ。

### GOP-FR-13 無根拠な軽量化の禁止

test 削除、閾値緩和、required leg の除外による CI 軽量化を禁止する。GH-FR-012 (merge・release境界) の
「無根拠 rerun、テスト削除、閾値緩和、required leg の除外で緑化してはならない」と整合し、軽量化は
必ず「どのレーンがどの gate を代替実行するか」を明示した設計変更としてのみ行う。

### GOP-FR-14 実測根拠の再測定義務

CI 所要時間の実測根拠 (GOP-FR-11 の秒数) は静的な一回限りの記録にせず、CI 実行時間が有意に悪化した場合
(例: targeted test 選択後も外部レーンが再度長時間化した場合) に再測定し、本書の数値を更新する。stale な
実測根拠のまま重み配分の正当性を主張しない。

## §4 受入基準 (falsifiable AC)

| AC | 対応 FR | 合格条件 | test design cite |
|---|---|---|---|
| GOP-AC-01 | GOP-FR-01, GOP-FR-02 | GitHub 側 (Projects/sub-issue) からの直接編集 fixture が正本へ反映されず、Issue 受付ゲート経由の command candidate のみ admission される | GOP-T-01 |
| GOP-AC-02 | GOP-FR-03 | completion 判定 fixture で GitHub 側緑表示のみを入力にした判定が拒否される | GOP-T-02 |
| GOP-AC-03 | GOP-FR-04 | roadmap gate/span の状態遷移 fixture が Projects view/status field/iteration へ一方向投影され、Projects 側の手動変更が次回同期で正本値へ収束する | GOP-T-03 |
| GOP-AC-04 | GOP-FR-05 | PLAN 親子・駆動モデル別 Issue fixture が parent/sub-issue へ規則どおり写像され、孤児 sub-issue が 0 件になる | GOP-T-04 |
| GOP-AC-05 | GOP-FR-06 | item/field/option 上限超過 fixture が同期前に fail-close し、option 名ベース再解決が ID drift を吸収する | GOP-T-05 |
| GOP-AC-06 | GOP-FR-07 | `helix status` の active frontier と Projects board + Issue 階層の表示が同一 fixture 上で一致する | GOP-T-06 |
| GOP-AC-07 | GOP-FR-08 | projection と `harness.db` を意図的に不一致にした fixture で `helix doctor` が fail-visible になる | GOP-T-07 |
| GOP-AC-08 | GOP-FR-09 | 書込み成功だが read-back が不一致になる fixture で silent success を返さない | GOP-T-08 |
| GOP-AC-09 | GOP-FR-10 | secret 未設定/誤設定 fixture で Projects API 呼び出しが fail-close し、secret 実値がログ/doc へ出力されない | GOP-T-09 |
| GOP-AC-10 | GOP-FR-11, GOP-FR-12, GOP-FR-13 | 外部 PR CI fixture が typecheck + targeted test + critical gate のみを実行し、full regression 省略分が内部 CI/nightly fixture で必ず実行される (カバレッジ相殺なし) | GOP-T-10 |
| GOP-AC-11 | GOP-FR-14 | CI 所要時間の再測定イベントが記録され、stale な実測根拠のまま重み配分主張が継続しない | GOP-T-11 |

## §5 用語

- GitHub 運用投影 (GitHub operations projection): roadmap gate/span と PLAN/Issue 階層を GitHub
  Projects / sub-issue へ一方向で反映する read 側 projection の総称。設計確定時に L0 glossary へ登録する。
