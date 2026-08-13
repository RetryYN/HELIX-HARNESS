---
plan_id: PLAN-L3-54-distribution-package-release
title: "PLAN-L3-54 (add-design): multi-project配布packageと段階release要件"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-14 HELIX自己適用を除いたmulti-project配布packをHELIX-HARNESS-OSへ段階releaseする"
created: 2026-08-14
updated: 2026-08-14
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
contract_postconditions: "自己適用除外、manifest exact set、consumer smoke、段階promotion、rollback、approval境界がL3/L10 pairとして反証可能になる"
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
generates:
  - { artifact_path: docs/plans/PLAN-L3-54-distribution-package-release.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/distribution-package-release-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/distribution-package-release-system-test-design.md, artifact_type: test_design }
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  requires:
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
  references:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/plans/PLAN-M-02-helix-identifier-rename.md
    - docs/adr/ADR-005-distribution-model-and-central-ui.md
  blocks: []
review_evidence: []
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
