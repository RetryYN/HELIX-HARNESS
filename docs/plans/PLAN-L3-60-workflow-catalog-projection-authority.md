---
plan_id: PLAN-L3-60-workflow-catalog-projection-authority
title: "PLAN-L3-60 (add-design): workflow catalog projection authorityをcurrentとcompatibilityへ分離する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: VERSION_UP
entry_signals:
  - "po_directive:Issue #744 requirements catalog projection authority contradiction"
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 744
behavior_contract_id: WFCLASS-PROJECTION-AUTH-001
responsibility_owner: workflow-classification-projection-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: configure
ddd_modeling_decision: value_object
contract_preconditions: "requirements v1.3.10がconfig/drive-route-catalog.jsonをcurrent generated projectionと旧15-route compatibility inventoryの両方に読める矛盾を持つ"
contract_postconditions: "requirements v1.3.12とclassification registry v1.1.4がconfig/workflow-classification-catalog.v1.jsonだけをcurrent meaning projection、config/drive-route-catalog.jsonをcompatibility inventoryと定義し、後続PLAN-L7-580がdoctorのprimary gateをtyped projectionへ切り替えられるauthority境界を固定する"
contract_invariants: "requirementsだけが意味authorityを持ち、current projectionとcompatibility inventoryは別path／別roleであり、legacy成功でcurrent failureを相殺しない"
contract_failures: "旧catalogのcurrent projection再昇格、current path欠落、requirements／registry／policy／projectionのversionまたはdigest driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "独立reviewがrequirements内の同一path二重roleをHighとして検出した既存Redを起点とし、旧文言再出現を拒否する回帰oracleを同一atomic patchへ追加するため未記録Red timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "新axisやruntime分岐を増やさず、既存2 catalog pathのroleを一意化してauthority ambiguityを除去する"
removal_trigger: "legacy drive-route catalog consumerが0になりcompatibility inventoryを削除するmigrationがconfirmedになった時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-classification-registry.test.ts
agent_slots:
  - { role: tl, slot_label: "TL — requirementsとprojection roleのversion-up" }
  - { role: qa, slot_label: "QA — authority逆転とlegacy offsetのnegative oracle" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T07:02:35Z"
    tests_green_at: "2026-08-16T07:02:35Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #744のrequirements authority version-up deltaをread-only独立reviewした。初回High 1件／Medium 1件を検出し、current fixtureの1.1.4追従とPLAN-L7-569〜579のartifact scope列挙を是正後に再確認した。requirementsだけが意味authorityを持ち、current generated projectionとfrozen compatibility inventoryが別path／別roleであること、registry／policy／projectionのversion・digest連鎖、全typed PLAN pin移行を確認し、最終blocker／high／medium 0でapproveした。Claude Code exact-HEAD reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run --project fast tests/workflow-classification-registry.test.ts tests/workflow-classification-catalog.test.ts tests/workflow-execution-policy-registry.test.ts tests/workflow-execution-policy-projection.test.ts tests/github-execution-episode-state.test.ts tests/github-execution-episode-location.test.ts tests/github-execution-episode-right-arm.test.ts tests/digest.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T07:02:35Z"
        evidence_path: tests/workflow-classification-registry.test.ts
        output_digest: "sha256:0743d4331c7bee6daf442734d5b487f5f9f2ac44030c61defd2761ff7465f4fd"
        result: "8 files / 74 tests passed"
      - kind: unit_test
        command: "npm exec --offline -- vitest run --project slow tests/slow/projection-writer.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T07:02:35Z"
        evidence_path: tests/slow/projection-writer.test.ts
        output_digest: "sha256:f7fb7c0e0209a22705e0f5df05ab1428520a42c06e697d903a3a80a166e7fe3d"
        result: "1 file / 37 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T07:02:35Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T07:02:35Z"
    evidence_digest: "sha256:fdfa7c3b048be710cb87e009da1dba79d3f456831a10b6ef724d326a3bedbc42"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-571-typed-plan-authority-failure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-576-github-execution-episode-state.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-581-github-workflow-identity-migration-bundle-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/route-classification-surface-inventory-2026-08-15.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: config }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-classification-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-execution-episode-state.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-execution-episode-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-execution-episode-right-arm.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L7-579-plan-entry-legacy-workflow-identity-isolation.md
  references:
    - config/drive-route-catalog.json
    - src/lint/drive-route-catalog.ts
  blocks:
    - docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md
---

# workflow catalog projection authorityの分離

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirementsの二重role記述を分離 | [直列] | current／compatibility pathが一意 |
| 2 | classification／policy registryをversion-up | [直列] | requirements version／digest一致 |
| 3 | generated catalog／policyを再生成 | [直列] | registry source digest一致 |
| 4 | authority pinとnegative oracleを追従 | [並列] | legacy再昇格mutationがred |
| 5 | Claude Code exact-HEAD独立レビューとfull CI | [review] | blocker 0、terminal green |

catalog doctor実装、外向け文書、runtime／DB追加移行は後続sliceへ分離する。旧15-route catalogの
互換構造を本sliceで削除せず、current meaning authorityとしての再利用だけを禁止する。
このHEADでは`src/lint/drive-route-catalog.ts`の旧15-route構造検査をcompatibility inventoryの
整合性検査として残すが、そのgreenはcurrent typed projectionの成立証拠ではない。doctorのprimary
admissionを`config/workflow-classification-catalog.v1.json`へ切り替え、legacy greenでcurrent failureを
相殺できないAND gateを機械強制する責務は、依存順どおり後続PLAN-L7-580／Issue #742が担う。
