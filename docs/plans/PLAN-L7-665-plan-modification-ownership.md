---
plan_id: PLAN-L7-665-plan-modification-ownership
title: "PLAN-L7-665 (impl): 既存artifact修正sliceのPLAN所有権を分離する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #855 existing artifact modification ownership cycle"
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 855
behavior_contract_id: PLAN-MODIFICATION-OWNERSHIP-001
responsibility_owner: plan-governance-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-24T15:17:18Z"
    tests_green_at: "2026-08-24T15:12:56Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "dc96b0e4-d8a6-4ba0-b7e9-a8e3c0d6ce8a"
    reviewed_head_sha: f80984f5da8554a92d18bd09835b59d13ec82ab0
    scope: "PR #989 HEAD f80984f5da8554a92d18bd09835b59d13ec82ab0をClaude Codeがread-only独立検収し、published base不在pathのmodifies拒否、violation配線、seeded mutation 3件のkill、復元後typecheckを実測して内容blocker 0と判定した。canonical review: https://github.com/RetryYN/HELIX-HARNESS/pull/989#issuecomment-5397322229"
    green_commands:
      - kind: smoke
        command: "gh run view 32740714002 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-24T15:12:56Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:fcf1972fa850a1ad407ad0f6918dd21552b5f153b7447d801f1a5454fe7fbf20"
        result: "completed / success / HEAD f80984f5da8554a92d18bd09835b59d13ec82ab0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-24T15:17:18Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-24T15:17:18Z"
    evidence_digest: "sha256:17865ade5330a35eef53135bcd31aeb5b9b77ddcbf3b59958d707f43e00b6aef"
  entries: []
contract_preconditions: "generatesが新規生成所有、既存差分は別のownership fieldを必要とする"
contract_postconditions: "modifiesを用いる既存artifact修正PLANがdraftのreview前にmerged-plan-statusで停止せず、V-pair traceを保持する"
contract_invariants: "generatesの完了所有とmodifiesの差分所有を混同しない。review evidenceやconfirmを自動生成しない"
contract_failures: "新設testのgenerates欠落、modifies testのoracle未接続、generates/modifiesの意味混同"
tdd_red_required: true
red_test: "U-PLANMOD-001..004のmodifies ownership oracleを除去すると既存test修正sliceのtraceがredになる"
red_at: "2026-08-24T11:28:12Z"
green_at: "2026-08-24T11:28:26Z"
mutation_oracle_evidence: "2026-08-24T11:28:12ZにdeclaredTestPathsからmodifies test_codeを一時除去し、tests/plan-modification-ownership.test.tsのU-PLANMOD-001がfailed（1 failed, 2 passed, exit 1）となるkillを実測した。2026-08-24T14:44:50ZにはselectInvalidModificationsを空集合へ変異し、U-PLANMOD-004がfailed（1 failed, 3 skipped, exit 1）となるkillを追加実測した。変異は破棄し、復元後に関連テストをgreenへ再確認した。"
complexity_effect: net_negative
complexity_justification: "既存artifact修正のための重複generates宣言とconfirm前review循環を除去する"
removal_trigger: "全plan artifact ownershipがappend-only immutable manifestへ移行し、modifiesが不要になった時"
parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md
pair_artifact: docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-001, test_path: tests/plan-modification-ownership.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-002, test_path: tests/plan-modification-ownership.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-003, test_path: tests/plan-modification-ownership.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-modification-ownership.md, oracle_id: U-PLANMOD-004, test_path: tests/plan-modification-ownership.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-665-plan-modification-ownership.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/plan-modification-ownership.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/plan-modification-ownership.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .claude/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-descent.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: src/lint/merged-plan-status.ts, artifact_type: source_module }
  - { artifact_path: src/graph/loader.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph-types.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/frontmatter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/merged-plan-status.test.ts, artifact_type: test_code }
  - { artifact_path: tests/relation-graph.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - issue:855
agent_slots:
  - { role: se, slot_label: "SE — modifies ownership schema and projection" }
  - { role: qa, slot_label: "QA — draft cycle and V-pair regression oracle" }
  - { role: tl, slot_label: "TL — generates/modifies authority boundary" }
---

# 既存artifact修正sliceのPLAN所有権

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | `generates`と`modifies`の意味をschema・規則へ分離 | 新規生成と既存差分の入力が別typed fieldになる |
| 2 | descent／V-pair／relation graphへ接続 | 既存test修正がtraceを失わず、既存sourceへ`modifies` edgeが出る |
| 3 | regression oracle | #855の両状態とgeneratesの従来fail-closeを再現できる |
| 4 | targeted／typecheck／doctor／CI | current HEADで全gateがgreen、Claude検収へ進める |

本sliceは既存artifactの所有権表現を追加する。PR、review、status confirm、GitHub通知の権限を変更しない。
PR本文は `helix-github-workflow-identity-contract.v1` を正規のIssue／PLAN由来identityとして束縛し、
実装内容とworkflow admissionの対象を一致させる。

catalog登録で変化した `docs/design/design-catalog.yaml` は、実体から再計算した
`sha256:e223424954df123a32a93d50e2dd1e7ffb0958a17f4ee921c6c723b885dd3b9c` を
L3 reviewed-digestへ再束縛し、旧digestのまま通過させない。
この再束縛ファイルはPRの `Expected changed paths` にも明示し、実差分とscope authorityを一致させる。
