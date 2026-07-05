---
plan_id: PLAN-L3-07-requirements-binding-enforcement
title: "PLAN-L3-07 (kind=add-design): 要件定義=決定事項の拘束と安全実装 enforcement 強化"
kind: add-design
layer: L3
drive: fullstack
status: draft
created: 2026-07-05
updated: 2026-07-05
owner: PO (人間) / Claude (Fable)
agent_slots:
  - role: tl
    slot_label: "TL — L0-L3 監査 finding の enforcement 降下設計（lint/gate/config 外部化）レビュー"
  - role: po
    slot_label: "PO — NFR グレード初期値・外部化基準・retention 方針の承認"
generates:
  - artifact_path: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/glossary-ssot.md
    artifact_type: design_doc
  # draft のため Step 5 の Glossary placeholder projection だけを実在 artifact として追加した。各 Step の残成果物
  # （lint 実装 / governance 追補 / NFR グレード表 / config スキーマ）は該当 Step の Forward descent 着地時に追加する。
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/governance/coding-rules.md
  references:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    - docs/plans/PLAN-L7-24-coding-rules-workflow.md
    - docs/plans/PLAN-L7-233-boundary-rule-canonicalization.md
    - docs/design/harness/L3-functional/nfr-grade.md
    - src/lint/coding-rules.ts
    - src/lint/shared.ts
    - src/state-db/refactor-candidate-policy.ts
---

# PLAN-L3-07 (kind=add-design): 要件定義=決定事項の拘束と安全実装 enforcement 強化

## 目的

PO 要求（2026-07-05）「**要件定義が決定事項であり、これに従ってエージェントが安全に実装していく仕組み**」を
機械 enforcement として閉じる。L0–L3 設計監査（2026-07-05、pmo-project-explorer 3 系統）で確認した
既存 enforcement の穴を、既存 confirmed PLAN 群（coding-rules-workflow / module-boundary-rule /
domain-boundary-lint）の**延長**として登録し、Forward descent（L6→L7）で実装する。

前段（L1⟷L2 要求洗い出し → 収束 → L3 確定）は PLAN-DISCOVERY-11 が担う。本 PLAN は
**確定した要件の下流拘束**（要件外実装の遮断・構造品質 gate・調整可能値の外部化）を担う。

## 監査で確認済みの穴（起票根拠、2026-07-05 監査）

1. **循環依存 lint 不在**: module-boundary はカテゴリ間一方向 3 組（lint/runtime/schema、
   `src/lint/shared.ts:251-276`）のみ。import cycle 検出なし（`src/lint/module-drift.ts:13-15` が後続 PLAN へ明示委任）。
2. **複雑度 blocking gate 不在**: `biome.json` は `recommended: true` のみで
   `noExcessiveCognitiveComplexity` は発火しない（正例投入で warning 0 を実測確認済み）。
3. **関数/ファイルサイズは advisory 止まり**: `refactor-candidates`（split-module ≥700 行 / extract-helper ≥120 行）は
   telemetry のみで doctor を fail させない。PLAN 化への closed loop も無い。
4. **境界 matrix の未定義領域**: state-db / cli / doctor 等の主要 module 間は方向未定義（自由 import 可）。
5. **チューニング値の外部化スキーマ不在**: threshold 類は TS 定数（`refactor-candidate-policy.ts` 等）で、
   コード変更なしの調整不可。外部化基準の governance 文書も無い。
6. **NFR グレード表の helix 版不在**: 数値閾値（fast<=120s/default<=600s/full<=1800s、confidence 0.75 等）が
   `pillar-functional-requirements.md` 内に散在し一覧化されていない（harness 側 `nfr-grade.md` 相当が無い）。
7. **データ retention/purge 方針の欠落**: memory/state/projection が append-only・supersede 追記のみで
   削除・保持期限の要件が無い。
8. **Glossary SSoT 実体未整備**: 要件（HR-FR-P7-02）はあるが実ドキュメントが無い。

## スコープ

### IN

