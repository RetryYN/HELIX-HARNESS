---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-71-closure-auto-approval.md
---

# closure自走承認 機能設計

## 1. 目的

`close_ready`を、人待ちではなく機械証跡で安全に`accepted`へ進める。期待集合はrepo-owned PLAN、
実行事実はappend-only harness.dbの`test_runs/test_cases/gate_runs`をauthorityとする。typed manifestは
候補scopeだけを固定し、callerがexpected evidenceやcapabilityを定義できない。DB primary identity、
session、exact command、oracle、exit/status、output artifact bytes、HEAD、時刻を結合して再計算する。
runnerは同じreceiptをrepo-owned append-only attestation chainと`runner_attestations`へ同時記録し、
DB rowとのexact joinを要求する。attestation tableのUPDATE/DELETEはtriggerで拒否する。

ローカル実行には外部暗号trust rootが無く、repository write権限を奪取した攻撃者まで証明対象にしない。
本境界はaccidental/direct INSERTと通常runtimeの誤投影を検出するもので、外部公開・cutover等は引き続き
human/action-binding approvalとGitHub required-check authorityへ残す。

## 2. 契約

`evaluateClosureAutoApproval(...)`は次を保証する。

- evidence manifest欠落、0件集合、digest drift、run replay、期限切れ、HEAD/PLAN driftをfail-closeする。
- 不可逆判定は文字列推測を禁止し、`irreversible_impact`とtyped capability
  (`version_activation/state_cutover/external_publish/charter_p8`)の一致を要求する。
- dry-runはcanonical path、symlink禁止、read/write可否、strict frontmatter、全render digestを検証する。
- apply直前にHEAD・manifest・PLAN bytes・DB receipt/evidence bytes・期限をCAS再検証する。
- 全patchをtempへrender/検証後、journaled compensating transactionでrenameする。multi-file filesystem
  atomicityは主張せず、途中失敗は全before bytesへrollbackし、process crashは次回startupでjournalから
  recoveryする。成功・失敗ともfsync済みbefore/after/recovery audit eventをhash-chainで残し、journalを
  started event digestへpinする。
- `--batch-size 1..100 --all`で361件以上をbounded windowとして列挙できる。executeは全windowの
  preflight成功後だけ行う。`--batch-size`と`--offset`はcanonical decimalだけを受理する。

## 3. Vペア

`docs/test-design/harness/L8-unit-test-design.md`の`U-CAUTO-001..006`をoracleとし、
`tests/closure-auto-approval.test.ts`とCLI route回帰で固定する。
