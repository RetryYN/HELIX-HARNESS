---
plan_id: PLAN-L7-511-screen-applicability-proto
title: "PLAN-L7-511 (add-impl): ScreenApplicabilityGate prototype検証 evaluator（U-SAP-006〜009）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める（slice2）"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAP-008
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §1-§2 の型・signature・DbC を正本とする。pure APIは filesystem/clock/DB/browser を直接読まない。slice1（PLAN-L7-510）の evaluator core と型を再利用する"
contract_postconditions: "validatePrototypeArtifact / recordWalkthroughIteration / evaluatePrototypeAgreement / validateRequirementsBackprop が L6 signature どおりの typed ScreenResultV1 を返し、同義入力は同digest、正常系 receipt は exactly-one、9状態完備・bounded iteration・latest artifact bind・全delta disposition を機械検査する"
contract_invariants: "write authority 0（pure evaluator のみ、transaction port / store / gate write は本PLAN非対象）。slice1 の既存 API・既存 src モジュールの挙動を変えない"
contract_failures: "static-only artifact・trace欠落・9状態欠落/重複・actor/observation/target/rebuild欠落・iteration超過・walkthrough欠落・旧artifact review・人以外review・digest不一致・未disposition delta・no_delta偽装を typed failure（HIL_PROTOTYPE_* / HIL_WALKTHROUGH_RECEIPT_MISSING）で fail-close する"
tdd_red_required: true
red_at: "2026-08-06T20:46:54Z"
green_at: "2026-08-06T20:53:22Z"
mutation_oracle_evidence: "tests/prototype-artifact.test.ts / tests/prototype-walkthrough.test.ts / tests/prototype-agreement.test.ts / tests/prototype-backprop.test.ts の it.each mutation が L6テスト設計 U-SAP-006〜009 のmutation行（trace一件ずつ欠落・9状態一件ずつ削除・iteration超過・digest改変・no_delta偽装 等）を機械検査する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#175）の第2スライス。slice1 と同一 pure module へ evaluator 4 本とtest 4本のみを追加し、CLI表面・DB schema・port実装は後続スライスへ分離する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のevaluatorへ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-006, test_path: tests/prototype-artifact.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-007, test_path: tests/prototype-walkthrough.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-008, test_path: tests/prototype-agreement.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-009, test_path: tests/prototype-backprop.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 slice分割（prototype検証 evaluator を第2スライスに）" }
  - { role: se, slot_label: "SE — prototype検証 evaluator 4本 実装" }
  - { role: qa, slot_label: "QA — U-SAP-006〜009 mutation oracle" }
  - { role: tl, slot_label: "TL — L6 signature 整合と後続スライス境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-511-screen-applicability-proto.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/screen-applicability.ts, artifact_type: source_module }
  - { artifact_path: tests/prototype-artifact.test.ts, artifact_type: test_code }
  - { artifact_path: tests/prototype-walkthrough.test.ts, artifact_type: test_code }
  - { artifact_path: tests/prototype-agreement.test.ts, artifact_type: test_code }
  - { artifact_path: tests/prototype-backprop.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
    - docs/plans/PLAN-L7-510-screen-applicability-core.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-07T02:36:00Z"
  review_binding:
    reviewer: "Claude code-reviewer subagent (intra-runtime)"
    reviewed_at: "2026-08-07T02:36:00Z"
    evidence_digest: "sha256:435959b1fa303ce67a18c8cdb0f26d3d7df57dcdd677f526ce7d4a5d3e9abb86"
  entries: []
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T21:06:00Z"
    tests_green_at: "2026-08-06T21:04:48Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 1件: L8表のU-SAP-006 mutation行『task/manifestのcapability・revision不一致』が実装不能表現でありtask.requirement_revisionが実装で未検査、加えてL6 §2のPrototypeManifestV1にcapability fieldが存在しない事実の不記載。Minor 3件: status=complete拒否の根拠docstring欠落、iteration上限ちょうどの正常系境界テスト欠落、L8 U-SAP-007行のrebuild入力mutation表現が実装不能）。是正としてvalidatePrototypeArtifactへtask.requirement_revision整数≥1検査を追加、task側mutation 4件のit.each追加、docstringへcapability bind唯一入口の根拠明記、L8表2行を実装可能な正確表現へ是正、上限境界（16件目成功）テスト追加。2回目approve（Critical/Important/Minor 0件）。reviewerはtask.requirement_revisionとmanifest.revisionが別軸概念であり直接比較を撤回してtask側整定性検査へ差し替えた設計判断を意味論的に正しいと独立判定し、63/63＋slice1回帰43/43＋design-language 11/11のgreen、tsc exit 0、biome clean、plan lint全OK、PLAN id/oracle citationの各file 1件維持、意図外ファイル波及なしを実測した。非ブロッキング申し送り=WALKTHROUGH_ITERATION_LIMIT=16のpolicy化と短縮ID衝突余地は後続transaction port/storeスライスで再検討。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/prototype-artifact.test.ts tests/prototype-walkthrough.test.ts tests/prototype-agreement.test.ts tests/prototype-backprop.test.ts tests/design-language.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T21:04:48Z", evidence_path: tests/prototype-artifact.test.ts, output_digest: "sha256:dd7a832f1f68f32b4ea29bdb57633a869a966aee100178ed4e5e9f93c746f3c4", result: "review是正後worktree: 6 files / 104 tests passed（U-SAP-006〜009の63件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T21:01:46Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T02:36:00Z"
    tests_green_at: "2026-08-07T02:35:25Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "CI self-heal差分（digest inventory v3再生成、coding-rules準拠のinput object化とL6 §1 signature更新、digest-pin衝突によるbiome warning fix撤回、left_arm_carry宣言、共有L8正本への統合とU-VPAIR-008c pin 2→3件更新）の追加レビュー。1回目request changes（(a)exemption pin拡大が未検証、(b)L6 §1のsignature drift、(c)left_arm_carryのno_pushbackが是正前reviewへの時点不整合bind）→ 是正（L6 §1をScreenFreezeInputV1形へ更新、PLAN固有L8 doc 3件を共有正本1件へ統合しexemptionをmodule単位1件へ縮小、reason へfixture manifest/design-catalogのpin根拠を明記）→ 2回目approve（blocking 0件）。reviewerはfixture manifestとdesign-catalogのL6 pair pinを実地確認し、digest pin 2件のsha256一致をPython実測、L6 §1と実装のfield完全一致、旧path参照の残存なし、114/114 greenを独立検証した。本entryへleft_arm_carry review_bindingを再bindする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/vmodel-pair.test.ts tests/screen-freeze.test.ts tests/screen-plan-route.test.ts tests/coding-rules.test.ts tests/digest.test.ts tests/feedback-test-owner-recognition-disposition.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/left-arm-carry-log.test.ts tests/design-language.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T02:35:25Z", evidence_path: tests/vmodel-pair.test.ts, output_digest: "sha256:60384e11e8ddb296fabee9f38bebbbd0cc3cfb7c66155e2dad8b084aaafbbb93", result: "heal是正後worktree: 10 files / 182 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T02:30:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-L7-511: ScreenApplicabilityGate の prototype検証 evaluator 実装

## 目的（Issue #175 第2スライス）

L6設計 `screen-applicability-prototype.md` の pure API 群のうち、prototype 検証系 evaluator 4 本
（U-SAP-006〜009）を slice1 と同じ pure module へ TDD で追加する。

- `validatePrototypeArtifact`: executable/startup 証跡・4 trace・exact 9 state・digest/provenance を検査し
  ready receipt を exactly-one 発行。static-only は `HIL_PROTOTYPE_NOT_EXECUTABLE`。
- `recordWalkthroughIteration`: user actor・observation・delta|no_delta・target・rebuild・
  bounded iteration を検査し walkthrough receipt を発行。同一入力再送は決定的同値。
- `evaluatePrototypeAgreement`: latest artifact・完結 walkthrough・人 review を同 digest へ bind。
- `validateRequirementsBackprop`: 全 delta disposition または no_delta と revision trace を検査し
  backprop receipt を発行。

iteration の数値上限は L6/L5 に未規定のため、module 定数 `WALKTHROUGH_ITERATION_LIMIT` として
export し docstring へ根拠を記す（policy 化は後続スライスへ申し送り）。

## §3 工程表

### Step 1: L6/L8 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（signature確定が実装の前提）。

### Step 2: prototype検証 evaluator 4 API 実装 → green [直列]

根拠: file_conflict（同一module `src/design/screen-applicability.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 `docs/design/helix/L6-function-design/screen-applicability-prototype.md` §1-§2、
L6テスト設計 `docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md` U-SAP-006〜009 行、
Issue #175 behavior contract、slice1 実装（PLAN-L7-510）。実装は slice1 と同一 pure module
（`src/design/screen-applicability.ts`）へ追加し、digest は slice1 と同じ固定キー順 `JSON.stringify` + sha256 で
決定化する。9 状態は `PrototypeStateKindV1` の exact set 照合（欠落・重複とも fail-close）、
walkthrough は prior 列の iteration 連続性 + `WALKTHROUGH_ITERATION_LIMIT` で bounded とする。
transaction port / store / CLI / DB projection は後続スライス（§後続スライス参照）。

## 後続スライス（本PLAN非対象）

- U-SAP-010〜012（freeze / stage closure gate / plan route composition と transaction port・store）
- harness.db projection と CLI 表面
- `WALKTHROUGH_ITERATION_LIMIT` の policy 化再検討
