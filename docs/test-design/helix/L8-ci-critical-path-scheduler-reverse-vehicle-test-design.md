---
title: "CI critical-path scheduler Reverse vehicleテスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-31
updated: 2026-08-31
owner: Codex / QA
plan: PLAN-REVERSE-707-ci-critical-path-scheduler
pair_artifact: docs/plans/PLAN-REVERSE-707-ci-critical-path-scheduler.md
---

# CI critical-path scheduler Reverse vehicleテスト設計

本設計は実装schedulerの性能や挙動を先行承認しない。Reverse vehicleの存在、Forwardとの双方向参照、
実測前のcompletion claim拒否だけを検証し、実装oracleはForward PLANとR0〜R4へ残す。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CISCHED-RV-001 | V-pair | pair_artifact欠落または逆向き参照不一致をPLAN lintで拒否 | tests/plan-artifact-existence.test.ts |
| U-CISCHED-RV-002 | 双方向reference | Forward／Reverseの片側参照欠落をbackfill gateで拒否 | tests/backfill-pairing.test.ts |
| U-CISCHED-RV-003 | completion境界 | Forward mergeとR0〜R4実測前のcompletion claimを拒否 | tests/post-merge-plan-status.test.ts |
