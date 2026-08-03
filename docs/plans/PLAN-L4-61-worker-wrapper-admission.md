---
plan_id: PLAN-L4-61-worker-wrapper-admission
title: "PLAN-L4-61 (add-design): worker wrapper admission基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-03 Feature #92の保護レーンとしてIssue #225 WCC-FR-02をL4/L9へ連続dispatchする"
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "WCC-FR-01 descriptor admissionがmainへmerge済みで、helix codex／claude、AdapterPlan、team adapter経路がexact HEADに実在する"
contract_postconditions: "HELIX所有wrapper経路とdirect provider CLIを型付きrouteで分離し、raw結果を将来benchmark consumerへ渡さないL4 componentとL9 oracleが一意になる"
contract_invariants: "provider成功文言やraw outputからwrapper provenanceを推論せず、HELIX adapterで生成したlaunch requestだけを比較候補にする"
contract_failures: "direct provider route、wrapper binding欠落、route改竄、raw結果混入をscorecard境界前でfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存AdapterPlan／ProviderInvocation／team runnerを再利用し、新service、DB table、workflow、benchmark runnerを追加しない"
removal_trigger: "旧HELIXのBash shimはbehavior atom採取後もcompatibility inputに留め、current Node adapterへ移植しない"
pair_artifact: docs/test-design/helix/L9-worker-wrapper-admission-system-test-design.md
review_evidence:
  - reviewer: "Codex independent reviewer / gpt-5.6-terra"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T00:48:24Z"
    tests_green_at: "2026-08-03T00:47:59Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "Issue #225 WCC-FR-02 L4/L9 candidate HEAD 33d67b6398cad7644d65a05b58c6c97a53150449をread-only監査。wrapper内部生成origin、canonical execution payload、sealed capability、codex/claude/team CLIのexact source binding、6件のL9 oracle、11-path scope expansionを照合しCritical/High/Medium 0、approve_for_status_transition。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/worker-wrapper-admission-design.test.ts tests/design-reality-binding.test.ts tests/design-language.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-03T00:47:59Z", evidence_path: tests/worker-wrapper-admission-design.test.ts, output_digest: "sha256:5d2c8673802c56e67458e2bf60ec8276bd94f059d6acb809464e77846979779e", result: "4 files / 35 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-03T00:48:24Z", evidence_path: src/lint/design-reality-binding.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0; stdout empty" }
scope_expansion_receipts:
  - expansion_id: WWA-SCOPE-001
    status: independent-reviewed
    reviewed_head: 33d67b6398cad7644d65a05b58c6c97a53150449
    reviewer_model: gpt-5.6-terra
    added_paths:
      - docs/governance/l3-rebaseline-g3-freeze-packet.md
      - tests/l3-g3-freeze-packet-v2.test.ts
      - config/digest-canonicalization-inventory.json
      - src/lint/l3-progression-reviewed-digests.ts
      - src/lint/l12-hybrid-reviewed-safe-v2.ts
      - tests/l12-hybrid-recognition.test.ts
    reason: "design catalogのcanonical digest pin、L12 reviewed-safe分母、および既存DRB AST拡張で移動したdigest inventoryのsource line metadataを同期するため"
    behavior_contract_id: WCC-FR-02
    responsibility_owner: worker-wrapper-admission
    responsibility_change: none
    functional_change: none
agent_slots:
  - { role: se, slot_label: "SE — wrapper route／provider invocation／consumer境界" }
  - { role: qa, slot_label: "QA — direct provider／raw output／route改竄のL9反例" }
  - { role: tl, slot_label: "TL — exact source bindingとFR05以降の非混載監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-61-worker-wrapper-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-wrapper-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/worker-wrapper-admission-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/design-reality-binding.ts, artifact_type: source_module }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/plans/PLAN-L4-60-worker-descriptor-admission.md
    - docs/design/helix/L3-requirements/worker-common-contract.md
    - docs/test-design/helix/worker-common-contract-acceptance.md
  references:
    - src/runtime/adapter.ts
    - src/team/run.ts
    - src/cli.ts
    - git@github.com:RetryYN/ai-dev-kit-vscode.git
  blocks:
    - issue:225
---

# PLAN-L4-61: worker wrapper admission基本設計

## 工程表

### Step 1: inventoryとcurrent authority [直列]

- current Node adapter、team runner、CLI entrypointと旧HELIXのraw CLI shimを比較する。
- 旧shimはbehavior atomだけ採取し、Bash／Python runtimeやoverride環境変数をcurrentへ移植しない。

### Step 2: L4 componentとroute境界 [直列]

- HELIX所有adapter routeとdirect provider routeを入力時点で分離する。
- raw provider outputを成功文言からwrapper実行へ昇格せず、consumerへ渡す前に拒否する。

### Step 3: 設計リファクタリング [直列]

- 新wrapper service案と既存AdapterPlanへのadmission追加案を同一oracleで比較する。
- owner、state、永続化、production module増分が小さい既存adapter案を採用する。

### Step 4: L9 negative oracle [直列]

- codex／claude／teamの正規経路、direct provider拒否、raw route許可mutationを検証する。
- benchmark runner、receipt ledger、sandboxを本sliceへ混載しない。

### Step 5: independent review [直列]

- authoring runtimeと異なる独立AI-Bがexact HEADをread-onlyで検査する。

## 受入条件

- AC-1: `WCC-FR-02`と`worker-wrapper-admission`だけを閉じる。
- AC-2: `helix codex`、`helix claude`、team adapterの実在sourceをexact digestへ束縛する。
- AC-3: direct provider CLI由来の結果を将来scorecard consumerへ渡さない。
- AC-4: 新service、DB table、workflow、benchmark runnerを追加しない。
- AC-5: L9正負oracle、PLAN lint、Design Reality Binding、独立AI-B reviewがgreenである。

## 検証

- `npx --no-install vitest run --project fast tests/worker-wrapper-admission-design.test.ts tests/design-reality-binding.test.ts --reporter=dot`
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L4-61-worker-wrapper-admission.md`
