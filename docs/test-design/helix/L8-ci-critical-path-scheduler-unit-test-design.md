---
title: "CI Critical-path Scheduler単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: Codex / QA
plan: PLAN-L7-707-ci-critical-path-scheduler
parent_design: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md
pair_artifact: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md
---

# CI Critical-path Scheduler L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CISCHED-001 | obligation保存 | 入力Verification Planと出力DAGのobligation exact setが一致する | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-002 | critical path | class/resource barrier適用後の最終groupからcritical path／makespanを再計算する | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-003 | artifact identity | expected identity欠落とwrong HEAD/platform/lockfile/toolchain/input/output digestを個別拒否する | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-004 | resource safety | exclusive stateをlease/fenceなしに並列化しない | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-005 | fallback | stale/unknown telemetryでrequired obligationを維持した既定DAGへfallbackする | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-006 | bounded execution | quota／stale HEADを拒否し、先行failure時の未開始heavy cancel exact setを返す | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-007 | artifact reuse | exact identity一致時だけsetup/build artifactをreuseする | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-008 | plan digest | 同一入力から同一plan digest、配置変更で異なるdigestを返す | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-009 | runtime context | runner OS／CPU／memory／timeout不整合を拒否し、backpressureをconservative fallbackへ送る | `tests/ci-critical-path-scheduler.test.ts` |
| U-CISCHED-010 | phase dependency | global/releaseからlocal/boundaryへの逆向きdependencyを拒否する | `tests/ci-critical-path-scheduler.test.ts` |

mutationはobligation削除、dependency edge削除、artifact identity一項目変更、lease/fence欠落、telemetry時刻超過、quota超過を
個別に注入する。wall-clock短縮だけではgreenにせず、required obligation exact setとresource safetyを同時に検証する。
