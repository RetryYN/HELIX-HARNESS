---
plan_id: PLAN-REVERSE-562-drive-route-system-typed-authority
title: "PLAN-REVERSE-562: drive route guidanceをrequirements typed authorityへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T15:51:33Z"
    tests_green_at: "2026-08-16T15:51:16Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #206のdrive route guidanceをrequirements-owned typed axis、generated catalog、compatibility inventory境界へ照合した。旧15-route表やmode／modelをcurrentへ再出力せず、signalからrouteを無条件推測しないことを確認した。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/process-drive-route-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/process-drive-route-authority.test.ts
        output_digest: "sha256:6a9df5ea07246856e866c0b71807a1715c639287b676b8914b7cbcee0a29f79c"
        result: "drive route authority oracle 5 tests green"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md
        output_digest: "sha256:eb5b13396fa1d7e541c91744ac647c9bfac43be2f86442b7a4b93a2fcb32352e"
        result: "PLAN lint green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206のdrive-route-systemが旧catalogを意味正本として異軸分類を案内している"
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: DRIVE-ROUTE-TYPED-AUTHORITY-001
responsibility_owner: drive-route-typed-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "drive-route-system.mdがconfig/drive-route-catalog.jsonをauthorityとし、旧15-route exact setをcurrent分類へ再出力している"
contract_postconditions: "drive-route-system.mdがrequirements registryを意味正本、generated catalogをprojection、旧catalogをcompatibility inventoryとして案内する"
contract_invariants: "target_axis／target_id、PLAN kind、specialist drive、execution mode、specialist workflow／capabilityを別軸で保持し、曖昧なlegacy入力を推測しない"
contract_failures: "旧catalog共同正本、旧route改名表のcurrent化、mode／modelの再出力、signalからの無条件推測を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "現行process guidanceの旧authority記述を同一sliceでtyped authorityへ是正し、U-DRTA-001〜005で再導入をfail-closeする"
mutation_oracle_evidence: "U-DRTA-001〜005がauthority、軸分離、導出線、legacy隔離、L1〜L12証跡境界を独立assertする"
complexity_effect: net_negative
complexity_justification: "旧15-route説明と複数軸の共通enum説明を除去し、requirementsからの一方向projectionへ整理する"
removal_trigger: "process guidanceがregistryから完全生成され、手書きprojection consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "§4、§4.1、§4.2、§9.2、§10のaxis、state machine、compatibility境界をprocess guidanceへ投影する。"
  - layer: L10-system-test
    decision: preserve
    evidence_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    reason: "異軸同一enum拒否とlegacy current再出力拒否をU-DRTA oracleへ具体化する。"
agent_slots:
  - { role: se, slot_label: "SE — drive route guidanceのtyped authority再投影" }
  - { role: qa, slot_label: "QA — 旧catalog共同正本／axis混同mutation" }
  - { role: tl, slot_label: "TL — requirements registryとの意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/drive-route-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/process-drive-route-authority.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md
  requires:
    - docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
    - docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - config/drive-route-catalog.json
---

# drive route guidanceのtyped authority再接着

## R0 現状採取

旧`drive-route-system.md`は`config/drive-route-catalog.json`をauthorityとし、15 route exact set、
旧mode、異なる分類軸を一つのroute体系として案内していた。requirements v1.3.12とregistry
v1.1.4が既にaxisを分離しているため、process guidanceだけが旧定義をcurrentとして再出力していた。

## R1 skip判定

既知のauthority driftを正規化するReverse sliceなのでR1をskipする。新しい分類やrouteを推測せず、
requirements registryにない値はunsupported／ambiguousとして扱う。

## R2 As-Is照合

意味authorityはrequirements、typed mirrorはversioned registry、current catalogはgenerated
projection、旧catalogはcompatibility inventoryである。current identityは`target_axis`／
`target_id` tupleであり、PLAN kind、specialist drive、execution modeを代用しない。

## R3 意図照合

Issue #206とPO指示は旧15 routeの改名ではなく、新要求・新定義から旧定義を一新することである。
したがって本sliceは表現だけを直すのではなく、signal→typed identity→policy／state→evidenceの
導出線、legacy fail-close、L1〜L12の証跡境界を同じ文書内で固定する。

## R4 Forward再入

本sliceはdrive route guidanceとoracleだけを所有する。runtime／CLI／DB／doctorのconsumer、
README／labels／templatesは後続の#206 atomic sliceへ残す。U-DRTA-001〜005、authority gate、
Claude exact-HEAD review、main read-afterがgreenになるまでcompletion claimを許可しない。
