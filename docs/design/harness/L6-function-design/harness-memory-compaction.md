---
layer: L6
sub_doc: function-spec
status: draft
freeze_blocking: false
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-56-harness-memory-compaction.md
---

> **L6 contract marker**: `compactMemory(input: CompactMemoryInput, deps: MemoryDeps & CompactionDeps) => CompactMemoryResult` は unit-test 粒度の contract。pre: layer は `harness` | `project`。post: U-MEMC-001..004 の oracle が全て green のときだけ合格。invariant: compaction 前後で `listMemory` / `surfaceMemory` / `findByKey` の観測結果は不変（意味論を変えない物理整理のみ）。

# ハーネスメモリ compaction — 機能設計

## §1 範囲

`.helix/memory/{harness,project}.jsonl` は append-only + `supersedes` 論理上書きのため、
superseded entry と parse 不能行が物理的に無制限蓄積する（PLAN-L6-56 §0）。本設計は
**superseded chain と破損行を除去して active entry のみへ書き直す deterministic compaction**
を定義する。メモリ意味論（supersede 規則・secret 拒否・surface budget）は変更しない。
LLM による要約・マージは行わない（deterministic 整理のみ）。

## §2 関数契約

| 関数 | 契約 |
|---|---|
| `compactMemory(input, deps)` | input = `{ layer, dryRun?: boolean }`。active entry（= `readActive` と同一の生存判定）だけを createdAt 昇順で temp file へ書き出し、`rename` で atomic 置換。実行前に `<layer>.jsonl.bak-<timestamp>` backup を必ず作成。返り値 = `{ layer, kept, removedSuperseded, removedDamaged, backupPath, applied }`。`dryRun=true` は件数のみ返し file を変更しない（`applied=false`）。 |
| `memoryCompactionAdvice(entries)` | 純関数。`{ total, superseded, damaged, ratio }` を返し、`total >= 200` または `superseded 比率 >= 0.5` のとき `recommend=true`。doctor / status の warning surface（compaction 推奨）に使う。閾値は exported policy const（`MEMORY_COMPACTION_THRESHOLDS`）。 |

## §3 Runtime 挙動

- CLI: `helix memory compact [--layer harness|project] [--dry-run]`（第一段は手動発火のみ。
  自動発火は導入しない — 判断: 書換えを伴う操作は human-visible な明示発火に限る）。
- audit: 実行ごとに `.helix/logs/memory-compaction.jsonl` へ
  `{ at, layer, kept, removedSuperseded, removedDamaged, backupPath, dryRun }` を追記する。
- fail 挙動: temp write / rename 失敗時は元 file を変更せず error を返す（fail-close、
  部分書き込み状態を残さない）。backup 作成失敗時は compaction 自体を中止する。
- doctor: `memoryCompactionAdvice` が recommend の場合に warn（block しない）。

## §4 Test oracle 設計

後続 L7 実装 PLAN で test 新設と同時に pair test-design（L7-unit-test-design.md）へ oracle 行を宣言する
（oracle-test-trace gate: 宣言 oracle は test citation 必須のため、宣言は実装スライスと同時に行う）。Covered by `tests/memory-compaction.test.ts`:

- U-MEMC-001: superseded chain（A ← B ← C）を含む layer の compaction 後、file には
  active entry のみが残り、`listMemory` / `findByKey` / `surfaceMemory` の結果が前後で deep equal。
- U-MEMC-002: parse 不能行は removedDamaged として除去され、件数が返り値に一致する。
- U-MEMC-003: `dryRun=true` は file と mtime を変更せず件数のみ返す。backup 作成失敗を注入すると
  compaction は中止され元 file が不変。
- U-MEMC-004: `memoryCompactionAdvice` は閾値未満で `recommend=false`、
  total>=200 または superseded 比率>=0.5 で `recommend=true`（境界値を含む）。
