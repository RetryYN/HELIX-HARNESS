# HARNESS-042 本文revision固定後の監査素材

- JSON: `/tmp/harness042-prebody-audit-material-worker.json`
- JSON SHA-256: `51581d10c4e48169e375dc3b2f1c5b34dfdfa56b3d3afba249e13d56b05bc19e`
- Body revision: `be594d73f9ed9bc441363111820b87b690da9b8b` (base `f5a974a4059a209982cb1cdec39c0537f52683b8`)

## 確認結果

- 6 target文書のbase prefix、suffix bytes/SHA、full SHAはcheckpointとactual worktree git blobsに一致。suffixは候補本文の先頭に空行LFを1 byte追加したもの。
- functional-verification.mdの物理行は44 unique CASE ID、各6列。旧ID 36件を維持し、新ID 8件を含む。
- 旧36行のsource literal/raw-LF SHAは別途3fd source blobに一致。
- PO row 47は `HARNESS-L2-042 | 採択 | MPR-RC-HARNESS-L2-042-001` と確認済み。

## 44件の新旧境界

新規ID:
- `CASE-HARNESS-L10-042-r10-acceptance-complete-denied`
- `CASE-HARNESS-L10-042-r10-authority-generation-denied`
- `CASE-HARNESS-L10-042-r10-execution-complete-denied`
- `CASE-HARNESS-L10-042-r10-implementation-complete-denied`
- `CASE-HARNESS-L10-042-r10-l3-approved-denied`
- `CASE-HARNESS-L10-042-r10-name-or-ticket-only-denied`
- `CASE-HARNESS-L10-042-r10-performance-threshold-generation-denied`
- `CASE-HARNESS-L10-042-r10-requirement-adopted-denied`

Root候補JSONのfunctional_cases metadata 38件は中間時点。本文revisionで確定した実物理inventory 44件とは区別して保持。旧36 literal全件も監査record内で保存。

## 制限

- 監査対象はこのexact body revisionと指定source pins。意味完全性や独立reviewを証明しない。
- L10実行、runtime、実測、PO L3承認は行っていない。
- このWorkerはcanonical/WT本文を編集していない。
