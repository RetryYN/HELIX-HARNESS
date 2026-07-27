---
plan_id: PLAN-L6-81-drive-route-catalog
title: "PLAN-L6-81 (add-design): 全駆動モデル経路catalog"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Forward／Scrum／Hybrid以外も含む全駆動モデル経路を整備する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 165
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-001
responsibility_owner: drive-route-catalog
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "route catalogが全entry routeの機械可読契約を提示する"
contract_postconditions: "全routeの入口、工程、承認、合流、終了、後続をexact setで検査できる"
contract_invariants: "mode、delivery route、kind、drive、execution mode、工程専門workflowを混同しない"
contract_failures: "route欠落・重複、孤児遷移、model不許可kind、文書欠落をfail-closeする"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "分散した経路定数を単一catalogへ投影し、個別gateの古い経路前提を検出する"
removal_trigger: "workflow schemaが同じ全fieldとexact-set検査を直接所有した時点で統合する"
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — route catalog schemaと純関数lint設計" }
  - { role: qa, slot_label: "QA — 欠落、孤児、kind drift反例" }
  - { role: tl, slot_label: "TL — 全駆動モデルの意味境界レビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-81-drive-route-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/drive-route-catalog.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
  - { artifact_path: config/drive-route-catalog.json, artifact_type: config }
  - { artifact_path: docs/process/modes/design-bottomup.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/specialist-workflows.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T21:03:00Z"
    tests_green_at: "2026-07-27T21:02:50Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #171 の current HEAD f8d1cf53 を clean detached worktree で独立レビューした。本 add-design PLAN が所有する L6 設計 (drive-route-catalog.md)、L8 test-design、catalog 正本 (config/drive-route-catalog.json) を確認した。catalog は 15 route の exact set を route_id / model / route_class / entry_signals / allowed_kinds / start_layers / phases / approval_policy / approval_requirements / autonomous_actions / merge_targets / exit_conditions / next_routes / document で機械可読に固定する。CLAUDE.md の delivery_route 定義 (PRODUCTION_SCRUM_REDUCED_V / V_DESIGN_SCRUM_IMPLEMENTATION) と整合し、production_scrum は allowed_kinds=[poc]、v_design_scrum_impl_hybrid は [design,poc,impl] と route 単位で分離されている。承認境界も route 単位で approval_requirements と autonomous_actions に分離され、Forward は layer_gate、Scrum は po_decision と規律が保たれる。新規 process 文書 docs/process/modes/design-bottomup.md と docs/process/specialist-workflows.md は日本語で記述され、後者は authority: config/drive-route-catalog.json で catalog へ束縛される。design-bottomup.md は src/schema/mode-catalog.ts の MODE_DOC_FILES から必須参照されるため本 PLAN の必須成果物であり、README.md とあわせて generates へ登録した (独立 review による追加)。非 blocker: 本 PR の changed path のうち freeze digest 同期系 5 件と tests/cli-surface.test.ts は他 PLAN lineage 所有であり本 PLAN では所有しない (scope expansion receipt で承認済み、恒久的な所有整理は Issue #166)。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/drive-route-catalog.test.ts tests/plan-entry-routing.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T21:02:50Z"
        evidence_path: config/drive-route-catalog.json
        output_digest: "sha256:904df21474364cc6f3499381d577ddea9f2fb06ac4baec4843e6a24d867c1ced"
        result: "30 passed"
dependencies:
  parent: docs/plans/PLAN-L3-19-github-operations-projection.md
  requires:
    - docs/process/modes/README.md
  references:
    - docs/governance/helix-harness-concept_v3.1.md
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks:
    - docs/plans/PLAN-L7-476-drive-route-catalog-gate.md
---

# PLAN-L6-81: 全駆動モデル経路catalog

## 完了条件

- route exact setと軸分離を正本化する。
- L6設計とL8 test-designが`U-DRCAT-001..004`で対応する。
- L7 gateがcatalog欠落・driftをdoctorでfail-closeする。
