---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
plan: docs/plans/PLAN-L6-71-closure-auto-approval.md
---

# closure自走承認 機能設計

## 1. 目的

`close_ready`を、人待ちではなく機械証跡で安全に`accepted`へ進める。承認条件は同一windowの
review-bundle digest一致、対象PLANごとのtest全件green、gate全件green、生成したtyped approval
recordによるclosure apply dry-run成功のANDとする。

## 2. 契約

`buildProjectClosureAutoApprovalBatch(snapshot, {limit, offset})`は次を保証する。

- 1件でもtest/gateが未実行、失敗、件数不一致ならbatch全体をfail-closeする。
- `PLAN-L7-146`、`PLAN-M-02`、external publish、charter P8を示すcandidateが混在したら、可逆候補も
  含めbatch全体を止めhuman approvalへ残す。
- apply前に全batchをpreflightし、途中までstatusを書き換えない。
- approval recordはschema、scope digest、対象PLAN、条件別真偽、不可逆境界、audit digestを持つ。
- `--batch-size 1..100 --all`で361件以上をbounded windowとして列挙できる。executeは全windowの
  preflight成功後だけ行う。

## 3. Vペア

`docs/test-design/harness/L8-unit-test-design.md`の`U-CAUTO-001..006`をoracleとし、
`tests/current-location.test.ts`とCLI route回帰で固定する。
