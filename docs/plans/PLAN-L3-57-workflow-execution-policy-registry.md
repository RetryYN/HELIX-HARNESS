---
plan_id: PLAN-L3-57-workflow-execution-policy-registry
title: "PLAN-L3-57 (add-design): workflow execution policy registryを要求正本化する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
route_mode: version-up
entry_signals:
  - "po_directive:Issue #704 command registry and policy binding slice"
created: 2026-08-15
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-POLICY-REGISTRY-001
responsibility_owner: workflow-execution-policy-registry
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "requirements v1.3.6がpolicy語彙とlegacy dispositionを固定したが、登録済みcommandとtyped bindingの実体が無い"
contract_postconditions: "requirements v1.3.7とpolicy registry v1.0.0が実在command IDと初期partial fail-close bindingをsource digest付きで固定する"
contract_invariants: "bindingはtyped identity、fixed conditions、command IDだけを持ち、raw shell、legacy identity、未登録command、高影響approval downgradeを許さない"
contract_failures: "missing policy、unknown command、duplicate binding、raw command injection、shell operator、high-impact approval noneをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "requirements／registry／strict schema／negative fixtureを同一atomic patchで追加し、未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "旧route-mapの17 entryを移植せず、実在する4 commandと5 bindingだけを登録し未対応identityを明示fail-closeする"
removal_trigger: "policy registry v2へmigrationしv1 consumerが0になった時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-execution-policy-registry.test.ts
agent_slots:
  - { role: tl, slot_label: "TL — command registryとtyped policy authority" }
  - { role: qa, slot_label: "QA — missing／duplicate／injection／approval downgrade反例" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-15T01:37:00Z"
    tests_green_at: "2026-08-15T01:34:25Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-opus-5
    scope: "PR #706 exact implementation HEAD 9d5e7ecb2c63b04fc4eb64055b200fa110ffba4dをClaude Code Opusがread-only独立レビューした。requirements-owned command registry、typed partial binding、missing／duplicate／injection／approval downgradeのfail-close、digest propagationを実測確認した。PLAN-L3-56 confirmedを取り込んだc10597a0でrequires_not_readyも解消済み。Critical 0、Blocker 0、Important 0、Minor 0でAPPROVE。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-execution-policy-registry.test.ts tests/workflow-classification-registry.test.ts tests/workflow-classification-routing.test.ts tests/workflow-classification-catalog.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T01:34:25Z"
        evidence_path: tests/workflow-execution-policy-registry.test.ts
        output_digest: "sha256:710ce3b0c35560bc37b4ac651d8775db6814f8e4fbcfe7d0f82cf5fe163e4742"
        result: "exact implementation HEAD 9d5e7ecb: 5 files / 39 tests passed"
generates:
  - { artifact_path: docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-execution-policy-registry.test.ts, artifact_type: test_code }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-routing.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L3-56-execution-policy-classification-boundary.md
  references:
    - src/schema/route-map.ts
    - src/workflow/routing-contracts.ts
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# workflow execution policy registryの正本化

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirements v1.3.7へ初期policy coverageを追加 | [直列] | unsupportedを近似実行しない |
| 2 | command registryとtyped binding schemaを追加 | [直列] | 4 command／5 bindingがstrict parse |
| 3 | resolverとnegative oracleを追加 | [直列] | missing／duplicate／injection／approval downgrade red |
| 4 | authority digestとclassification projection metadataを追従 | [直列] | current bytes一致 |
| 5 | Claude Code Opus exact-HEAD reviewとfull CI | [review] | blocker 0、terminal green |

generated policy projection、runtime／CLI consumer、legacy adapter、doctorは後続sliceとし、本PLANでは
旧route-mapをcurrent outputへ再出力しない。
