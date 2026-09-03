# Issue native graph projection 詳細設計

## 1. 目的

Issue本文のversioned hierarchy／dependency contractを意味正本に保ったまま、GitHub nativeの
parent／sub-issue／dependencyをread-side projectionとして比較する。GitHub側の値から本文authorityを
補完推測せず、差分をtyped findingとして後続Recoveryへ渡す。

## 2. 入出力

入力は`IssueHierarchyNode[]`と、adapterが取得・正規化した`IssueNativeGraphSnapshot[]`である。
native snapshotはstable node ID、Issue番号、parent、sub-issue、blocked-by、blocksに加え、各ページ取得の
完了状態を必須とする。出力はschema、検査件数、graph digest、sorted finding exact setを持つ。

## 3. Authority境界

- desired graphは本文contractだけから構成する。
- child exact setは各Issueの`parent_issue`を逆引きして導出する。
- dependency exact setは本文の`blocked_by`／`blocks`を使用する。
- native graphは観測projectionであり、本文contractを書き換えない。
- native Issue欠落、stable ID欠落／衝突、pagination不完了時はfail-closeする。
- 入力順と重複edgeはcanonicalizationし、同じ意味graphへ同じdigestを返す。

## 4. Finding分類

parent、child、dependencyのmissing／extraを別codeに分ける。parentの両側不一致も、body parent欠落、
native-only parent、異なるparentへ分離する。取得不完全をedge欠落の成功として扱わず、
`native_snapshot_incomplete`を必ず残す。

## 5. 後続境界

本sliceはread-only比較までを所有する。GitHub write、read-after、部分成功receipt、DB projection、scheduled
repository-wide auditは後続sliceでこのreportを再利用して実装する。
