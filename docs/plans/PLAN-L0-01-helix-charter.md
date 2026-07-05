---
plan_id: PLAN-L0-01-helix-charter
title: "PLAN-L0-01: HELIX 企画書 起票工程"
kind: charter
layer: L0
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
agent_slots:
  - role: po
    slot_label: "PO — HELIX 企画の最終判断・G0.5 サインオフ"
generates:
  - artifact_path: docs/design/helix/L0-charter/helix-charter_v0.1.md
    artifact_type: design_doc
dependencies:
  parent: null
  requires: []
  blocks:
    - PLAN-L1-06-helix-solo-conversion
  references: []
# 訂正 (2026-06-28): 旧 blocks=PLAN-L1-01-business-requirements は harness の confirmed
# team 版 L1 PLAN を誤参照していた (HELIX の L1 work でない)。HELIX solo 化は既存 L1 を
# 検証修正 + re-freeze する駆動 hub PLAN-L1-06-helix-solo-conversion が担うため、ここへ repoint。
# G0.5 は review-only/judgment gate。charter (kind=charter) は review_evidence 必須対象
# (design/impl/add-*) ではないため test-green 証跡は持たない。PO サインオフは status=confirmed
# + §3 Step 5 + §4 DoD で記録 (2026-06-28、人間 PO 承認)。
---

# PLAN-L0-01: HELIX 企画書 起票工程

## §0 本 PLAN の役割

HELIX（超個人開発システム）の L0 企画書（`kind=charter`）を起票・確定し、**G0.5（企画→要求）**を通す工程。HELIX-HARNESS を土台に、HELIX を `area=helix` として L0 から積み直す Forward の起点。既存ハーネス（HELIX 移行前の harness）の確定済み L1–L7 資産は壊さず上に積む。

## §1 入力 (上流からの baton)

- PO のビジョン（chat、2026-06-28）: 超個人開発システム／3 層自律境界（人=L0–L2＋L2モック・L3承認／AI=L4 以降フル自動）／10 本柱 P0–P9／横断原則（単一ルール・共有記憶）。
- 旧 HELIX gap 分析（`RetryYN/ai-dev-kit-vscode` dogfood / v3 charter）: 簡素化で落ちていた安全自走 4 機構（駆動 workflow＋forward_return／DB 収束／pair_closure／連続走行＋fresh-session）と escalation 境界を復元。
- 土台: HELIX-HARNESS（V モデル工程・gate・state DB 実装済み、L7 実装スプリント進行中）。

## §2 出力 (本 PLAN で確定)

- 企画書: `docs/design/helix/L0-charter/helix-charter_v0.1.md`（`artifact_type=design_doc`）。
- G0.5 通過（背景・目的・スコープが L1 へ trace 可能／内部矛盾なし）。

## §3 工程表 (Step + 進捗)

### 手順 1: [直列] PO ビジョン収集 (Step 1)
> 直列理由: downstream_dependency — ビジョン確定が後続 Step 2〜5 の前提になるため。
chat で「何を／誰のため／変える点」を確定（超個人開発・3 層自律境界・10 本柱 P0–P9・横断原則）。
- 進捗: ✅ (2026-06-28)

### 手順 2: [直列] 旧 HELIX gap 分析 (Step 2)
> 直列理由: downstream_dependency — Step 1 のビジョンを基準に旧 HELIX と差分照合するため。
旧 HELIX（`RetryYN/ai-dev-kit-vscode` dogfood / v3 charter）を精読し、落ちていた安全自走機構を P0/P9 新設・P1/P3/P5/P8 強化として復元。
- 進捗: ✅ (2026-06-28)

### 手順 3: [直列] charter v0.1 起草 (Step 3)
> 直列理由: downstream_dependency — Step 1〜2 の確定内容を企画書へ統合するため。
`helix-charter_v0.1.md` を起票（背景・目的・自律境界・P0–P9・横断原則・非目標・成功方向・L1 trace seed）。
- 進捗: ✅ (2026-06-28)

### 手順 4: [直列] レビュー (Step 4 / review: 内部矛盾チェック + L1 trace 可能性確認)
> 直列理由: downstream_dependency — Step 3 の起草物に対し G0.5 の 2 条件を検証するため。
`helix plan lint` / `helix doctor` ＋ PO レビューで「内部矛盾なし」「背景・目的・スコープが L1 へ trace 可能」を確認。
- 進捗: ✅ (2026-06-28、plan lint GREEN / doctor GREEN)

### 手順 5: [直列] G0.5 PO サインオフ (Step 5)
> 直列理由: downstream_dependency — Step 4 の検証通過後に PO が確定するため。
PO 承認 → status=confirmed。L1 要求起票（P0–P9 → BR-*/NFR-*）へ baton。
- 進捗: ✅ (PO 承認 2026-06-28、status=confirmed)

## §3.1 実装計画 (各節をどう埋めるか)

| 節 | 情報源 | 方法 |
|----|--------|------|
| §1 背景 | PO chat + 旧ハーネス現状 | 個人開発委譲・オーケストレーション弱点を背景化 |
| §2 目的 | PO ビジョン | 自律境界＋自己保守を目的文に |
| §3 自律境界 | PO 確定 (3 層) | V モデル L0–L14 を人/AI で区切る表 |
| §4 スコープ P0–P9 | PO 10 本柱 + gap 分析 | 各柱を高レベル一行、機構詳細は L1 carry |
| §5 横断原則 | PO (単一ルール・共有記憶) | `rule-drift` の全エージェント一般化として記述 |
| §6 非目標 | PO 確定 | チーム/上流自動化/既存作り直し/CC メモリ依存を除外 |
| §7 成功方向 | PO 代表シナリオ | 定量 KPI 強制せず方向性のみ |
| §8 L1 trace seed | 本 charter §8 | P0–P9 → BR-*/NFR-* 接続点を列挙 |

## §4 完了条件 (DoD / Definition of Done)

- [x] 企画書 `helix-charter_v0.1.md` が存在し非空。
- [x] 背景・目的・スコープ（P0–P9）が記載され、L1 業務要求/非機能要求へ trace できる構造（charter §8 trace seed）。
- [x] 内部矛盾・ロジック破綻がない（G0.5 fail 条件②に該当しない、PO 確認 2026-06-28）。
- [x] `helix plan lint` GREEN ／ doctor GREEN（ソース exit 0、バイナリ exit 0。l6-fr-coverage バイナリ負債も同 PR で修正）。
- [x] G0.5 PO サインオフ → status=confirmed（2026-06-28）。

## §5 carry / 次工程 (L1) への引き継ぎ

- P0–P9 と横断原則を L1 で BR-*/NFR-* に分解。HELIX は harness の Forward L0 再入として既存 L0/L1 を検証修正・re-freeze する（駆動 hub = `PLAN-L1-06-helix-solo-conversion`、team→solo + P0–P9）。
- W モデル（AI エージェントシステム = V を 2 回）適用要否を L1 で判定（charter §9）。
- 非目標（チーム運用／人の L3 以降直接記述・L4 介入／既存 L1–L7 作り直し／CC 内蔵メモリ依存）を L1 制約として継承。
