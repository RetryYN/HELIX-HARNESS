---
plan_id: PLAN-L4-56-development-model-design-projection
title: "PLAN-L4-56 (add-design): development model 3軸をcurrent L4/L6へ投影"
kind: add-design
layer: L4
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 Issue #245 current L4/L6 designをstyle／case／specialist別軸へ再束縛する"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 245
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-DESIGN-001
responsibility_owner: development-model-design-projection
change_slice: atomic
refactor_step: consolidate
legacy_retirement_state: compatibility_only
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "L3で3 development style、Discovery／PoC case-driven model、Design HARNESS specialist processが別軸でfrozen"
contract_postconditions: "current L4/L6/processがdevelopment_style、case_driven_model、specialist_processesを直交fieldとして設計する"
contract_invariants: "L1-L12だけをcurrent layer authorityとし、style／case／specialist／route／kindを相互変換しない"
contract_failures: "PoCのScrum内包、Design HARNESSのstyle／case／layer化、旧route／layerのcurrent出力を拒否する"
tdd_red_required: false
complexity_effect: net_negative
pair_artifact: docs/test-design/helix/L4-pillar-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — 4軸のcomponent／I/F／data flow境界" }
  - { role: qa, slot_label: "QA — old taxonomyと軸混同のnegative oracle" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-56-development-model-design-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L4-basic-design/function.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/function-spec.md, artifact_type: design_doc }
  - { artifact_path: docs/process/forward/L08-L14-verification-phase.md, artifact_type: markdown_doc }
  - { artifact_path: tests/development-model-design-projection.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/vmodel-pair.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md
  requires:
    - docs/plans/PLAN-L3-44-authoring-style-case-authority.md
    - docs/plans/PLAN-L3-48-requirement-style-case-authority.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/multimodal-design-harness-authority.md
  blocks:
    - issue:246
---

# PLAN-L4-56: development model設計projection

## 目的

current L4/L6設計と右腕process入口を、development style、case-driven model、specialist processへ
再束縛する。change route、kind、runtime modeは別概念として維持する。

## 工程表

### Step 1: exact inventory [直列]

- Issue #245の4 current design/process fileと既存owner oracleだけを変更対象にする。
- L1/L3 requirement、authoring、verification test-design、runtime schemaを変更しない。

### Step 2: axis contract [直列]

- development style exact 3をexactly oneで設計する。
- Discovery／PoCをScrum非内包のcase-driven modelとして0..1で設計する。
- Design HARNESS等を0..N specialist processとして設計する。

### Step 3: compatibility isolation [直列]

- 旧mode taxonomy、旧layer、旧Scrum名はcompatibility inputに限定する。
- current output、DB projection、completion evidenceへ旧値を出さない契約を置く。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、full CI greenと同一HEADへ束縛する。

## 受入条件

- AC-1: 4 sourceすべてが3軸を別fieldまたは別sectionで表す。
- AC-2: ScrumとPoC、styleとchange route、Design HARNESSとV-model layerを混同しない。
- AC-3: L6にtyped projectionとnegative contractがある。
- AC-4: current right-arm processがstyleに関係なくL7〜L12 pairを要求する。
- AC-5: behavior追加やruntime実装を混載せず、PLAN追加に伴う既存recognition分母だけを再束縛する。

## 検証

- `npx vitest run --project fast tests/development-model-design-projection.test.ts`
- `npx vitest run --project fast tests/l12-hybrid-recognition.test.ts`
- `npm run helix -- plan lint`
- `npm run typecheck`
