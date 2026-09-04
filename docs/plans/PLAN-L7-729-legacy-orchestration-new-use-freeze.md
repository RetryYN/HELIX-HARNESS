---
plan_id: PLAN-L7-729-legacy-orchestration-new-use-freeze
title: "PLAN-L7-729 (refactor): 旧orchestration surfaceの新規利用をfreezeする"
kind: refactor
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "structural"
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 865
behavior_contract_id: LEGACY-TEAM-LOOP-RETIREMENT-001
responsibility_owner: legacy-orchestration-retirement
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "#865のconfirmedな段階退役契約を変更せず、Phase 1の新規利用freezeを機械化する。"
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "#865でphase単位依存、新規利用freeze先行、successor未成立中の先行削除禁止が確定している"
contract_postconditions: "旧orchestration surfaceのtracked current consumerがpath別上限へ固定され、新規pathと増加がdoctorでfail-closeする"
contract_invariants: "既存engineを削除せず、historical evidenceをcurrent consumerへ数えず、inventoryを旧authorityの正当化に使わない"
contract_failures: "inventory欠落・退化、別path追加、同一path増加、gate未配線を個別にfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存direct engineの挙動は変更せず、既知利用の増加を止めるgovernance ratchetを追加するため。未実測の実装前Redは記録せず、比較演算子mutationの実測を回帰証拠とする。"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-05T04:14+09:00にper-path growth比較をactual > maximumからactual < maximumへ反転し、U-LORET-001とU-LORET-003が2 failed／4 passed、exit 1でkillした。比較を復元後6/6 greenへ戻した。"
complexity_effect: net_negative
complexity_justification: "旧engineごとに分散していた新規利用禁止を一つのpath別ratchetへ集約し、後続移行で単調減少できる"
removal_trigger: "旧direct engine current consumerが0となり、inventoryと本ratchetをretirement read-afterへ置換した時点"
parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md
pair_artifact: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md
dependencies:
  parent: null
  requires:
    - docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
  references:
    - issue:865
    - issue:863
    - issue:819
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-001, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-002, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-003, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-005, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, oracle_id: U-LORET-006, test_path: tests/legacy-orchestration-surface.test.ts }
generates:
  - { artifact_path: config/legacy-orchestration-surface-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/legacy-orchestration-retirement-ratchet.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md, artifact_type: test_design }
  - { artifact_path: src/lint/legacy-orchestration-surface.ts, artifact_type: source_module }
  - { artifact_path: tests/legacy-orchestration-surface.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — tracked surface inventoryとpath別ratchet" }
  - { role: qa, slot_label: "QA — new path／growth／inventory mutation" }
  - { role: tl, slot_label: "TL — compatibility-only境界と後続phase依存" }
review_evidence: []
---

# PLAN-L7-729: 旧orchestration surfaceの新規利用freeze

## 対象

current tracked repositoryの旧direct engine、team-owned slot、static capability routing、
consumer再生成surfaceをexact inventoryへ固定する。既存債務の減少は許可し、増加はdoctorで拒否する。

## 非対象

- direct engine、historical evidence、read-only replayの削除。
- successor route、Assignment、Lease、Notification Fabricの実装。
- 配布release、tag、publish、cutover。

## 完了条件

targeted test、typecheck、Biome、PLAN lint、doctor、全回帰、Claude exact-HEAD review、
DB convergence、main read-afterがgreenになること。
