---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-71-closure-auto-approval.md
---

# closure自走承認 機能設計

## 1. 目的

`close_ready`を、人待ちではなく機械証跡で安全に`accepted`へ進める。DBのrun件数は候補抽出に限り、
承認authorityには使わない。typed manifestがHEAD、PLAN bytes、期待test/gate集合、evidence bytes、
run ID、command、exit code、output digest、実行時刻、有効期限を固定し、実ファイルから再計算する。

## 2. 契約

`buildProjectClosureAutoApprovalBatch(snapshot, {limit, offset})`は次を保証する。

- evidence manifest欠落、0件集合、digest drift、run replay、期限切れ、HEAD/PLAN driftをfail-closeする。
- 不可逆判定は文字列推測を禁止し、`irreversible_impact`とtyped capability
  (`version_activation/state_cutover/external_publish/charter_p8`)の一致を要求する。
- dry-runはcanonical path、symlink禁止、read/write可否、strict frontmatter、全render digestを検証する。
- apply直前にHEAD・manifest・PLAN bytes・evidence bytes・期限をCAS再検証する。
- 全patchをtempへrender/検証後、単一transactionでrenameする。途中失敗は全before bytesへrollbackし、
  成功・失敗ともbefore/after durable audit eventとevent digestを残す。
- `--batch-size 1..100 --all`で361件以上をbounded windowとして列挙できる。executeは全windowの
  preflight成功後だけ行う。`--batch-size`と`--offset`はcanonical decimalだけを受理する。

## 3. Vペア

`docs/test-design/harness/L8-unit-test-design.md`の`U-CAUTO-001..006`をoracleとし、
`tests/closure-auto-approval.test.ts`とCLI route回帰で固定する。
