---
title: "GitHub execution episode current-location投影単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: QA
plan: docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md
---

# GitHub execution episode current-location投影単体テスト設計

## Oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GHEPL-001 | GH-AC-019 | fresh DBでglobal bootstrapを同時生成し、episode/location fault時はbootstrapを含む全writeをrollbackする | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-002 | GH-FR-021 | typed workflow identity、episode identity、HEAD、owner、contract、event digestをexact一致させる | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-003 | GH-FR-021 | HEAD更新とoutbox ACK後にlocationのrevision／event digestがcurrent projectionへ追従する | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-004 | GH-AC-019 | shared baseを持つ複数active episodeを全件保持し代表一件を生成しない | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-005 | GH-AC-019 | terminal disposition、active／terminal count、canonical episode set digest、global snapshot hashを再計算する | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-006 | GH-FR-021 | location schema／rowにlegacy identity列・値を出さない | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-007 | GH-AC-019 | episode／location全fieldとaggregate／global snapshot／snapshot hash driftを各reasonで拒否する | `tests/github-execution-episode-location.test.ts` |
| U-GHEPL-008 | GH-AC-019 | schema、design catalog、PLAN、freeze digestのpair／trace欠落を拒否する | `tests/l3-g3-freeze-packet-v2.test.ts` |

in-memory `harness.db`だけを使用し、networkとGitHub mutationをunit scopeへ含めない。
