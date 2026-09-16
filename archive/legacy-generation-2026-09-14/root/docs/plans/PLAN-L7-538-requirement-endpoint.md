---
plan_id: PLAN-L7-538-requirement-endpoint
title: "PLAN-L7-538 (add-impl): trace edge の requirement 端点を graph に実在させる（U-DRG-015）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-10 進めて（#177 L4 以降 第 3 スライス）"
created: 2026-08-10
updated: 2026-08-10
owner: Claude / TL
github_issue_id: 177
engineering_discipline_required: true
behavior_contract_id: HR-FR-DHR-011
responsibility_owner: design-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L7-537 で L1 family の trace が edge 化されるようになったが、requirement node が投入されないため intake 出力単体では validateRegistryGraph を通せない（端点 orphan）。REQUIREMENT_ID_PATTERNS は L1 family を含まず、BR-01 の requirement node を作ることもできない"
contract_postconditions: "L1 family を registry の requirement grammar として認識し（D-1 の恒久部分）、edge 化した requirement を authority=shadow の node として投入する。intake 出力（nodes + trace_edges）が validateRegistryGraph を単体で通り端点 orphan が 0 になる。grammar（isRegistryRequirementId）と採用 bypass（isRegistryNativeRequirementId）を別述語に分離する"
contract_invariants: "isRegistryNativeRequirementId は isRegistryRequirementId の真部分集合であり L1 family に対して常に false。intake の catalog bypass は native 判定だけを使う。node 投入は実際に edge 化した ID に限り、未採用の catalog エントリを投入しない。同一 ID を重複投入しない。既存 native family の採用挙動を変えない"
contract_failures: "grammar を広げた結果 intake の bypass まで広がり catalog gate が無効化されて BR-99 が素通りする経路、requirement node を投入せず端点 orphan のまま commit へ流す経路、catalog 全件を node 化してどの screen からも参照されない requirement を graph へ流し込む経路、source_pointer を catalog 由来にせず L1 定義行への復元経路を失う経路を、述語分離と U-DRG-015 系 oracle で塞ぐ"
tdd_red_required: true
red_at: "2026-08-10T05:02:00Z"
green_at: "2026-08-10T05:08:00Z"
mutation_oracle_evidence: "tests/design-registry-requirement-endpoint.test.ts が L8 の U-DRG-015 / 015b / 015c を機械検査する。6 mutation をいずれも exit 非 0 で kill することを実測（6/6）。locator と改変内容: (1) src/design/design-registry-screen-intake.ts の bypass を isRegistryNativeRequirementId → isRegistryRequirementId（grammar 側へ戻し catalog gate を迂回、4 oracle が red）、(2) 同 if (!adoptedRequirementIds.has(...)) → if (false)（requirement node を投入しない、4 oracle が red）、(3) 同 nodes.push 前に未採用 catalog エントリも node 化する行を追加（4 oracle が red）、(4) src/design/design-registry.ts の REQUIREMENT_ID_PATTERNS から ...L1_REQUIREMENT_ID_PATTERNS を削除（grammar から L1 family を外す）、(5) 同 isRegistryNativeRequirementId の参照を NATIVE_REQUIREMENT_ID_PATTERNS → REQUIREMENT_ID_PATTERNS（native 判定に L1 family を混ぜる、4 oracle が red）、(6) requirement node の source_pointer を catalogEntry?.source_pointer ?? ... から screen_trace 由来のみへ変更。各 mutation 後に restored して 10 passed + 1 skipped を確認済み"
complexity_effect: justified_positive
complexity_justification: "既存 module に述語 1 本と node 投入分岐 1 つを足すのみ。新規 module も schema も dependency も増やさない。grammar と採用条件の分離は将来 family を足すときの安全弁になる"
removal_trigger: "#257 Canonical Design IR が requirement node を直接供給し、screen intake 由来の shadow requirement node の consumer が 0 になった時点"
parent_design: docs/design/helix/L6-function-design/design-registry.md
pair_artifact: docs/test-design/helix/L8-design-registry-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-registry.md, oracle_id: U-DRG-015, test_path: tests/design-registry-requirement-endpoint.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #177 L4 以降の slice 分割（端点実在を第 3 スライスに）" }
  - { role: se, slot_label: "SE — grammar と採用 bypass の述語分離、端点 node 投入" }
  - { role: qa, slot_label: "QA — grammar 拡張が catalog gate を迂回しないことを oracle で固定" }
  - { role: tl, slot_label: "TL — 述語を 2 本に分ける判断（1 本で兼ねる案との比較）" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-538-requirement-endpoint.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/design-registry.ts, artifact_type: source_module }
  - { artifact_path: src/design/design-registry-screen-intake.ts, artifact_type: source_module }
  - { artifact_path: tests/design-registry-requirement-endpoint.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-537-catalog-intake.md
  requires:
    - docs/plans/PLAN-L7-537-catalog-intake.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-10T05:25:00Z"
    tests_green_at: "2026-08-10T05:23:00Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLI へは PR #526 / #529 のコメントで独立レビューを依頼済みだが、Claude から Codex を起こす wake チャネルが存在しない（Issue #532）ため、規定代替の intra_runtime_subagent（claude-sonnet-5, read-only）が実施した。verdict=approve（Critical 0 / Important 0 / Minor 1）。Minor は left_arm_carry.review_binding.evidence_digest の placeholder で、本レビュー確定後に実測値を束縛した（PLAN-L7-536 / 537 で 2 回連続して踏んだため、今回は review_evidence を先に確定させてから digest を採る手順へ変更した）。**reviewer による独立検証**: 本 slice 最大のリスクである述語拡張の波及について src 全体を grep し、isRegistryRequirementId の呼び出し元が design-registry.ts:305（isValidEntityId の requirement kind 判定）の 1 件のみであること、intake 側の採用可否判定には使われておらず catalog gate の迂回箇所が他に無いことを実測で確認した。実台帳を自分で走らせ node 62（screen 15 / requirement 47）/ edge 83 / unmapped 2 / validateRegistryGraph ok を再現し PLAN §4 の表と一致することを確認した。mutation は 6 件のうち bypass を native から grammar へ戻す 1 件を独立再現して 4 oracle が red になることを確認、残り 5 件は時間都合で未実測と明記された（実装側では 6/6 を実測済み）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-registry-requirement-endpoint.test.ts tests/design-registry-catalog-intake.test.ts tests/design-registry-screen-intake.test.ts tests/design-registry-graph.test.ts tests/digest.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-10T05:23:00Z", evidence_path: tests/design-registry-requirement-endpoint.test.ts, output_digest: "sha256:a7e4e13760812ea1807566fb61b2e4b123549e939f638220e271c7e1f5751dcf", result: "6 files green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T05:23:00Z", evidence_path: docs/plans/PLAN-L7-538-requirement-endpoint.md, output_digest: "sha256:25f5cd5a09c4683cd8511f8bf7cafd5a17434d793eaeac30850203de2a7de643", result: "5 gate すべて OK" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-10T05:23:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-10T05:25:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-10T05:25:00Z"
    evidence_digest: "sha256:dd8be908af0e9d6bfb364405f22808de67495bfa6217205c2198136855148c37"
  entries: []
---

# PLAN-L7-538: requirement 端点の実在

## §1 目的

PLAN-L7-537 で L1 family の trace が edge 化されるようになったが、`BR-01` の requirement node が
graph に無いため intake 出力単体では `validateRegistryGraph` を通せない（端点 orphan）。
HR-FR-DHR-011「catalog に存在するが registry へ未投入の ID を端点に持つ edge を許さない」を満たす。

## §2 設計判断

### §2.1 grammar と採用条件を別の述語にする（本 slice の核心）

D-1 により L1 family は registry の requirement **grammar** として認識する。ただし grammar と
採用可否を同じ述語で兼ねると、grammar を広げた瞬間に catalog gate が無効化される。

| 述語 | 範囲 | 用途 |
|---|---|---|
| `isRegistryRequirementId` | native + L1 family | grammar（node の ID 形検査） |
| `isRegistryNativeRequirementId` | native のみ | intake の catalog bypass |

intake の bypass に grammar 側を使うと catalog に無い `BR-99` が素通りして trace を捏造できる。
両述語の差分（`BR-01` に対して grammar=true / native=false）を oracle で固定した。

### §2.2 投入は実際に edge 化した ID に限る

catalog 全件を node 化すると、どの screen からも参照されていない requirement が graph へ流れ込む。
`source_pointer` は catalog の値をそのまま持ち、L1 定義行への復元経路を失わない。

## §3 工程表

### Step 1: red（U-DRG-015 / 015b / 015c を先に書く）[直列]

根拠: downstream_dependency（TDD 規律）。

### Step 2: green（述語分離と端点 node 投入）[直列]

根拠: downstream_dependency（oracle 定義後にのみ実装を当てる）。

### Step 3: 既存 oracle の追随 [直列]

根拠: shared_state（`U-DRG-012` 系は同一 module の nodes 集合を固定している）。

### Step 4: 実台帳に対する graph 検証 [直列]

根拠: downstream_dependency（fixture だけでは実 83 edge の端点実在が確認できない）。

### Step 5: mutation 追試 [直列]

根拠: downstream_dependency（述語分離が load-bearing か確認する）。

### Step 6: 設計文書・テスト設計への反映と review [並列]

根拠: parallel（L5 §10 / L6 §6 / L8 oracle 表は同一判断から同時に導ける）。

## §3.1 実装計画

`design-registry.ts` に `NATIVE_REQUIREMENT_ID_PATTERNS` / `L1_REQUIREMENT_ID_PATTERNS` の分離と
`isRegistryNativeRequirementId` の export を追加する。`design-registry-screen-intake.ts` は bypass を
native 判定へ切り替え、edge 化した requirement を `authority=shadow` の node として投入する。

## §4 実台帳に対する適用実測（2026-08-10）

| 指標 | 値 |
|---|---|
| nodes | **62**（screen 15 / requirement 47） |
| edges | 83 |
| unmapped | 2 |
| `validateRegistryGraph` | **ok**（端点 orphan 0） |

PLAN-L7-537 時点では node 15 / edge 83 で端点 orphan が残っていた。本 slice で graph 検証が
単体で通るようになった。

## §5 本 PLAN の非対象

- 恒久 family 認識と暫定 loader の lifecycle 分離宣言（HR-FR-DHR-012）。次スライスで起票する。
- intake 結果の commit（transaction 側）。既存 commit 経路の変更は行わない。
- `BR-20` / `BR-21` の解決（Issue #530、L1 は人間 authority）。

## §6 残リスク

- `authority=shadow` の requirement node が graph に入るため、canonical への昇格判断は commit 側の
  責務のまま。intake が canonical を名乗らない設計は維持しているが、shadow node の滞留を検知する
  仕組みは本 slice では持たない。
- grammar に L1 family を加えたことで、registry の他 consumer も `BR-*` を requirement ID として
  受理するようになる。採用は catalog gate が守るが、**intake 以外の投入経路**が将来増えた場合は
  同じ gate を通す必要がある（述語分離はそのための土台）。
