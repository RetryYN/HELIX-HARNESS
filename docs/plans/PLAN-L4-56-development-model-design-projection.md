---
plan_id: PLAN-L4-56-development-model-design-projection
title: "PLAN-L4-56 (add-design): development model 4 fieldをcurrent L4/L6へ投影"
kind: add-design
layer: L4
drive: agent
status: confirmed
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
refactor_step: dual_green
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "L3で3 development style、Discovery／PoC case-driven model、change route、Design HARNESS specialist processが別fieldでfrozen"
contract_postconditions: "current L4/L6/processがdevelopment_style、case_driven_model、change_route、specialist_processesを直交fieldとして設計する"
contract_invariants: "L1-L12だけをcurrent layer authorityとし、style／case／specialist／route／kindを相互変換しない"
contract_failures: "PoCのScrum内包、change routeからのstyle推定、Design HARNESSのstyle／case／layer化、旧route／layerのcurrent出力を拒否する"
tdd_red_required: false
complexity_effect: net_negative
pair_artifact: docs/test-design/helix/L4-pillar-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — 4軸のcomponent／I/F／data flow境界" }
  - { role: qa, slot_label: "QA — old taxonomyと軸混同のnegative oracle" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T18:08:49Z"
    reviewed_at: "2026-07-31T18:08:49Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #320 HEAD 9951728778e24c5f0ea67ab0420c4474a73224edをClaude AI-Bがclean worktreeでread-only検証した。内容面はcorrectness／security／data lossを含むblocker 0、8 path exact scope一致、L3 authorityとの整合、旧taxonomyのcompatibility隔離、V-pair oracle非弱体化、recognition exact countを確認した。draft中だけoutstandingが20→21となるbootstrapを独立再現し、statusをconfirmedへ遷移するとgoal-evidence-audit、CLI outstanding、doctor objective-evidence-auditおよび設計projection関連5 fileがgreenになることを実測した。declared scope内の本PLAN transitionと新candidate HEADのfull CI terminal greenを条件とするapprove_after_fixes。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/320#issuecomment-5146050062"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T19:10:29Z"
    reviewed_at: "2026-07-31T19:11:51Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #320 HEAD 501c74567c4c8d8070004354c35a384a56a51f03をClaude AI-Bがclean detached checkoutでread-only再検証した。前回A-1／B-1〜B-3の解消、original 8 path exact scope、compatibility inputとcurrent outputの隔離、targeted 5 file／100 test greenを確認した。review evidence時系列を本entryで是正し、新candidate HEADのfull CI terminal green（lint／DB rebuild／doctorを含む）を条件とするapprove_after_fixes。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/320#issuecomment-5146569273"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/goal-evidence-audit.test.ts tests/design-language.test.ts tests/development-model-design-projection.test.ts tests/vmodel-pair.test.ts tests/l12-hybrid-recognition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-31T19:10:29Z"
        evidence_path: tests/development-model-design-projection.test.ts
        output_digest: "sha256:5ecbe0f2a44c70391cc5888365175cf35a9c71a055735cea9745872647492fb7"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T22:27:52Z"
    reviewed_at: "2026-07-31T22:47:04Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #325 HEAD d2243e6a001db968ca76fb09d8f8fbd3561caa83をClaude AI-Bがread-only収束reviewした。declared 8 pathと実diffのexact一致、M-1〜M-3／L-1／L-2のCLOSED、Critical／High／Medium／Low 0、blocker_count=0を確認した。review環境ではtestを再実行せず、AI-A側のtargeted 3 file／79 test、PLAN lint、typecheck greenを前提証拠とした。receipt転記後の最終HEADにおけるfull CI terminal green、DB convergence、Claude exact-HEAD reviewを条件とするapprove_after_fixes。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/325#issuecomment-5148096843"
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

current L4/L6設計と右腕process入口を、development style、case-driven model、change route、specialist processへ
再束縛する。kindとruntime modeは別概念として維持する。

## 工程表

### Step 1: exact inventory [直列]

- Issue #245の4 current design/process fileと既存owner oracleだけを変更対象にする。
- L1/L3 requirement、authoring、verification test-design、runtime schemaを変更しない。

### Step 2: axis contract [直列]

- development style exact 3をexactly oneで設計する。
- Discovery／PoCをScrum非内包のcase-driven modelとして0..1で設計する。
- change routeを選択済みstyle内で0..1発動する変更・復旧経路として設計する。
- Design HARNESS等を0..N specialist processとして設計する。

### Step 3: compatibility isolation [直列]

- 旧mode taxonomy、旧layer、旧Scrum名はcompatibility inputに限定する。
- current output、DB projection、completion evidenceへ旧値を出さない契約を置く。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、full CI greenと同一HEADへ束縛する。

## 受入条件

- AC-1: 4 sourceすべてが4 fieldを別fieldまたは別sectionで表す。
- AC-2: ScrumとPoC、styleとchange route、Design HARNESSとV-model layerを混同しない。
- AC-3: L6にtyped projectionとnegative contractがある。
- AC-4: current right-arm processがstyleに関係なくL7〜L12 pairを要求する。
- AC-5: behavior追加やruntime実装を混載せず、PLAN追加に伴う既存recognition分母だけを再束縛する。

## 検証

- `npx vitest run --project fast tests/development-model-design-projection.test.ts`
- `npx vitest run --project fast tests/l12-hybrid-recognition.test.ts`
- `npm run helix -- plan lint`
- `npm run typecheck`
