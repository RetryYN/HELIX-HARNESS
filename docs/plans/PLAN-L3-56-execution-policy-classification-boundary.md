---
plan_id: PLAN-L3-56-execution-policy-classification-boundary
title: "PLAN-L3-56 (add-design): execution policy分類境界を要求正本へ追加する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
route_mode: version-up
entry_signals:
  - "po_directive:Issue #704 requirements-owned execution policy prerequisite"
created: 2026-08-15
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFCLASS-POLICY-BOUNDARY-001
responsibility_owner: workflow-classification-execution-policy-boundary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "旧route-mapがmode、command、preflight boolean、approval booleanを同一entryへ畳み込み、pair-agent／design-bottomup／verificationの処遇がrequirements registryに無い"
contract_postconditions: "requirements v1.3.6とregistry v1.1.0がidentity→policyの一方向境界、typed policy field、legacy構成の非identity dispositionを固定する"
contract_invariants: "pair-agentはexecution form、design-bottomupはSCREEN_DESIGN条件、operation verificationはL7-L12 verification scopeであり、workflow identityへ昇格しない"
contract_failures: "legacy構成のidentity昇格、policyからidentityへの逆流、raw command／approval boolean再導入、unsupported identityの推測実行をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "requirements／registry／strict schema／negative fixtureを同一atomic patchで追加し、未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "後続policy実装の語彙をtyped exact setへ限定し、旧17-entry route-mapを新正本へ写経する分岐を除去する"
removal_trigger: "execution policy v2へversion migrationしv1 boundary consumerが0になった時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-classification-registry.test.ts
agent_slots:
  - { role: tl, slot_label: "TL — requirements authorityとidentity／policy境界" }
  - { role: qa, slot_label: "QA — legacy identity昇格とpolicy逆流のnegative oracle" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-15T01:38:00Z"
    tests_green_at: "2026-08-15T01:34:06Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "PR #705 exact HEAD 994c25cb77a6df6e92c10ee99d7e4395f60dd7d3をClaude Code Opusがread-only独立レビューした。requirements v1.3.6 §4.2.2のexecution policy分類境界、legacy construct 3件のtyped disposition、unsupported fail-close、mutation oracle、digest inventory line 251を実測確認した。Critical 0、Blocker 0、Important 0、Minor 0でAPPROVE。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-classification-registry.test.ts tests/workflow-classification-routing.test.ts tests/workflow-classification-catalog.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T01:34:06Z"
        evidence_path: tests/workflow-classification-registry.test.ts
        output_digest: "sha256:5d4b0cb67ce4c541f45952506d58dc6a045e259e6fa20c5652334268f79a0c91"
        result: "exact HEAD 994c25cb: 4 files / 30 tests passed"
generates:
  - { artifact_path: docs/plans/PLAN-L3-56-execution-policy-classification-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: src/schema/workflow-classification-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-registry.test.ts, artifact_type: test_code }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-routing.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L3-55-workflow-classification-registry.md
  references:
    - docs/governance/route-classification-surface-inventory-2026-08-15.md
    - src/schema/route-map.ts
    - config/drive-route-catalog.json
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# execution policy分類境界

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirements v1.3.6へidentity／policy分離を追加 | [直列] | 意味authorityがrequirementsだけにある |
| 2 | registry v1.1.0とstrict schemaへtyped語彙を追加 | [直列] | policy境界とlegacy dispositionが機械検証可能 |
| 3 | legacy identity昇格と双方向化を反証 | [直列] | targeted negative oracle green |
| 4 | digest／projection metadataをcurrent bytesへ追従 | [直列] | registry／catalog／NFR／freeze dual-green |
| 5 | Claude Code Opus exact-HEAD reviewとfull CI | [review] | blocker 0、terminal green |

command registry、execution-policy binding実体、runtime／CLI／DB consumer、legacy adapter、doctorは後続の
原子的sliceとし、本PLANでは旧route-mapのcommand情報を新正本へ写経しない。
