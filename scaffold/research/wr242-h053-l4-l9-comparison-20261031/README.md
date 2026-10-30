# WR242 H053 L4/L9 比較記録

status: scaffold（比較証拠。class membership・要求意味・authorityを生成しない）
authority_effect: none

## 対象と固定物

- base: `dd07a3498be74f32519adf42a221caf51e547ea1`
- 比較前固定source-only artifact: [`blind-source-only.json`](blind-source-only.json)
- 固定SHA-256: `5e69cd0c3c472090947fec9454d892ffa2caa24ed0aa2a1b2540f7d9c18f408b`
- 固定コメント: [#3510 comment 6534090409](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534090409)
- 主比較記録: [`comparison.json`](comparison.json)
- scaffold binding: `SCF-B-0203`。旧候補 `SCF-B-0197` は先行 #3976 で登録済みのため採用しなかった。最新main `456bf1f4e143811a32ae1314f3146e34098509db` に `0203` がなく、同時進行worktreeの未追跡・変更中bindingにも `0203` がないことを確認した。

固定artifactは比較後もbytesを変更せず、別ファイルとしてコピーした。比較は固定後に実施した。validatorはL4 algorithm、runtime、test、CIを起動しない。

## 比較結果

source-only artifactはL3/L10とL4散文から32個のunique source leaf、11個のprovisional candidate groupを記録する。候補groupは互いに重複し得る意味上の検討単位で、QA §3の実classやmemberを宣言していない。分類code、ordered finding_codes、owner、axis/state、typed owner_refは確定せず、candidate keyのassertionは0件である。

現行L4の38 `failure_classifications` rowsは、各rowの`oracle_refs`がL9のnegative case IDを一つ指し、そのcaseのclassification、change、backflow owner、record axes、claim/operation/reference state、副作用数が38/38で一致する。一方、これらは明示class membershipではない。L4/L9 class table、`negative_class_ref`、`negative_equivalence_classes` markerはなく、固定artifactはsource-derivedなfinding code order、class axis/state、typed owner_refを宣言していない。L4のaxis/state配列はcasewise observationとして照合できるが、それをclass keyの単一axis/stateへ投影する根拠はない。L5 ruleもQAのtyped `function_ref`/`contract_ref`を宣言せず、raw `function`を持つ。6要素keyと実memberを固定artifactから一意に結べない。

従ってこのbaseではclass migrationを実施しない。架空singleton、memberなしのclass、または全件residualを作らず、既存L4/L9文書とoracleを保持する。L9母集団を理由にL4 source meaningを除外したものはないため、確認済みのclass脱落はない。未決の候補groupとrow-level crosswalkは比較artifactに残した。canonical `remaining` は更新していない。

## 再現可能な静的確認

```sh
python3 scaffold/research/wr242-h053-l4-l9-comparison-20261031/validate_comparison.py
```

この確認は固定artifact/32 source-leaf hash、L4→L9の既存casewise pointerとcode、L4 contractごとのcandidate leaf参照、markerとkey解決の現状を静的に照合する。check-childのbase結果とnew-generation `scfctl validate/stale` の計測は本記録の`verification-summary.json`に併記し、この比較作業ではcheckerを変更していない。

## 残件

class migrationを成立させるには、11 candidate groupsのうちどのnegative meaningを独立classへ分けるか、各classのordered finding_codesとsingle key axis/state、typed owner_refおよびL9 case membershipを認める根拠が必要である。現行L4/L9と固定source-only artifactだけでは埋まらない。L5/L8側のPR-Bや将来の最新main checker変更は本比較に混ぜていない。
