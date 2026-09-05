---
title: "worker isolation broker L8実装単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-09-04
owner: QA
plan: docs/plans/PLAN-L6-96-worker-isolation-broker.md
pair_artifact: docs/design/helix/L6-function-design/worker-isolation-broker.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker L8実装単体テスト設計

`tests/worker-isolation-broker.test.ts`をcanonical oracleとする。Linux実process oracleはrepo absolute path、workspace `.git/.helix/harness.db`、
`GITHUB_TOKEN`が不可視で、child env key exact setが`HOME/LANG/PATH/TMPDIR`であることを検証する。
実process oracleは`HELIX_BWRAP_BIN`または標準system pathに実在するbubblewrapへ束縛し、未導入環境では明示skipする。
targeted closure環境では実在pathを指定して必ず実行し、mock結果を実process証拠へ昇格しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WIB-001 | scratch境界 | repo内scratchを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-002 | source境界 | symlink、git、state、DBを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-003 | platform／backend | Linux以外または未登録backendを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-004 | wrapper同一性 | 複製されたwrapper executionを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-005 | byte snapshot | 特殊fileと上限超過を拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-006 | launch同一性 | 複製されたbroker launchを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-CLEANUP-001 | 起動例外と一度限り消費 | 注入spawn例外を伝播し両FDの閉鎖をfstatで検証。同launchの再利用はspawn 0で拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-CLEANUP-002 | 異常終了と再入拒否 | statusが非zeroまたはnullの場合も両FDを閉鎖し、実行中の再入・終了後の再利用はspawn 0で拒否。実timeoutの再現とは区別する | `tests/worker-isolation-broker.test.ts` |
| U-WIB-CLEANUP-003 | 成功後の消費と継続可能性 | 正常な出力envelopeを受理しFDを閉鎖。同launchは拒否するが、別途prepareした新しいlaunchは正常実行できる | `tests/worker-isolation-broker.test.ts` |
| U-WIB-007 | 実process隔離 | repo、state、DB、credentialが可視ならRed | `tests/worker-isolation-broker.test.ts` |
| U-WIB-008 | admission鮮度 | stale／拒否済みdescriptorを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-009 | mutation到達性 | filesystem隔離分岐の除去をRedにする | `tests/worker-isolation-broker.test.ts` |
| U-CIISO-001 | runner identity | `ubuntu-24.04`固定とUbuntu 24.04／`noble`実効一致を検証し、alias／別releaseを拒否 | `tests/harness-check-workflow.test.ts` |
| U-CIISO-002 | bounded apt | bubblewrap導入を共通helperへ集約し、raw aptまたはtimeout欠落を拒否 | `tests/harness-check-workflow.test.ts` |
