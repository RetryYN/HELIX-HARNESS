---
plan_id: PLAN-L3-61-github-workflow-guidance-authority
title: "PLAN-L3-61 (add-design): GitHub運用要件をtyped workflow authorityへ収束する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206 active GitHub requirementsに残るdrive_model／mixed enum／Full V fallbackを是正する"
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: GH-WORKFLOW-GUIDANCE-AUTH-001
responsibility_owner: github-workflow-guidance-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "GitHub自律運用L3要件がdrive_model、異軸分類の単一enum、分類失敗時Full V推測をcurrent guidanceとして残す"
contract_postconditions: "Issue admissionがrequirements registry exact tuple、execution mode、specialist driveを別fieldで保持し、unknown／ambiguous／decision待ちを推測せずfail-closeする"
contract_invariants: "requirements registryが唯一の意味authorityであり、legacy identityをcurrent Issue／PLAN／PR／DBへ再出力しない"
contract_failures: "部分tuple、未知axis／ID、stale registry、legacy current出力、複数候補、Full V fallbackを別reasonで拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #206 current-main inventoryがactive L3 requirementsの旧定義を既存Redとして実証しており、要件とL10 acceptanceを同一atomic pairで是正する"
mutation_oracle_evidence: "GH-T-001がdrive_model current field、部分tuple、未知axis／ID、stale registry、legacy current出力、複数候補、Full V fallbackの再導入をnegative fixtureとして要求し、後続実装gateが各欠陥をkillする"
complexity_effect: net_negative
complexity_justification: "異軸constructの重複enumとfallback推測を除去し、registry-owned exact tupleへ一本化する"
removal_trigger: "workflow identity schema major version更新時にversioned successorへ移管する"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
agent_slots:
  - { role: tl, slot_label: "TL — requirements axis／fallback authority" }
  - { role: qa, slot_label: "QA — legacy再出力／unknown／ambiguity反例" }
  - { role: se, slot_label: "SE — 後続process／CLI projection境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T15:33:06Z"
    tests_green_at: "2026-08-16T15:33:00Z"
    verdict: approve
    worker_model: codex:gpt-5.6-luna
    reviewer_model: codex-intra-runtime
    scope: "Issue #206のL3 GitHub運用要件authority移行をcurrent requirements／registry／L10 acceptanceへ照合した。drive_model、異軸enum、Full V fallbackをcurrent identityへ再出力せず、unknown／ambiguous／decision待ちを推測しない契約になっていること、後続process／CLI／runtime／DBを本sliceへ混在させていないことを確認した。Claude Code exact-HEAD独立reviewはPR terminal gateとして別途必須であり、completion claimはfalseのまま維持する。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/l3-g3-freeze-packet-v2.test.ts
        output_digest: "sha256:fa326602892fe7c9c4fd06f2b48af4dadd7f78d9a490bcd032bcd749c4ee659a"
        result: "L3 G3 freeze packet tests green"
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/l12-hybrid-recognition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/l12-hybrid-recognition.test.ts
        output_digest: "sha256:8eab7bfdd5911957f892eee9ae4a82e74f4d4c5a70a17a969cf93f7a8b7893ba"
        result: "L12 recognition tests green"
      - kind: typecheck
        command: "npm exec --offline -- tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
        output_digest: "sha256:40460da4726ba9eb1d6e28941c0ac66f5097334940160100862f7292cd970eab"
        result: "PLAN lint全gate green"
generates:
  - { artifact_path: docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/github-autonomous-operations-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-recognition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L3-55-workflow-classification-registry.md
    - docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  blocks: []
---

# GitHub workflow guidance authority収束

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-001のIssue fieldをtyped tupleへ移行 | [直列] | drive_model current field 0 |
| 2 | GH-FR-002／GH-NFR-001の異軸enumとfallbackを除去 | [直列] | unknown／ambiguousを推測しない |
| 3 | L10 acceptanceへnegative fixtureを接続 | [並列] | GH-T-001が旧定義再導入を拒否 |
| 4 | authority／design-language／pair／全回帰 | [直列] | current requirements pair green |
| 5 | Claude Code exact-HEAD独立review | [review] | blocker 0、terminal CI green |

本sliceはL3 requirementsと対応L10 acceptanceだけを所有する。process、README、CLI、setup、labels、
runtime／DB projectionの移行はIssue #206の後続原子的sliceへ分離し、本PRで全surface完了をclaimしない。
