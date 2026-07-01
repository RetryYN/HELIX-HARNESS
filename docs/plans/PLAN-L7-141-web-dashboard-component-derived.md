---
plan_id: PLAN-L7-141-web-dashboard-component-derived
title: "PLAN-L7-141 (impl): src/web 中央UI 再実装 — ui-element §2 設計部品から降ろす component-derived 15画面 (L7-102 table-dumper prototype を破棄して再起票)"
kind: impl
layer: L7
drive: fe
status: confirmed
created: 2026-06-24
updated: 2026-06-30
owner: PM (Opus) / PO (人間) / Codex
parent_design: docs/design/harness/L2-screen/screen-list.md
supersedes:
  - PLAN-L7-102-web-dashboard-phase-b
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
agent_slots:
  - role: se
    slot_label: "SE — src/web 中央UI を ui-element §2 部品から component-derived 実装"
  - role: tl
    slot_label: "TL — 実装レビュー (cross_agent / intra_runtime_subagent)"
generates:
  - artifact_path: docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
    artifact_type: markdown_doc
  - artifact_path: src/web/types.ts
    artifact_type: source_module
  - artifact_path: src/web/tokens.ts
    artifact_type: source_module
  - artifact_path: src/web/catalog.ts
    artifact_type: source_module
  - artifact_path: src/web/render.ts
    artifact_type: source_module
  - artifact_path: src/web/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/web.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L2-03-ui-element.md
  references:
    - docs/plans/PLAN-L7-102-web-dashboard-phase-b.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T04:15:00+09:00"
    tests_green_at: "2026-06-30T04:15:00+09:00"
    verdict: approve
    scope: "PLAN-L7-141 resumed for a component-derived read-only static UI slice: 15 L2 screens, L4 token source, no table-dumper, CLI web render surface. L10 UX polish and implemented_screens declaration remain separate frontiers."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/web.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T04:15:00+09:00"
        evidence_path: tests/web.test.ts
        output_digest: "sha256:5a3fd2544c6bfa21ea4f0b57c63e9601e9d53dc4b5162b32e97bda1e248a5352"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T04:15:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T04:15:00+09:00"
        evidence_path: src/web/catalog.ts
        output_digest: "sha256:89751205161e2d91c71128fe514a3fa935570231665619ac89e844e0677407bc"
---

# PLAN-L7-141 (impl): src/web 中央UI 再実装 (component-derived)

## 優先度: 再開 / first component-derived slice landed (Codex 2026-06-30)

PO 決定 (2026-06-26) では **中央UI (画面) は後回し** としていたが、2026-06-30 の L0-L8 completion 監査で
`G-L7PACK.C` / 本 PLAN が L7 frontier として残っていることを確認したため、Codex で first component-derived
slice を再開した。

- 本 PLAN は `status=confirmed`。`src/web` に L2/L4 由来の component registry、L4 token reader、read-only
  static renderer、`ut-tdd web render` CLI surface、`tests/web.test.ts` を追加済み。
- ただし `implemented_screens` はまだ立てない。`screen-impl-pair-freeze` の L10 境界と、impl 後 UX 磨き /
  WCAG 実比検証は別frontierとして残す。
