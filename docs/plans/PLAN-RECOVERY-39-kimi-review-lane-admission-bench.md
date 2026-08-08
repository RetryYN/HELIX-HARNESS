---
plan_id: PLAN-RECOVERY-39-kimi-review-lane-admission-bench
title: "PLAN-RECOVERY-39 (recovery): Kimi 独立レビュー lane の admission bench 欠落回復 (issue #390)"
kind: recovery
layer: cross
drive: be
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-08 PO 指示「既存の PR レビュー lane を解禁」。issue #390 の独立レビュー lane は実装 merge 済みだが、buildKimiReviewFallbackAdmission が要求する受け入れ試験（bench case 5 件 exact set / negative mutation 4 件 exact set）を実測する手段が無く admission receipt を発行できない"
status: completed
created: 2026-08-08
updated: 2026-08-08
owner: AIM (Claude) / TL
github_issue_id: 390
behavior_contract_id: KIMI-REVIEW-FALLBACK-001
responsibility_owner: independent-review-fallback-router
parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md
pair_artifact: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: "Claude primary runtime (実測 bench + negative mutation oracle)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T09:40:00Z"
    tests_green_at: "2026-08-08T09:35:00Z"
    verdict: approve
    worker_model: kimi-cli-v0.29.2
    reviewer_model: claude-fable-5
    scope: "issue #390 の独立レビュー lane（merge 済み）に対する受け入れ試験を実装し実測した。bench case 5/5 pass（clean_approve=approve / seeded_blocker=block は bubblewrap 隔離下の実 Kimi 起動、tool_request / schema_drift / quota_switch は決定的 oracle）、negative mutation 4/4 kill（remove_head_binding / allow_high_risk / allow_tool_activity / reuse_stale_receipt）。各 evidence_digest は out-dir 生成物 bytes の sha256 で preimage を tracked 化し、第三者が Kimi 未起動で再計算できる。S4 receipt が挙げた解禁条件 4 点は調査の結果すべて merge 済み実装で充足しており、未了は機構ではなく本受け入れ試験だったことを確認した。admission は HEAD 束縛かつ 24 時間上限のため一度きりの解禁は成立せず、本 bench を HEAD ごとに再実行するパイプラインとして位置づける。"
    green_commands:
      - { kind: smoke, command: "npx --no-install tsx tests/tools/kimi-review-admission/run-admission-bench.ts <out-dir> (cases 5/5 pass, mutations 4/4 killed)", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T09:35:00Z", evidence_path: docs/research/assets/kimi-review-lane-admission-2026-08-08/summary.json, output_digest: "sha256:0298016d6d38ef9734ddc4f37124c3463e13265d5830f2c3b1bb47ae2e0df95f" }
      - { kind: typecheck, command: "npm run typecheck", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T09:36:00Z", evidence_path: tests/tools/kimi-review-admission/run-admission-bench.ts, output_digest: "sha256:0298016d6d38ef9734ddc4f37124c3463e13265d5830f2c3b1bb47ae2e0df95f" }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-011a, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-011b, test_path: tests/kimi-review-admission-bench.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/independent-review-fallback.md, oracle_id: U-IRF-011c, test_path: tests/kimi-review-admission-bench.test.ts }
agent_slots:
  - role: aim
    slot_label: "AIM — lane 解禁を阻んでいた欠落（受け入れ試験の不在）の特定"
  - role: se
    slot_label: "SE — admission bench の実装と実測"
  - role: qa
    slot_label: "QA — negative mutation oracle の設計と kill 確認"
generates:
  - artifact_path: docs/plans/PLAN-RECOVERY-39-kimi-review-lane-admission-bench.md
    artifact_type: markdown_doc
  - artifact_path: tests/tools/kimi-review-admission/run-admission-bench.ts
    artifact_type: test_code
  - artifact_path: tests/tools/kimi-review-admission/admission-evidence.ts
    artifact_type: test_code
  - artifact_path: tests/kimi-review-admission-bench.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/helix/L8-independent-review-fallback-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/research/kimi-review-lane-admission-bench-2026-08-08.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - docs/research/kimi-worker-s4-full-bench-2026-08-08.md
  references:
    - docs/design/helix/L3-requirements/worker-common-contract.md
    - docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md
---

# PLAN-RECOVERY-39: Kimi 独立レビュー lane の admission bench

## 目的

issue #390 の独立レビュー lane は実装が merge 済みだが、`buildKimiReviewFallbackAdmission` が要求する
受け入れ試験（bench case 5 件の exact set 全 pass + negative mutation 4 件の exact set 全 kill）を
実測する手段が無く、admission receipt を発行できないため実運用に入れなかった。本 PLAN はその
受け入れ試験を実装し、実測して lane 解禁の前提を満たす。

PLAN-DISCOVERY-13 の S4 採否（用途限定 admit = controlled bench / proposal-only）の範囲内で行う。

## 完了条件

- [x] bench case 5 件を実測できる harness を実装する。clean_approve / seeded_blocker は
      bubblewrap 隔離下で実 Kimi を起動し、tool_request / schema_drift / quota_switch は
      lane の検証境界を直接叩く決定的 oracle とする。
- [x] negative mutation 4 件（remove_head_binding / allow_high_risk / allow_tool_activity /
      reuse_stale_receipt）を実装し、すべて kill されることを確認する。
- [x] 各 evidence_digest の preimage を artifact として out-dir へ残し、第三者が Kimi を起動せず
      digest を再計算できるようにする（旧 S2 の再現不能判定の反省）。
- [x] 実測結果と運用手順を research doc に記録する
      （`docs/research/kimi-review-lane-admission-bench-2026-08-08.md`、5/5 pass・4/4 kill）。
- [x] S4 receipt の解禁条件 4 点が既存 merge 済み実装で充足済みであることを確認し、doc に訂正を記録する。

## 範囲外

- admission receipt の発行そのもの。同一 HEAD の Claude PR レビュー receipt（canonical v2、実 PR の
  実レビュー成果物で合成不可）が別途要るため、対象 HEAD での運用時に実施する。
- 汎用 `helix kimi` 委譲面。汎用 worker isolation broker は egress 遮断固定で外部 CLI worker を
  載せられないため、専用 sandbox profile の設計から必要であり別 PLAN とする。
