---
plan_id: PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback
title: "PLAN-REVERSE-329 (kind=reverse): L1-L2 elicitation cycle S4 confirmed fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
forward_routing: L1
promotion_strategy: reuse-with-hardening
drive: fe
status: confirmed
created: 2026-07-05
updated: 2026-07-06
owner: TL (Codex) / PO
parent_design: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
pair_artifact: tests/semantic-frontier-consistency.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - D11 S4 confirmed の Reverse fullback scope と正本反映先を整理する"
  - role: po
    slot_label: "PO - L1-L2 反復ループの正式採用範囲と人-AI 境界を確認する"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L00-L06-design-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  requires:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  references:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    - docs/process/forward/L00-L06-design-phase.md
    - docs/process/gates.md
    - docs/plans/PLAN-L7-330-l1-l2-consistency-lint.md
    - docs/plans/PLAN-L7-333-l1-l2-gap-check-readonly.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T00:50:55+09:00"
    tests_green_at: "2026-07-06T00:50:55+09:00"
    verdict: approve
    scope: "R1/R2 の process / concept / requirements fullback、R3 の L1-L2 consistency lint と read-only gap-check CLI 結線を確認した。`PLAN-L7-330` が ID レベル収束 gate、`PLAN-L7-333` が観点表 8 項目 / 3 round bound / A-40 route の read-only packet を担当し、AI が L1/L2 を確定しない境界を維持している。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/l1-l2-gap-check.test.ts tests/l1-l2-consistency.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: tests/l1-l2-gap-check.test.ts
        output_digest: "sha256:f3435b4f0c1127cf10ef330910081950421ebd31bfbf9d2510a11510570b9132"
      - kind: smoke
        command: "bun src/cli.ts l1-l2 gap-check --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:52465f53377f16e84bcf3b3f3f7dc9d58e94f6f593dcd29a10d733ae53bee1de"
---

# PLAN-REVERSE-329: L1-L2 要求洗い出しサイクルの fullback

## 目的

`PLAN-DISCOVERY-11` は 2026-07-05 の PO S4 判断で `decision_outcome=confirmed` になった。PoC で実証した
L1-L2 反復ループ、AI gap-check read-only 境界、A-40 再検証点への接続を、Discovery 記録の中だけに閉じず
Forward front-end / gate / requirements 正本へ戻す。

## R0 現状

- S4 confirmed evidence は `PLAN-DISCOVERY-11` の `s4_decision_record` に記録済み。
- L1 PM-06 への Round 1 反映と S3 verify は済み。
- 残差は L2 側 1 件で、screen track 再開時に A-40 経由で扱う。
- `PLAN-L7-330` で L1/L2 consistency lint と doctor 接続は実装済み。
- process 正本反映、concept / requirements の trace seed 昇格、gap-check CLI / hook 結線の Forward descent 接続は未完了。よって whole-program completion には数えない。

## Fullback 方針

- R1: `docs/process/forward/L00-L06-design-phase.md` と `docs/process/gates.md` に、L1-L2 反復ループと収束 gate を正式な Forward 前段として戻す。`2026-07-05 completed`
- R2: concept / requirements の trace seed を confirmed 記述へ昇格する。AI は L1/L2 を確定せず、read-only gap-check のみを担う境界を維持する。`2026-07-05 completed`
- R3: L1/L2 consistency lint と gap-check read-only CLI / hook の Forward descent PLAN へ接続する。`2026-07-06 completed`
- R4: fullback artifact、pair evidence、review evidence、green command を揃えて terminal 化する。`2026-07-06 completed`

## R1/R2 反映記録

- `docs/process/forward/L00-L06-design-phase.md` に L1-L2 elicitation loop を追加し、人が L1/L2 を直接作成・収束宣言し、AI は read-only gap-check だけを担う境界を Forward 前段へ戻した。
- `docs/process/gates.md` に G1/G2 収束の扱いを追加し、consistency lint green は必要条件、最終 freeze は人の宣言、A-40 再検証へ接続する規則を明示した。
- `docs/governance/helix-harness-concept_v3.1.md` と `docs/governance/helix-harness-requirements_v1.2.md` の trace seed を PoC 段階から S4 confirmed の正式追補へ昇格した。
- 既存実装 `PLAN-L7-330` は ID-level L1/L2 consistency lint として完了済み。`PLAN-L7-333` で観点表 8 項目の
  gap-check read-only surface、CLI 結線、Forward descent PLAN への接続も完了した。L1/L2 の自動起草や
  自動確定は含めず、AI は欠落候補を surface するだけである。

## 受入条件

- `PLAN-DISCOVERY-11` を参照する Reverse PLAN として `scrum-reverse` が orphan を出さない。
- confirmed PoC を semantic frontier pending decision に戻さない。
- D11 の S4 confirmed を completion claim と誤認せず、Reverse fullback 未了を outstanding として残す。
- 日本語 first の説明を保ち、コマンド名・識別子・ファイル名だけ原語を許可する。

## Terminal 記録

- `PLAN-L7-330`: L1/L2 ID-level consistency lint と doctor hard gate。
- `PLAN-L7-333`: `helix l1-l2 gap-check --json` read-only packet。観点表 8 項目、3 ラウンド bound、
  A-40 change-log route、`writePolicy=no-write`、`completionClaimAllowed=false` を固定。
- hook 判定: direct hook 自動起動は N/A。L1/L2 は人が直接作成・収束宣言するため、hook が自動実行や
  自動修正の契機になると charter §3 の人-AI 境界を曖昧にする。正式 surface は repo-local read-only CLI
  packet とし、handover / status / review 時に明示実行する。
- `scrum-reverse` / `l1-l2-consistency` / `objective-evidence-audit` は `doctor` で green。

残る L2 側 PM-06 表示詳細 1 件は、screen track 再開時の A-40 change-log と G1-trace 再検証で扱う
carry item であり、本 Reverse fullback の terminal claim には混ぜない。
