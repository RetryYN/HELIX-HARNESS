---
plan_id: PLAN-L3-55-workflow-classification-registry
title: "PLAN-L3-55 (add-design): workflow分類を要求正本のversioned registryへ収束する"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: version-up
entry_signals:
  - "po_directive:2026-08-15 旧定義を新要求／新定義で是正しversion upするForward本線へ戻す"
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-A0
responsibility_owner: workflow-classification-requirements-registry
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: implementation_required
ddd_modeling_decision: domain_service
contract_preconditions: "requirements v1.3.4と旧15-route catalogが併存し、catalogが意味authorityとして誤用されるsurfaceが残る"
contract_postconditions: "requirements v1.3.5が分類axisとtyped identityを定義し、strict registry/schemaがcatalogをgenerated projection、旧15-routeをcompatibility inventoryとして固定する"
contract_invariants: "3 development style、DISCOVERY_POC、SCRUM_REVERSE、workflow model、state machine、specialist drive/workflow/capability、execution modeを同一enumへ畳み込まず、曖昧signalを推測しない"
contract_failures: "catalog authorityへの逆転、旧routeのrequirements identity昇格、REDESIGN等の誤降格、親identity欠落、未解決signalのroute推測をfail-closeする"
tdd_red_required: true
red_at: "2026-08-15T04:35:13+09:00"
green_at: "2026-08-15T04:38:22+09:00"
complexity_effect: net_increase
complexity_justification: "後続projectionの単一入力となるrequirements-owned registryとstrict parserを追加する一方、旧catalogの意味authorityを廃止する移行境界を明示する"
removal_trigger: "registry v2以降へschema migrationし、v1 consumerが0になった時点でversioned successorへ置換する"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-classification-registry.test.ts
agent_slots:
  - role: tl
    slot_label: "TL — 要求正本とprojection境界、分類axis、versioning契約"
  - role: qa
    slot_label: "QA — authority逆転、axis混在、曖昧signalのnegative oracle"
review_evidence: []
generates:
  - artifact_path: docs/plans/PLAN-L3-55-workflow-classification-registry.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    artifact_type: design_doc
  - artifact_path: src/schema/workflow-classification-registry.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-classification-registry.test.ts
    artifact_type: test_code
  - artifact_path: config/nfr-registry.json
    artifact_type: config
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires: []
  references:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - config/drive-route-catalog.json
  blocks: []
---

# PLAN-L3-55: workflow分類requirements registry

## §1 目的

旧15-route catalogを名称変更して新正本へ再固定せず、要件定義をversion upしてworkflow分類の意味を
typed axis、identity、relation、state machineとして確定する。catalog以下は本registryから生成・検証する。

## §2 工程

1. requirements v1.3.5で分類axisと互換境界を確定する。
2. requirements-owned JSON registryとstrict schemaを追加する。
3. authority逆転、axis混在、legacy昇格、曖昧signal推測をmutation oracleで拒否する。
4. 要件digestに依存するL3 freezeとNFR evidenceを同一HEADへ追従する。
5. Claude Code Opus exact-HEAD review、full CI、DB convergence後にconfirmedへ遷移する。

## §3 非対象

- catalog生成、runtime／CLI／DB migration、legacy adapter、doctor gateは後続の原子的sliceとする。
- #635、#188を本sliceで解放しない。
- 配布、`pair_artifact` directory是正、closure自走を混載しない。

## §4 完了条件

requirements v1.3.5、registry、schema、mutation oracle、reviewed digestが同じ分類を返し、旧15-route exact setを
current authorityとして使用しないことをtargeted test、full CI、独立reviewで証明する。
