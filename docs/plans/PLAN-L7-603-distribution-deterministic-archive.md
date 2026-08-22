---
plan_id: PLAN-L7-603-distribution-deterministic-archive
title: "PLAN-L7-603 (impl): distribution archiveを再現可能なartifactへ固定する"
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
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #659 deterministic distribution package artifact"
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 659
behavior_contract_id: DISTRIBUTION-PACKAGE-RELEASE-001
responsibility_owner: distribution-package-release
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "既存のclean distribution package surfaceと、署名・tag・publishをaction-binding approvalへ残す配布境界が存在する"
contract_postconditions: "同一source HEAD・tagのlocal packageがarchive metadataを固定した同一artifact digestを返し、manifestがそのdigestへ束縛される"
contract_invariants: "配布先remote、tag、publish、cutover、credential、working treeを変更せず、consumer packageへdogfood stateを混入させない"
contract_failures: "同一入力でtarball/checksum/manifest digestが不一致、artifact digest欠落、未承認remote action、署名・publish・cutoverの実行を成功へ丸めない"
tdd_red_required: false
tdd_red_waiver_reason: "既存package commandの再現性欠陥に対するdeterministic archive flagsと二重生成oracleを同一atomic sliceで追加するため"
complexity_effect: justified_positive
complexity_justification: "archive entry order、timestamp、owner/group、PAX metadataを固定し、artifact contentとmanifest digestを別々の証跡として検証するため"
removal_trigger: "distribution package manifestがcanonical artifact registryへ移行し、このPLANのlocal package consumerが0になった時"
agent_slots:
  - { role: se, slot_label: "SE — deterministic archive metadata／manifest digest" }
  - { role: qa, slot_label: "QA — repeated package bytes／checksum／remote mutation oracle" }
  - { role: tl, slot_label: "TL — distribution approval boundary／current identity" }
parent_design: docs/design/helix/L6-function-design/distribution-deterministic-archive.md
pair_artifact: docs/test-design/helix/L8-distribution-deterministic-archive-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-deterministic-archive.md, oracle_id: U-DISTDET-001, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-603-distribution-deterministic-archive.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-deterministic-archive.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-deterministic-archive-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-357-distribution-sync-pack-commands.md
    - docs/governance/helix-harness-requirements_v1.3.md
  references:
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-19T03:37:57Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-19T03:37:57Z"
    evidence_digest: "sha256:00b282228128bcb03d63ab62467087ed0d13689dd60033b83f08c7db5d5f7ec5"
  entries: []
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-19T03:37:57Z"
    tests_green_at: "2026-08-19T03:37:48Z"
    verdict: approve
    worker_model: gpt-5.6-codex
    reviewer_model: codex-intra-runtime
    scope: "現HEADの配布archive変更をread-only確認し、GNU tar metadata固定、manifest artifactDigest束縛、remote／tag／publish非変更、二重生成oracle、L6/L8/PLANの責務対応を確認した。targeted deterministic archive test、left-arm carry、PLAN governance lintを実測した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/cli-surface.test.ts -t U-DISTDET-001"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:2699dd0b80af45b91e34ca9199b0a2e98c4490e68e735eacc65cd521876da53d"
      - kind: typecheck
        command: "npm run typecheck --if-present"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:8aa23401265a522f6a9d04e6bdaaa1855432965d44e5721ea70b1c0e037d4011"
      - kind: lint
        command: "npx --no-install biome check src/cli.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: biome.json
        output_digest: "sha256:824566b60e6976c53cf6faf10655a845c63923ce0399120ccf2c1d809b3fa5cd"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-603-distribution-deterministic-archive.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-L7-603-distribution-deterministic-archive.md
        output_digest: "sha256:f434645ab8157472f0a7ea6371443b70174c4b74830e62267dfd637865f56b48"
---

# PLAN-L7-603: 配布アーカイブの再現性固定

## 目的

同一source HEAD・同一tagから配布packageを複数回生成したときに、tarballのentry順とfilesystem由来metadataの揺れでdigestが変わる問題を是正する。
local packageの再現性を上げ、manifest、checksum、artifact本体を同じdigestへ束縛する。

## スコープ

- GNU tarのentry順、mtime、owner、group、numeric owner、PAX atime／ctimeを固定する。
- package manifestへ生成済みtarballの`sha256` artifact digestを記録する。
- 同じ入力を2回packageし、tarball、checksum、manifest digestが一致する回帰oracleを追加する。

## 非対象

署名、tag作成、publish、配布repoへのpush、canary／preview／stable promotion、PLAN-M-02 cutoverは実行しない。
これらは既存のaction-binding approval境界へ残す。

## 受入条件

- 同一source HEAD・同一tagの2回生成でtarball bytesとchecksumが一致する。
- manifestの`artifactDigest`がtarballの実測SHA-256と一致する。
- local testはremote state、tag、publish、credential、working treeを変更しない。
