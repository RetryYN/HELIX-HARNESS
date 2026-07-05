---
description: 作業を machine-checkable な PLAN step に分解する（requirement 単位、parallel/serial marker 付き）
argument-hint: "<feature or task description>"
judgment_core: v1
---

task を verifiable step を持つ HELIX PLAN へ分解する。`planning-and-task-breakdown` と
`gate-planning` skill を使う。判断規律（inventory-first・代替案・falsifiable AC）の正本は
`docs/skills/judgment-core.md`（判断コア SSoT）。

Target: $ARGUMENTS

authoring 前に既存の `docs/plans/` を確認する。overlap する新規 PLAN を作るより、既存 PLAN の拡張を優先する。
design doc が必要な requirement ごとに 1 PLAN とし、複数 requirement をまとめない。

Produce:

1. **Decomposition** — V-model unit-test-design 粒度の step にする。各 step は 1 つの design-doc section、
   または 1 つの `src/` module + その test に対応する。named file のない "implement feature X" は大きすぎるので分割する。
2. **§工程表 schedule** — 各 step に `[並列]` または `[直列]` を付ける。`[直列]` step は serialization reason
   （file_conflict / downstream_dependency / shared_state）を cite する。少なくとも 1 つの review step が必要である。
3. **Acceptance criteria** — PLAN の FR または layer gate に接続し、それぞれを falsifiable check にする。
   検証する `helix` command を明記する。
4. **Dependencies** — `requires` / `parent` は既存 doc を指す。

`helix plan lint`（schedule + dependency existence）で validate し、`helix doctor` が exit 0 であることを確認する。
`.claude/CLAUDE.md` の PLAN Rules schema に従って authoring する。
