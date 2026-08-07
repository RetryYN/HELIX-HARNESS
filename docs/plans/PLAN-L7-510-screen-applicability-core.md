---
plan_id: PLAN-L7-510-screen-applicability-core
title: "PLAN-L7-510 (add-impl): ScreenApplicabilityGate pure evaluator core（U-SAP-001〜005）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAP-002
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §0-§1 の型・signature・DbC を正本とする。pure APIは filesystem/clock/DB/browser を直接読まない"
contract_postconditions: "canonicalizeScreenScope / evaluateScreenApplicability / validateNoUiReceipt / evaluateScreenReentry / planPrototypeDiscovery が L6 signature どおりの typed ScreenResultV1 を返し、同義入力は同digest、二route同時選択0、free-text/deferred pass 0、stale判定は task exactly-one を生成する"
contract_invariants: "write authority 0（pure evaluator のみ、transaction port / store / gate write は本PLAN非対象）。既存 src モジュールの挙動を変えない"
contract_failures: "field欠落・unknown capability・absolute locator・free-text route・reason/actor/evidence/expiry欠落・digest改変・no-UI routeへのtask生成を typed failure で fail-close する"
tdd_red_required: true
red_at: "2026-08-06T16:12:22Z"
green_at: "2026-08-06T16:54:15Z"
mutation_oracle_evidence: "tests/screen-scope.test.ts / tests/screen-applicability.test.ts / tests/no-ui-receipt.test.ts / tests/screen-reentry.test.ts / tests/prototype-discovery.test.ts の it.each mutation が L6テスト設計 U-SAP-001〜005 のmutation行（field欠落・順序変更・1 byte digest改変・同一入力再送増分0 等）を機械検査する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#175）の第1スライス。pure module 1本とtest 5本のみを追加し、CLI表面・DB schema・port実装は後続スライスへ分離する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のevaluatorへ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-core-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-001, test_path: tests/screen-scope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-002, test_path: tests/screen-applicability.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-003, test_path: tests/no-ui-receipt.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-004, test_path: tests/screen-reentry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-005, test_path: tests/prototype-discovery.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 slice分割（pure evaluator core を先行）" }
  - { role: se, slot_label: "SE — screen-applicability pure module 実装" }
  - { role: qa, slot_label: "QA — U-SAP-001〜005 mutation oracle" }
  - { role: tl, slot_label: "TL — L6 signature 整合と後続スライス境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-510-screen-applicability-core.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-core-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/screen-applicability.ts, artifact_type: source_module }
  - { artifact_path: tests/screen-scope.test.ts, artifact_type: test_code }
  - { artifact_path: tests/screen-applicability.test.ts, artifact_type: test_code }
  - { artifact_path: tests/no-ui-receipt.test.ts, artifact_type: test_code }
  - { artifact_path: tests/screen-reentry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/prototype-discovery.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-06T16:56:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-06T16:56:00Z"
    evidence_digest: "sha256:35c69d829d39f2d77ba43693bcca91caf9236959782c69c26c1a200a017d2b77"
  entries: []
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T16:56:00Z"
    tests_green_at: "2026-08-06T16:54:15Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が3ラウンドでレビューした。1回目request changes（Important 3件: ScreenDecisionV1.capability_idへの複数capabilityカンマ結合packingが未文書化・未テスト、canonicalizeScreenScope複合if 5分岐のmutation耐性欠如、PLAN本文の§工程表/§実装計画欠落）。是正としてcapability IDカンマ含有のfail-close追加とpacking方式のdocstring明記、複数capability同一route正常系テスト（packing往復）追加、screen-scope it.eachへ5 mutation＋dedupテスト追加、ruleContentDigest重複をcomputeScreenRuleSetDigestへ一本化。2回目もrequest changes（Important 1件: 追記した§3工程表が箇条書きネストのためplan lintのStep抽出正規表現に一致せずzero-step bypassでgreen表示になっているだけとreviewerが正規表現直接適用で検出）。是正としてStep 1-4を行頭h3見出し化しStep 3へSERIAL_REASONS根拠行を追加、green_atを記入。3回目approve（Critical/Important/Minor 0件）。reviewerはStep 4件抽出・根拠行・review Step・§3.1実装計画の充足、43/43 green、tsc exit 0、digest inventory一致、実装/テストの前ラウンドからの無変更を独立実測した。非ブロッキング申し送り=短縮ID(48bit)衝突余地とevaluateScreenReentryのrule digest差分検出がL6 signature上不可能な点（後続transaction port/storeスライスで再検討）。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/screen-scope.test.ts tests/screen-applicability.test.ts tests/no-ui-receipt.test.ts tests/screen-reentry.test.ts tests/prototype-discovery.test.ts tests/design-language.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T16:54:15Z", evidence_path: tests/screen-applicability.test.ts, output_digest: "sha256:888e298e733bf45816da888e6027601f223efd02deb65bf12d5e09f4a295fb80", result: "review是正後worktree: 7 files / 84 tests passed（U-SAP-001〜005の43件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T16:54:10Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-L7-510: ScreenApplicabilityGate の pure evaluator core 実装

## 目的（Issue #175 第1スライス）

L6設計 `screen-applicability-prototype.md` の pure API 群のうち、write authority を持たない
evaluator core 5 本（U-SAP-001〜005）を TDD で実装する。

- `canonicalizeScreenScope`: scope/capability/phase/public surface を stable sort し digest 化。
  field欠落・unknown capability・absolute locator を reject、同義入力は同 digest。
- `evaluateScreenApplicability`: UI 有無を deterministic 評価。free-text / deferred を pass しない。
  二 route 同時選択 0。
- `validateNoUiReceipt`: reason/actor/evidence/reentry/scope/rule/expiry を完全照合。
- `evaluateScreenReentry`: capability/rule/scope digest 差で stale + 再判定 task exactly-one。
  同一入力再送は増分 0。
- `planPrototypeDiscovery`: prototype_required だけを受け、screen/interaction/state/data 義務を
  全保持した task 一件を生成。no-UI route への task 生成は fail-close。

## §3 工程表

### Step 1: L6/L8 突き合わせとred oracle作成 [直列]（済 2026-08-06T16:12:22Z red）

根拠: downstream_dependency（signature確定が実装の前提）。

### Step 2: pure evaluator 5 API 実装 → green [直列]（済 2026-08-06T16:14:10Z green）

根拠: file_conflict（同一module `src/design/screen-applicability.ts` への集中編集）。

### Step 3: review Step（intra_runtime_subagent = code-reviewer sonnet、Codex usage limit中の規定代替） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes（Important）→ 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §0-§2、
L6テスト設計 `docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md` U-SAP-001〜005 行、
Issue #175 behavior contract。実装は pure module 1本（`src/design/screen-applicability.ts`）へ集約し、
digest は固定キー順 `JSON.stringify` + sha256 で決定化する。ScreenDecisionV1.capability_id（単数 string）への
複数 capability packing はソート済みカンマ結合とし、capability ID へのカンマ含有を fail-close で禁止して
round-trip を保証する。transaction port / store / CLI / DB projection は後続スライス（§後続スライス参照）。

## 後続スライス（本PLAN非対象）

- U-SAP-006〜009（prototype artifact・walkthrough・agreement・backprop の各検証）
- U-SAP-010〜012（freeze / stage closure gate / plan route composition と transaction port・store）
- harness.db projection と CLI 表面
