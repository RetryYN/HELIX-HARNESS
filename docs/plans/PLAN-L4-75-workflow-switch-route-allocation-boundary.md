---
plan_id: PLAN-L4-75-workflow-switch-route-allocation-boundary
title: "PLAN-L4-75 (add-design): workflow switching／routing／allocationのsystem境界を定義する"
kind: add-design
layer: L4
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
  - "po_directive:Issue #188 UWJ-FR/AC-011..015をrequirements正本からL4とL9へForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 188
behavior_contract_id: UWJ-DECISION-BOUNDARY-001
responsibility_owner: workflow-decision-orchestration
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "UWJ-FR/AC-011..015、requirements-owned workflow registry、#187 proposal-only authority、#193 measurement contract、#221 bounded historyがcurrent authorityである"
contract_postconditions: "switching／routing／allocation、measurement binding、Full V freeze／Scrum SR0..SR4 backfillのsystem component境界とL9 fail-close oracleが1対1で固定される"
contract_invariants: "typed identityはtarget_axis＋target_id＋registry version/digestだけをcurrent入力とし、catalogはgenerated projection、AI判断はproposal-only、mode/model/catalog_route_id/route_classを意味authorityへ戻さない"
contract_failures: "必須field欠落、stale registry、legacy identity推測、fallback/dead-letter欠落、capacity/budget/fairness欠落、measurement missing/stale/fail、proposal自己commit、Full V部分freeze、Scrum backfill欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL4↔L9のsystem boundary設計だけを固定し、L5/L8 schemaとL6/L7 runtime TDDは後続原子PLANへ分離する"
complexity_effect: net_negative
complexity_justification: "#187／#193／#221の既存authorityをportとして再利用し、旧mode routingとprovider固有配車の重複正本を廃止できる単一system境界へ収束する"
removal_trigger: "後継workflow decision authorityがUWJ-FR/AC-011..015を同等以上に満たし全consumer移行とread-afterが完了した時"
pair_artifact: docs/test-design/helix/L9-workflow-switch-route-allocation-system-test-design.md
backprop_decision: not_required
backprop_decision_reason: "confirmed L3 requirementsを意味変更せずL4/L9へ降下するForward sliceであり、上位要求の変更を伴わない"
agent_slots:
  - { role: aim, slot_label: "AIM — switch／route／allocationと既存portの責務境界" }
  - { role: qa, slot_label: "QA — UWJ-AC-011..015のnegative system oracle" }
  - { role: tl, slot_label: "TL — typed identity／proposal-only／measurement authorityの非重複監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-workflow-switch-route-allocation-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-switch-route-allocation-boundary-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md
    - docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md
    - docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md
    - docs/design/helix/L4-basic-design/bounded-probe-history.md
  blocks:
    - issue:188-l5-l8-schema
    - issue:188-l6-l7-runtime
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-22T03:46:50Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-22T03:46:50Z"
    evidence_digest: "sha256:b2640ec34efcf6df50f81f9199ce5150382f7af3886b02bad4451c3c0fc4f854"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-22T03:46:50Z"
    tests_green_at: "2026-08-22T03:45:27Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 792345fd-722c-4696-85eb-02494ab28d30
    scope: "PR #929 exact HEAD ad6334fe。UWJ-FR/AC-011..015のL4↔L9 pair、typed identity、proposal-only、measurement、Full V／Scrum publication、digest追従を監査。blocker/high/medium 0。token存在oracleの構造検査化は後続L5/L8の非blocker課題。review: https://github.com/RetryYN/HELIX-HARNESS/pull/929#issuecomment-5377687627"
    green_commands:
      - { kind: unit_test, command: "npx vitest run tests/workflow-switch-route-allocation-boundary-design.test.ts tests/l3-g3-freeze-packet-v2.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-22T03:45:27Z", evidence_path: tests/workflow-switch-route-allocation-boundary-design.test.ts, output_digest: "sha256:5a70904510a5aded99a34e1bc3d6ea7dc73329917dc6a11f9d81b07a0afb1dc6", result: "2 files / 37 tests passed。Claude transcript session 792345fd-722c-4696-85eb-02494ab28d30で実測。" }
---

# workflow switching／routing／allocationのL4↔L9 Forward

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | UWJ-FR/AC-011..015と既存authority portを棚卸し | 重複・compatibility再利用0 |
| 2 | L4 component／authority／state境界を定義 | 5 FRの責務がexactに配置される |
| 3 | L9 negative system oracleを定義 | 必須欠落とauthority迂回が個別に反証される |
| 4 | catalog／digest／outstandingと専用oracleを同期 | governance gate green |
| 5 | Claude exact-HEAD独立review | blocker 0、Draftのまま次層未完了を維持 |

本PLANはL4/L9 pairだけを所有する。L5 typed schema、L6 planner/evaluator、DB projection、CLI、provider adapter、
resident lane、#635 dynamic guide injectionは後続へ分離する。

#205はPR #925、merge HEAD `70aaa4f79f9eed00a6dcf5e4dc61239c16ae57de`、post-main run
`32543657708`でterminal read-after済みであり、本sliceはそのtyped identity projectionを前提証拠として参照する。

| requirement pair | 本sliceの責務 |
|---|---|
| UWJ-FR/AC-011 | switchingのsystem境界 |
| UWJ-FR/AC-012 | routingのsystem境界 |
| UWJ-FR/AC-013 | allocationのsystem境界 |
| UWJ-FR/AC-014 | measurement束縛境界 |
| UWJ-FR/AC-015 | Full V／Scrumのpublication境界 |
