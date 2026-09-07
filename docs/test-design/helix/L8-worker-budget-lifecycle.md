---
title: "Worker Budget Lifecycle テスト設計"
status: draft
plan_id: PLAN-RECOVERY-1601-worker-deadline
parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md
pair_artifact: docs/design/helix/L6-function-design/worker-budget-lifecycle.md
---

# Worker Budget Lifecycle テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WBL-001 | 正常終了 | deadline前の終了でstatusや出力を失う実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-002 | process tree | direct childだけ停止して孫を残す実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-003 | packet budget | hard-coded timeoutで200msと800msが同時刻になる実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-004 | late side effect | timeout return後に孫がmarkerを生成する実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-005 | CLI terminal出力 | lifecycle fieldsを欠落させるCLI JSONを拒否 | `tests/cli-surface.test.ts` |
| U-WBL-006 | OS境界 | process tree停止不能時の無期限fallbackを拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-007 | wrapper interruption | `SIGINT`でwrapperだけ終了しprovider treeを孤児化する実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-008 | child終了後の残存tree | direct childの正常終了後に孫だけ残る場合、deadlineまで待って`status=0`と`timed_out=true`を同時に返す実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-009 | repeated external signal | 実wrapperへ`SIGINT`・`SIGTERM`・`SIGHUP`をcleanup中に再送し、既定終了でprovider treeを孤児化する実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-010 | CLI interruption projection | 実CLIへ`SIGINT`を送り、provider reap後にJSONへ理由を保持せず終了code 130へ投影しない実装を拒否 | `tests/cli-surface.test.ts` |
| U-WBL-011 | bounded capture | stdout/stderr合算上限後に実観測byte数またはtruncatedを失う実装を拒否 | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-012 | team compatibility | sealed `budget.time_ms`をmember実行へ渡さず独自spawnへ戻る実装を拒否 | `tests/team-run.test.ts` |
| U-WBL-013 | team timeout terminal | timeout済みprocessがexit 0を返してもmemberをcompletedへ昇格する実装を拒否 | `tests/team-run.test.ts` |
| U-WBL-014 | team lifecycle fail-close | lifecycle field欠落、未reap、またはpacket budgetと異なるdeadlineを成功へ昇格する実装を拒否 | `tests/team-run.test.ts` |
| U-WBL-015 | 共通terminal admission | exit 0でもtimeout・残存tree・割込み・未reap・lifecycle errorがあればdirect/team双方で失敗にする | `tests/provider-process-lifecycle.test.ts` |
| U-WBL-016 | direct CLI terminal admission | timeout後にproviderがexit 0を返してもJSONをfailed/timed_out、process exitを124とし、consult receiptを生成しない | `tests/cli-surface.test.ts` |
