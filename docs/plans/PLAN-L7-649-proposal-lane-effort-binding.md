---
plan_id: PLAN-L7-649-proposal-lane-effort-binding
title: "PLAN-L7-649 (impl): proposal lane の effort を model と束縛する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-22
updated: 2026-08-22
owner: Claude / TL
github_issue_id: 881
behavior_contract_id: PROPOSAL-LANE-EFFORT-MODEL-BINDING-001
responsibility_owner: proposal-lane-effort-binding
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "effortForLane が lane.model を参照せず tier だけで effort を返し、member 組み立ての model と effort が別経路のため、T1 lane に何の model を載せても xhigh になる"
contract_postconditions: "effort は standardEffortForModel(lane.model) から導出し、lane tier は capEffort による上限としてのみ働く"
contract_invariants: "worker 既定が gpt-5.6-luna である限り T1 の投影値は xhigh のままだが、それは model 由来の結果であり tier 由来の固定値ではない。未知 model は安全側 medium を経由し、なお tier 上限を受ける"
contract_failures: "tier 固定への差し戻し、上限適用の除去、capEffort の恒等化、T1／T2-mini／T0 上限の改変を U-LANEEFF-001〜004 と U-LUNA-003 が個別に red にする"
tdd_red_required: false
tdd_red_waiver_reason: "PR #851 HEAD 24561056 での実測（Issue #881 本文の 4 model matrix と U-LUNA-003 の変異 survive）を既存 Red とし、未記録 timestamp を捏造しない"
complexity_effect: net_negative
complexity_justification: "独立していた 2 経路の effort 決定を standardEffortForModel 一本へ寄せ、tier を上限という単一責務へ縮小する"
removal_trigger: "全 lane tier の上限が model registry 側へ表現でき、LANE_EFFORT_CEILING が恒等になった時点で削除する"
parent_design: docs/design/helix/L6-function-design/proposal-lane-effort-binding.md
pair_artifact: docs/test-design/helix/L8-proposal-lane-effort-binding-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Forward レーンで回収されない Issue を本レーンで回収する（Issue #881 の Required correction）"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/proposal-lane-effort-binding.md, oracle_id: U-LANEEFF-001, test_path: tests/team-launch-policy.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — 6 mutation の individual kill と U-LUNA-003 非退行の反証" }
  - { role: tl, slot_label: "TL — effort authority 一本化の妥当性確認" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-649-proposal-lane-effort-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/proposal-lane-effort-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-proposal-lane-effort-binding-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/team/launch-policy.ts, artifact_type: source_module }
  - { artifact_path: src/team/model-effort.ts, artifact_type: source_module }
  - { artifact_path: tests/team-launch-policy.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-639-luna-worker-model-registry.md
  requires:
    - docs/plans/PLAN-L7-639-luna-worker-model-registry.md
  blocks:
    - issue:881
---

# proposal lane の effort を model と束縛する

## §背景（実測）

Issue #881 で PR #851 HEAD `24561056` に対して測定した matrix。

```
T1-worker lane model=gpt-5.6-luna       → xhigh   （model 標準 xhigh、一致）
T1-worker lane model=gpt-5.6-terra      → xhigh   （model 標準 medium、乖離）
T1-worker lane model=gpt-5.4-codex      → xhigh   （model 標準 medium、乖離）
T1-worker lane model=claude-haiku-4-5   → xhigh   （model 標準 low、乖離）
```

既存 `U-LUNA-003` は Luna lane しか渡さないため、実装を model 由来へ差し替えても survive していた。

## §工程表 schedule

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | `capEffort` を model-effort へ追加 | ladder 上限適用が純関数として閉じる |
| 2 | `LANE_EFFORT_CEILING` を定義 | tier が上限という単一責務になる |
| 3 | `effortForLane` を合成へ置換 | model 標準 effort が authority になる |
| 4 | 非 Luna negative oracle を追加 | tier 固定変異が red になる |
| 5 | 責務境界を L6 設計へ明記 | どちらが authority か文書で確定する |

## §境界

- worker 既定 model そのものは変更しない。`gpt-5.6-luna` の T1 投影値は `xhigh` のまま維持する。
- `adaptReasoningEffort`（観測による適応調整）は本 PLAN の対象外。
- `luna-worker-model-registry.md` は projection 行の粒度更新と責務境界の参照追加に留め、
  registry の値自体は触らない。