- Step 1 — 構造品質 gate 増強（スパゲッティ化防止）:
  `no-circular-dependency` lint 新設（import グラフ DFS、`coding-rules.md` へ rule 追記 + `REQUIRED_RULE_IDS` 登録）、
  `biome.json` へ `noExcessiveCognitiveComplexity` 明示有効化（閾値は coding-rules.md に明記、既存違反は
  baseline grandfather で fail-close 移行）、境界 matrix を architecture §3.1 の全 module へ拡張し
  未定義境界ゼロを module-drift と突合検査。
- Step 2 — チューニング値の外部化: 外部化基準（PO/非エンジニアが調整しうる値・3 回以上出現リテラル・
  環境依存値は config 化）を `coding-rules.md` へ新設し、`REFACTOR_CANDIDATE_THRESHOLDS` 等を
  `.helix/config/*`（schema + doctor 検証付き）へ移す。PLAN-DISCOVERY-11 の観点表閾値・ラウンド上限も同枠。
- Step 3 — helix 版 NFR グレード表: harness `nfr-grade.md` 相当を `docs/design/helix/L3-requirements/` に新設し、
  散在閾値を集約（初期値は現行値を転記、変更は PO 承認）。
- Step 4 — データ retention/purge 方針の要件化: memory/state/DB projection の保持・圧縮・削除を
  NFR/FR として L1/L3 へ追記（L1 追記は PO 起草・承認、charter §3 準拠）。
- Step 5 — Glossary SSoT 実体化: `docs/design/helix/` 配下に glossary を起票し HR-FR-P7-02 を接地。
  用語（HELIX/HBR/HR-FR/HAC 等）に加え、**識別子⇔日本語の対訳表**（関数・コマンド・gate・module 名 →
  日本語名/一行説明）を持つ。L6 関数仕様表（関数 | Signature | pre | post | invariant | oracle）が
  関数単位の日本語説明を既に担っているため、対訳表は L6 表からの projection として重複起草せず参照で束ねる。
  design-language gate の `TECHNICAL_WORD_ALLOWLIST`（現行 33 語）へ語を追加する際は glossary 登録を
  前提条件とする（allowlist と用語集の drift 防止）。
- Step 6 — advisory→PLAN 化 loop の閉鎖: refactor candidate 高信頼度 warn が N 回連続 surface された場合に
  doctor が「未 triage」を actionable として報告する（放置の可視化。blocking 化は Step 1 の gate と役割分担）。

### OUT / 非対象

- PLAN-DISCOVERY-11 の担当領域（L1⟷L2 サイクル本体、gap-check、収束 gate）— 参照のみ。
- CLI 名・ローカル状態ディレクトリ名・配布面の識別子切替（PLAN-M-02 管轄）。
- 既存違反の一括修正（grandfather baseline で段階移行。ratchet は design-language gate と同型）。

## 受入条件

- 各 Step の成果物が「文書化（governance/design）+ 機械検査（lint/doctor/CI）」の対で着地する
  （prose のみの claim 禁止 = PLAN claim discipline）。
- 新 gate は fail-close だが、既存 debt は baseline grandfather で移行し既存 CI green を壊さない
  （導入時点の `harness-check` green を実測 evidence として記録）。
- 外部化した config は schema 検証を doctor に接続し、schema 違反 config で doctor が fail する test を持つ。
- charter §3 境界を守る: L1 追記（Step 4）は PO 起草・承認。AI は L3 以下の起草と実装のみ。
- confirmed 前に review evidence 記録（可能なら別 runtime / model family、単一 runtime 時は
  intra_runtime_subagent）。

## スケジュール

- mode: parallel（Step 1/2/3 は独立。Step 4 は PO 判断待ち、Step 5/6 は軽量で随時）。
- Step 1: 構造品質 gate 増強（serial 内部: rule 文書化 → lint 実装 → baseline → fail-close 接続）。
- Step 2: 外部化基準文書化 + config スキーマ + threshold 移設。
- Step 3: helix 版 NFR グレード表新設（PO 承認で confirmed）。
- Step 4: retention/purge 要件化（PO 起草・承認、AI は L3 降下のみ）。
- Step 5: Glossary SSoT 起票。
- Step 6: refactor candidate 未 triage の actionable 化。