- 配布の active track = [[PLAN-L7-157-distribution-clean-pull]] (R2: 中央UI/画面 = L7-141/146 は配布物に
  **同梱しない** = 画面なしで配布、という過去判断は distribution channel の判断として残る。今回の着地は
  product runtime へ配布を強制しない repo-local L7 implementation slice。
  同系列の serverless 共有 ([[PLAN-L7-146-serverless-readonly-share]]) は引き続き別frontier。

## 0. なぜ再起票か (PO 2026-06-24「画面のほうは一度破棄。使い物にならないから要件を正して再起票」)

`PLAN-L7-102-web-dashboard-phase-b` (confirmed) が生んだ `src/web` は、L2 ui-element §2 の
設計部品 (`HierarchyPulldown` / `HeatmapGrid` / `LayerTemplate` 等) から降ろさず、harness.db を
`SELECT` して汎用テーブル描画する **table-dumper prototype** だった (中央UIの mission=工程管理表を
測れない、[[feedback_central_ui_kouteihyou_mission_not_coverage]])。さらに画面 V-model 鎖
`L2 画面設計 → L4 FE 設計標準 (ui-standard) → L6 機能設計 → src/web 実装 → L10 UX 磨き(impl後)` の
**設計標準 (部品/色) を飛ばして** 実装に着手していた。よって prototype を破棄し、要件 (component-derived +
段階順) を正して再起票する。

> **descent 是正 (PLAN-L4-14、2026-06-24)**: 再利用 FE 設計標準 (部品/色/tokens) は L10 ではなく **L4
> `ui-standard`** に降りる (`data`=DB 設計標準の FE 対応物、document-system-map §1b)。L10 は impl **後**の
> UX 磨き/WCAG 検証 (L2 の右腕ペア)。本 PLAN の前提を §3.3 PLAN-L4-14 の canonical descent 鎖へ更新する。

L7-102 は本 PLAN が `supersedes` で引き継ぐ (errata 規律、.claude/CLAUDE.md / PLAN-L7-89)。
prototype コード (`src/web/*.ts`) と `tests/web.test.ts`、`cli web` command は破棄済 (本 PLAN 着手時に
再生成)。`screen` projection (`PLAN-L7-96`、doc 正本→harness.db read-model) は基盤として保持。

## 1. 要件 (正した前提)

1. **component-derived**: 各画面は L2 ui-element §2 の設計部品から構成する。汎用 table dumper 禁止。
2. **段階順 (V-model、PLAN-L4-14 §3.3)**: `L2 画面設計(G2) → L4 ui-standard (FE 設計標準) → L6 機能設計
   → src/web 実装 → L10 UX 磨き(impl後)`。L4 FE 設計標準 (ui-standard + tokens) 到達まで
   `implemented_screens` を立てない (`screen-impl-pair-freeze` gate が fail-close)。
3. **mission で測る**: 完遂判定は工程管理表 (mission) で行う。描画数や implemented flip の coverage で
   「Phase B 完遂」と名乗らない ([[feedback_coverage_not_substance]])。
4. **read-only + CLI コピー action** (screen-list §3 S5=b)、**画面ID↔URL 1:1** (screen-list §2) は L7-102 で
   妥当だった制約として踏襲。

## 2. Scope (着手時)

- `src/web/` を ui-element §2 部品ベースで再構築 (component catalog → 15 screen composition → static app shell)。
- `cli web render` command 再配線、`tests/web.test.ts` を部品単位で再設計。
- L4 FE 設計標準 (ui-standard、PLAN-L4-14) 到達済み。`tokens.yaml` を唯一のtoken sourceとして読む。
- Serverless共有・runtime配信・L10 UX磨きは本first sliceの外。後続frontierとして残す。

## 3. Acceptance Criteria

- 15 画面が ui-element §2 部品から構成され、table-dumper 描画が無い。`tests/web.test.ts` が固定。
- `screen-impl-pair-freeze` gate green かつ L4 FE 設計標準 (ui-standard) 到達後にのみ `implemented_screens` を宣言。
  本sliceでは L10 未到達のため宣言しない。
- mission (工程管理表) は PM-01 `HeatmapGrid` を含む component composition で表現する。
- `ut-tdd web render --out <path> --json` が静的 read-only HTML を生成する。
- doctor / lint / vitest / plan lint green。review evidence を confirmed 前に記録。

## 4. Schedule

- mode: serial。
- Step 1 ✓ (2026-06-24): **FE 設計標準を authored + cross-reviewed**。当初 `docs/design/harness/L10-ux/`
  に置いたが PLAN-L4-14 で **L4 `ui-standard.md` + `tokens.yaml`** へ re-home (層配置是正、§6)。confirmed 昇格は
  G4 PO サインオフ (L4 基本設計凍結)。
- Step 2: ui-element §2 部品の render 実装。
- Step 3: 画面 → router/app/server 配線 + tests。
- Step 4: review → confirmed。
- Step 2 ✓ (2026-06-30): `src/web/catalog.ts` に L2 §2 由来の共通10部品 + 画面固有40部品 + 15 screen
  composition を実装。
- Step 3 ✓ (2026-06-30): `src/web/render.ts` で read-only static app shell を実装し、`src/cli.ts` に
  `web render` を再配線。副作用はファイル書き出しのみで、UI実行/API呼び出しは持たない。
- Step 4 ✓ (2026-06-30): `tests/web.test.ts` + `tests/cli-surface.test.ts` + typecheck/lint green。

## 5. 壊さない / 再発させない

- table-dumper への逆戻りを `screen-impl-pair-freeze` + 本 AC で塞ぐ。
- `screen` projection (L7-96) と L2 設計群は破棄対象でない (read-model / 設計は保持・要件を正すのみ)。
- L4 FE 設計標準 (ui-standard) を飛ばさない (段階順を破った L7-102 の再発防止)。L10 (UX 磨き) は impl 後。

## 6. FE 設計標準 降下完遂 記録 (2026-06-24、Step 1。PLAN-L4-14 で L4 へ re-home)

L2 ui-element §2 部品から component-derived で FE 設計標準を authored した (read-only + CLI コピー S5=b
前提を維持)。**当初 L10 に置いたが、再利用 FE 設計標準 (部品/色/tokens) は impl 前に要る方式設計/開発標準
のため L4 へ降ろすのが正しい (PLAN-L4-14、`data`=DB 設計標準の FE 対応物、document-system-map §1b)**。
よって substance を L4 へ re-home し、L10 は impl 後の UX 磨き placeholder とした。

**成果物 (PLAN-L4-14 で L4 へ re-home 済)**:
- `docs/design/harness/L4-basic-design/ui-standard.md` — 15 画面の component-derived FE 設計標準 (§4 UI 部品カタログ / §5 画面合成 = table-dumper 不在の確認 / §3.4 a11y WCAG 2.2 AA / §6 visual regression 方針)。
- `docs/design/harness/L4-basic-design/tokens.yaml` — デザイントークン SSOT (FR-30、WCAG 2.2 AA 目標、token 名一意)。
- `docs/design/harness/L10-ux/visual-design.md` — impl 後 UX 磨き/WCAG 検証の placeholder へ reframe。

**review_evidence (intra_runtime_subagent)**:
- reviewer: code-reviewer (claude-sonnet-4-6) / worker: claude-opus-4-8 (PM)。hybrid だが Codex live dispatch は別途任意 (本 land は sonnet cross-review を採用)。
- reviewed_at: 2026-06-24 / verdict: **APPROVE (Critical 0)**。
- scope: component-derived (汎用テーブル 1 枚で代替不能、§5) / L2 grounding (新規部品・画面の発明なし) / token 健全性 (一意・5 状態・WCAG AA 目標) / a11y (WCAG 2.2 AA) / 誠実性 (status=draft、implemented 詐称なし)。
- Important 3 件 解決済: I-1 (`SeverityBadge`=`StatusBadge` alias 明記 + §5 HM-07 に StatusBadge 追記) / I-2 (HM-04・HM-07 の「再実行トリガー」を S5=b の `CopyButton`(CLI 文字列) と明記、L2 §2 脱落の High-Fi 補完) / I-3 (WCAG 2.2 と AC-FR-30-03 の 2.1 不一致 → oracle 更新を visual-design §7 governance carry に列挙)。Minor 4 件 (M-1〜M-4) 反映済。
- 緑証跡: 本 commit 時点で doctor EXIT 0 / plan lint EXIT 0 (検証ログ参照)。

**次工程**: G10 (UX 磨き完了) PO サインオフ → L10 doc `confirmed` 昇格 → Step 2-4 (実装)。
中央UI「フロント編集/送信」方向 (PO 2026-06-24) が確定すれば、本 L10 設計に edit/submit affordance を
back-prop する (read-only 維持の最小形 = 既存 `CopyButton`/`NextActionCard` の指示生成への延長)。
