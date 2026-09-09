---
title: "CLI-R00 throughput baseline 単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: QA / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
plan: docs/plans/PLAN-L7-1687-cli-r00-throughput-baseline.md
pair_artifact: docs/design/helix/L6-function-design/cli-r00-throughput-baseline.md
---

# CLI-R00 throughput baseline 単体テスト設計

実行テストは `tests/cli-r00-throughput-baseline.test.ts` に1対1で束縛する。
wall-clockの絶対閾値を合否にしない。CLIをspawnして挙動を変える試験もしない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CLIR00-001 | Issue #1687の13指標exact set | 欠落・余剰・順序変更を`metric_set_incomplete`で拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-002 | catalogのmeasured／proxy／unmeasurable分類 | 定義の観測種別を欠落させず、相互に排他である | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-003 | 測定不能をmeasuredへ偽装 | `CI_RERUN_COUNT`へ数値を置いたartifactを`unmeasurable_claimed_measured`で拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-004 | proxyを直接観測へ昇格 | `DIFF_BYTES`をmeasuredへ読み替えたartifactを`proxy_claimed_as_direct`で拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-005 | 同一条件再計測 | Node versionまたはenvironmentを変えたcandidate比較を`condition_mismatch`／`environment_mixed`で拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-006 | 構造snapshot | `artifact.source_head`のblobからfamily数・byte長・shard jobを決定的に再抽出し、frozen既知値と一致させる。live treeの絶対閾値は使わない | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-007 | shared-file collision proxy | top-level family数以外の同時PR数をproxy値へ代入したsnapshotを拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-008 | frozen artifact | repo-owned JSONがschema検証に通り、構造proxyが`source_head` blobと一致する。別HEADや+1 byte／+1 familyは`condition_mismatch`で殺す | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-009 | unknown key／短縮HEAD | 余剰fieldまたは短縮SHAを`unknown_key`／`schema_invalid`で拒否する | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-010 | collectorのCLI非依存 | collector sourceが`src/cli.ts`をimportせず、command登録副作用を持たない | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-011 | 指標欠落mutation | observationsから1件削除したartifactを`metric_set_incomplete`で殺す | `tests/cli-r00-throughput-baseline.test.ts` |
| U-CLIR00-012 | 測定不能の数値比較 | unmeasurable同士のdelta比較を`unmeasurable_not_comparable`で拒否し、高速化判定へ使わせない | `tests/cli-r00-throughput-baseline.test.ts` |

旧CLI monolithの行数削減やtest削除をpositive oracleにしない。
R01以降の分割完了を本testのgreenで主張しない。
