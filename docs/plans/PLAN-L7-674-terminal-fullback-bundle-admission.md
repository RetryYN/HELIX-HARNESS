---
plan_id: PLAN-L7-674-terminal-fullback-bundle-admission
title: "PLAN-L7-674 (add-impl): typed PLAN terminal fullback bundle admission"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #1031 terminal fullback bundle admission"]
created: 2026-08-25
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1031
behavior_contract_id: GWID-TERMINAL-BUNDLE-001
responsibility_owner: github-workflow-identity-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
contract_preconditions: "通常PRの複数typed PLAN拒否と、requirements version-up専用migration bundleが既存admissionで成立している"
contract_postconditions: "同一IssueのForward／Reverse terminal fullbackだけが、各typed identityを保持したstrict bundleとして受理される"
contract_invariants: "terminal bundleはmigration bundleへ偽装せず、registry authorityを増やさず、legacy identityを推測せず、manifestとcurrent HEADをexact照合する"
contract_failures: "marker重複／併記、manifest／owner／PLAN identity／registry digest／catalog／Issue／PR／HEAD不一致、非typed PLAN、未登録identityを専用reasonでfail-closeする"
tdd_red_required: true
red_at: "2026-08-25T15:16:22Z"
green_at: "2026-08-25T15:26:54Z"
mutation_oracle_evidence: "tests/backfill-pairing.test.ts U-BACKFILL-006とtests/l3-g3-freeze-packet-v2.test.ts U-DESIGNCOV-016が、Reverse pairとcurrent L3 digestを欠落させたHEAD cf44b8a1のCI run 32862423304をfailedにして欠落変異をkillした。双方向linkとdigest pinを復元後、両suiteを含む82 testsがgreenへ復帰した。tests/github-workflow-identity-admission.test.ts U-GWIDADM-019／020はterminal marker、manifest、owner、registry digest、identity、Issue不一致を個別にrejectする。"
complexity_effect: justified_positive
complexity_justification: "複数typed PLANを許可する例外をmigrationとterminal fullbackへ明示分離し、GitHub workflow内の自由文推測を増やさず共通adapterへ集約する"
removal_trigger: "GitHub workflow identity admission schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-019, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-020, test_path: tests/github-workflow-identity-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-674-terminal-fullback-bundle-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-674-terminal-fullback-bundle-admission.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/adapters/github-workflow-identity-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/github-workflow-identity-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
  requires:
    - docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
    - docs/plans/PLAN-REVERSE-674-terminal-fullback-bundle-admission.md
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    - docs/design/helix/L6-function-design/github-workflow-identity-admission.md
    - docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — terminal fullback admission adapter" }
  - { role: qa, slot_label: "QA — manifest／identity／Issue／HEAD反例" }
  - { role: tl, slot_label: "TL — migration／terminal bundle境界" }
---

# typed PLAN終端束ねの受入

## 目的

Issue #1031は、同一IssueのForward PLANとReverse fullback PLANを一つの終端closure sliceとして検査するための
GitHub workflow identity admission契約を追加する。通常PRの`exactly one`原則と、requirements version-up専用の
migration bundle契約は維持し、terminal fullbackを別の明示的なbundle schemaとして実装する。

## 境界

- terminal bundleは、sorted uniqueなchanged PLAN manifestとexactly oneのowner PLANを持つ。
- manifest内の全PLANはcurrent registry version／digestとcatalogに登録されたtyped identityを持つ。
- Forward／Reverseの`target_id`は保持し、owner PLANのidentityで上書きしない。
- 全PLANの`github_issue_id`、Issue／PR contract、candidate HEADをexact照合する。
- registry authority pathの同時変更は要求しない。migration markerとの併記は拒否する。
- bundle受理はadmissionの成功であり、completion claim、Issue close、mergeを単独では許可しない。

## 実装順

1. L3要件、L6設計、L8テスト設計へterminal fullback contractを追加する。
2. adapterへterminal bundle marker、strict manifest、owner、identity、Issue一致の検査を追加する。
3. U-GWIDADM-019／020とmutation oracleを実装し、既存migration／通常PRの反例を退行させない。
4. `npm run typecheck`、targeted test、plan lint、全CI、Claude exact-HEAD reviewを同一HEADへ束縛する。
5. dogfood PR #1030でForward／Reverse PLANをterminal bundleとして再検証する。
6. 本add-implをReverse PLANと双方向に接続し、L3要件変更のcurrent digestをG3 freeze packetへ伝播する。

## 受入条件

1. 通常の複数typed PLANは従来どおりfail-closeし、migration bundleはversion-up専用のまま変わらない。
2. terminal bundleのpositive oracleが異なるForward／Reverse identityを保持してgreenになる。
3. marker重複／併記、unsortedまたは重複manifest、owner欠落、stale digest、unknown identity、Issue不一致、
   changed PLANの未列挙または未typedを個別にfail-closeする。
4. current registry／catalogとIssue／PR／PLAN tuple、candidate HEADが一致し、legacy fieldやproseから推測しない。
5. current HEADのCI、DB convergence、Claude独立review、main read-afterを揃えるまでcompletion claimを許可しない。
