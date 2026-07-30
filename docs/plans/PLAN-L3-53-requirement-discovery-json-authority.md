---
plan_id: PLAN-L3-53-requirement-discovery-json-authority
title: "PLAN-L3-53 (add-design): Requirement Discovery LoopとL3 JSON authority契約"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-30 Requirement Discovery LoopからL3 strict JSON正本へ収束する"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: RDJ-FR-001
responsibility_owner: requirement-discovery-json-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "L1〜L12正本、153 active requirement、HR-FR-HIL-15/17/19/20、Design HARNESS、Authoring Admission Engineが存在する"
contract_postconditions: "L1 Markdown、L2 append-only discovery、L3 strict JSON canonicalの境界とL10 oracleが確定し、G1/G3 approval holdが機械検証できる"
contract_invariants: "既存24 system contractと153 requirementを増減せず、3 style／case／specialist軸を混同せず、人間判断をAIが捏造しない"
contract_failures: "L2早期canonical化、prototypeの要求正本化、別Requirement Engine、dual authority、旧layer再導入、旧Scrum名再出力、approval hold欠落をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存Requirement Translator等へ新規差分をrefinementし、runtimeや重複engineを追加しない"
removal_trigger: "L3 JSON authority cutover後に本移行契約が恒久schema／consumer契約へ完全吸収されconsumerが0になった時点"
github_issue_id: 283
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — L1/L2/L3 authority境界と既存責務mapping"
  - role: qa
    slot_label: "QA — backflow、人間承認、dual authorityのnegative oracle"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-30T15:20:20Z"
    reviewed_at: "2026-07-30T15:20:20Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #289 HEAD 181e91091cea763faee19d25a6b219480ffd7dc4をClaude AI-Bがclean detached checkoutでread-only reviewした。RDJ-FR-001..012とRDJ-AC-001..012のexact pair、L1/L2/L3 authority境界、既存24 system contractの再利用、G1/G3 hold、Design Template JSONの3 typed portと#290への分離を確認し、Critical／High／Medium 0、content verdict approve。Actions run 30553367527はtypecheck、full regression、Biome、pre/post DB rebuildがgreenで、doctor唯一のredは本confirm前のmergedPlanStatus bootstrap。独立DB replayはprojection sha256:8edc0e93fa8e60f5f7dd0c3326c9a59f33a4f3d63e7e38f7388e8bb446e9fbed、checkpoint sha256:2579bbfb157a8508a1b3685181686b47b105f51fcbc0cca5df8597200d461598、stale/orphan/finding 0、converged=true。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/289#issuecomment-5132773235"
    green_commands:
      - kind: smoke
        command: "npx --no-install tsx src/doctor/l3-g3-logical-db-receipt.ts"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-30T15:20:20Z"
        evidence_path: src/doctor/l3-g3-logical-db-receipt.ts
        output_digest: "sha256:041c2d0b0bf622fc24b2d6fc5e97185793a4d47d93fd908eec0a981623444eec"
generates:
  - artifact_path: docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/requirement-discovery-json-authority-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-requirement-discovery-json-authority.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires: []
  references:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
    - docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
    - docs/design/helix/L3-requirements/requirement-translation-obligation.md
    - docs/design/helix/L3-requirements/requirement-style-case-authority.md
    - docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
---

# PLAN-L3-53: Requirement Discovery LoopとL3 JSON authority

## §工程表

### Step 1: 既存責務mappingとgap監査

- `HR-FR-HIL-15/17/19/20`、`HIL-BR-22..24`、`HIL-FR-41..45`、Design HARNESS、
  Authoring Admission Engineへ指示書の各責務をexactly oneで割り当てる。
- 既存責務で表現不能な差分だけを`RDJ-FR-001..012`としてrefinementする。

### Step 2: L3/L10 pair契約

- L1人間向けMarkdown、L2 append-only event/candidate、L3 strict JSON canonicalのauthority境界を定義する。
- 質問、surface prototype、反応、暗黙要件、収束、compiler backflow、
  generated view、migration/cutover、downstream routingを反証可能にする。

### Step 3: freeze保留

- Issue #30へJSON authority migration中の`G1/G3 approval hold`を記録する。
- PR #280 snapshotを承認へ再利用せず、PR-6の再束縛まで153/153 active・0 frozenを維持する。

## §1 非対象

- schema/runtime、153件shadow migration、generator、DB projection、JSON cutover、G1/G3再束縛。
- 外部worker、GitHub settings、security tool導入、production resource、release/tag。

## §2 closure

current HEADのtargeted oracle、full CI、DB convergence、authoring runtimeと異なるAI-B review、
review tree＝merge treeが揃った場合だけ本契約sliceをconfirmedへ遷移する。
