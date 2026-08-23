---
plan_id: PLAN-L7-652-distribution-lite-artifact-projection
title: "PLAN-L7-652 (impl): Lite capabilityをexact artifact setへ投影する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #856を先行再開しconsumer_core_v1を実artifactへ投影する"
created: 2026-08-22
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 856
behavior_contract_id: DISTRIBUTION-LITE-ARTIFACT-PROJECTION-001
responsibility_owner: distribution-lite-artifact-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "DIST-LITE-FR-001とvalidated consumer_core_v1 profileが存在する"
contract_postconditions: "allowlist capabilityがsource tree上の決定的exact artifact setとdigestへ投影される"
contract_invariants: "Full HELIXを唯一のauthorityとし、Lite専用builder、推測fallback、development state混入を許さない"
contract_failures: "catalog、unknown／missing／excluded capability、duplicate／absolute／forbidden／missing source pathをtyped failureで拒否する"
tdd_red_required: true
red_test: "U-DISTART-002..004／003a..003cでfail-close境界の欠落を個別検出する"
red_at: 2026-08-23T10:13:15+09:00
green_at: 2026-08-23T10:13:24+09:00
mutation_oracle_evidence: "isForbiddenArtifactPath判定を一時除去するとU-DISTART-003がartifact_path_forbidden欠落でred（1 failed / 4 passed）。Luna独立reviewでWindows absolute、拡張子付きcredential filename、非選択capabilityとのpath重複が旧実装を通過する反例を実測。指摘後、win32 absolute判定除去でU-DISTART-003a、filename token判定除去でU-DISTART-003b、catalog全entry重複判定除去でU-DISTART-003cがそれぞれ単独1 failedとなることを実測し、各guardを復元した"
complexity_effect: justified_positive
complexity_justification: "汎用builderの前段をpure typed projectionへ限定し、手編集path allowlistと暗黙prefix包含を除去する"
removal_trigger: "distribution profileとartifact catalogが同一Requirement IR generated projectionへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — capability／artifact ownershipとpure projection" }
  - { role: qa, slot_label: "QA — unknown／excluded／unsafe path negative oracle" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-001, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-002, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-003, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-003a, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-003b, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-003c, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-004, test_path: tests/distribution-artifact-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, oracle_id: U-DISTART-006, test_path: tests/distribution-artifact-projection.test.ts }
generates:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-artifact-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: src/setup/distribution-artifact-projection.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-artifact-projection.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:937
    - issue:938
  blocks:
    - issue:856-profile-bound-builder
review_evidence:
  - reviewer: "Codex CLI / gpt-5.6-luna"
    review_kind: intra_runtime_subagent
    reviewer_session_id: "01a02c65-985d-76a3-810b-bbae21be7e10"
    reviewed_at: "2026-08-23T02:18:24Z"
    tests_green_at: "2026-08-23T02:17:26Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: codex:gpt-5.6-luna
    reviewed_head_sha: 3c814fdbca6c2c3f4aeb59c34e9223c113d2d8e3
    scope: "PR #953 exact HEAD 3c814fdbca6c2c3f4aeb59c34e9223c113d2d8e3をread-only Luna/xhighが独立再reviewした。前回blockerだった複数failureに隠れるoracleをU-DISTART-003a..003cへ分離し、Windows absolute、credential filename 3種、非選択／excluded entryを含むcatalog全体duplicateを各単独入力で検出すること、PLAN mutation evidence／verification binding／L8 test designの一致を確認した。blocker 0、verdict approve。"
    green_commands:
      - kind: unit_test
        command: "PATH=/home/tenni/.local/node24/bin:$PATH npx --no-install vitest run tests/distribution-artifact-projection.test.ts tests/digest.test.ts tests/l3-g3-freeze-packet-v2.test.ts -t 'U-DISTART|U-DIGEST-005'"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-23T02:18:56Z"
        evidence_path: tests/distribution-artifact-projection.test.ts
        output_digest: "sha256:9766175454265fdf9bcb788c3da665f7adfa0adc32dce5b7686ea12a5ec14f13"
        result: "Luna reviewer runは3 files／10 tests passed、41 skipped。output_digestは同一HEAD・同一commandのTL post-review replayを束縛"
      - kind: typecheck
        command: "PATH=/home/tenni/.local/node24/bin:$PATH npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T02:18:56Z"
        evidence_path: src/setup/distribution-artifact-projection.ts
        output_digest: "sha256:8aa23401265a522f6a9d04e6bdaaa1855432965d44e5721ea70b1c0e037d4011"
        result: "Luna reviewer runとTL post-review replayの双方でtsc --noEmit exit 0"
      - kind: lint
        command: "PATH=/home/tenni/.local/node24/bin:$PATH npx --no-install biome check tests/distribution-artifact-projection.test.ts docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md src/setup/distribution-artifact-projection.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-23T02:18:56Z"
        evidence_path: tests/distribution-artifact-projection.test.ts
        output_digest: "sha256:1a4c877dbc0da896a107f71d157de64d2f316270477e80b6b14d9087259d11ed"
        result: "Luna reviewer runとTL post-review replayの双方でBiome exit 0、対象TS 2 files checked"
---

# PLAN-L7-652: Lite capability artifact projection実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L6/L8 contractを固定 | pure input/outputとfail-close境界が反証可能になる |
| 2 | projection coreをTDD実装 | U-DISTART-001..004がgreenになる |
| 3 | current profile artifact catalogへ接続 | 11 allowlist／10 exclusionのexact setがsource treeへ解決する |
| 4 | PLAN lint、typecheck、targeted test、独立review | blocker 0、candidate exact HEADが一致する |

## 非対象

archive builder、consumer canary、Windows smoke、tag、publish、promotion、DevOS cutoverは後続原子PRへ分離する。
