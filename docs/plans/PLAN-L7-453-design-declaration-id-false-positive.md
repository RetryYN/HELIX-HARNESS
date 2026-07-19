---
plan_id: PLAN-L7-453-design-declaration-id-false-positive
title: "PLAN-L7-453 (troubleshoot): design-declaration ID 検出の技術用語誤検知修正"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals: ["po_directive:2026-07-14 /goal 全システム監査 (3回独立調査 + Codex worker gpt-5.6-terra 検証で確定)"]
created: 2026-07-14
updated: 2026-07-14
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    worker_model: codex-gpt-5.6-terra
    reviewer_model: codex-gpt-5-intra-runtime-review
    reviewed_at: "2026-07-20T08:45:00+09:00"
    tests_green_at: "2026-07-20T08:50:00+09:00"
    verdict: pass
    scope: "技術用語 allowlist、正当な未宣言 ID 検出、DB rebuild 後の doc-path 別 drift を独立レビュー。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/design-declarations.test.ts tests/plan-lint.test.ts tests/ddd-tdd-rules.test.ts", runner: vitest, scope: targeted, exit_code: 0, completed_at: "2026-07-20T08:50:00+09:00", evidence_path: docs/plans/PLAN-L7-453-design-declaration-id-false-positive.md, output_digest: "sha256:eac4c2d671368c24733f1201efb72171f01bcc1b237316e7b413f72aab60ce84" }
      - { kind: typecheck, command: "npm run typecheck", runner: npm, scope: repository, exit_code: 0, completed_at: "2026-07-20T08:50:00+09:00", evidence_path: docs/plans/PLAN-L7-453-design-declaration-id-false-positive.md, output_digest: "sha256:8aa23401265a522f6a9d04e6bdaaa1855432965d44e5721ea70b1c0e037d4011" }
backprop_decision: not_required
backprop_decision_reason: "既存の design-declaration drift 検出器 (PLAN-L7-397 で実装済み) の正規表現バグ修正であり、L1-L6 の要求・設計意味は変更しない。"
owner: TL (Codex/Claude)
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot実装責任と回帰証跡の閉鎖"
  - role: se
    slot_label: "SE — bodyDefinitionIds() の ID 検出正規表現に技術用語除外ロジックを追加"
  - role: qa
    slot_label: "QA — UTF-8 等の一般技術用語を含む design doc での回帰テスト"
generates:
  - artifact_path: docs/plans/PLAN-L7-453-design-declaration-id-false-positive.md
    artifact_type: markdown_doc
  - artifact_path: src/schema/design-declarations.ts
    artifact_type: source_module
  - artifact_path: tests/design-declarations.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-453 (troubleshoot): design-declaration ID 検出の技術用語誤検知修正

## 0. 背景 (PO `/goal` 全システム監査で発見)

PO 指示「全システム監査して不足があれば起票すること。3回調べてTeraで検証すること」に基づき、Claude 主監査
(1回) + 独立 subagent 監査2回 (pmo-project-explorer / code-reviewer) の計3回の独立調査を実施し、
Codex worker (gpt-5.6-terra) で adversarial 検証した結果、確認済み (real gap) と判定された defect。

`src/schema/design-declarations.ts` の `bodyDefinitionIds()` (91-110行付近) は本文中の
`\b[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b` パターンにマッチする文字列を「未宣言の design declaration ID」
候補として拾う。この正規表現は一般的な技術用語 (例: `UTF-8`) にもマッチしてしまい、
`spec.defines` に登録されていない技術用語が `undeclared_definition` (severity=error) の誤検知 finding を
生成する。

実例: `docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md:270` の本文に `UTF-8` という語が
含まれており (`tools/verify_files.py` の説明文中)、これが誤って ID 候補として検出される。Terra 検証で
`analyzeDesignDeclarations()` を対象文書へ直接適用し `undeclared_definition: UTF-8` を実際に再現確認済み。

この error finding は `src/state-db/projection-writer.ts:3616-3624` で `design-declaration-undeclared_definition`
kind の finding として DB へ投影され (次回 projection rebuild 時)、`src/state-db/current-location.ts:9507-9511`
の `design_declaration_drifts` カウントへ反映される。drift が 1 件以上あると `current-location.ts:9575` の
`needs_reverse` 判定に寄与する (Terra 検証による訂正: drift 単独では必ず `completion_boundary: contradicted`
/ drive=Recovery になるわけではない。`contradicted` は L14 終端 claim と L7 open work の併存時のみ発生する。
ただし drift は `needs_reverse` 経路を誤って引き起こす実害がある)。

