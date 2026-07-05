---
plan_id: PLAN-L3-09-requirements-omission-guards
title: "PLAN-L3-09 (add-design): 要件漏れガード — 中間層 FR 横断カバレッジと inventory-first 実施証跡の FR を追加する"
kind: add-design
layer: L3
drive: agent
status: archived
decision_recorded_at: 2026-07-06
decision_owner: PO (人間)
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "descent-obligation / l6-fr-coverage / drive-model-passage の既存 gate 群を additive に補完する検査 FR の追加であり、既存 gate の判定意味・baseline は変更しない。"
owner: Claude (Fable)
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - 既存 gate 群 (descent-obligation / l6-fr-coverage) との責務重複排除"
  - role: qa
    slot_label: "QA - 中間層カバレッジと証跡 gate の fail-close oracle 設計"
generates:
  - artifact_path: docs/plans/PLAN-L3-09-requirements-omission-guards.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - src/lint/descent-obligation.ts
    - src/lint/l6-fr-coverage.ts
    - src/lint/fr-roadmap-coverage.ts
    - docs/skills/judgment-core.md
  references:
    - docs/plans/PLAN-L6-35-descent-obligation.md
    - docs/plans/PLAN-L7-22-fr-unit-coverage.md
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
---

# PLAN-L3-09 (add-design): 要件漏れガード FR の追加

## 2026-07-06 closure

本 PLAN は 2026-07-06 PO 指示「completion-decision-packet を 0 件まで潰す」により
current completion scope から archived とする。中間層 FR 横断カバレッジと inventory-first
実施証跡 FR は現行 scope では追加せず、L3 要件 / L3 acceptance への追補も行わない。

将来、要件漏れガード FR を再開する場合は新規 add-design PLAN で inventory、FR/AC、
責務境界、review evidence を取り直す。この archive record を FR confirmed または実装完了として扱わない。

## 目的（PO 要求 2026-07-06「要件定義時の機能漏れ・デグレ対策」）

機能漏れ対策の既存 gate 群は厚い（l1-l2-consistency の双方向被覆、l6-fr-coverage の
FR⇔L6⇔unit 検査、descent-obligation の下降義務・実装先行検出、drive-model-passage の
モード合流証跡）が、棚卸しで 2 つの残ギャップが確認された:

1. **中間層の横断カバレッジ不在**: FR カバレッジ検査は L6 偏重で、L3→L4→L5 の中間層で
   FR が「途中まで降りて止まっている / 途中の層で取りこぼされた」ことを一括検出する gate が無い。
2. **inventory-first の実施証跡不在**: inventory-first は judgment-core v1 の原則として明文化され
   marker 整合は機械検査されるが、「要件起草時に実際に既存資産・旧 HELIX repo を照合したか」の
   証跡を要求する gate が無く、原則の遵守が起草者の自律に依存している。

本 PLAN はこの 2 つを検査 FR として L3 に追加する。

## 設計方針

- **既存 gate の再実装をしない**: 中間層カバレッジは `descent-obligation` の chain データと
  `l6-fr-coverage` の FR registry 読取（`loadFrDocs`）を再利用し、集計軸（層別 FR 到達率）だけを
  追加する。責務重複は TL レビューで排除する。
- **証跡は構造化フィールドで要求**: inventory-first 証跡は PLAN frontmatter の構造化フィールド
  （照合先・照合日・採否結論）として要求し、prose 記述を証跡とみなさない
  （`coding ≠ substance` の claim discipline と同方向）。
- **baseline/grandfather 方式**: 既存 PLAN への遡及適用はせず、新規 add-design / design PLAN
  から fail-close とする。

## スコープ

### Step 0 — inventory（serial、着手前必須）
- 旧 HELIX repo（`RetryYN/ai-dev-kit-vscode`）に要件カバレッジ検査 / 起草前チェックリスト機構が
  無いか照合し、採否を記録する（inventory-first。本 PLAN 自身が最初の適用例となる）。
- descent-obligation / l6-fr-coverage / fr-roadmap-coverage の出力データ構造を確認し、
  中間層集計に不足する情報を特定する。

### Step 1 — 中間層 FR 横断カバレッジ FR 起草（serial）
- 「各 FR が L3→L4→L5→L6 のどの層まで降りているかを層別に集計し、停滞 FR を可視化・
  新規停滞を fail-close する」検査 FR を追加する。

### Step 2 — inventory-first 実施証跡 FR 起草（serial）
- 「add-design / design PLAN は inventory 照合証跡（照合先・照合日・採否）を構造化フィールドで
  持たなければ confirmed に到達できない」検査 FR を追加する。

### Step 3 — 受入テスト設計（serial）
- L3 acceptance test design へ両 FR の AT を追加する（停滞 FR の検出 / 証跡欠落 PLAN の block を
  oracle 化）。

### OUT / 非対象
- L4 以降の設計・実装（FR confirmed 後の降下 PLAN で行う）。
- 既存 confirmed PLAN への証跡遡及要求（baseline で除外）。
- 「実際に検索したか」の行動テレメトリ収集（証跡フィールドの真正性は review evidence 側で担保し、
  行動監視は導入しない）。

## 受入条件
- 両 FR が pillar-functional-requirements.md に追加され、`helix plan lint` / `helix doctor` exit 0。
- 中間層カバレッジ FR の AC に「既存 gate との責務境界（何を検査しないか）」が明文化されていること。
- L3 acceptance test design に対応 AT が存在すること。
- confirmed 化の前に review evidence を記録する。

## スケジュール
- mode: serial。Step 0 inventory → Step 1 → Step 2 FR 起草 → Step 3 AT 設計 → レビュー → confirmed。

## 壊さない / 再発させない
- descent-obligation / l6-fr-coverage の既存 baseline・判定意味を変更しない（additive な集計軸のみ）。
- 証跡フィールドの形式検査を prose 検査にしない（構造化フィールドの presence + 参照実在で判定）。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| 中間層カバレッジ (mid-layer coverage) | 新規 | FR の L3→L6 層別到達集計。停滞 FR の可視化と新規停滞の fail-close | 導入層 L3、FR confirmed 時に back-merge |
| inventory 証跡 (inventory evidence) | 新規 | 要件起草時の既存資産・旧 HELIX 照合の構造化証跡（照合先・照合日・採否） | 導入層 L3、FR confirmed 時に back-merge |

## §7 機能要求更新 (FR registry delta)

本 PLAN が検査 FR を 2 件追加する（Step 1 / Step 2 で ID 採番・登録）。既存 FR の意味変更なし。