## PO 決定記録（2026-07-05、「OK進めて」）

- **着手順を承認**: Step 2 の外部化基準文書化を薄く先行 → Step 1（構造品質 gate、Codex 委譲候補）→
  Step 3/5 並行。Step 6 は Step 1 の gate 稼働後。
- **Step 4 retention 方針の方向性を確定**: 期限付き物理削除は採用しない。**append-only を維持し、
  supersede 済み entry の compaction（折り畳み）+ アーカイブ移動 + projection rebuild** で運用劣化のみ防ぐ
  （元に戻せない破壊的削除を仕組みに持ち込まない）。この方向で AI が L3 要件案を起草し、PO が承認する。
- レビュー分離: confirmed 昇格レビューは作成側と逆の runtime / model family へ回す。

## S1 進捗メモ（2026-07-05）

- **Step 2 前半完了**: 外部化基準を `docs/governance/coding-rules.md` §外部化基準として文書化
  （3 基準 + 段階〔policy module 分離 → `.helix/config` + schema〕+ 安全境界値の外部化禁止 + telemetry triage 義務）。
  config スキーマ実装と threshold 移設は Step 2 後半（Forward descent）で扱う。
- Step 5 の初期 placeholder artifact として `docs/design/helix/L3-requirements/glossary-ssot.md` を起票した。
- 本 artifact は L0 §10 を単一 SSoT とする projection であり、用語を独自定義しない。
- `HR-FR-P7-02`、L5 `HC-P7`、L6 `detectGlossaryDrift` / `validateContextMapBoundary` への trace を束ね、
  識別子・CLI・gate 名を日本語説明に接続した。
- **Step 1 着地**: 構造品質 gate 増強として `no-circular-dependency` を coding-rule SSoT / `REQUIRED_RULE_IDS`
  に登録し、`src/**/*.ts` の相対 import graph DFS を `coding-rules` hard gate へ接続した。導入時点の既存
  12 cycle は `GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS` で baseline 固定し、新規 cycle のみ fail-close とする。
  Biome `complexity.noExcessiveCognitiveComplexity` は `level: error` で明示有効化し、現行 baseline 閾値
  `maxAllowedComplexity: 187` を `coding-rules.md` に記録した。`DISALLOWED_SOURCE_BOUNDARY_IMPORTS` は
  architecture §3.1 全 module を定義対象に拡張し、`module-drift` が未定義境界 0 を突合する。
  検証: `bun run vitest run tests/coding-rules.test.ts tests/module-drift.test.ts` / `bun run typecheck` /
  `bun run lint` / `bun run src/cli.ts doctor` は green。full Vitest / `test:local` は exec session が結果を
  返さず、実プロセス残存なしを `ps` で確認したため、取得済み green command に含めない。
- まだ confirmed / terminal ではない。runtime 実装、doctor 接続、drift test、review evidence は後続 Step で扱う。

## 壊さない / 再発させない

- 既存 confirmed PLAN（L6/L7/REVERSE の coding-rules / boundary 3 セット）を supersede しない（延長のみ）。
- 新 gate 導入で既存 CI を赤にしない（grandfather 必須）。
- Codex in-flight の作業ファイルに触れない（基準点は HEAD、hybrid commit 協調規則に従う）。
- 旧 HELIX 資産の再確認: 各 Step の設計時に inventory-first（migration 監査 2026-07-04 で閉鎖済みだが、
  該当粒度の概念（coding 規約・glossary 運用）があれば TS/Bun で再実装、bulk import しない）。

## レビュー / 次工程

- 起票根拠 = 本セッション監査（pmo-project-explorer 3 系統、2026-07-05）。所見はチャット報告と本文 §監査で
  確認済みの穴に記録。
- PO は 2026-07-05 に Step 1-3 の着手順と Step 4 retention 方針方向性を承認済み。
- 次 action: Step 2 後半（config schema + threshold 移設）と Step 3（NFR グレード表）を小さく分割して実装する。
  Step 4 の L1 追記は PO 起草・承認が必要なため、AI は L3 以下の案と検査設計までに留める。
- terminal 化は、各 Step の generated artifact、review evidence、green command が揃ってから行う。
