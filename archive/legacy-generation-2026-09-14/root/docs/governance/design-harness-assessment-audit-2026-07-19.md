# デザインハーネス現状評価監査（2026-07-19）

status: recorded
kind: governance-audit
author: claude (PO レビュー入力の裏取り)

## 目的

PO から提示された「デザインハーネスは入っているか」評価（3 段階整理＋改善提案）を、
リポジトリ実体（src / tests / docs/design）に対して裏取りし、正式記録として残す。

## 裏取り結果（リポジトリ実体との照合）

### 1. ドキュメント設計ハーネス = 実装済み（確認：一致）

- 設計文書 metadata（`defines` / `read_first` / `done_when` / pair artifact / required gate、
  未知参照・重複 ID・循環・stale 依存の検出）は runtime 実装あり:
  - `src/schema/document-agent-metadata.ts`
  - `src/lint/document-agent-metadata.ts`
  - `src/runtime/document-agent-metadata-apply.ts`
  - tests: `tests/document-agent-metadata.test.ts` / `-apply` / `-integration`
- 文書二時点比較（semantic diff: 文書追加削除・ID 追加削除・見出し単位変更・
  改版履歴なし本文変更・不正パス/重複/解析失敗）も runtime 実装あり:
  - `src/adapters/document-semantic-diff-fs.ts`
  - `src/runtime/document-change-report.ts`
  - tests: `tests/document-semantic-diff.test.ts` / `tests/document-change-report.test.ts`
- 注: L6 設計書 `document-agent-metadata-contract.md` / `document-semantic-diff.md` 自体は
  `status: draft`（実装が先に存在し、設計書が追随中）。

### 2. 画面・プロトタイプハーネス = 設計済み・実装前（確認：一致）

- L2 工程境界（L2 モック ↔ L10 UX 検証の pair）は `docs/design/helix/L2-screen/` で `status: confirmed`。
- `screen-applicability-prototype.md`（全 PLAN の `prototype_required`/`not_applicable` 分類、
  操作可能プロトタイプ、9 状態、walkthrough 証跡、no-UI 判定の stale 化）は `status: draft`。
- runtime 側は `src/lint/screen-impl-pair-freeze.ts` 等の部分的 lint のみで、
  ScreenApplicabilityGate・prototype manifest・walkthrough receipt のエンジンは未実装。

### 3. 要求翻訳・設計リファクタリングハーネス = 設計段階（確認：一致）

- `requirement-translation-obligation.md`（原文→原子要求→capability→service→domain object→
  template/oracle/gate の Design Obligation Graph、Template Gap Issue→Reverse 戻し）は `status: draft`。
- `design-refactoring-domain-model.md`（外部化 / 共通化 / object化 / 意味に基づくrename /
  Redesign / Retrofit、意味比較 = 入出力・副作用・failure・状態遷移・consumer・oracle）も `status: draft`。
- 対応 runtime モジュールは未実装（L5/L6 設計とテスト設計が先行）。

## 結論

デザインハーネスは「設計文書管理・設計論理」は runtime として実在し強い。
一方「画面・操作・ユーザー検証・実装差分」を自動で回す部分は優れた設計書がある段階で、
runtime 化が次の主戦場である。

## 改善方針（PO レビューより採録）

1. **DESIGN HARNESS を第一級サブシステムへ統合**: 現在別 slice の
   画面適用性 / prototype / 要求翻訳 / design obligation / domain model /
   design refactor / 文書metadata / semantic diff / 可視化を
   Product Design（プロダクト設計）/ Experience Design（体験設計）/ System Design（システム設計）/ Design Governance（設計統治）の4層へ統合する。
2. **共通 ID 体系（Design Registry）**: `requirement_id` / `screen_id` / `flow_id` /
   `interaction_id` / `state_id` / `component_id` / `design_token_id` / `content_id` /
   `analytics_event_id` / `service_id` / `domain_object_id` / `acceptance_id` を一つの registry で結線。
   現状は要求・service・domain object・oracle の結線が強く、画面上の interaction/状態と
   バックエンド契約・計測イベントの結線が弱い。screen → interaction → permission → command →
   API → domain event → analytics event → acceptance test を一本で追えるようにする。
3. **UI 設計用ドメインモデルの追加**: 既存 Domain Model Catalog（DDD/BE 寄り）とは別に
   Page（画面）/ User Flow（利用者動線）/ Navigation（遷移）/ UI Component / Interaction Pattern / Design Token /
   Content Block / Feedback / Empty State / Error Recovery / Permission State / Analytics Eventの型を持つ。
4. **9 状態の拡張と組合せ爆発の抑制**: デバイス・入力手段・ロール・言語・データ量・
   利用回次・低速回線・競合更新・destructive action・undo/rollback の軸を追加し、
   全件掛け算ではなく risk-based pairwise で fixture を選定する。
5. **設計↔実装 drift 検査**: prototype↔画面要求、prototype↔実装 DOM/component、
   design token↔CSS、interaction↔E2E、content↔表示文言、analytics↔実装発火、
   accessibility 要求↔実測、の差分検出を semantic diff の次段として追加。
6. **要求原子化のやりすぎ防止**: 原子要求に親となる利用者目的・業務価値・対象シナリオ・
   前後文脈・成功結果・判断理由を必ず残し、User Task / Business Outcome 単位の親グラフを併存維持。

## 実装優先順位

1. DESIGN-HARNESS 統合 capability registry
2. ScreenApplicabilityGate の runtime 化
3. 実行可能prototype manifestとwalkthrough receipt
4. screen / interaction / state ↔ 要件・API・test の結線
5. prototype ↔ 実装 drift detector
6. Design Refactor / Domain Model 自動化

着手時は inventory-first・L6 descent 規則（L6 設計 + test-design pair なしに L7 起票しない）に従い、
既存 draft 設計書の confirm を先行させる。
