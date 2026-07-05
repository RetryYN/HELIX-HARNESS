---
plan_id: PLAN-L3-10-message-catalog-externalization
title: "PLAN-L3-10 (add-design): 文言外部化 — 人間向け prose のメッセージカタログ化 FR を L3 に追加する"
kind: add-design
layer: L3
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "既存 FR-L1 機能エリア (config 外部化・requirements-binding) の延長として文言カタログ FR を additive に追加する。machine-surface-language ルールと外部化基準の既存意味は変更しない。"
owner: Claude (Fable)
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - machine-surface 固定と prose カタログ化の境界設計"
  - role: docs
    slot_label: "DOCS - 対象文言インベントリと日本語プロース整合"
generates:
  - artifact_path: docs/plans/PLAN-L3-10-message-catalog-externalization.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - docs/governance/coding-rules.md
    - src/config/requirements-binding.ts
    - src/lint/coding-rules.ts
  references:
    - docs/plans/PLAN-L3-08-message-catalog-externalization.md
    - docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
    - docs/plans/PLAN-L7-158-refactor-detector-precision-and-policy-extraction.md
    - docs/plans/PLAN-L7-159-policy-sidecar-extraction-sweep.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T06:18:00+09:00"
    tests_green_at: "2026-07-06T06:18:00+09:00"
    verdict: approve
    scope: "HR-FR-P9-04 と HAT-P9-04 を L3/L12 に追加し、人間向け prose の message catalog 化と machine-surface 固定境界を確認した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: lint
        command: "bun run helix plan lint"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T06:18:00+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:dbe091509df7d341548bb71a86cd99e9dfe54dafe0b50585b9d7468edc776fb4"
---

# PLAN-L3-10 (add-design): 文言外部化 — メッセージカタログ FR の追加

## 実装確認（PO 指示 2026-07-06）

本 PLAN は archive では閉じず、L3/L12 への FR/HAT 追加が完了した事実に合わせて confirmed とする。
文言カタログの runtime 実装は下流 L4-L7 PLAN で扱うが、本 add-design の受入範囲は満たしている。

## 目的（PO 要求 2026-07-06「要件定義時に外部化などでの文言の差し替え自由度の向上」）

既存の外部化パイプライン（`.helix/config/requirements-binding.yaml` + zod 検証、PLAN-L3-07 /
L7-158 / L7-159）は**チューニング数値**に限定されており、CLI・doctor・要件文書の**人間向け
prose 文言**はソースコード（`src/cli.ts` 等）へインライン埋め込みのままである。
本 PLAN は「人間向け prose 文言のカタログ外部化」を FR として L3 に追加し、
文言差し替え（日本語化の段階是正、consumer 別文言、表記統一）をコード変更なしで行える
自由度を要件として確定する。

## 設計方針（境界の先鋭化）

- **machine surface は対象外で固定**: `machine-surface-language` ルール（CLI/doctor/lint/JSON/env の
  ASCII 安定トークン `OK`/`violation`/`warning` 等）はカタログ化しない。トークンは機械契約であり、
  差し替え自由度の対象は**人間が読む prose のみ**とする。この境界を FR の受入条件に明記する。
- **段階導入**: 既存文言の一括カタログ移行（bulk migration）はしない。baseline/grandfather 方式
  （coding-rules / oracle-test-trace と同型）で「新規文言はカタログ経由、既存はインベントリ化して
  段階移行」とする。
- カタログの schema 検証・欠落キー fail-close・未使用キー検出を要件に含める
  （requirements-binding の zod 方式を踏襲）。

## スコープ

### Step 0 — inventory（serial、着手前必須）
- 旧 HELIX repo（`RetryYN/ai-dev-kit-vscode`）にメッセージカタログ / i18n / 文言テンプレート機構が
  無いか照合し、採否を記録する（inventory-first）。
- `src/cli.ts` ほか人間向け文言の埋め込み箇所を棚卸しし、対象文言の規模を確定する。

### Step 1 — FR 起草（serial）
- pillar-functional-requirements.md へ文言カタログ FR（machine-surface 除外境界・schema 検証・
  段階導入方式・欠落キー fail-close を AC に含む）を追加する。

### Step 2 — 受入テスト設計（serial）
- L3 acceptance test design へ対応 AT を追加する（カタログ差し替えで CLI prose が変わり、
  機械トークンが不変であることを oracle 化）。

### OUT / 非対象
- L4 以降の設計・実装（FR confirmed 後の降下 PLAN で行う）。
- 既存文言の一括移行（段階導入の baseline 設定のみ）。
- 多言語対応（i18n 一般化）。現時点の要件は「差し替え自由度」であり、locale 切替は将来要件として
  parking する。

## 受入条件
- FR が pillar-functional-requirements.md に追加され、`helix plan lint` / `helix doctor` exit 0。
- FR の AC に machine-surface 除外境界が明文化されていること。
- L3 acceptance test design に対応 AT が存在すること。
- confirmed 化の前に review evidence を記録する。

## スケジュール
- mode: serial。Step 0 inventory → Step 1 FR 起草 → Step 2 AT 設計 → レビュー → confirmed。

## 壊さない / 再発させない
- `machine-surface-language` ルールの検査対象・トークン集合を変更しない（人間向け prose との
  境界を曖昧にしない）。
- 外部化基準（coding-rules.md）の「数値チューニング値」既存規定を書き換えず、文言カタログを
  別節として追加する。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| メッセージカタログ (message catalog) | 新規 | 人間向け prose 文言の外部ファイル正本。machine-surface トークンは対象外 | 導入層 L3、FR confirmed 時に back-merge |

## §7 機能要求更新 (FR registry delta)

本 PLAN が文言カタログ FR を 1 件追加する（activation 後の Step 1 で ID 採番・登録）。
既存 FR の意味変更なし。
