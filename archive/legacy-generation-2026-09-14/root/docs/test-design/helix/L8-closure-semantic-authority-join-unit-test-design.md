---
title: "closure semantic authority join L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-01
updated: 2026-09-01
owner: QA
plan: docs/plans/PLAN-RECOVERY-75-closure-semantic-authority-join.md
pair_artifact: docs/design/helix/L6-function-design/closure-semantic-authority-join.md
---

# closure semantic authority join L8単体テスト設計

- U-CESA-006: exact PLAN＋artifact kindの3 authorityで全candidateがreadyになる。
- U-CESA-007: wrong PLANはreview placeholderを解決しない。
- U-CESA-008: source digest／payload不一致をloaderが拒否する。
- U-CESA-009: 同一PLAN内のwrong HEADを拒否する。
- U-CESA-010: structured oracleとruntime oracleの不一致を拒否する。
- U-CESA-011: semantic bundle digestがapproval scope digestへ束縛される。

各negative oracleはlegacy greenやprobe時刻による相殺を認めない。
