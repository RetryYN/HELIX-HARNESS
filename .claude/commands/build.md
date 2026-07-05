---
description: frozen spec/test design に基づき HELIX quality gate 付きで実装する
argument-hint: "<PLAN id or feature>"
---

HELIX では incrementally に実装する。`incremental-implementation` skill を使う。

Target: $ARGUMENTS

Entry condition: PLAN の `parent_design` が既存の L5/L6 design を指し、`helix plan lint` が通り、
paired L6 test design が存在すること。いずれかが欠ける場合は停止し、design gap を先に解消する
（design より先に実装しない）。

trace-freeze 前の quality baseline:
- Types: `any` は 0。external input には `unknown` + type guard を使う。external value への non-null
  assertion は使わない。引数は 3 個以下（超える場合は typed options object）。
- Naming/structure: local convention に合わせる。file は kebab-case。function は 1 responsibility。
  deep nesting より early return を優先する。
- Descent obligation: すべての新規 file は PLAN の `generates` list 経由で L5/L6 artifact へ trace する。
  新規 file が出た場合は `generates` を更新する。

Gate sequence:

```
implement → bun run typecheck → bun run lint → bun run test
→ helix doctor → helix review --uncommitted → record evidence in .helix/audit/
→ trace-freeze → review → accept
```

`helix review --uncommitted` は skip しない。trace-freeze 前に必要な evidence を生成するためである。
active PLAN scope の内側に留まる。
