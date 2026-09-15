---
plan_id: PLAN-L5-83-development-model-runtime-routing
title: "PLAN-L5-83 (add-design): development model runtime routing詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 Issue #248 AUTH-SURFACE-RUNTIME-001をL5/L8へ降下する"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    reviewed_at: "2026-08-01T09:31:42Z"
    tests_green_at: "2026-08-01T09:30:00Z"
    verdict: pass
    scope: "PR #327 HEAD 73fb6c37のL5/L8 runtime routing設計、axis分離、legacy dual-green境界、catalog provenanceを独立監査。AI-B blocker 0。Actions run 30693646631は342 files／3202 tests、lint、DBがgreenで、doctorの唯一の失敗は本確定遷移を要求するmergedPlanStatusだった。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/development-model-runtime-routing-design.test.ts tests/design-coverage.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/l12-hybrid-recognition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T09:30:00Z", evidence_path: tests/development-model-runtime-routing-design.test.ts, output_digest: "sha256:c847f665f7db6707f13350b995eac469ad17890cb664cdce8fbe0eead5890734", result: "35/35 pass; PLAN lint 777/777; tsc exit 0" }
github_issue_id: 248
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-RUNTIME-001
responsibility_owner: development-model-runtime-routing
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-56がdevelopment style、case-driven model、change route、specialist processを直交fieldとして確定している"
contract_postconditions: "current authoring、schema、DB projection、recommendation、CLI receiptが同じ4軸を読み、旧drive_models／scrum_typeをcurrent出力へ使わない実装契約が閉じる"
contract_invariants: "compatibility parseの成功でcurrent field欠落を相殺せず、style／case／change route／specialist／runtime modeを相互変換しない"
contract_failures: "旧drive_modelsによる推薦加点、PoCのScrum内包、scrum_type必須化、legacy fieldのDB／CLI出力、暗黙axis推定を拒否する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "重複するdrive-model推定を4軸typed projectionへ集約し、旧fieldをcompatibility parserへ隔離する"
removal_trigger: "Issue #322完了後にcurrent skill metadata 60/60を確認し、legacy drive_models consumer=0になった時点"
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — 4軸value objectとDB／CLI境界" }
  - { role: qa, slot_label: "QA — legacy-only successとaxis混同のmutation" }
  - { role: tl, slot_label: "TL — exact inventoryとdual-green境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-83-development-model-runtime-routing.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/development-model-runtime-routing.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/development-model-runtime-routing-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-56-development-model-design-projection.md
  requires:
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/design/harness/L6-function-design/function-spec.md
  references:
    - docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md
    - docs/test-design/helix/L4-pillar-system-test-design.md
  blocks:
    - issue:248
    - issue:253
    - issue:322
---

# PLAN-L5-83: development model runtime routing詳細設計

## 工程表

### Step 1: exact inventory [直列]

- runtime/schema/DB/CLIの14 sourceと既存owner oracleだけを対象にする。
- `docs/skills` 61 assetの意味backfillはIssue #322、active Bun command撤去はIssue #253へ残す。

### Step 2: L5 contract [直列]

- 4軸value object、current/compatibility parse、DB column、推薦score、PoC state/errorを固定する。
- current field欠落をlegacy fieldで補完しないfail-close条件を固定する。

### Step 3: L8 oracle [直列]

- exact-set、axis polarity、legacy-output、missing-current-field mutationをkillするoracleを固定する。
- current CLI／receiptにlegacy field名が現れないことを検証する。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがexact inventory、状態遷移、反例をread-only検証する。

## 受入条件

- AC-1: 4軸の型、cardinality、current値、legacy境界が実装可能な粒度で一意である。
- AC-2: current skill scaffold、catalog、DB、recommendation、current-location、CLIが同じfieldを使う。
- AC-3: `drive_models`と`scrum_type`はcompatibility parseだけで、current score／projection／receiptへ出ない。
- AC-4: `kind=poc`はScrum非内包のcase-driven S0〜S4で、`scrum_type`欠落をcurrent failureにしない。
- AC-5: Issue #322未完のskillはcompatibility-onlyとしてcurrent recommendationから除外される。

## 検証

- `npx --no-install vitest run --project fast tests/development-model-runtime-routing-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L5-83-development-model-runtime-routing.md`
