---
plan_id: PLAN-L3-36-atomic-development-contract
title: "PLAN-L3-36 (add-design): 原子的開発・CI・リファクタリング契約"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 原子的PR・原子的CI・原子的リファクタリングをTDD/DDDと接続する"
  - "po_directive:2026-07-23 GitHub運用・工程表・DB次タスク抽出へ同じ契約を投影する"
  - "po_directive:2026-07-23 作業中PRのAI間排他lockとmemory takeover運用を厳格化する"
created: 2026-07-23
updated: 2026-07-24
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/github-atomic-development-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-atomic-development-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — behavior contract、DDD責務境界、CI profile、legacy縮退順序をレビュー"
  - role: qa
    slot_label: "QA — impact選択、full回収、次タスク収束、negative fixtureをレビュー"
review_evidence: []
generates:
  - artifact_path: docs/plans/PLAN-L3-36-atomic-development-contract.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L3-35-downstream-queue-correction.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-atomic-development-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-atomic-development-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-ci-performance-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: tests/github-atomic-development-contract.test.ts
    artifact_type: test_code
  - artifact_path: tests/github-l3-trace-authority-hygiene.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
  requires:
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    - docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
    - docs/governance/ddd-tdd-rules.md
    - docs/process/modes/refactor.md
  references:
    - docs/design/helix/L3-requirements/github-operations-projection.md
    - docs/governance/l3-downstream-queue.json
  blocks: []
---

# PLAN-L3-36: 原子的開発・CI・リファクタリング契約

## §0 目的

新規実装と既存改修を別運用に分けず、`1 behavior contract + 1 responsibility owner`を原子単位として、
requirement、TDD、DDD、PR、CI、GitHub工程、`harness.db`の次タスクを同一HEADへ収束させる。

## §工程表

### Step 1: 原子slice境界 [直列]

- acceptance example、失敗oracle、最小実装、refactor、検証、PRを1つのbehavior contractへ束縛する。
- DDDのbounded context、aggregate、domain service、value objectのいずれかをexactly-one責務ownerにする。

### Step 2: CI profileと回収契約 [直列]

- PRはtypecheck、変更影響targeted、contract oracle、critical gateを実行する。
- full regression、全doctor、全traceはmain合流直後とnightlyで実行し、PR省略集合をexact回収する。
- unknown impact、security、schema、migration、selector自体の変更はfullへfail-closeする。
- PR #110 run `30022734228` の22分2秒を現行baselineとして保存し、重要検査p95 60秒、Full verification
  p95 3分の予算超過をPerformance Recoveryへ送る。単発の高速値やtimeout延長で達成扱いにしない。

### Step 3: legacy縮退と次タスク収束 [直列]

- characterization contract → dual-green → consumer移行 → consumer=0確認 → legacy削除の順序を固定する。
- GitHub Issue/PR、工程表、workflow schedule、DB `next_action`を同じ依存frontierから生成する。

### Step 4: PR leaseとreview handoff [直列]

- repo、PR、HEAD単位でexactly-one writer leaseとread-only reviewer leaseを分離する。
- memory takeoverを通知だけでなく、release/acquire event、heartbeat、TTL、push前token検証へ束縛する。
- active takeoverは15分poll・15分heartbeat・45分TTL、idle時は30〜60分pollとし、観測だけではownershipを移さない。
- remediation時はreviewerがwriter leaseを明示取得し、元writerの同時pushをfail-closeする。

### Step 5: 後続分離 [後続・本PRに混載しない]

- impact selector、CI workflow、DB schema、task extractor、legacy removalの実装はL4以降へ降下する。
- downstream queueは、`atomic_slice_admission`、`impact_ci_recovery`、
  `mini_refactor_migration`、`dependency_frontier_task_extraction`、`pr_exclusive_lease`の
  5 workstreamを分離する。各workstreamのL4/L9、L5/L8、L6/L7を合計15枠として別PRでexact採番する。

## §旧HELIX資産の採否

- source snapshot: `RetryYN/ai-dev-kit-vscode` main
  `1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`。
- 採用: `HELIX-workflows/helix-process/refactor-workflow.md`のgolden masterを含む保護網→小変更→
  green→commit、`cli/lib/refactor_engine.py`の対象正規化・session lock・auditの考え方。
- 強化: local `fcntl` lockやtest件数一致をauthorityにせず、repo+PR+HEAD lease、behavior oracle digest、
  GitHub critical gate、同一HEAD receiptへ昇格する。
- 不採用: Python `refactor_engine.py` / `axis_09_refactor.py`のbulk移植、`.github/workflows/refactor.yml`の
  PRごとの直列full regression、検査失敗を`|| true`で通す方式。

## §受入条件

- AC-1: 1 sliceがexactly-one behavior contractと責務ownerを持ち、複数aggregateや無関係契約を混載しない。
- AC-2: PR省略集合がpost-merge/nightlyでexact回収され、unknown/high-risk変更はfullへfail-closeする。
- AC-3: legacy削除はcharacterization、dual-green、consumer=0、rollback receiptなしに選択できない。
- AC-4: GitHub、工程表、workflow、DB next actionが同一HEAD・同一dependency frontierへ収束する。
- AC-5: writer leaseがexactly-oneで、review/remediation handoffとpushが同一lease token・HEADへ束縛される。

## §完了境界

本PLANはL3要件とL10 oracleの定義だけを閉じる。CI workflow変更、selector、task extractor、
リファクタリング実施、legacy削除、downstream pair・実装・実行証拠は完了扱いにしない。
