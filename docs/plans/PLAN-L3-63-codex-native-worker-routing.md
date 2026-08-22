---
plan_id: PLAN-L3-63-codex-native-worker-routing
title: "PLAN-L3-63 (add-design): Sol TL＋Luna xhigh native worker要件を正本化する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:2026-08-20 Codex resident laneをSol親TL＋Luna xhigh native workerへ移行する"
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-ROUTING-001
responsibility_owner: codex-native-worker-routing-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "Issue #624のPO決定、frozen 153 requirement baseline、Requirement IR refinement authority、current model/effort/spawn guard gapを確認済み"
contract_postconditions: "CNW-FR-001、CNW-R-01..05、CNW-AC-001..008がRequirement IR refinementとしてcurrent rootへ束縛され、runtime実装sliceのauthorityになる"
contract_invariants: "Sol parent、Luna worker、Claude reviewerを分離する。arbitrary model override拒否、historical evidence保持、baseline root不変を維持する"
contract_failures: "Sol subagent、Terra current fallback、Luna terminal authority、自己review、stale policy、baseline改変をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 requirement refinement authorityのみを更新し、runtime implementationは後続PLANへ分離する"
complexity_effect: net_neutral
complexity_justification: "既存baselineを増改変せず、1件のrefinement contractへ新要求とoracleを集約する"
removal_trigger: "baseline requirementsのversioned再freezeがCNW contractを同じ意味で吸収し、全consumer migrationとread-afterが完了した時"
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/codex-native-worker-routing-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — parent／worker／reviewer authorityとrefinement境界" }
  - { role: qa, slot_label: "QA — override／旧identity／自己reviewのnegative oracle" }
generates:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L3-63-codex-native-worker-routing.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/test-design/helix/codex-native-worker-routing-acceptance.md, artifact_type: test_design }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/codex-native-worker-routing-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires:
    - docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md
  references:
    - docs/design/helix/L3-requirements/worker-common-contract.md
  blocks:
    - issue:624-runtime-implementation
review_evidence:
  - reviewer: claude-opus-5
    review_kind: cross_agent
    reviewed_at: "2026-08-20T17:48:33Z"
    tests_green_at: "2026-08-20T17:44:00Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    scope: "PR #849 HEAD 7f394b84405148dfeee5763698cef6fbc8089d93 をClaude Codeが
      exact-HEAD独立reviewした。CNW-PROJ-001..003と§1.1の被覆境界、requirements本文をbehavioral
      acceptanceへ読み替えない条項、表記変更mutationによるdigest束縛を実測しblocker 0。
      behavioral oracleはsrc/配下にluna実装が0件のため本requirements sliceの範囲外と判断した。
      review source: https://github.com/RetryYN/HELIX-HARNESS/pull/849#issuecomment-5359628194"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/codex-native-worker-routing-requirements.test.ts tests/l3-g3-freeze-packet-v2.test.ts && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-20T17:44:00Z"
        evidence_path: tests/codex-native-worker-routing-requirements.test.ts
        output_digest: "sha256:aa892bf1364d2e5fc15cabba518f2916afd7307a33cf7d3d91b0b42d2f65166e"
        result: "31 tests passed across 2 files; tsc --noEmit exit 0"
---

# PLAN-L3-63: Codex native worker routing要件

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | Issue #624、現行model registry、effort schema、spawn guardを棚卸し | gapと非対象が分離される |
| 2 | L3 requirementとL10 acceptanceを作成 | CNW exact setと双方向pairが成立する |
| 3 | Requirement IR refinementへ原子的に投影 | frozen baseline digest不変、current rootのみ更新 |
| 4 | targeted test、PLAN lint、authority gateを実行 | 全oracle green |
| 5 | Claude exact-HEAD独立review後にmerge | blocker 0、main read-after成立 |

## §後続実装

runtime sliceは本PLANへ混載しない。要件authority merge後、effort schema、model registry、policy-derived spawn、
receipt／doctorを依存順の原子的PRへ分割する。

confirmed遷移後のoutstanding snapshotはmainと同値へ戻るため、PR scopeはnet diffだけを宣言する。
