---
plan_id: PLAN-L7-671-issue-dependency-detector-parser-shape
title: "PLAN-L7-671 (impl): Issue依存契約のdetector／parser形状を一致させる"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1010 detector and parser shape parity"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 1010
behavior_contract_id: ISSUE-DEPENDENCY-DETECTOR-PARSER-SHAPE-001
responsibility_owner: issue-dependency-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: consolidate
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "Issue本文のyaml fenced blockはmarker前に改行、空行、またはsame-line空白を持ち得る"
contract_postconditions: "detectorとparserは同じ採用block抽出結果を使い、parser受理形状をdetectorが見落とさない"
contract_invariants: "field順、relation意味、prose marker非採用、Issue番号付きmalformed findingを維持する"
contract_failures: "parser受理blockのsilent skip、prose marker誤採用、malformed blockのfinding欠落"
tdd_red_required: true
red_test: "U-IHIER-011へmarker前空行とsame-line markerを入力するとparserは成功するが旧detectorはfalseを返す"
red_at: "2026-08-24T20:48:36Z"
green_at: "2026-08-24T20:48:58Z"
mutation_oracle_evidence: "2026-08-24T20:50:27ZにhasIssueDependencyContractBlockを旧改行必須regexへ一時変異し、U-IHIER-011が1 failed / 9 passed（exit 1）になるkillを実測した。shared extractorへ復元後にtargeted greenを再確認する。"
complexity_effect: net_negative
complexity_justification: "detector専用regexを削除し、採用block抽出をparserと共有するpure functionへ集約する"
removal_trigger: "Issue dependency contractがGitHub本文以外のversioned typed storeへ完全移行した時"
parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, oracle_id: U-IHIER-011, test_path: tests/issue-hierarchy.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-671-issue-dependency-detector-parser-shape.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/issue-scope-authority-gates.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/issue-hierarchy.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-hierarchy.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-666-issue-dependency-contract-attribution
  requires: []
  blocks: []
  references:
    - "issue:1010"
    - "issue:980"
    - "issue:634"
agent_slots:
  - { role: se, slot_label: "SE — shared fenced block extractor" }
  - { role: qa, slot_label: "QA — whitespace shape and malformed regression" }
  - { role: tl, slot_label: "TL — parser authority and atomic convergence" }
---

# Issue依存契約のdetector／parser形状一致

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | parser受理形状をRed固定 | 旧detectorだけが空行／same-line形状を見落とす |
| 2 | 採用block抽出を共有 | detectorとparserが同じblockを参照する |
| 3 | malformed帰属を回帰 | Issue番号付きstable findingを維持する |
| 4 | CI・Claude検収 | exact HEADでblocker 0、main read-afterまで成立する |

本sliceはdependency relationやPLAN bindingの意味を変更しない。#1005が導入した採用境界を
parserの既存受理形状へ一致させ、detectorだけの狭いregexを正本化しない。
