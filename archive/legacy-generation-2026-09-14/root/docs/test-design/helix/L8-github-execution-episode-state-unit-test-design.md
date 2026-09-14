---
title: "GitHub execution episode状態単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: QA
plan: docs/plans/PLAN-L7-576-github-execution-episode-state.md
pair_artifact: docs/design/helix/L6-function-design/github-execution-episode-state.md
---

# GitHub execution episode状態単体テスト設計

## Oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GHEP-001 | GH-FR-021 | identity完全入力だけを`admitted`として受理し、episode／workflow／source／owner／contractの各欠落を拒否する | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-002 | GH-FR-022 | 正規遷移だけがrevisionとsequenceを進め、順序飛越し、stale revision、sequence重複を拒否する | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-003 | GH-FR-021 | active resourceの別episode重複とstable resource差替えを拒否し、同一episodeのHEAD更新をevent化する | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-004 | GH-FR-022 | event後、outbox後、projection前のfaultをrollbackし、三tableへ部分行を残さない | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-005 | GH-FR-022 | 同一idempotency keyの同一payloadだけを再利用し、異なるpayloadをconflictにする | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-006 | GH-FR-022 | terminal disposition、closure receipt、main read-after、DB replay、lease解放を要求し、PO decision欠落とterminal後transitionを拒否する | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-007 | GH-FR-022 | event／outbox replayだけを一致させ、persisted projection改変とevent sequence gapを拒否する | `tests/github-execution-episode-state.test.ts` |
| U-GHEP-008 | GH-AC-019／020 | schema、design catalog、PLAN、freeze digestのpair／trace欠落をgovernance gateで拒否する | `tests/l3-g3-freeze-packet-v2.test.ts` |

testはin-memory `harness.db`を使い、Node transactional boundaryだけがwriteする。Python、GitHub API、network、
実repository mutationはunit scopeへ含めない。
