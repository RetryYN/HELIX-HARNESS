# A-106 - L5 完了再レビュー (2026-06-09)

## 対象範囲

L5 detailed-design 完了状態 (PLAN-L5-00..08、4 つの L5 sub-doc、L5↔L8 pair) の再レビュー。目的は、A-104/A-105 の G5 freeze が substance basis で成立するか確認すること (coverage ≠ substance: ID coverage だけでなく doc 本文を読む)。

## 方法

- pmo-sonnet による 4 つの L5 sub-doc + L8 + ADR-007 の substance review (ID 数ではなく内容を読む)。
- 機械チェック: `bun run typecheck` (0)、`bun run src/cli.ts doctor` (0)、対象 `plan lint`、full `npx vitest run`。

## 判定

L5 substance は **レビュー時点では conditional pass → 下記修正後 pass** と判断した。4 つの sub-doc (physical-data / module-decomposition / internal-processing / if-detail) には実体ある設計内容がある: physical schema (field type / required / default / zod)、dependency direction を持つ module boundary、DbC pre/post/invariant、D-CONTRACT external contracts、ADR-007 safety boundary。宣言済み carry (SubDoc zod / planIdSchema regex / adapter detail zod / edge docstring transcription) は明示的な defer であり、under-design ではない。

## この再レビューで修正した所見

1. **Critical — L8 doc body mojibake.** G5 freeze commit (14792e3) 自体が UTF-8→CP932 の誤読により L8 doc body (§0-§4 + Appendix A) を破損していた。English §5 GWT と Appendix B だけが無事だったため、cross-agent review は読めない日本語 narrative を見落として通過した (coverage≠substance の見落とし — structure/ID は確認したが full readability は未確認)。CP932 reversal は lossy (79 replacement chars) だったため、破損前 version (7d6449c) から clean Japanese body を復元し、無事だった English §5/Appendix B と confirmed frontmatter を結合した。Encoding-fix note を doc header に追加した。
2. **Critical — stale "SQLite 不採用" in PLAN-L5-00-master §1 triage.** Contradicted ADR-007 (SQLite adopted as projection/feedback DB) and the master's own Appendix B (PLAN-L5-08). Updated to: file-based JSON/YAML as SSoT + `.ut-tdd/harness.db` SQLite as projection/feedback DB (ADR-007, ADR-001 defer released). Cleanup-principle (MUST) violation resolved.
3. **Important — stale DoD checkboxes.** §5 DoD に、実際には完了済みの未チェック項目が 2 つ残っていた: L8 pair_artifact connection (現在は L8 §5 による GWT-level) と G5 readiness (A-104 で freeze 済み)。どちらも evidence reference 付きでチェック済みにした。

## 残 carry (freeze blocker ではない)

- IMP-004: `src/schema/frontmatter.ts` の `planIdSchema` は layered/drive IDs をまだ受け付けない。`plan lint` hard-enforcement 前に解消すべき blocking dependency 付き carry として宣言済み (physical-data.md §4)。Cross-series ID pattern (DISCOVERY/REVERSE/RECOVERY/M) は physical-data §4 にまだ列挙されていない。
- L6/L7 carry: function signatures、pseudocode、resolver/scoring/regex、TypeScript + vitest の実体化。
- Security/PO: authentication と secret-management の運用判断は human/security approval carry のまま。

## テスト状態

- typecheck 0, doctor 0, `plan lint` (L5-00 / L5-08) OK.
- `npx vitest run`: 既存 failure 7 件。この再レビューで導入したものはない (2 つの doc edit を stash し、HEAD で再現して確認): `tests/runtime-hook-entrypoints.test.ts` (bun subprocess spawn `status: null`, environment flakiness) + `tests/l6-fr-coverage.test.ts` (PO parallel WIP, untracked)。2 つの doc edit は markdown-only で、どの test からも import されない。

## 注記

Working tree には parallel PO edits がある (L6 FR-unit-coverage: function-spec.md / concept / L7-unit-test-design.md / doctor / l6-fr-coverage)。この再レビューが触れたのは docs/test-design/harness/L8-integration-test-design.md と docs/plans/PLAN-L5-00-master.md だけであり、commit はその 2 つだけを stage する必要がある。
