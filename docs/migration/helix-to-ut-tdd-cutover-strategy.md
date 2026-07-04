# HELIX to UT-TDD cutover strategy 記録

Date: 2026-06-11
Status: backfilled-current
Owner: Codex TL + PO

Related:

- `docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md`
- `docs/governance/ut-tdd-agent-harness-extraction-plan_v0.1.md`
- `docs/plans/PLAN-M-01-cutover-backfill.md`
- `docs/plans/PLAN-L7-44-harness-db-master.md`
- `docs/plans/PLAN-L7-46-projection-writer.md`

## 1. Current decision の記録

cutover target は UT-TDD-owned execution と state である。

- HELIX は reference source のみである。concepts、labels、historical inventory を供給する。
- executable harness behavior は TypeScript/Bun `src/` 配下の UT-TDD 側が所有する。
- `ut-tdd` CLI と `.ut-tdd/` state は current harness path である。
- `.helix/` と `vendor/helix-source/` はこの product の runtime state ではない。
- HELIX Python files は product code として copy しない。必要な behavior は TypeScript で再実装する。

これは、active cutover work が wave-by-wave code port ではないことを意味する。repository が current UT-TDD path を一貫して記述・検証できるよう、documentation、commands、state projection、audit feedback を backfill する作業である。

## 2. Superseded assumptions の一覧

| Old assumption 旧前提 | Current rule 現行ルール |
| --- | --- |
| HELIX Python modules を UT-TDD package へ copy する | required behavior は TypeScript/Bun `src/` で再実装する |
| HELIX CLI commands を operating path として使う | `ut-tdd` commands を operating path として使う |
| `.helix/` を active state として扱う | `.ut-tdd/` を active generated state area として扱う |
| HELIX fallback を normal operation として保持する | HELIX materials は historical/reference inputs としてのみ保持する |
| cutover を source-module swap として定義する | cutover を docs/config/state/projection alignment として定義する |

legacy command names は historical source または inventory を quote する場合だけ現れてよい。この repository の new work に対する instructions ではない。

## 3. Current cutover state の記録

この repository は new work について、すでに UT-TDD-owned mode にある:

- project rules は `CLAUDE.md`、`.claude/CLAUDE.md`、`AGENTS.md` に分割されている。
- governance documents は TypeScript/Bun を implementation path として指定している。
- roadmap と review checks は UT-TDD CLI/doctor path 経由で動く。
- `harness.db` は audit と feedback signals の local projection target である。
- vendor snapshots は migration context の read-only evidence として残す。

残る cutover loop は projection completeness である。feedback と audit checks が Markdown scans だけに依存せず同じ local database を query できるよう、automation outputs を `harness.db` へ取り込む必要がある。

## 4. Harness DB projection backfill の内容

`harness.db` は、verification band に必要な cutover-facing projections を受け取る:

- `roadmap_rollups`: program-level の band、gate、span、frontier summary。
- `roadmap_band_coverage`: program band ごとの covered/parked/uncovered status を持つ row。
- `roadmap_gate_progress`: roadmap gate ごとの span confirmation status を持つ row。
- `review_evidence_registry`: PLAN ごとの review evidence metadata。

これらは deterministic projections である。source は repository documents と generated evidence のままであり、`.ut-tdd/harness.db` は rebuild できる。

## 5. Verification definition の定義

cutover backfill は、以下がすべて成立したときに complete とする:

- `ut-tdd doctor` が active roadmap drift または handover drift を報告しない。
- `db rebuild` が roadmap と review evidence projection tables を作成する。
- projection tests が idempotent rebuild behavior と verification/cutover bands の concrete rows を証明する。
- この document が current work に対して HELIX runtime path、Python port、`.helix/` state dependency を指示しない。

## 6. Rollback and recovery の方針

この cutover は destructive data migration を実行しない。

- documentation changes は commit で revert できる。
- `.ut-tdd/harness.db` は repository sources から rebuild できる。
- new projection tables は append-only schema additions であり、`db rebuild` により populate される。
- projection quality が regress した場合は、source documents を truth として保持し、DB rows を gate decisions に使う前に projection writer を修正する。

## 7. Completion evidence の記録

completion evidence は以下に記録する:

- `tests/projection-writer.test.ts`
- `src/schema/harness-db.ts`
- `src/state-db/projection-writer.ts`
- `.ut-tdd/handover/CURRENT.json`
- `docs/handover/session-handover-2026-06-11-cutover-db-projection.md`
