# LABO Stage 5 review01 Root追補補正記録（候補）

- 対象PR: #2620、正式review comment [6004749682](https://github.com/RetryYN/HELIX-HARNESS/pull/2620#issuecomment-6004749682)。本文SHA-256: `e8d66f7e9822733728e46ff9fc36f230578ce7265aabf7232562038da9e569fc`。
- basis: 固定要求と採択根拠は `633bf12ea8f948db8ba3d6600179c4a9507377a7`。編集前candidateの祖先HEADは `56260ed7fca00e59dc0c02da26ae0d8999d34450`、本文commitは `10944c7359aed7db96f40703c133da3ed30bd7d3`。最新統合main `8a763ce4211afa1ef2a7e54c209933a03e029243` の6 canonical bytesを各本文の完全prefixとして保持した。
- 判定状態: Root意味検収待ち、独立review待ち。45件の正式所見は前監査のdispositionを引き継ぎ、今回の作成側修正でclosureとはしていない。承認・完了・実装・実行許可は生成していない。

## Root追加12群の反映

1. NFR/NVの059 index終端を実case `CASE-47`へ同期した。
2. 050にregistration-only、target-change-onlyの完了誤認とtarget-change receipt欠落を別fixtureで追加した。
3. 061の15項目unknown値を一項目ずつ`CASE-87`〜`CASE-101`へ分け、複合歴史欠落をindex化。通常履歴へ15条件すべてを強制する変異を`CASE-102`へ追加した。
4. 061派生添付漏洩は識別可能な入力source ownerとSECURITYへ、特定不能時はowner unknownを保持する。
5. 061のreceiptからのassignment/permission/admission/judge任命生成を`CASE-103`〜`CASE-106`へ個別化し、旧`CASE-77`はindex化した。
6. 063の重複missing/stale行を主fixtureへのindexとし、target-change receipt欠落を`CASE-51`へ追加。
7. 064のselected-scope除外、verification unavailable、runtime-only/output-format-only差分、mapping revision staleを一変異ごとに分離した。
8. 066でspeedによるmisrepair/unresolved隠蔽を`CASE-29/30`に分けた。
9. 068にAttempt identityを残したままresult receiptだけ欠落する`CASE-18`を追加した。
10. 069で受入findingのoracle不足source/reason欠落を`CASE-28`へ分け、unknown/unclassifiedを保持する。
11. 070のsource owner・要求owner・SECURITYの境界をFR ACへ同期し、067/068採択を推定する`CASE-65`を追加した。
12. 071ではmodel revision更新で旧資格を失効し、新revision状態へ継承しないoracleを明記した。

## 構造・検証

Stage 5の旧table CASE 568件と箇条書き26件を保持した。現在のtable CASEは600件で、差分として32 row IDが追加されている。全定義数は626（table 600、prose 26）。これはID・参照の構造集計であり、独立fixture成立数や意味coverageではない。table ID重複は0、AC参照のdanglingは0。各parentのmax suffix、現行物理行・LF込みliteral SHA、固定親pin、旧source pin、6本文SHAとmain prefix SHAは同名JSON記録に収録した。

- `scfctl validate`: bindings 147、fail 0
- `scfctl stale`: 0
- `scfctl residuals`: 0
- `govcheck`: atoms 7622、requirements 57、files 58
- `git diff --check`: pass

旧runtime、CLI、hook、tests、CI、Bunは実行していない。PR更新・push・Ready・mergeも行っていない。JSONは正式45 findingと前監査を保持し、未確認範囲とindependent/root pending状態を区別する。
