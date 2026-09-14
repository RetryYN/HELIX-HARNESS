---
schema_version: skill.v1
name: incremental-implementation
skill_type: process
applies_to:
  layers:
    - L5
    - L6
    - L7
  drive_models:
    - Forward
    - Add-feature
    - Refactor
    - Retrofit
---

# incremental implementation（段階実装）

HELIX の L7 実装品質 baseline。対象は type safety、naming discipline、
function design、descent obligation である。PLAN の pair-freeze から trace-freeze までを扱う。
TDD cycle order（test-driven-development skill 参照）を置き換えるものではなく、
各 Red-Green step の内側で適用する rules（規則）である。

## この skill を読む条件

- pair-freeze 後に L7 implementation を開始する
  （L5/L6 design docs が存在し、`helix plan lint` と `helix doctor` が green）。
- code review（`helix review --uncommitted`）が type、naming、design quality issue（設計品質 issue）を指摘する。
- Refactor または Retrofit PLAN が、in-bounds な source changes（範囲内 source 変更）を scope している。

## Descent obligation（降下義務）

すべての L7 source file は、L5 detailed design doc と L6 unit-test design doc へ
trace できなければならない。新しい module を書く前に確認する。

1. `docs/design/L5-<module>.md` が存在し、pair-freeze を pass している。
2. `docs/test-design/L6-<module>.md` が存在し、これから書く test file を参照している。
3. どちらかが無い場合、PLAN は unresolved `requires` を持つ。
   source を書く前に停止し、design gap を解決する。

`helix doctor` は構造 link の存在を確認するが、substance（中身）は確認しない。
coding 前に L5 doc を読み、implementation questions（実装上の疑問）に答えていることを確認する。

## Type safety rules（型安全規則）

- type を narrow できない理由を PLAN-linked comment で説明しない `any` は使わない。
  `// @ts-ignore` も同じ rationale なしでは禁止。
- multi-shape return values には TypeScript discriminated unions を使う。
  `Result<T, E>` pattern の方が明確な場合、`T | null | undefined` は避ける。
- external inputs（parsed JSON、CLI args）には `any` より `unknown` を優先する。
  使用前に type guard で narrow する。
- 各 commit 後に `npm run typecheck` が 0 で終了しなければならない。
  commits をまたいで type debt を貯めない。

## Naming discipline（命名規律）

- Function names は action を表す命令形 verb にする。
  例: `recordGuardrail`、`readPlanFile`、`emitProjectionRow`。
  noun forms（`guardrailRecorder`）は避ける。
- Boolean return values は `is*` / `has*` / `can*` prefixes を使う。
- File names は primary export と一致させる。
  `projection-writer.ts` は `ProjectionWriter` または `writeProjection` を export する。
- source に導入した new terms（新規用語）は、同じ commitで
  `docs/design/helix/L3-requirements/glossary-ssot.md`へ追加する。

## Function design constraints（関数設計制約）

- function の responsibility（責務）は 1 つにする。state を読み、変換し、output を書く function は、
  distinct names を持つ 3 functions に分割する。
- `.helix/` または `harness.db` に書き込む functions は、business logic を同時に計算しない。
  I/O と computation を分離し、unit tests が side effects なしに computation を検証できるようにする。
- Public API surface（exported functions and types）は、tests と callers に必要な最小集合にする。
  internal helpers を export しない。
- function body の推奨最大は 30 lines。それを超える場合は named helper（名前付き helper）を抽出し、
  helper が new concept を表すなら L5 spec に extraction を記録する。

## Incremental commit discipline（段階 commit 規律）

- 各 commit は Red test を Green へ進める
  （または Green を維持したまま refactor する）。
  noise を減らすために複数 feature commits をまとめない。
  Red-commit / Green-commit sequence は監査証跡である（FR-L1-02）。
- stage は explicit files のみ（`git add <file>`、`git add -A` は使わない）。
- commit messages は Conventional Commits に従う。
  `feat(module): description`、`test(module): description`、`refactor(module): description`。

## Trace-freeze checklist（trace-freeze 確認）

- [ ] すべての new source files が paired L5 design doc と L6 test design doc を持つ。
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run lint` が exit 0（Biome check: format + lint）。
- [ ] `npm run test` が 0 で終了し、PLAN-linked rationale の無い `.skip` / `.todo` が残っていない。
- [ ] `helix doctor` exits 0.
- [ ] new terms が L0 glossary に追加されている。
- [ ] PLAN `review_evidence` が trace-freeze commit SHA を参照している。
- [ ] `helix review --uncommitted` が L7 に対する blocking findings を出さない。

## Anti-patterns（避けるパターン）

- paired L5/L6 doc なしに source files を書く。
  `helix doctor` が即時には出せない descent obligation debt を作る。
- 1 つの function で I/O と computation を混ぜる。
  unit tests が file system state に依存し、integration concern になる。
- rationale なしに `// biome-ignore` で formatting rule を黙らせる。
  これらは蓄積し、次の push で CI を壊す。
