---
plan_id: PLAN-L7-408-objective-decision-count-binding
title: "PLAN-L7-408 (troubleshoot): G-10 decisionCountをlive completion frontierへ動的拘束"
kind: troubleshoot
layer: L7
drive: be
status: completed
route_mode: incident
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
parent_design: docs/governance/helix-objective-evidence-audit.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
entry_signals:
  - "po_directive:2026-07-11 設計を正としてテスト/検出器を追従させる — goal evidence testの旧decisionCount固定を是正"
backprop_decision: not_required
backprop_decision_reason: "G-10の既存completion frontier契約を動的に検証する修正で、上位意味は変更しない。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot起点と再現条件の妥当性確認"
  - role: qa
    slot_label: "QA — stale count/prefix collision/矛盾markerのRed fixture"
  - role: se
    slot_label: "SE — completion row全markerのtoken境界付き数値照合"
  - role: tl
    slot_label: "TL — G-10 fail-closeとsnapshot単一性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-408-objective-decision-count-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-209-objective-evidence-audit.md
  references:
    - src/lint/outstanding.ts
    - src/lint/completion-decision-packet.ts
    - tests/completion-decision-packet.test.ts
    - tests/outstanding.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:14:34+09:00"
    tests_green_at: "2026-07-11T03:12:03+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "decisionCountのlive items bindingをseverity-firstレビュー。substringで70を7と誤認する穴、正値+stale値併記、二重snapshot、将来count=0 fixtureを是正し、blocker/high残存なし。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/goal-evidence-audit.test.ts tests/completion-decision-packet.test.ts tests/outstanding.test.ts tests/l0-l8-design-consistency-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:12:03+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:9e5961ded3b17116d3457085b076499a41cee8d5c2272442f9d98c002e332e41"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T03:12:10+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:2a492cc4599b27e801dc1227fb948243f1efa93868c7b3de64304762682b3258"
      - kind: lint
        command: "bunx biome check src/lint/objective-evidence-audit.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:12:20+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:6b87783c379b37be9070e714ad9aa18951c255c2d65382e659feb605fda6dc6b"
---

# PLAN-L7-408: objective decisionCount動的拘束

## §0 defect

G-10監査行はcompletion frontierの件数を持つが、testが旧`decisionCount=2`を固定していたため、PLAN起票・
終端化に追従せず正本とtest oracleが分裂した。また単純substring照合では`7`と`70`、正値とstale値の
矛盾併記を区別できない。

## §1 工程表

1. [直列] stale countを再現し、live `outstanding.items.length`との不一致をRedにする。
2. [直列] G-10行の全markerをtoken境界付きで数値抽出し、全値一致を強制する。
3. [直列] prefix collision、矛盾併記、単一snapshotのnegative fixtureを追加する。
4. [直列] commit-fixed targeted tests、typecheck、Biome、別agentレビューで閉じる。

## §2 受入条件

- marker欠落、live件数との差、`decisionCount=70`によるprefix collision、正値+stale値併記がfail-close。
- PLAN増減後もtest自身が固定件数を二重正本化しない。
- commit-fixed targeted 101/101、typecheck、Biomeがgreen。

## §3 対象外

- pending PLANの人間承認やterminal化。
- PLAN-M-02 cutover、version-up activation、外部infra apply。
