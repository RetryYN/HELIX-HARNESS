---
title: "Luna native spawn admission単体テスト設計"
layer: L8
artifact_type: unit-test-design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-640-luna-native-spawn-admission.md
pair_artifact: docs/design/helix/L6-function-design/luna-native-spawn-admission.md
---

# テスト観点

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-LUNASPAWN-001 | native guard | `agent_type`なしのLuna／xhigh／task本文を許可 | `tests/agent-guard.test.ts` |
| U-LUNASPAWN-002 | exact pair | modelまたはeffortの相違・欠落を拒否 | `tests/agent-guard.test.ts` |
| U-LUNASPAWN-003 | boundary | unknown role、task欠落、bulk spawnを拒否 | `tests/agent-guard.test.ts` |
| U-LUNASPAWN-004 | tool contract | model／reasoning effort欠落を拒否 | `tests/tool-contract.test.ts` |
| U-LUNASPAWN-005 | CLI hook | 実entrypointでも同じpass／block | `tests/agent-guard.test.ts` |
| U-LUNASPAWN-006 | policy provenance | current Luna／xhighをversion／digestへ束縛 | `tests/codex-native-worker-policy.test.ts` |
| U-LUNASPAWN-007 | stale policy | version相違／digest driftを拒否 | `tests/codex-native-worker-policy.test.ts` |
| U-LUNASPAWN-008 | caller override | Sol／highをpolicy identityへ昇格しない | `tests/codex-native-worker-policy.test.ts` |
| U-LUNASPAWN-009 | freeze propagation | L6設計のcatalog登録とG3 digestを同時に固定 | `tests/l3-g3-freeze-packet-v2.test.ts` |
