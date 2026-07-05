---
plan_id: PLAN-DISCOVERY-11-l1-l2-elicitation-cycle
title: "PLAN-DISCOVERY-11 (kind=poc): L1⟷L2 要求洗い出しサイクル — 画面(mock)で要求を洗い出す反復前段 + 収束 gate → L3 ハンドオフ"
kind: poc
layer: cross
workflow_phase: S1
scrum_type: design-spike
drive: fe
status: draft
created: 2026-07-04
updated: 2026-07-05
owner: PO (人間) / Claude (Opus)
parent_design: docs/design/harness/L1-requirements/screen-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — L1⟷L2 要求洗い出しサイクルの Discovery 境界と S1/S4 判断条件を整理する"
  - role: tl
    slot_label: "TL — Forward front-end (L00-L06-design-phase §L2=L1 フェーズ分離) との整合・収束 gate を既存 G1 exit に接続する PoC レビュー"
  - role: po
    slot_label: "PO — elicitation cycle の入口/出口・AI gap-check 境界 (charter §3) の承認、収束『切る』の最終宣言主体"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。設計成果 (forward/L00-L06-design-phase 追記 §L1⟷L2 cycle +
  # 収束 gate 仕様 + AI gap-check contract) と、それを enforce する consistency lint (src/lint) は本文 §スコープ参照。
  # 規範確定 (concept/requirements 先行) + Forward descent 着地時に generates へ追加する。
dependencies:
  parent: null
  requires: []
  references:
    - docs/process/forward/L00-L06-design-phase.md
    - docs/design/harness/L1-requirements/screen-requirements.md
    - docs/design/harness/L2-screen/README.md
    - src/workflow/design-elicitation.ts
    - src/lint/screen-impl-pair-freeze.ts
---

# PLAN-DISCOVERY-11 (kind=poc): L1⟷L2 要求洗い出しサイクル

## 目的

PO 理想「**画面を作って要求を洗い出す**、で〈切ったら〉**要件定義（L3）へ進む**」を Forward 前段の
first-class な工程として設計する。これは新 mode ではなく **Forward front-end（L0→L1→L2→[収束]→L3）の
精緻化**である。canonical `forward/L00-L06-design-phase.md:51` は既に **「L2 画面 = L1 のフェーズ分離」
（画面要求 → 要求/要件 L1→L3 上流、画面詳細 → L5）** と認識しており、本 PLAN はその往復を
**明示的な反復ループ + 収束 gate + AI gap-check** として formalize する（発明ではなく既存萌芽の formal 化）。

charter §3 の人-AI 境界を一切崩さない: L1/L2 は**人が直接作成**（mock=最後の直接関与）、L3 は **AI 起草・人は承認のみ**。

## 確定した設計判断（PO、2026-07-04）

- **AI 関与度 = gap-check のみ**: 人が画面(L2 mock)と要求(L1)を書く。AI は「mock にあるが要求に無い / 要求に
  あるが mock に無い」不整合・欠落を検出して surface するだけ（起草・確定はしない）。charter §3 厳守。
- **収束『切る』= 機械 gate + 人の宣言**: L1↔L2 の被覆一致・宙に浮いた要求ゼロ・L2⟷L10 mock ペア存在を
  consistency lint で機械判定し green を必要条件に、最終 freeze は人が宣言（既存 **G1 exit** の PO サインオフに接続）。

## スコープ

### IN — 工程設計（Forward front-end 精緻化）
- **L1⟷L2 反復ループの明示化**: 1 ラウンド = 「L2 mock 更新 ⟷ L1 要求(BR/screen-req/FR-L1)更新」。
  mock が新要求を露出 → L1 back-prop（`screen-requirements.md` §trace / business-requirements 反映）→ mock 再描画、
  を bounded に回す。各ラウンドの変更を change-log/trace 化し back-prop を記録（`forward-convergence.ts` の
  back-prop 統制と整合、宙に浮いた別フローを作らない）。
- **AI gap-check contract**: 人フェーズに read-only の gap-check を配線。出力 = ①mock⟷要求の双方向欠落一覧、
  ②不整合（画面 ID ↔ screen-req ↔ FR-L1 の trace 断絶）、③L2⟷L10 mock ペア未整備。**提案のみ・確定しない**。
- **収束 gate 仕様（既存 G1 exit の拡張）**: 「L1⟷L2 相互整合・安定」を機械判定する必要条件を G1 exit
  （現行「5 sub-doc confirmed + L1↔L14 OT ペア孤児 0 + BR/画面/機能 trace 整合」）へ 1 条件追加する形で接続。
  green + 人サインオフ → L3 へ baton carry（AI が L3 FR+AC を起草開始）。

### IN — enforcement（設計が確定したら Forward descent で実装）
- L1↔L2 consistency lint（`src/lint/`）: screen-requirements 15 画面 ↔ L2 screen-list/flow/ui-element の
  被覆双方向一致、dangling 要求ゼロ、L2⟷L10 mock ペア存在を検査。既存 `screen-impl-pair-freeze.ts` の近縁として
  設計（再発明しない）。fail-close は G1 gate に接続、baseline debt は grandfather。
- gap-check の CLI/hook 結線点（read-only、人フェーズ支援）。

### OUT / 非対象
- **新 mode を作らない**（modes/ は Forward 以外。本件は Forward 前段）。
- AI が L1/L2 を起草・確定しない（charter §3、gap-check の read-only を厳守）。
- L3 以降の自動化（既存 Forward 本線、本 PLAN は L3 ハンドオフ点までを設計）。
- design-bottomup（backend 起点 FE derive、`design-elicitation.ts`）とは入口が別。greenfield 前段が本 PLAN の対象で、
  bottom-up と混同しない（合流点のみ参照）。

## 規範整合（上位正本先行）

`process/modes/README.md` の規範ルール「規範変更は concept/requirements（上位正本）先行 → docs/process へ反映」に従う。
本件は Forward 本線 front-end への追記のため、確定前に **concept v3.1 / requirements v1.2 の該当節（L1/L2/G1）へ
trace seed を通す**（本 draft は提案。confirmed 昇格前に上位正本の追補要否を TL/PO 判定）。

## 受入条件
- Forward front-end の L1⟷L2 反復ループ・AI gap-check・収束 gate が `forward/L00-L06-design-phase.md`（+ 必要なら
  上位正本）に矛盾なく記述され、charter §3 境界（人=L1/L2、AI=L3 起草）を破らない。
- 収束 gate が既存 G1 exit を回帰させず 1 条件追加として接続。gap-check は read-only（確定権を持たない）。
- consistency lint は設計確定後の Forward descent で実装し stale-edge を作らない（generates は着地時追加）。
- doctor / lint / plan lint green。confirmed 前に review evidence 記録（可能なら別 runtime / model family）。

## スケジュール
- mode: serial（設計 → 規範整合 → enforcement 実装の順、各独立着地）。
- Step 1: L1⟷L2 反復ループ + AI gap-check contract + 収束 gate 仕様を `forward/L00-L06-design-phase.md` 追記案として設計（TL）。
- Step 2: 上位正本（concept/requirements）への trace seed 要否を判定・反映（PO 承認）。
- Step 3: consistency lint を Forward descent（L6→L7）で実装（既存 screen-impl-pair-freeze を参照）。
- Step 4: gap-check の read-only 結線。
- Step 5: 検証 → review → G1 exit 接続確認 → confirmed。

## S1 進捗メモ（2026-07-05）

- Step 1 の TL 提案は本 PLAN 本文の §目的 / §スコープ / §受入条件として整理済み。
  具体的には「L1⟷L2 反復ループ」「AI gap-check は read-only」「収束 gate は既存 G1 exit の必要条件追加」
  という 3 点を設計案として固定した。
- ただし `docs/process/forward/L00-L06-design-phase.md` / `docs/process/gates.md` への正本反映は、
  上位正本（concept / requirements）への trace seed 要否を PO/TL が判定してから行う。現時点で
  canonical process doc を更新して confirmed と主張しない。
- consistency lint 実装、gap-check CLI/hook 結線、G1 exit への fail-close 接続は Step 2 承認後の Forward descent
  対象であり、S1 draft のまま current completion evidence へ混ぜない。
- 次 action: PO が Step 2 の `trace seed required / not_required` と、S2/S3/S4 へ進めるかを判断する。

## 壊さない / 再発させない
- charter §3 の人-AI 境界を越えない（AI が L1/L2 を確定しない）。
- 既存 G1 exit / L2⟷L10 mock ペア設計（IMP-039）を回帰させない。
- 新 mode を増やさない（Forward 前段の精緻化に限定、mode ecosystem を撹乱しない）。
- generates 実在物のみ規約を守り relation-graph stale-edge を作らない。

## レビュー / 次工程
- 実装（consistency lint 等）は設計確定後・Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: PO 対話（2026-07-04）「画面を作って要求を洗い出す→切ったら要件定義」。既存萌芽 = `forward/L00-L06-design-phase.md:51`
  「L2 = L1 フェーズ分離」。関連 = [[upstream-helix-reconciliation]]（screen 設計連鎖 gap は PLAN-L7-323 で L3/L6 降下側を扱う）。
