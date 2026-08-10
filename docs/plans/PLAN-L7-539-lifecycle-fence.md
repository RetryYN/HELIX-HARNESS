---
plan_id: PLAN-L7-539-lifecycle-fence
title: "PLAN-L7-539 (add-impl): requirement intake の lifecycle fence を exact inventory で機械化する（U-DRG-016）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-10 進めて（#177 L4 以降 第 4 スライス、HR-FR-DHR-012 で最終）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: HR-FR-DHR-012
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "L3 §2.1 が恒久 / 置換可能 / 撤去の 3 区分を prose で宣言しているだけで、#257 到達後に旧 adapter を消し忘れても恒久要素まで一緒に消しても機械が検知できない。撤去対象の module・export・test・policy entry の exact inventory が存在しない"
contract_postconditions: "src/design/requirement-intake-lifecycle.ts が 3 区分の exact inventory（5 entry）と activation probe を凍結宣言として持ち、#257 到達可否に応じて撤去対象の残存・早すぎる撤去・恒久要素の欠落を typed violation で返す。実 repo に対する gate が CI（vitest）で常時実行される"
contract_invariants: "inventory は Object.freeze 済みで entries も各要素も凍結する。判定は inventory と実態の差分のみで path の内容を解釈しない。replaceable は存在・不在いずれも違反にしない。違反は symbol 昇順で全件返す。既存 module の挙動を変えない（本 slice は検査面の新設のみ）"
contract_failures: "撤去側を『到達後の残存』だけ検査して片肺にする経路、恒久要素の欠落を見逃す経路、replaceable を retire として扱い #257 未到達で偽陽性を出す経路、import 行やコメントの言及を実在に数えて撤去し忘れ検査が空振りする経路、activation probe を判定に使わず常に未到達とみなす経路を、U-DRG-016 系 6 oracle で塞ぐ"
tdd_red_required: true
red_at: "2026-08-10T13:32:40Z"
green_at: "2026-08-10T13:32:41Z"
mutation_oracle_evidence: "tests/requirement-intake-lifecycle.test.ts が L8 の U-DRG-016 / 016b〜016h を機械検査する。8 mutation をいずれも exit 非 0 で kill することを実測（8/8）。locator と改変内容（すべて src/design/requirement-intake-lifecycle.ts）: (1) if (input.canonicalIrActive && present) → if (false)（撤去対象の残存を検知しない）、(2) if (!input.canonicalIrActive && !present) → if (false)（早すぎる撤去を検知せず片側検査へ退化）、(3) 恒久要素の if (!present) → if (false)、(4) replaceable の early continue ブロックを削除、(5) detectPresentSymbols の宣言 regex を部分一致 `${entry.symbol}` へ緩める、(6) canonicalIrActive を existsSync(probe) から false 固定へ、(7) violations.sort(...) を削除、(8) 宣言 regex から (?:async\\s+)? と function\\*?/let/enum を落として旧形へ戻す。各 mutation 後に restored して 8/8 green を確認済み。**(5) と (6) は初回追試で生存**し、(5) は pure な detectPresentSymbols を切り出して言及のみ / 宣言ありの注入 source で、(6) は一時 repo に probe を作って判定が反転する反例で塞いだ。**(7) と (8) は review 指摘で追加**した面であり、reviewer が (7) の生存を独立実測している。さらに **(5) の再追試で anchor 不一致による偽の生存**（regex 文字列を変更したため mutation script の置換が no-op になっていた）が起き、anchor を修正して当て直し kill を確認した。『全部 kill』と報告せず生存と偽陽性の双方を記録した"
complexity_effect: justified_positive
complexity_justification: "新規 pure module 1 本のみで、既存 module の signature も挙動も変えない。prose の 3 区分を機械検査へ移すことで、#257 到達時の撤去作業が推測ではなく gate 駆動になる"
removal_trigger: "#257 到達後に撤去対象がすべて撤去され、inventory の retire entry が 0 件になった時点（fence 自体は恒久 / 置換可能の宣言として残る）"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-016, test_path: tests/requirement-intake-lifecycle.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 L4 以降の slice 分割（lifecycle fence を最終スライスに）" }
  - { role: se, slot_label: "SE — exact inventory と両方向判定の実装" }
  - { role: qa, slot_label: "QA — 片肺検査・言及の過剰受理・probe 未使用の 3 経路を oracle で塞ぐ" }
  - { role: tl, slot_label: "TL — activation probe を inventory 側に置く判断（外部 flag との比較）" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-539-lifecycle-fence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/requirement-intake-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-intake-lifecycle.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-538-requirement-endpoint.md
  requires:
    - docs/plans/PLAN-L7-538-requirement-endpoint.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-10T13:55:00Z"
    tests_green_at: "2026-08-10T13:53:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI へは PR #526 / #529 で独立レビューを依頼済みだが Claude→Codex の wake チャネルが存在しない（Issue #532）ため、規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が実施した。verdict=request_changes（Critical 1 / Important 1 / Minor 1）→ 全件是正済み。**Critical**: retire inventory が design-registry-screen-intake.ts の 10 export 中 2 件しか押さえておらず、撤去し忘れ検査が対象 module に対して構造的に不完全だった。是正: 台帳結合 4 件（loadScreenIntakeInputs / ScreenLedgerRowV1 / ScreenTraceRowV1 / canonicalizeScreenEntityId）へ拡張し、残り 6 件を『intake の意味論であり #257 到達後も生き残る』として非対象の判断根拠つきで module 冒頭・L5 §11.1.1・PLAN §2.0 へ明文化した。**Important**: left_arm_carry.review_binding.evidence_digest が placeholder で sha256 regex を満たさない。是正: 本レビュー確定後に実測値を束縛（3 スライス連続の同一指摘だったため review_evidence を先に確定させる手順へ変更済み）。**Minor**: violations.sort に oracle が無く mutation が生存すること（reviewer が独立実測）、および detectPresentSymbols の宣言 regex が export async function を拾えないこと（reviewer の probe 検証）。是正: U-DRG-016g / 016h を追加し regex を async / function* / let / enum まで拡張、mutation を 6 件から 8 件へ増やして 8/8 kill を実測した。**reviewer による独立検証**: 本 fence が CI で実際に効くかを harness-check.yml で確認し、regression-test ステップが tests 配下の全 test file を lane へ強制割り当てする union チェックを持つため本 test が全回帰対象に入ることを根拠つきで確認した。mutation は 2 件（replaceable continue 除去 = kill、violations.sort 除去 = 生存）を独立実測し、残り 4 件は未実測と明記された。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/requirement-intake-lifecycle.test.ts tests/design-language.test.ts tests/digest.test.ts tests/design-coverage.test.ts tests/design-registry-screen-intake.test.ts tests/design-registry-requirement-endpoint.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T13:53:00Z", evidence_path: tests/requirement-intake-lifecycle.test.ts, output_digest: "sha256:6ec2f085f49ae939b7c5c2416b7b194eaec4b04cc1dc07f9f840d356b8f79cd2", result: "6 files green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T13:53:00Z", evidence_path: docs/plans/PLAN-L7-539-lifecycle-fence.md, output_digest: "sha256:a57aa914a91da1d900b7497852073333ae1b390992f494732357b29a6f9d27a7", result: "5 gate すべて OK" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T13:53:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T13:55:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-10T13:55:00Z"
    evidence_digest: "sha256:dc34b6ff3887da5ab2eb3de6e7cd498f198869af55eb8c41a56e0e5bb87f12a0"
  entries: []
---

# PLAN-L7-539: requirement intake の lifecycle fence

## §1 目的

L3 §2.1 は恒久 / 置換可能 / 撤去の 3 区分を prose で宣言しているだけで、#257（Canonical Design IR）
到達後に旧 adapter を消し忘れても、恒久要素まで一緒に消しても機械が検知できない。
HR-FR-DHR-012「撤去対象を exact inventory として列挙し、#257 到達後に旧 adapter が残存していれば
失敗する negative lifecycle test を持つ」を満たす。

本 slice で **HR-FR-DHR-007〜012 が全数着地**する。

## §2 設計判断

### §2.0 撤去対象は「台帳結合」だけを挙げる

`design-registry-screen-intake.ts` の 10 export のうち inventory へ挙げるのは台帳 schema に結合した
4 件（`loadScreenIntakeInputs` / `ScreenLedgerRowV1` / `ScreenTraceRowV1` /
`canonicalizeScreenEntityId`）。残り 6 件は intake の意味論であり、#257 が canonical IR から同じ形の
入力を供給すればそのまま生き残る。撤去対象に含めると #257 到達時に「消してはいけないものを消せ」と
要求する誤った gate になる。**この線引きは省略ではなく宣言**として module 冒頭と L5 §11.1.1 に書いた。

初版は `loadScreenIntakeInputs` / `ScreenTraceRowV1` の 2 件しか挙げておらず、review で
「10 export 中 2 件では撤去し忘れ検査が構造的に不完全」と Critical 指摘を受けた。実装側でも
同じ漏れに気づいており、`ScreenLedgerRowV1` / `canonicalizeScreenEntityId` を追加したうえで
非対象 6 件の判断根拠を明文化した。

### §2.1 判定は両方向にする

撤去側を「到達後の残存」だけ検査すると片肺になる。まだ消してはいけないものが消えている状態
（`retire_target_missing_early`）も違反として扱い、inventory の腐りを検知する。

| 状態 | 恒久 | 置換可能 | 撤去 |
|---|---|---|---|
| #257 未到達 | 実在必須 | 判定しない | 実在必須 |
| #257 到達後 | 実在必須 | 判定しない | 不在必須 |

`replaceable` を判定対象にしない理由は L3 §2.1 が「置換」であって「撤去」を要求していないため。
判定しないが inventory には残す（宣言として読めることに意味がある）。

### §2.2 activation probe を inventory 側に置く

`#257 到達` の判定を外部 flag ではなく `src/design/canonical-design-ir-intake.ts` の実在で行う。
判定条件を inventory と同じ場所に置くことで、prose の「#257 が来たら」を機械が読める形にする。

### §2.3 実在は宣言箇所だけを見る

import 行やコメントの言及まで数えると、撤去済みの symbol が残骸として言及されているだけで
「まだある」と誤判定し、撤去し忘れ検査が空振りする。`function` / `const` / `interface` /
`type` / `class` 宣言のみを実在とみなす。

## §3 工程表

### Step 1: red（U-DRG-016 系を先に書く）[直列]

根拠: downstream_dependency（TDD 規律。module 不在で red を実測してから実装する）。

### Step 2: green（inventory と両方向判定の実装）[直列]

根拠: downstream_dependency（oracle 定義後にのみ実装を当てる）。

### Step 3: mutation 追試と oracle 補強 [直列]

根拠: downstream_dependency（green だけでは oracle が load-bearing か判定できない）。

### Step 4: 設計文書・テスト設計への反映 [並列]

根拠: parallel（L5 §11 / L6 §7 / L8 oracle 表は同一判断から同時に導ける）。

### Step 5: review [直列]

根拠: downstream_dependency（実装確定後の成果物に対して検証する）。

## §3.1 実装計画

新規 `src/design/requirement-intake-lifecycle.ts`（凍結 inventory + pure な analyze + I/O loader）と
`tests/requirement-intake-lifecycle.test.ts`（U-DRG-016 / 016b〜016f）。既存 module は変更しない。

## §4 mutation 追試で生存した 2 件（および review 指摘による 2 件追加）

| # | mutation | 生存理由 | 追加した反例 |
|---|---|---|---|
| (5) | 宣言 regex を部分一致へ緩める | 実 repo の symbol はすべて宣言済みで、緩めても結果が変わらない | pure な `detectPresentSymbols` を切り出し、言及のみ / 宣言ありの注入 source で判定が分かれることを固定（U-DRG-016e） |
| (6) | activation probe 判定を false 固定へ | 現状 probe が不在で結果が同じ | 一時 repo に probe を作り `canonicalIrActive` が反転することを固定（U-DRG-016f） |

いずれも「現状の実データでは差が出ない」型の生存であり、fixture を足すのではなく
**判定が分かれる状況を作る**反例で塞いだ。

review でさらに 2 件の未検査面が判明し、oracle を追加した（U-DRG-016g / 016h）。

| # | mutation | 指摘元 | 追加した反例 |
|---|---|---|---|
| (7) | `violations.sort(...)` 削除 | reviewer が生存を独立実測 | 全 symbol を欠落させた入力で昇順・全件性を固定（U-DRG-016g） |
| (8) | 宣言 regex から `async` を落とす | reviewer の probe 検証 | `export async function` 形を実在として認識することを固定（U-DRG-016h） |

再追試では **anchor 不一致による偽の生存**も起きた。(5) の regex 文字列を変更した後、mutation
script の置換対象が一致せず no-op になっていたにもかかわらず「生存」と読める出力が出た。
anchor を修正して当て直し kill を確認した。mutation script の置換が実際に当たったかを
確認せずに生存と判定してはならない。

## §5 本 PLAN の非対象

- `helix doctor` への配線。本 slice は vitest による CI 常時実行で fence を成立させる。
  doctor への露出は別 slice（検査面と報告面を同一 slice に混ぜない）。
- `BR-20` / `BR-21` の解決（Issue #530。L1 は人間 authority）。
- #257 側の実装。probe path の宣言のみで、canonical IR そのものは本 slice の対象外。

## §6 残リスク

- inventory は手書き宣言であり、将来 intake 経路が増えたときに登録し忘れる可能性がある。
  登録漏れそのものを検知する仕組みは持たない（entry が指す symbol の腐りは検知できる）。
- activation probe は path の実在だけを見る。#257 が別 path へ着地した場合は probe の更新が要る。
  probe path を inventory 側に置いたのはその更新箇所を 1 点に絞るためである。
