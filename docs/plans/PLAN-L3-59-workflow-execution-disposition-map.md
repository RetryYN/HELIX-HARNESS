---
plan_id: PLAN-L3-59-workflow-execution-disposition-map
title: "PLAN-L3-59 (add-design): routing dispositionとprocess exitをexact束縛する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
route_mode: version-up
entry_signals:
  - "po_directive:Issue #704 disposition-to-exit mapping gap"
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-DISPOSITION-EXIT-001
responsibility_owner: workflow-execution-disposition-contract
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: configure
ddd_modeling_decision: value_object
contract_preconditions: "consumer disposition exact setはあるが、3個の粗いexit classから7 dispositionへの写像がschemaに無くconsumerが推測できる"
contract_postconditions: "requirements v1.3.9とpolicy registry v1.2.0が7 dispositionそれぞれのexit_classとexit_codeをexact固定する"
contract_invariants: "resolvedだけがsuccess/0であり、ambiguityとapproval_requiredはblocked/1、unknown／decision待ち／unsupportedはunresolved/2を返す"
contract_failures: "disposition欠落、余剰、exit class/code downgrade、registryとprojectionのdigest driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "先行Opus reviewが粗いexit mappingをImportantとして検出した既存Redであり、strict schemaのnegative fixtureを同一atomic patchで追加するため未記録Red timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "粗い3値から推測する余地を除き、既存7 dispositionへ明示mappingを追加するだけでidentity軸は増やさない"
removal_trigger: "consumer receipt schemaのmajor versionでexit mappingを別正本へ移す時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-execution-policy-registry.test.ts
agent_slots:
  - { role: tl, slot_label: "TL — disposition／exit意味authority" }
  - { role: qa, slot_label: "QA — downgrade／欠落／余剰negative oracle" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T09:22:00Z"
    tests_green_at: "2026-08-15T09:22:00Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "requirements v1.3.9が7 dispositionをsuccess／blocked／unresolvedへexact束縛し、policy_unsupportedをsuccessへdowngradeするnegative fixtureがredになることを確認した。旧15-route inventoryやlegacy identityを新authorityへ昇格していない。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-classification-registry.test.ts tests/workflow-execution-policy-registry.test.ts tests/workflow-execution-policy-projection.test.ts && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T09:22:00Z"
        evidence_path: tests/workflow-execution-policy-registry.test.ts
        output_digest: "sha256:eec70898b5408ae42181c9b58704f8a2b1a075cc528072840c8e6049e26f6101"
        result: "3 files / 31 tests passed; tsc --noEmit exit 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T09:22:00Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T09:22:00Z"
    evidence_digest: "sha256:84fbda6c404dc46b6c29fd35294755572d8b600bf3c34ed355f304ad48caef1f"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-execution-policy-registry.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
  references:
    - src/cli/commands/route.ts
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# routing dispositionとprocess exitのexact束縛

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirementsへ7 dispositionのexit class/code表を追加 | [直列] | 意味authorityがrequirementsだけにある |
| 2 | strict registryとgenerated projectionへlossless投影 | [直列] | version／source digest／全mapping一致 |
| 3 | success downgradeとmapping欠落を反証 | [直列] | targeted negative oracle green |
| 4 | Claude Code Opus exact-HEAD独立レビュー | [review] | blocker 0 |

旧`route eval` runtime／CLI／DB consumerの切替は、この契約をconsumeする後続atomic sliceで行う。
