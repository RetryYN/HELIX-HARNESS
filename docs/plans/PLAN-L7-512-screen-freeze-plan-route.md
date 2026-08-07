---
plan_id: PLAN-L7-512-screen-freeze-plan-route
title: "PLAN-L7-512 (add-impl): ScreenApplicabilityGate freeze candidate と plan route composition（U-SAP-010 / U-SAP-012）"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#175 ScreenApplicabilityGateを進める（slice3）"
created: 2026-08-07
updated: 2026-08-07
owner: Claude / TL
github_issue_id: 175
engineering_discipline_required: true
behavior_contract_id: U-SAP-012
responsibility_owner: screen-applicability
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §1-§2 の型・signature・DbC を正本とする。pure APIは filesystem/clock/DB/browser を直接読まない。commitPlanScreenRoute は ScreenTransactionPortV1 経由でのみ副作用を委譲し、unit テストは in-memory fake port を使う"
contract_postconditions: "evaluateScreenFreeze が current な二routeのexactly-oneをpure評価し verdict=passed の gate candidate を決定的生成する（commit系fieldはplaceholder、gate write authority 0）。aggregatePlanScreenRoute が capability ID exact set・全decision current/settled・set digest一致を要求し1件でもUIならprototype_requiredを優先する。commitPlanScreenRoute が bundle を検証してから port へ exactly-one 委譲し gate_write_count=0 の receipt を返す"
contract_invariants: "write authority 0（gate write は後続スライスの commitStageClosureAndGate だけ）。PlanScreenRouteCommitBundleV1 に gate payload を混入できない型を維持する。slice1/slice2 の既存 API の挙動を変えない"
contract_failures: "skip/agreement両欠落・両方同時・decision stale・route deferred・partial transaction・capability ID欠落/余剰/重複・scope digest不一致・append_order改変・write_set_digest改変・operation_digest不一致・prototype task exact set逸脱・port receipt identity不一致を typed failure で fail-close し、port fault は透過する"
tdd_red_required: true
red_at: "2026-08-06T23:49:32Z"
green_at: "2026-08-06T23:51:19Z"
mutation_oracle_evidence: "tests/screen-freeze.test.ts / tests/screen-plan-route.test.ts の it.each mutation が L6テスト設計 U-SAP-010 / U-SAP-012 行のmutation（両欠落・両方・stale・deferred・partial transaction・exact set改変・digest改変・委譲回数・gate_write_count）を機械検査する"
complexity_effect: justified_positive
complexity_justification: "Design HARNESS の新規機能ユニット（#175）の第3スライス。pure module への evaluator 2系統とtest 2本のみを追加し、store 実装・DB schema・CLI 表面は後続スライスへ分離する"
removal_trigger: "L6設計 screen-applicability-prototype がsupersedeされ、後継設計のevaluatorへ置換された時"
parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md
pair_artifact: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-010, test_path: tests/screen-freeze.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/screen-applicability-prototype.md, oracle_id: U-SAP-012, test_path: tests/screen-plan-route.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — #175 slice分割（freeze candidate と plan route を第3スライスに）" }
  - { role: se, slot_label: "SE — freeze / plan route evaluator 実装" }
  - { role: qa, slot_label: "QA — U-SAP-010 / U-SAP-012 mutation oracle" }
  - { role: tl, slot_label: "TL — L6 signature 整合と gate write authority 境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-512-screen-freeze-plan-route.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-screen-applicability-prototype-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/design/screen-applicability.ts, artifact_type: source_module }
  - { artifact_path: tests/screen-freeze.test.ts, artifact_type: test_code }
  - { artifact_path: tests/screen-plan-route.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L6-function-design/screen-applicability-prototype.md
    - docs/test-design/helix/L6-screen-applicability-prototype-unit-test-design.md
    - docs/plans/PLAN-L7-511-screen-applicability-proto.md
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
    reviewed_at: "2026-08-07T00:08:30Z"
    tests_green_at: "2026-08-07T00:07:55Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目request changes（Important 1件: commitPlanScreenRouteのplan_envelope_mismatch/plan_decisions_mismatch分岐が先行するoperation_digest再計算チェックに遮蔽され、v8 coverage実測で0 hitのまま『plan aggregateとdecision集合の不一致』mutationが事実上未検証。Minor 4件: buildPlanScreenRouteBundleがL6 exact function set外の補助builderである旨の注記欠落、同builderのguard未到達、expected_subject_revisions空固定の根拠コメント欠落、二重委譲テストのoracle強度）。是正としてdigest payloadに含まれないfieldだけを狙う偽装テスト4件（plan.snapshot_id/plan.snapshot_revision単独差し替え→plan_envelope_mismatch、decisions配列のdecision_digest偽装→plan_decisions_mismatch、空decision集合、builder snapshot不一致）を追加し、根拠コメントとPLAN §3.1注記を追記。2回目approve（Critical/Important/Minor 0件）。reviewerはタンパー対象fieldがoperation_digestのhash payloadに含まれないことをコード読解で確認したうえ、v8 coverageを独立再実行してslice3領域の未到達statement/branch 0件（round 1の4箇所から解消）、40/40＋slice1/2回帰106/106のgreen、tsc exit 0、biome clean、plan lint全OK、純追記（logic変更なし）、citation各file 1件を実測した。非ブロッキング申し送り=二重委譲テストのoracle強度はretry経路追加時に強化、WALKTHROUGH_ITERATION_LIMITのpolicy化と短縮ID衝突余地は後続storeスライスで再検討。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/screen-freeze.test.ts tests/screen-plan-route.test.ts tests/design-language.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-07T00:07:55Z", evidence_path: tests/screen-plan-route.test.ts, output_digest: "sha256:751a77c2baa355dfd2a2ed640265310871f93ce0957ca19f7306cfe7cea7b666", result: "review是正後worktree: 4 files / 81 tests passed（U-SAP-010/012の40件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-07T00:03:56Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
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

# PLAN-L7-512: freeze candidate と plan route composition の実装

## 目的（Issue #175 第3スライス）

L6設計 `screen-applicability-prototype.md` のうち、gate 直前までの pure 評価系 2 系統を
slice1/slice2 と同じ pure module へ TDD で追加する。

- `evaluateScreenFreeze`（U-SAP-010）: current な二 route の exactly-one を pure 評価し、
  verdict=passed の `ScreenGateReceiptV1` candidate を決定的生成する。skip/agreement 両欠落・両方同時・
  stale・deferred・partial transaction は typed failure。commit 系 field は placeholder とし、
  実採番は唯一の gate write authority（後続スライスの `commitStageClosureAndGate`）だけが行う。
- `aggregatePlanScreenRoute` → `commitPlanScreenRoute`（U-SAP-012）: capability ID exact set・
  全 decision current/settled・set digest 一致を検査し、1件でも UI なら plan route を
  prototype_required に優先する。commit は bundle 検証後に `ScreenTransactionPortV1` へ
  exactly-one 委譲し、`gate_write_count: 0` の receipt を返す。gate payload は型で混入不能とする。

## §3 工程表

### Step 1: L6/L8 突き合わせとred oracle作成 [直列]

根拠: downstream_dependency（signature確定が実装の前提）。

### Step 2: freeze / plan route evaluator 実装 → green [直列]

根拠: file_conflict（同一module `src/design/screen-applicability.ts` への集中編集）。

### Step 3: review Step（別runtime判定。Codex usage limit中は intra_runtime_subagent = code-reviewer を規定代替とする） [直列]

根拠: downstream_dependency（前段実装の完成に依存するレビュー）。
request changes → 是正 → approve の各ラウンドを review_evidence へ記録する。

### Step 4: confirm → db rebuild → commit → PR → CI → merge → Issue #175 evidence [直列]

根拠: shared_state（outstanding snapshot / harness.db projection の単一owner収束）。

## §3.1 実装計画

情報源: L6設計 §1-§2（`evaluateScreenFreeze` / `aggregatePlanScreenRoute` / `commitPlanScreenRoute` の
signature と DbC、`PlanScreenDecisionV1` / `ScreenGateReceiptV1` / `PlanScreenRouteCommitBundleV1` /
`PlanScreenRouteReceiptV1` / `ScreenTransactionPortV1` schema、plan route append 順
`decision -> prototype_task -> process_event -> projection`）、L6テスト設計 U-SAP-010 / U-SAP-012 行、
Issue #175 behavior contract、slice1/slice2 実装。digest は既存と同じ固定キー順 `JSON.stringify` + sha256 で
決定化する。unit テストの port は委譲回数と受領 bundle を記録する in-memory fake とし、CAS / DB は
後続スライスの store 実装で扱う。`buildPlanScreenRouteBundle` は L6 §1 の exact function set
（`aggregatePlanScreenRoute` → `commitPlanScreenRoute`）には無い補助 builder であり、primary U には
数えない（bundle の決定的構築と digest 採番だけを担い、commit 側が委譲前に再計算照合する）。

## 後続スライス（本PLAN非対象）

- U-SAP-011（`commitStageClosureAndGate` と `ScreenApplicabilityStoreV1` 実装、唯一の gate write authority）
- harness.db projection と CLI 表面
- `WALKTHROUGH_ITERATION_LIMIT` の policy 化再検討（slice2 申し送り）
