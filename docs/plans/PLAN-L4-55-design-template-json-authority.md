---
plan_id: PLAN-L4-55-design-template-json-authority
title: "PLAN-L4-55 (add-design): Design Template JSON authority基本設計"
kind: add-design
layer: L4
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-31 Issue #290 設計書templateをJSON正本化する"
created: 2026-07-31
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 290
engineering_discipline_required: true
behavior_contract_id: DESIGN-TEMPLATE-JSON-AUTHORITY
responsibility_owner: design-template-json-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "G1/G3でRequirement JSON 153/153がdefinition frozenであり、RDJ-FR-008の接続fieldが存在する"
contract_postconditions: "template registry、applicability、shadow変換、generated viewのcomponent境界とL9反例が閉じる"
contract_invariants: "JSONだけを構造的設計意味のauthorityとし、prose catalogとgenerated viewから逆流させない"
contract_failures: "unknown template、predicate不正、required field欠落、意味重複、generated view直接編集、旧正本化を拒否する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "既存templateの意味を一つのversioned registryへ集約し、固定冊数とLLM自由補完を同時に除く"
removal_trigger: "Design Template JSONが別canonical registryへatomic cutoverし、consumer=0になった時点"
pair_artifact: docs/test-design/helix/L4-design-template-json-authority-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — authority/component/data-flow境界" }
  - { role: qa, slot_label: "QA — L9 negative system oracle" }
  - { role: tl, slot_label: "TL — 既存catalog再利用と後続slice分離" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-55-design-template-json-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/design-template-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L4-design-template-json-authority-system-test-design.md, artifact_type: test_design }
review_evidence: []
dependencies:
  parent: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
  requires:
    - requirements-ir/requirements.json
    - config/requirement-ir-schema.json
  references:
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
    - docs/design/helix/L3-requirements/multimodal-design-harness-authority.md
    - docs/design/design-catalog.yaml
    - docs/research/design-harness-deep-research-coverage-2026-07-29.md
  blocks:
    - docs/plans/PLAN-L5-82-design-template-json-authority.md
---

# PLAN-L4-55: Design Template JSON authority基本設計

## 完了条件

- L4の構成、責務、I/F、主要data flow、authority境界がL9反例とpairになる。
- `design-catalog.yaml`を成果物所在catalogとして維持し、template意味正本へ昇格させない。
- schema、planner、instance、pair graphの実装を本PRへ混載しない。
- L4 close前のDesign Refactor Gateで、機能・性能・oracleを落とさずcomponentと正本を減らせないか判定する。
