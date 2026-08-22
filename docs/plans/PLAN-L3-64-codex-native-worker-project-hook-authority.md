---
plan_id: PLAN-L3-64-codex-native-worker-project-hook-authority
title: "PLAN-L3-64 (add-design): native workerのproject hook root authorityを正本化する"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:2026-08-22 Issue #895 native Luna workerのproject hook rootとactive assignment authorityを正本化する"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 895
behavior_contract_id: CNW-HOOK-AUTHORITY-001
responsibility_owner: codex-native-worker-routing-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "CNW-FR-001とCNW-R-01..05がcurrent authorityであり、hosted Codexがstale primary rootの旧agent guardを実行する再現証拠がある"
contract_postconditions: "CNW-R-06..08とCNW-AC-009..013がroot／HEAD／hook digest、assignment authority、bounded lifecycleをRequirement IRへ束縛する"
contract_invariants: "既存Luna payload normalizationを再実装せず、foreign dirty treeを変更せず、primary shared treeへの暗黙fallbackとraw bypassを正常経路にしない"
contract_failures: "root／HEAD／digest不一致、別root loader、stale primary fallback、unbounded hook、terminal result消失をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 requirement refinement authorityのみを更新し、pure contractとruntime接続は後続PLANへ分離する"
complexity_effect: net_neutral
complexity_justification: "既存CNW refinementをrevision-upし、project hook authorityだけを同一contractへ追加する"
removal_trigger: "native worker project hook identityがversioned baseline requirementへ吸収され、全surface migrationとread-afterが完了した時"
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/codex-native-worker-routing-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — project root／assignment authorityと非対象境界" }
  - { role: qa, slot_label: "QA — stale／foreign／timeout negative oracle" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/codex-native-worker-routing-acceptance.md, artifact_type: test_design }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/codex-native-worker-routing-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-63-codex-native-worker-routing.md
  requires:
    - docs/plans/PLAN-L3-63-codex-native-worker-routing.md
  references:
    - docs/design/helix/L3-requirements/worker-common-contract.md
  blocks:
    - issue:895-runtime-implementation
---

# native worker project hook authorityのRequirement IR refinement

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | hosted hook root、active worktree、loader、timeoutの実測を棚卸し | root authority gapと非対象が分離される |
| 2 | CNW-R-06..08とCNW-AC-009..013をL3↔L10へ追加 | exact setとnegative mutationが成立する |
| 3 | Requirement IR refinementをrevision-up | source／semantic digestが一致する |
| 4 | targeted test、PLAN lint、authority gate | 全oracle green |
| 5 | Claude exact-HEAD独立review後にmerge | blocker 0、main read-after成立 |

runtimeは本PLANへ混載しない。authority merge後、L6/L8 pure identity contract、SessionStart／doctor／status／
dispatch projection、Assignment worktree接続、bounded hook lifecycleを依存順の原子的PRへ分割する。

PLAN-L3-63の`generates`はconfirmed時点のhistorical provenanceであり、current artifact ownershipとして再評価しない。
requirements／L10 acceptanceのfrontmatter `plan`、Requirement IR `plan_id`、本PLANの`generates`が一致する
`PLAN-L3-64-codex-native-worker-project-hook-authority`だけをrevision 2のcurrent ownerとする。旧PLAN本文やreview evidenceを
新しいR-06..08／AC-009..013へ書き換えず、current owner判定でhistorical `generates`との共同正本化を拒否する。

この変更はPLAN-L3-63全体の訂正・supersessionではなく、revision 2へ更新したartifactだけのpartial ownership transferである。
exact-one PLAN admissionを壊してconfirmed旧PLANを同一PRで書き換えず、次のmachine-readable transferをcurrent authorityとする。

<!-- HELIX:cnw-ownership-transfer:v1 -->
```json
{
  "schema_version": "helix-cnw-ownership-transfer.v1",
  "from_plan": "PLAN-L3-63-codex-native-worker-routing",
  "to_plan": "PLAN-L3-64-codex-native-worker-project-hook-authority",
  "scope": "revision_2_artifacts_only",
  "transferred_artifacts": [
    "docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md",
    "docs/test-design/helix/codex-native-worker-routing-acceptance.md",
    "requirements-ir/refinement_contracts.json",
    "requirements-ir/manifest.json",
    "docs/generated/requirements/requirement-definition.generated.md",
    "docs/governance/l3-rebaseline-g3-freeze-packet.md",
    "docs/governance/generated/outstanding-snapshot.json",
    "tests/codex-native-worker-routing-requirements.test.ts"
  ]
}
```

## §既知conformance debtと後続owner

CNW-R-08の15秒既定／60秒hard ceilingは新しいcurrent authorityであり、次の既存設定は本requirements-only sliceの
merge時点では非適合baselineとして残る。green扱いせず、#895のbounded hook lifecycle runtime sliceが是正を所有する。

| current setting | 実測値 | failure／移行責務 |
|---|---:|---|
| `.codex/hooks.json` SessionStart | 90秒 | 60秒以下へ移行し、超過を`project_hook_lifecycle_timeout`で拒否 |
| `.claude/settings.json` `claude-memory-wake` | 7230秒 | 同期hookから分離したbounded workerへ移行し、terminal review／receiptを保持 |

後続runtime sliceは設定値を変更するだけで完了せず、CNW-AC-013の60秒超過、期限なし、親process残留、
terminal result消失のnegative mutationを実装し、SessionStart／Stop／memory wakeのread-afterを証拠化する。
