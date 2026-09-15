---
title: "Luna worker model registry単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / QA
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-639-luna-worker-model-registry.md
pair_artifact: docs/design/helix/L6-function-design/luna-worker-model-registry.md
---

# Luna worker model registry単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-LUNA-001 | registry exact identity／price／effort | Luna・公式価格・xhighが一致し、Terra historical priceも保持 | `tests/model-registry.test.ts` |
| U-LUNA-002 | Codex T1 routing | worker routeがLuna以外ならfail | `tests/tier-router.test.ts` |
| U-LUNA-003 | proposal team projection | T1 memberがLuna／xhigh以外ならfail | `tests/team-launch-policy.test.ts` |
| U-LUNA-004 | standard effort resolver | current workerがLuna／xhigh以外ならfail | `tests/model-effort.test.ts` |
