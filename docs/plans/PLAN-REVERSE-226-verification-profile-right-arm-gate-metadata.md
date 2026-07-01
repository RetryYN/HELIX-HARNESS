---
plan_id: PLAN-REVERSE-226-verification-profile-right-arm-gate-metadata
title: "PLAN-REVERSE-226 (reverse): verification profile right-arm gate metadata"
kind: reverse
layer: cross
workflow_phase: R4
drive: agent
status: confirmed
confirmed_reverse_type: code
forward_routing: L5
promotion_strategy: reuse-with-hardening
created: 2026-07-02
updated: 2026-07-02
owner: Codex
agent_slots:
  - role: tl
    slot_label: "TL - verification profile right-arm metadata backfill"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-226-verification-profile-right-arm-gate-metadata.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-226-verification-profile-right-arm-gate-metadata.md
---

# PLAN-REVERSE-226: verification profile right-arm gate metadata

## R0 Evidence Acquisition

`verification-profile` は A-125 以降、変更ファイルから MCP / browser / DB / API / GitHub profile を推薦できた。
しかし profile が右腕 `G8-G14` のどの gate を支えるか、また requirements v1.2 §1.6 の drive 別 L10 要否と
どう接続するかを型で持っていなかった。

## R1 Observed Contracts

- G10 は `fe` / `fullstack` / `agent` で常に必要。
- `be` / `db` は UI を持つ場合のみ L10 が必要。
- G8-G14 evidence profile は `docs/process/forward/L08-L14-verification-phase.md` に定義済み。
- `verification-profile` は doctor hard gate に接続済みなので、metadata drift も doctor で落とせる。

## R2 As-Is Design

変更ファイルから `VerificationSignal` を出し、`SIGNAL_TO_PROFILE` で profile を推薦していたが、profile
定義は signal と実行安全性に閉じていた。G10 browser evidence が catalog から消えても、profile 推薦
そのものは成立しうるため、右腕工程の意味要件を満たしているかが見えなかった。

## R3 Intent Hypothesis

profile catalog に `recommendedGates` / `recommendedDrives` を持たせ、G8-G14 と drive 別 L10 要否を同じ
型モデルで扱う。`fe` / `fullstack` / `agent` について G10 browser profile が 0 件になった場合は
`missing-drive-g10-profile` として fail-close する。

## R4 Gap & Routing

Route to L5/L7:

- L5/process: L08-L14 verification phase に profile 接続ルールを明記する。
- L7/test-design: U-MCPPROFILE-015/016 を追加し、catalog metadata と drive L10 hard gate を oracle 化する。
- L7/code: `VerificationProfile` 型、catalog、`analyzeVerificationProfileGate` を更新する。
