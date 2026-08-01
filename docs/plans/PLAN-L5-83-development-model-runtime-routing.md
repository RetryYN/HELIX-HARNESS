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
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T01:03:41Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327 HEAD 38f33a91c33dc5c04acc70685cabda0c9bd05169をClaude AI-Bがread-only設計reviewした。L8のchange route exact 10がL4/L5正本の9値と不一致であるB-1を返し、L5 enum実数とL8宣言数を突き合わせるoracle追加を要求した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5148749556"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T01:09:59Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327 HEAD da9e51022df0e1ed9541307460c38d639bbaa54fをClaude AI-Bがread-only再reviewした。B-1閉鎖を確認後、L5 parse段のnullable表現とL6 projectWorkflowAxes後のexact projectionが分離されず、style fail-close規則が逆転するB-2を返した。case/changeのnull正本、historical view source、style/case pair実数oracleも同scopeで是正する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5148778243"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T01:16:30Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327 HEAD 838c337890ca3ac87b1cf521515e7e170205564aをClaude AI-Bがread-only再reviewし、content blocker 0、B-1／B-2閉鎖を確認した。同一責務内のN-2 compatibilityInputsとN-3 admitted specialist brandをcurrent PRで是正し、L4 pillarの既存none debt N-1は親Issue #243へsuccessor evidenceとして分離する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5148808087"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T01:21:11Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327の再通知後もAI-B receiptが旧HEAD 838c337890ca3ac87b1cf521515e7e170205564aへ束縛されたためcurrent HEAD判定には使わない。ただしB-4〜B-7のL5↔L6 exact oracle、style候補空集合、L8 metadata、L4 none移行規則は同一4-path責務内の有効findingとして是正する。B-3はHEAD 36ec7df6で先行閉鎖済み。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5148826803"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T01:36:58Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327 exact HEAD 3cb3fccedae079e8d6af354fe9f2ebe905fd560eをClaude AI-Bがread-only収束reviewし、L5↔L6 field/type、空集合non-admit、L8 metadata、L4 none移行、14 source identityをOKとした。新規designのcatalog admission B-8とdraft PLANのoutstanding accounting B-9だけをmain-red blockerとして返したため、必須正本同期を同PRへ追加する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5148886675"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T02:14:16Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #327 exact HEAD c5d2af15a39765beb59be4af96c99bcf00b3b134をAI-Bがread-only reviewし、B-10/B-11閉鎖、content blocker 0、残りはfinal CIのみと判定した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/327#issuecomment-5149103158"
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
