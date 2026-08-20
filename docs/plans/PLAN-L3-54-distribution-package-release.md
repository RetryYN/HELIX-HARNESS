---
plan_id: PLAN-L3-54-distribution-package-release
title: "PLAN-L3-54 (add-design): multi-project配布packageと段階release要件"
kind: add-design
layer: L3
drive: agent
status: confirmed
revision: 2
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:2026-08-14 HELIX自己適用を除いたmulti-project配布packをHELIX-HARNESS-OSへ段階releaseする"
created: 2026-08-14
updated: 2026-08-21
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: DISTRIBUTION-PACKAGE-RELEASE-001
responsibility_owner: distribution-package-release
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "HR-FR-HYB-008、HR-FR-P6-03..06、PLAN-L7-157、PLAN-M-02とconsumer doctorが存在する"
contract_postconditions: "HELIX-HARNESS-LITE consumer_core_v1、自己適用除外、profile／manifest exact set、consumer smoke、段階promotion、rollback、standing authorization／approval境界がL3/L10 pairとして反証可能になる"
contract_invariants: "development repositoryを正本とし、同一Node artifact、consumer所有bytes保全、remote actionのapproval境界を維持する"
contract_failures: "dogfood混入、digest drift、文書/license欠落、consumer smoke不成立、stage skip、artifact差替え、未承認remote actionをfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存distribution／setup／version-up責務を再実装せず、配布artifactとpromotionの不足要件だけを詳細化する"
removal_trigger: "配布契約が恒久L3 schemaとL10 oracleへ完全吸収され本移行PLANのconsumerが0になった時点"
github_issue_id: 659
parent_design: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/distribution-package-release-system-test-design.md
agent_slots:
  - { role: tl, slot_label: "TL — package authority／consumer／promotion／approval境界" }
  - { role: qa, slot_label: "QA — dogfood混入、portability、rollback、stage skip反証" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-20T23:14:48Z"
    reviewed_at: "2026-08-20T23:21:20Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude:claude-opus-5
    scope: "POが2026-08-21にHELIX-HARNESS-LITEをFull HELIX唯一正本から生成するconsumer-safe stable subsetとして要求し、本L3/L10要件化を承認した。PR #857 HEAD 5c54874937266ce96e6cf4ca3e0cf5ca26c41e7fをClaude Codeがpost-CI exact-HEAD reviewし、Full／Lite authority境界、consumer_core_v1 allowlist、未終端capability除外、exact-set design-language negative oracleを照合してblocker 0。Actions run 32426597324はfull regression、Biome、DB rebuildがgreenで、doctor唯一redは本PLAN draftのmergedPlanStatus。review source: https://github.com/RetryYN/HELIX-HARNESS/pull/857#issuecomment-5363264851"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast --project slow (GitHub Actions harness-check run 32426597324)"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-20T23:14:48Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:4e25dded0326bf5478425eb6a0c25c4b3c8c91c48703ee8e8cb5ae14588a932b"
        result: "Actions run 32426597324。full regression、Biome、pre/post DB rebuild、Windows smoke、CodeQL green。doctor唯一redはconfirm前mergedPlanStatus。output_digestはClaude post-CI review comment本文のdigest。"
generates:
  - { artifact_path: docs/plans/PLAN-L3-54-distribution-package-release.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/distribution-package-release-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/distribution-package-release-system-test-design.md, artifact_type: test_design }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  requires:
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
  references:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/plans/PLAN-M-02-helix-identifier-rename.md
    - docs/adr/ADR-005-distribution-model-and-central-ui.md
  blocks:
    - issue:856-lite-consumer-profile-implementation
---

# PLAN-L3-54: multi-project配布packageと段階release要件

## 1. inventory-first調査

- 現行HELIX: requirements v1.3、PLAN-L7-157、P6 setup／distribution契約、consumer doctor、
  version-up／PLAN-M-02 approval packetを再利用する。
- 旧HELIX read-only source: `PLAN-218-helix-framework-package-export`、`cli/helix-setup`、
  `docs/setup-guide.md`、LICENSE noticeからpackage export／setup／guideのbehavior atomだけを採取する。
- 不採用: 旧Python／Bash runtime、Bun、旧UT state／DB、development dogfoodのbulk import。

## 2. L3/L10 pair

`HR-FR-HYB-008`をrequirements §4.6.1へ分解し、`HR-AC-HYB-008-01..09`をL10 system oracleへ
1対1接続する。L4以降のartifact builder、remote sync、tag、publishは本sliceへ混載しない。

## 3. closure境界

current HEADのgovernance／freeze／NFR source binding、full CI、DB convergence、別runtime reviewが揃うまで
本PLANはdraftとする。要件pairのconfirmはremote publish、tag、promotion、cutoverの実行許可ではない。

## 4. 改訂2: HELIX-HARNESS-LITE

PO指示2026-08-21により、初期consumer distribution profileを`HELIX-HARNESS-LITE`／`consumer_core_v1`として
version-upする。Liteは別forkではなくFull HELIXのconsumer-safe allowlist projectionとする。安全ゲート、既定配布先、
artifact identity、review、consumer smoke、rollback、monitoring、expiryへ束縛したstanding authorization成立時だけ
canary／preview／stableを追加承認なしで自走可能とし、PLAN-M-02 cutoverとpolicy外targetはaction-binding approvalへ残す。
