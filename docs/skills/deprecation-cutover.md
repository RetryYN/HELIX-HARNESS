---
schema_version: skill.v1
name: deprecation-cutover
skill_type: process
applies_to:
  layers:
    - L3
    - L4
    - L5
    - L6
    - L7
    - L11
    - L12
  drive_models:
    - Refactor
    - Retrofit
    - Recovery
    - Reverse
---

# Deprecation cutover（廃止 cutover）

HELIX harness で command、module、path、env name、convention を削除または置換するときに、V-model traceability と
`harness-check` green を保つための規律。PLAN が既存 runtime surface を削除または supersede する場合に適用する。

## この skill を読むタイミング

- PLAN が `helix` subcommand、`src/` module、agent、skill pack、environment variable を削除または置換する。
- Drive が Retrofit（incremental strangler-fig replacement）、Refactor（consolidation）、または Reverse
  （cutover 後の back-fill）である。
- `helix doctor` が legacy runtime residue の `asset-drift` finding を報告している。

## Decision checklist（PLAN 起票前）

1. `src/` と `docs/` に動作する replacement がすでに存在するか。landed replacement なしで deprecate しない。
2. reference はいくつ残っているか。`grep -r "<target>" docs/ src/ tests/` を実行する。zero reference が
   cutover exit condition である。
3. target は legacy runtime prefix または legacy vendor path で命名されていないか。`helix doctor` の
   `asset-drift` gate は、登録済み agent、skill、prompt asset 内の legacy runtime command/name/env residue と
   legacy source path で fail する（FR-L1-49）。削除は必須であり任意ではない。
4. replacement が post-cutover で壊れていた場合の rollback path は何か。

## HELIX transition naming contract（移行中の命名 contract）

新しい env name と command は `HELIX_*` prefix を使う（正しい例: `HELIX_ALLOW_RAW_AGENT`）。
`src/cli.ts` の env handling に触れる PLAN は、同じ PLAN 内で残存する legacy-prefixed name を `HELIX_*` へ migrate する。
延期する場合は、明示的な `improvement-backlog.md` entry を記録する。

## Harness internals の strangler-fig phasing

```
Phase 0  old path live; new path exists behind a HELIX_* opt-in flag
Phase 1  new path default; old path warn-deprecated (logged)
Phase 2  old path removed; helix doctor asset-drift is green
Phase 3  deprecation notices / compat shims removed
```

current phase は PLAN `status` と design doc に記録する。commit ごとに 1 phase だけ進める。各 boundary では
`.helix/audit/` に `harness-check`-green evidence record を残す。

## 削除 checklist（L7）

- [ ] `grep -r "<deprecated-identifier>" docs/ src/ tests/` が zero hit を返す。
- [ ] `helix doctor` が zero `asset-drift` finding で pass する。
- [ ] `bun run typecheck` が pass する。dangling type reference を残さない。
- [ ] removed path を参照する test は更新するか、rationale comment 付きで削除する（silent `.skip` は不可）。
- [ ] merge 前に `helix review --uncommitted` evidence を記録する。

## Reverse back-fill obligation（Reverse back-fill 責務）

cutover が design へ back-fill されていない impl を削除する場合、Reverse PLAN（R0→R4、`kind=reverse` で追跡、
`helix plan lint` と `helix vmodel lint` で検証）を開き、何をなぜ削除したかを記録する。Reverse obligation が
open の間は cutover PLAN を `accepted` にしない。descent-obligation contract は、削除されたすべての feature が
design artifact を残すことを要求する。
