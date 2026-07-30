---
plan_id: PLAN-L3-53-requirement-discovery-json-authority
title: "PLAN-L3-53 (add-design): Requirement Discovery LoopとL3 JSON authority契約"
kind: add-design
layer: L3
drive: agent
status: draft
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
