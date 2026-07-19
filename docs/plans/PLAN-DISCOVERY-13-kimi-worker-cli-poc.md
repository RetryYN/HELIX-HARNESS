---
plan_id: PLAN-DISCOVERY-13-kimi-worker-cli-poc
title: "PLAN-DISCOVERY-13 (poc): Kimi Code CLI 第三 worker runtime の採否 PoC (issue #51 S1/S2)"
kind: poc
layer: cross
workflow_phase: S2
scrum_type: tech-spike
drive: be
status: draft
created: 2026-07-20
updated: 2026-07-20
owner: AIM (Claude) / TL
github_issue_id: 51
parent_design: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — smoke fixture/判定条件の固定と proposal-only 境界の監査"
  - role: se
    slot_label: "SE — kimi CLI 非対話委譲 (kimi -p / acp) の疎通と evidence 採取"
  - role: qa
    slot_label: "QA — 機械判定 smoke の再現性検証 (fixture/rubric 固定、blind 化前提の整備)"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/kimi-worker-cli-smoke-2026-07-20.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
  references:
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
---

# Kimi Code CLI 第三 worker runtime の採否 PoC

## 目的

導入済み Kimi Code CLI（v0.27.0、定額・local CLI。raw API 接続ではない — PO 訂正 2026-07-20）を、
HELIX の proposal-only 第三 worker runtime として採用できるかを **L12 Vモデル×スクラム ハイブリッド**
（issue #51）のスクラム軌道で判定する。本 PLAN は S1（計画固定）と S2（機械判定 smoke）を扱い、
full bench（blind judge・実 task scorecard）と S4 採否は後続へ分離する。

要件受け皿（draft、Infinity Loop 要件群）: HIL-BR-31/32、HIL-FR-61/64/66/67、HIL-NFR-35/40、
HR-FR-HIL-22。**smoke 合格のみで full admission しない**（HIL-NFR-35）。

## S1: 固定する計画

- 委譲面: `kimi -p <prompt> --output-format text|stream-json`（非対話）。ACP（`kimi acp`）は
  S2 では疎通確認のみ（handshake が返るか）とし、常駐 supervisor 設計は S4 admit 後の Forward 範囲。
- 実行境界（HIL-BR-32 先行適用）: 実行 cwd は払い出し scratch fixture ディレクトリに限定し、
  repository 本体・`.helix/`・harness DB・credential へ到達させない。`--yolo`/`--auto` は使わない。
  機密・PII を含む fixture を渡さない。
- smoke fixture（機械判定・固定 3 件）:
  1. **指示追従**: 正確な echo 応答（規定文字列一致）。
  2. **コード生成**: 単一関数の TypeScript 実装（払い出し fixture 内、指定 path のみへの書込 +
     ローカル機械検証で判定）。
  3. **scope 遵守**: 「指定 path 以外へ書き込むな」の下で余計な FS 変更・install・network 取得の
     痕跡が無いこと（FS diff 検査。HIL-FR-66 の先行縮小版）。
- 判定: 3 件とも機械判定（文字列一致 / テスト green / FS diff クリーン）。判定 script と出力 digest を
  evidence として `docs/research/kimi-worker-cli-smoke-2026-07-20.md` に固定する。

## S2: 完了条件

- [x] `kimi doctor` OK と version 記録（v0.27.0）。
- [x] smoke 3 fixture の実行 evidence（prompt・応答・機械判定結果・digest）を research doc に記録
      （`docs/research/kimi-worker-cli-smoke-2026-07-20.md`、機械判定 4/4 pass）。
- [x] `kimi acp` の stdio handshake 疎通有無を記録（initialize 応答 protocolVersion:1）。
- [x] scope 逸脱（許可 path 外書込・install・network 痕跡）が検出された場合は相殺せず単独 failure として記録
      （HIL-NFR-35: 重大 failure を平均点で相殺しない）— 検出 0（FS diff clean）。

## 範囲外（後続）

- full bench（blind judge、mutation kill、skill A/B、実 task scorecard）と S4 採否決定。
- `helix kimi` 委譲面・sandbox template・Proposal Revalidation Gate の実装（S4 admit 後の Forward）。
- 該当 L1/L3 要件の confirm（PO 承認境界）。

## S4 routing（owner 台帳）

| 論点 | S0-S2 owner | S4 後の routing |
|------|-------------|-----------------|
| worker 採否 (HR-FR-HIL-22) | AIM (Claude) / TL | full bench PLAN → admission decision |
| `helix kimi` 委譲面 | SE / TL | L4 Forward 設計（Node supervisor + sandbox contract） |
