# Wave15 旧HELIX要求直接意味レビュー方法

## 目的と境界

Wave15は `de98b6cfe0d700cdd5027f6f0b2a2695f5d1e070` を親revisionとし、BR08 HELIX-HARNESS、BR09 HARNESS／OS connection、BR11 HELIX-OSの要求unitを静的に再照合する。対象は7 atom、9 edgeで、累計44 unit／132 edge、残り174 unitである。authority effectは `none`、要求・設計・計画・実装のいずれも実行完了や製品採否を確定しない。

各atomは製品境界の人手判断待ちで、3 unitすべて product-exclusive、shared overlapは0件である。BR09は connection unit のため `product_scope` を `HELIX-HARNESS` と `HELIX-OS` の2製品として保持し、`product_target` はnullのまま扱った。候補assetのcatalog membershipはsemantic evidenceではない。candidate membershipはsemantic evidenceではない。

## 静的判定手順

要求IRのunit statementをsource spanとatomへ分割し、phase候補、product候補、classification、manifest digest、crosswalk、decompositionを突合した。要求assetは同一要求IDの契約確認に限り `confirmed` とし、実装成立の証拠にはしない。designとplanは同じcounterevidenceとgateを適用し、引用範囲にないatomをcoveredにしない。実装sourceは意味候補の部分一致を記録できるが、実行していないため implementation confirmed は0とする。

controlled bindingは、atom textとraw source_fragmentsの双方にanchorが接地すること、引用excerpt内にrequired termsがあることを専用verifierで確認する。BR09の2製品表現は単一製品へ縮約しない。過去Waveのnon-requirement assetとの重複はasset ID集合で検査する。

旧資産は静的readのみで参照した。runtime、test、hook、CI、adapterは実行していない。archiveをoracle、fallback、現行実装の代替として扱わず、新規buildも許可しない。

## 判定結果の取り扱い

要件3 edgeは契約確認、plan/design 3 edgeとimplementation 3 edgeは unresolved とした。unresolvedはconsumer closure、product authority、旧実行状態が未確定であることを残す。Phase capability表はcrosswalkの7行をexactに転記し、candidate statusを authorityへ昇格させない。
