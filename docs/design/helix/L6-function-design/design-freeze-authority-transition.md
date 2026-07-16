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
複数head CASへ結合する。CLIはこの状態を表示するだけで、authorityを推測・補完しない。

## 2. 契約

- `observeCanonicalDesignDenominator` はcanonical manifest全件を再計算し、欠落・digest不一致を区別する。
- `activatePo7Decision` / `transitionPo7Authority` はepochと直前event digestのCASを必須とする。
- `commitPostPoDesignFreezeTransitionV2` はPO7 active head、4 current heads、直前receipt、期限を同一transactionで検証する。
- receipt、projection、authority eventはappend-onlyとし、部分writeは全rollbackする。
- shared digestはcanonical JSONだけをhashし、absolute pathや時刻を暗黙入力にしない。

## 3. DbCとoracle

| 境界 | pre | post / invariant | oracle |
| --- | --- | --- | --- |
| denominator observation | canonical manifestが読める | exact件数と各digestを返し、不一致を成功扱いしない | U-DFA-001 |
| PO7 authority | expected epoch/event digest一致 | active/revokedをappend-only遷移 | U-DFA-002 |
| freeze v2 commit | PO7 active、4-head CAS、期限内 | 9境界をatomic commit、exact replay | U-DFA-003/004 |
| supersession | current headsと直前receipt一致 | 古いreceiptや任意headを拒否 | U-DFA-005 |
| authority CLI/schema | migration済みDB | authorityを読取り表示し、schema registryを欠落させない | U-DFA-006 |
