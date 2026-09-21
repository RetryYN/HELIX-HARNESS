# Wave16 旧HELIX要求直接意味レビュー方法

## 目的と境界

Wave16は親revision `6dad906ed9a52c9e49611931645db2f298c6bf6a` を固定し、BR12 HELIX-HARNESS、BR14 HELIX-HARNESS、BR14 HELIX-OSを静的に再照合する。対象は3 unit、8 atom、9 edgeで、累計47 unit／141 edge、残り171 unitである。authority effectは `none`、要求・設計・実装のいずれも製品採否、実装完了、consumer closureを確定しない。

BR12-A01はHELIX-OS側の既存Wave2 atom `BR12-OS-A06` と同じ `同じintake契約へ正規化し` を共有する。BR12-A02とBR14のatomは各unitのproduct-exclusiveとして扱い、共有範囲を拡張しない。BR14-OSはphase候補0、phase capability evidence 0を正本どおり保持する。candidate membershipはsemantic evidenceではない。

## 静的判定手順

要求IR、product-unit decomposition、crosswalk、asset catalog、archive manifest、各asset本文を直接照合した。要求assetは同一要求IDとsource spanの契約確認だけを `confirmed` とし、実装成立の証拠にはしない。designとplanには同じcounterevidence／gateを適用する。引用spanにないatomはcoveredにせず、atom IDと原文内容をcounterevidenceへ記録した。

controlled bindingはrequired termsがexcerptに存在し、anchorがatom textとraw source_fragmentsの双方に接地することを専用verifierで確認する。BR12 shared peerのsource fragment、decompositionのshared overlap、Wave2 peer atom、BR14のparent unresolved reasonsを検査対象として保持した。BR14-OSはphase 0のためphase表へ行を追加しない。

旧資産は静的readのみで参照した。runtime、test、hook、CI、adapterは実行していない。archiveは現行実装のoracle、fallback、代替機構にせず、新規buildも許可しない。

## 判定結果

requirement 3 edgeは契約確認、design 3 edgeとimplementation 3 edgeは保守的に unresolved とした。implementation confirmedは0である。consumer closure、product authority、旧実行状態、BR14の採否・追跡closureはpendingのまま残す。
