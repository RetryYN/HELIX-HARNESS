# A-137 provider-dispatch 利用不能機能 audit

日付: 2026-06-16

目的: configured だが実際には usable ではなかった provider-dispatch surfaces を列挙し、countermeasures を定義・追跡する。

## 結果

Self-contained な HELIX command surface は usable のまま: `status`、`doctor`、DB maintenance、plan lint、`review --uncommitted`、task classification、skill suggestion、dry-runs、cutover dry-run、handover。

壊れていた surface は live provider dispatch だった:

- `helix codex --execute`
- `helix team run --execute`
- hybrid の live cross-review dispatch

原因:

1. Codex には native command resolution がなく、PATH 上の壊れた wrapper に当たり得た。
2. `team run --execute` は shared provider invocation path ではなく raw member adapter commands を spawn していた。
3. Runtime detection は command-name presence を provider availability と扱っていたため、`hybrid` が false positive になり得た。
4. HELIX provider dispatch は product-owned でなければならないのに、adapter は HELIX wrapper env names をまだ持っていた。

## 利用不能機能マトリクス

| # | 機能 | 原因 | 対策 | 状態 |
|---|---|---|---|---|
| 1 | `helix codex --execute` | bare `codex` が non-spawnable wrapper に resolve され得た。Windows command scripts には shell-safe invocation が必要だった。 | `resolveCodexNativeCommand()` を追加し、`%APPDATA%\\npm\\codex.exe/codex.cmd` を優先し、`HELIX_CODEX_BIN` を尊重し、`.cmd` / `.bat` invocation を安全に wrap する。 | unit、hook-entrypoint、full regression、doctor で verified |
| 2 | `helix team run --execute` | Team execution が shared adapter/native resolution を bypass していた。 | `runCommand` を `buildProviderInvocation(provider, command, args)` 経由に route する。 | fake-provider team execution と full regression で verified |
| 3 | Hybrid cross-review live dispatch | #1 と #2 に依存。 | 両方の provider execution paths を restore し、fake cross-provider team execution を verify する。 | dispatch mechanism verified。live AI task invocation はこの audit では意図的に未実行 |
| 4 | `status` / `doctor` provider availability | Detection が spawnability なしの PATH name presence を使っていた。 | capability probe (`--version`) を使い、provider が実際に spawn できる場合だけ availability を report する。 | provider probes 後にのみ `mode=hybrid` を report する doctor で verified |
| 5 | HELIX runtime env debt | Provider dispatch が HELIX wrapper env names を emit または depend していた。 | `HELIX_CLAUDE_BIN` / `HELIX_CODEX_BIN` を使い、provider execution env から `HELIX_ALLOW_RAW_*`、`HELIX_RAW_*_REASON`、`HELIX_CLAUDE_BIN`、`HELIX_CODEX_BIN` を strip する。 | tests と HELIX-separation search で verified |
| 6 | Native Claude version sort | Mixed-source lexicographic sorting では semver-newest native binary を選ばない可能性がある。 | source ごとに parsed semver で sort する。 | deferred low-priority follow-up |

## 漏れ防止ルール

- `status` が available と報告した provider は、resolved binary が実際に spawn するまで usable と証明されない。
- `helix claude --execute` が動くことは、`team run --execute` が動くことを意味しない。
- Cross-review policy correctness は live dispatch usability を証明しない。
- Countermeasures は targeted tests、full regression、`doctor`、HELIX-separation search evidence が clean になった後にのみ closed とする。

## 現在の実装 evidence

- `src/runtime/adapter.ts` が provider command resolution と invocation を own する。
- `src/runtime/detect.ts` は provider spawnability を使う。
- `src/cli.ts` は single-provider execution と team execution の両方を `buildProviderInvocation` 経由に route する。
- Tests は capability-based detection、Codex override resolution、Windows command-script invocation、provider handover kind、hook wrapper lifecycle、fake cross-provider team execution を cover する。

## 完了した verification

- `bun run typecheck` は pass 済み。
- `bun run lint` は pass 済み。
- `bun run src\\cli.ts doctor` は pass 済み。
- `bun run test` は pass 済み: 81 files、677 tests。
- HELIX-separation search は HELIX-owned runtime/test/handover surfaces で passed。
- `PLAN-L7-68` と handover docs は mechanical handover と explicit handover を区別している。

## 残る carry

- Native Claude version semver sorting は deferred low-priority follow-up のまま。
- real cross-provider `team run --execute` による live AI task execution はこの audit では invoke していない。dispatch mechanism は fake-provider execution tests と provider spawnability probes で cover される。
