---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/helix/L8-design-freeze-authority-transition.md
plan: docs/plans/PLAN-L7-459-design-freeze-authority-transition.md
---

# Design Freeze authority transition 機能設計

## 1. 責務

PO7 decision authority と Design Freeze transition を、観測済み設計分母、Git authority、append-only receipt、
複数head CASへ結合する。PO7/v1 CLIは既定でin-memory DBによるproposalを表示し、明示`--execute`時だけ
project-owned `.helix/harness.db`へauthority transactionをcommitする。v2 CLIは曖昧なdry-runを作らず`--execute`を必須とする。
CLI adapterはauthorityを推測・補完せず、
transaction receiptの補助exportもproject-owned `.helix/evidence/authority/`へ限定する。

## 2. 契約

- `observeCanonicalDesignDenominator` はcanonical manifest全件を再計算し、欠落・digest不一致を区別する。
- `activatePo7Decision` / `transitionPo7Authority` はepochと直前event digestのCASを必須とする。
- `commitPostPoDesignFreezeTransitionV2` はPO7 active head、4 current heads、直前receipt、期限を同一transactionで検証する。
- receipt、projection、authority eventはappend-onlyとし、部分writeは全rollbackする。
- shared digestはcanonical JSONだけをhashし、absolute pathや時刻を暗黙入力にしない。
- `--receipt-out` / `--full-row-export-out`はauthority evidence rootからのcanonical相対pathだけを受理する。
  absolute path、traversal、backslash、NUL、`.helix/`再指定、symlink ancestorはDB open/migration/commit前に拒否する。
  receiptとfull-row exportは異なるpathを要求する。evidenceはnew-file-onlyとし、同一path＋同一bytesのexact replayだけを
  許可する。既存異bytesはauthority commit前に拒否する。operation-bound payloadをtransaction outboxへ固定し、file/dir
  `fsync`、Linux directory-fd capabilityに拘束したmkdir/sibling temp/hard-link no-replace publish、no-follow相当、
  全ancestor dev/inoのpublish前後照合、path identity再検査、
  post-read digest後にterminal materialization receiptをappendする。terminal済みevidence欠落はoutbox bytesから修復するかfail-closeする。
  外部pathとsource文書へ書かない。

## 3. DbCとoracle

| 境界 | pre | post / invariant | oracle |
| --- | --- | --- | --- |
| denominator observation | canonical manifestが読める | exact件数と各digestを返し、不一致を成功扱いしない | U-DFA-001 |
| PO7 authority | expected epoch/event digest一致 | active/revokedをappend-only遷移 | U-DFA-002 |
| freeze v2 commit | PO7 active、4-head CAS、期限内 | 9境界をatomic commit、exact replay | U-DFA-003/004 |
| supersession | current headsと直前receipt一致 | 古いreceiptや任意headを拒否 | U-DFA-005 |
| authority CLI/schema | migration済みDB、明示`--execute`、project-owned evidence相対path | append-only transactionを実行し、schema registryを欠落させず、外部/不正pathはDB変更前に拒否する | U-DFA-006 |
