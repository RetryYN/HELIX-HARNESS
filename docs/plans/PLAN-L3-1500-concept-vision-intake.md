---
plan_id: PLAN-L3-1500-concept-vision-intake
title: "Concept・Vision・Packageの原文保全と版管理対応"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive: Concept/Vision ZIPの整理・版管理への対応・保全後削除の明示依頼。要件承認ではない"
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1500
behavior_contract_id: CAPABILITY-RELEASE-PORTFOLIO-MANAGEMENT-001
responsibility_owner: capability-release-portfolio-management
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "未発効の取込候補と原文を保存し、意味変更は既存RLS/FRSの別改版へ明示的に残す"
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "ZIPの全10文書を読取り、同梱checksumと一致し、既存Release要求との状態差を確認する"
contract_postconditions: "原文保存、提供候補13件、版軸分離、既存要求への対応、未確認出典を追跡できる"
contract_invariants: "入力資料は承認・実装・公開の証拠に自動昇格しない。既存ownerと意味正本を維持する"
contract_failures: "原文欠落、未知版の推測、二重owner、候補のruntime化、承認創作を拒否する"
tdd_red_required: true
tdd_red_evidence: "CI run 33999795382でbyte保存した外部原文14件をauthored日本語文書として検出しpreflight failure。原文編集ではなく保存域境界を実装する"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-06 09:13:00開始、intake除外だけを撤去するとU-DESLANG-018が1 failed（2.50秒）。外部原文pathがload対象となる退行を検出。復元後09:13:19開始は1 passed（2.51秒）"
complexity_effect: net_negative
complexity_justification: "既存Portfolio/Module/Slice/Bundleを再利用し、新しい版台帳やengineを作らない"
removal_trigger: "候補の意味差分を既存要求へ正規移管し、検収・main read-after後に候補状態を更新する"
parent_design: docs/governance/candidates/concept-vision-release-crosswalk.md
pair_artifact: docs/governance/candidates/concept-vision-package-intake.md
dependencies:
  parent: docs/governance/candidates/concept-vision-release-crosswalk.md
  requires: []
  references:
    - issue:1500
    - issue:1494
    - issue:1073
    - issue:1074
    - issue:1496
    - issue:397
  blocks: []
generates:
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_INTAKE_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/00_MASTER_INTAKE.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_INTAKE_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/SHA256SUMS.txt, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/current/HELIX_CATALOG_INTAKE_v0.6.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/current/HELIX_RELEASE_AND_VERSION_CATALOG_v0.6.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/current/HELIX_DEVELOPMENT_PACKAGE_CATALOG_v0.6.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/archive/intake/2026-09-06-concept-vision/evidence/HELIX_EXISTING_HIERARCHY_AND_TRANSITIONS_v0.1.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/concept-vision-package-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/concept-vision-release-crosswalk.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-1500-concept-vision-intake.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/design-language.ts, artifact_type: source_module }
  - { artifact_path: tests/design-language.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — 原文と正本の対応" }
  - { role: qa, slot_label: "QA — 保存と参照の検証" }
review_evidence: []
---

# 取込範囲

原文はarchiveの参照資料、整理版は未発効候補とする。Concept v4承認を取り消さず、文書v0.1と能力目標1.0〜5.0を別軸にする。
今回の依頼からモデル学習、Web実装、公開版採番、tag/publish、owner移管を開始しない。

## 検証済みと残件

- 原文10文書のSHA-256一致: 10/10、exit 0。
- 整理版から原文/取込台帳への相対参照: 6/6解決。
- RLS本文およびFRS v0.2候補と対応を比較済み。全要求/実装/consumer照合は未完了。
- PLAN lint: exit 0。独立レビュー、CI、main read-afterは未完了。レビューを実行したという記録を創作しない。
- 原文はcommit `17f00abeb`でremote保存済み。hash一致と保存を確認後、元ZIPのみ削除した。原文はGitから復元可能。
- main未到達のため復元経路はremote branch `docs/1500-concept-vision-intake`に依存する。元ZIP pathは `/home/tenni/HELIX-HARNESS/HELIX_Concept＆Vision.zip`。GitへZIP binaryは追加していない。
- DB rebuildおよびcommit後outstanding snapshot照合はexit 0。PR #1576で独立検収を追跡する。
- CIのdesign-language違反14件は、原文編集とchecksum更新による初回対処を撤回した。原文と受領時checksumをbyte一致へ復元し、byte保存域を言語正本から除外するU-DESLANG-018を追加。baselineは変更しない。
