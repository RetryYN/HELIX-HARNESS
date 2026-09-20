---
title: "旧要求・旧asset直接semantic review wave 2 review応答"
status: addressed_pending_rereview
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 2 review応答

## 対象

- PR: #1914
- request: `RH-1914-GUI-01`
- base: `7b4cb8ef5cfa71e5166a6565c4ba8426020e15ec`
- reviewed content: `296bf9418b133086c0169758cc4dcb9da9016a03`
- request payload SHA-256: `0ef9b6dd3d0bfee8b95ba23da2ee2fbc8cd2df0cc495a0a8a8956a9b2073aa5e`
- response file SHA-256: `e5e0f1e213ec2e0a0ab5575743c73423122eb3462270c184778025c8a5b126ea`
- reviewer: Claude GUI `review_merge` lane

## 指摘と処分

| finding | severity | 処分 |
|---|---|---|
| `MAJOR-1914-01-01` | Major | 対応。human actor／L3 agreementはFR-06のどのatomにも直接対応しないため、2 edgeをcovered atomなしの`unresolved`へ変更した。隣接実装という不確実性はedgeに残し、atom証拠は生成しない。Scope Gate入力atomは述語付きの入力定義へ直し、unresolved bindingにはsource fragmentとrequired termを結ぶanchorを必須化した。 |
| `MAJOR-1914-01-02` | Major | 対応。decomposition正本の`shared_source_overlaps`から各atomへ`shared_with_units`と`boundary_review_state`を転記し、receiptへshared／product-exclusive exact setとdigest、製品境界解決状態を追加した。OSの3 atomがすべて共有spanで人間decision待ちであることをstatusへ明記した。 |
| `MAJOR-1914-01-03` | Major | 対応。receiptへ`design_partial_atom_ids`と`no_evidence_atom_ids`および各digestを追加した。設計partialは実装未被覆から除かず、同時に証拠皆無atomとの違いを別集合で保持する。status表も両列をmetadataから照合する。 |
| `MINOR-1914-01-01` | Minor | 対応。BR-12のstable ID A01〜A06を保ち、GitHub Issue、GitHub PR、GitHub CI event、ユーザー差し込みIssue、ユーザー差し込みPLAN、同一contract正規化の6自立atomにし、区切り・接続を`connective_fragments`へ分離した。設計edgeのatom別bindingにはsource fragment anchorを追加した。 |
| `MINOR-1914-01-02` | Minor | 対応。statusの累積unit／edgeと未着手unitを正規表現で取得し、metadataおよびcrosswalk総unit数から導出した値へ照合する。固定文字列を期待値にしない。 |
| `INFO-1914-01-01` | Info | 確認。独立試験mergeと全静的検証の合格、6 edge判定に指摘なし、旧runtime等を実行していないことを保持する。 |

## 境界

本処分はreview済みHEADの指摘対応であり、要求・phase・asset採否、製品owner決定、successor、正式L2／L11、実装、consumer closureを生成しない。修正後HEADは新しいrequest identityで再reviewする。

## round 2

- request: `RH-1914-GUI-02`
- reviewed content: `b6298c2f6b1bea0464ee48cc7c343f09f84e7869`
- request payload SHA-256: `51cf6a844c92cb4b71c86b8a94ce6165492c06ba217f1266b58cd2bfd0d17778`
- response file SHA-256: `adc3ccd668e2127b153228f622e425d5b9db2c05e46332c6abe0c6633d359c4b`

| finding | severity | 処分 |
|---|---|---|
| `MAJOR-1914-02-01` | Major | 対応。`no_evidence_atom_ids`からcontract自己再掲を差し引かず、実装confirmed／unresolvedと設計partialだけを差し引く。status列は「設計・実装証拠なし」と定義し、FR-06を5件／3件、BR-12を3件とした。 |
| `MINOR-1914-02-01` | Minor | 対応。`connective_fragments`を1〜2文字の明示allowlistへ制限し、重複を拒否し、atomの意味fragmentに含まれる文字列をconnectiveへ置けないようにした。 |
| `MINOR-1914-02-02` | Minor | 対応。直接対応atom 0の隣接実装2 edgeを三値定義に従って`rejected`へ変更し、evidence relation `adjacent_implementation_nonmatching`で単なる別機能との違いを保持した。集計はconfirmed 2／rejected 6／unresolved 1となる。 |
| `INFO-1914-02-01` | Info | 確認。round 1の他の修正、欠陥注入、test mergeおよび静的検証結果を保持する。 |

round 2の`incomplete`に列挙された残る213 unit、425 edge、consumer、製品owner decision等は本PRの未確認範囲として保持し、完了や採否を生成しない。
