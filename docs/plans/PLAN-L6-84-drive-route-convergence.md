---
plan_id: PLAN-L6-84-drive-route-convergence
title: "PLAN-L6-84 (add-design): 駆動経路Forward収束契約"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 全駆動モデルと経路を整理し、非Scrum系を含めて定義する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 197
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-008
responsibility_owner: drive-route-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "drive-route-catalog.v1の15 routeと2 specialist workflowがcurrent"
contract_postconditions: "全非Forward routeが循環せず有限遷移でForwardへ到達し、軸分離を人間と機械の両正本で再現できる"
contract_invariants: "route、kind、drive、execution mode、specialist workflowを同一enumへ統合しない"
contract_failures: "Forward非終端、到達可能性の有無を問わないroute循環、route内部重複、specialist exact set driftを拒否する"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存catalog validatorへgraph walkと一意性検査を追加し、新service、DB、CLIを増やさない"
removal_trigger: "Universal Workflow admissionが同じroute graph contractを所有し既存consumerが0になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — route graph／軸分離設計" }
  - { role: qa, slot_label: "QA — cycle／dead-end／exact set反例" }
  - { role: tl, slot_label: "TL — 全15 route意味監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-84-drive-route-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/drive-route-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T04:36:00Z"
    tests_green_at: "2026-07-28T04:34:00Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #201 の current HEAD fac79694 を clean detached worktree で独立レビューした。本 add-design PLAN が所有する L6 設計差分は delivery route / drive route / PLAN kind / drive / execution mode / specialist workflow / specialist capability を別軸として定義し、全非 Forward route の forward_full_v への有限収束と forward_full_v の終端性を U-DRCAT-008 として固定する。前 HEAD 08e79f8b では gate が reachability しか検査せず非 spine route 間の循環を検出できなかった (reverse/research へ 2-cycle を注入し findings 0 を実測)。fac79694 で route_cycle_detected が追加され、同じ反例と self-loop の双方を検出し、無改変 catalog では false positive を出さないことを再実測で確認した。設計文の主張と gate の実装が一致した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/drive-route-catalog.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T04:34:00Z"
        evidence_path: docs/design/harness/L6-function-design/drive-route-catalog.md
        output_digest: "sha256:c3d52cf3805b22eafbd4580f32b8460d48db27e98cbaca4ecee4767a4f8e57c7"
        result: "10 passed"
dependencies:
  parent: docs/plans/PLAN-L6-81-drive-route-catalog.md
  requires:
    - config/drive-route-catalog.json
  references:
    - docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md
  blocks:
    - docs/plans/PLAN-L7-479-drive-route-convergence.md
---

# PLAN-L6-84: 駆動経路Forward収束契約

## 完了条件

- 15 routeをdelivery／normalization／change／restoration等の役割で説明できる。
- 全非Forward routeのForward到達可能性、cycle不在、工程専門exact setをL8反例へ降ろす。
- delivery route以外の経路を例外処理や「その他」へ畳み込まない。
