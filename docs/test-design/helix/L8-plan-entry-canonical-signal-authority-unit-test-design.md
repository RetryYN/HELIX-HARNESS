---
title: "PLAN entry canonical signal authority単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: QA / TL
plan: docs/plans/PLAN-RECOVERY-88-plan-entry-canonical-signal.md
pair_artifact: docs/design/helix/L6-function-design/plan-entry-canonical-signal-authority.md
---

# PLAN entry canonical signal authority 単体テスト設計

## Oracle

- `U-PROUTE-003b`: `regression_dev`を`catalog_signal`として解決し、会話由来の指示、承認、ADR判断へ昇格しない。
- 既存`U-PROUTE-003`: catalogにもDBにもない値は`entry_signal_unresolvable`を維持する。
- 既存typed route照合により、signalとworkflow identityの不一致をfail-closeする。