現時点の `.helix/harness.db` (read-only 照会) では該当 finding はまだ投影されていない (次回 projection
rebuild で顕在化する)。既存 `tests/design-declarations.test.ts` (9 tests) は全て pass するが、
`UTF-8` のような一般技術用語を含む body での false positive を防ぐ回帰テストが無い。

## 1. 実装範囲 (Scope)

- `src/schema/design-declarations.ts` の ID 検出ロジック (`bodyDefinitionIds()` および関連正規表現) に、
  既知の非 declaration 技術用語 (`UTF-8` 等のエンコーディング名、バージョン番号表記など) を除外する
  ガードを追加する。除外方式は次のいずれか (実装時に選定):
  (a) 既知の技術用語 allowlist で除外、
  (b) declaration ID の命名規約 (プロジェクト内 prefix、例えば大文字3文字以上の prefix + 数値 suffix) に
      合致しないパターンを除外する、
  (c) 両方の組み合わせ。
- 誤検知を減らしつつ、既存の正当な undeclared_definition 検出力を落とさないこと (regression fence)。

## 2. 受入条件 (Acceptance Criteria)

- [x] `docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md` を含む既存 design doc 群を
      `analyzeDesignDeclarations()` にかけて `UTF-8` 由来の `undeclared_definition` finding が 0 件になる。
      (2026-07-14 直接実行で確認: 単体ファイル解析で `undeclared_definition` finding に `UTF-8` を含む
      ものは0件)
- [x] `tests/design-declarations.test.ts` に `UTF-8` 等の技術用語を含む body での false-positive 回帰テストを追加し green。
- [x] 既存の正当な undeclared_definition 検出 (実際に未宣言の declaration ID がある場合の検出) が
      regression しないことをテストで確認する。
- [x] `npx --no-install vitest run --project fast tests/design-declarations.test.ts` green (10 tests)。
- [x] `helix current-location --json` の `design_declaration_drifts` が本 doc 由来では 0 になることを
      DB projection rebuild 後に確認した。13件はすべて `docs/design/helix/L3-requirements/hybrid-rebaseline-v0.5.0-collision.md` 由来で、本 doc は `docDependencies` に含まれない。

## 2a. 実装状況 (2026-07-14 追記)

本 PLAN 起票 (draft) の直後、Codex が同一 working tree 上で独立に (または本 draft PLAN を検知して)
`e0664fda fix(schema): ignore technical terms in declaration scan` を commit し、上記スコープを実装した。
`src/schema/design-declarations.ts` の `bodyDefinitionIds()` に `nonDeclarationTerms` allowlist
(`UTF-8`/`UTF-16`/`UTF-32`/`ISO-8601`/`RFC-3339`) を追加し、`tests/design-declarations.test.ts` に
「`UTF-8` 等は誤検出しないが `R-UNDECLARED` のような正当な未宣言IDは引き続き検出する」回帰テストを追加した。
Claude (本 PLAN 起票者) が cross-runtime review として実装を確認: `bunx vitest run
tests/design-declarations.test.ts` green (10/10)、`analyzeDesignDeclarations()` を対象 doc に直接適用し
`UTF-8` 由来の finding が消えたことを実測確認済み。2026-07-20 に DB projection rebuild と独立レビューを完了し、status を confirmed とした。

## 3. 範囲外 (Out of scope)

- `design_declaration_drifts` を利用する current-location / drive-model 判定ロジック自体の変更 (別関心)。
- SessionStart hook のハング疑義 (別件、本 PLAN の範囲外。harness memory 参照)。

## 4. 追跡 (Trace)

- 起点: PO `/goal` 全システム監査 (2026-07-14)。3パス独立調査 + Codex worker (gpt-5.6-terra) adversarial 検証で確定。
- 実装: `src/schema/design-declarations.ts` `bodyDefinitionIds()`。
- 検出経路: `src/state-db/projection-writer.ts:3616-3624` → `src/state-db/current-location.ts:9507-9511`。
- 既存テスト: `tests/design-declarations.test.ts`。

## 5. 用語更新

用語更新なし。
