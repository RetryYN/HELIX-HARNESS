---
title: "DevOS distribution instruction authority機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
plan: docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md
parent_design: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
pair_artifact: docs/test-design/helix/L8-distribution-devos-instruction-authority-unit-test-design.md
---

# DevOS distribution instruction authority機能設計

`AGENTS.md`と`CLAUDE.md`は毎sessionのproject instruction authorityとして、正式配布先
`RetryYN/HELIX-HARNESS-DevOS`と旧`RetryYN/HELIX-HARNESS-OS`のcompatibility input-only境界を同じ意味で返す。

`analyzeRuleDrift`は両project正本へcurrent identityとcompatibility markerを要求し、片面欠落をfail-closeする。
`.claude/CLAUDE.md`は両project正本を参照するruntime adapterであり、配布authorityを複製しない。

本sliceはinstruction authorityだけを所有する。runtime、CLI、setup、doctor、generated consumer outputの移行は
Issue #942の後続原子PRへ残し、tag、publish、remote cutoverを実行しない。
