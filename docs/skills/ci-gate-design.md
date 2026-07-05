---
schema_version: skill.v1
name: ci-gate-design
skill_type: verification
applies_to:
  layers:
    - L7
    - L8
    - L9
    - L11
    - L12
  drive_models:
    - Forward
    - Add-feature
    - Refactor
    - Recovery
---

# CI gate design（CI gate 設計）

`harness-check` CI gate と、その背後にある `helix doctor` checks の設計・運用を扱う。
automated quality gate を追加・変更・debug する場合に適用する
（FR-L1-05 static gate、FR-L1-18 cross-detection 集約）。

## この skill を読む条件

- PLAN が新しい `helix doctor` check または `src/lint/` rule を追加する。
- `harness-check` が red で、root cause を見つける必要がある。
- layer transition（pair-freeze / trace-freeze / accept）の gate condition を設計する。

## harness-check composition（構成）

canonical CI run は `harness-check`。CI を pass させるために sub-gate を skip しない。

```
bun run typecheck      # tsc --noEmit、error 0
bun run lint           # Biome check (format + lint)、violation 0
bun run test           # Vitest。bun test ではない（5s sync timeout が flaky）
helix doctor          # every harness gate を fail-close
```

`bun run lint` は Biome を check mode（format + lint）で実行する。
`biome lint` だけでは formatting を検査しない。push 前は必ず `bun run lint` を使う。

## new gate が必要な条件

defect class が mechanically detectable で、現在 review をすり抜けている場合に gate を追加する
（substance gap、orphaned PLAN、roster↔guard drift など）。
まず `src/plan/lint.ts` と `src/doctor/` が既に cover していないことを確認する。
overlapping gates は false-confidence を作る（PLAN dependency existence は plan-governance が既に検査する）。
`src/lint/` または doctor surface に実装し、`helix doctor` へ wire し、pass path と fail path の両方を
exercise する Vitest test を追加する。

## gate は coverage だけでなく substance を見る

coverage check（ID present、link exists、count matches）は content の正しさを証明しない。
gate 設計時は、その gate が *absent* または *wrong* artifact を検出できるか、
missing ID だけを検出するのかを問う。absence では fail-close を優先する
（absence-blindness は descent gap の root cause）。

## Failure response protocol（失敗時の対応）

1. **full** output を読む。`| tail` しない。truncation は root error を隠す。
2. failed sub-gate（typecheck / lint / test / doctor）を特定する。
3. source の root cause を直す。PLAN-linked rationale なしに `// biome-ignore`、
   `// @ts-ignore`、`.skip` で黙らせない。
4. push 前に full sequence を local で再実行する。
5. fail すべき check が pass した場合は、`improvement-backlog.md` entry を起票し PLAN を開く。
   false-green は gate defect である。

## 環境 note（Windows / Linux parity）

- hook execution 中、`CLAUDE_PROJECT_DIR` は repo root を指していなければならない。
- runner `PATH` に `System32` が無い場合、runtime hook entrypoints は status null で fail する。
  code regression と扱う前に `helix doctor` で確認する。

## 新規 gate 向け L8 integration test design

- [ ] Gate が発火し、result row を `harness.db` に記録する。
- [ ] seeded violation fixture で gate が exit 1 になる。
- [ ] clean fixture で gate が exit 0 になる。

L8 design は L5/L6 design doc と pair にして `docs/test-design/` 配下へ記録する。
これは L7 Vitest unit tests とは別物である。
