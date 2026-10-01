# v1.3 既存40件監査の順位再配置crosswalk

> 本文はsource-IDによる順位照合記録であり、要求の採択・完了・閉鎖・authorityを決めない。

## 対象と境界

このcrosswalkのcurrent stateはbundle HEAD `9792c7034dd2d6365b03ea74cd389af7e6ac2d8b`時点の固定131-poolでreviewed identity 131件、identity-filter unreviewed 0件である。全rank 1–131にsource-ID監査記録があることを示すidentity bookkeepingで、意味レビュー完了・source condition closureを意味しない。直前の110/21状態（bundle HEAD `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41`）と87/44状態（bundle HEAD `a3d44d939668775c00fd77b66b5d85416b3df65e`）は履歴スナップショットとしてJSONに保存した。旧raw119 rows21–40 artifactは誤順位の歴史記録として残し、current positions21–40には使わない。これはidentity監査記録の範囲であり、意味上の未レビュー総数・条件閉鎖数ではない。

固定v1.3 queue 303行から `primary_residual` かつ `unresolved_for_closure_work` の255行を取り、32個のpinned focused auditをraw ID tokenだけでなくsource tupleで照合した結果、qualified hitは124件、effective identity-filter poolは131件（255−124）となる。source-qualified join proofは `docs/governance/audits/requirements-stage/v13-effective-rank-selection-reconstruction-review-2026-10-01.json` @ `0a91e269671a3a7b30d3ee7d1ef084d959791975`（JSON SHA-256 `424c0348780596e14aec1f1234bdd0842f06e54017846edab33fda694429c186`）を参照する。candidate4755/#2353等は別母集団として除外する。119件のraw-token no-hit列はすべての意味上未レビュー条件を表さない。

旧artifactの `rows21–40` と `rows41–60` ラベルは131-pool順位として無効である。ここでは旧40行のsource identity tupleをqueueと突合し、既存comparison欄を意味変更せず順位だけを再計算した。旧40件は新poolの連続区間ではなく、rank42–67の一部とrank91–110に分布する。source-qualified positions21–40の新規監査は別途current evidenceとして加えた。raw119旧監査の`REQSRC-SUP-00171`は新順位41のcarryoverであり、その旧比較記録は保持する。

## 固定pin

- Queue: `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json` @ `50686b6762788574cb471967e8c24846d3dd56ae`; SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`.
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`; SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`; asset `LEGACY-ASSET-02319C2481B9E01698D5` / ledger line 956 SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`.
- Source-qualified join proof: `docs/governance/audits/requirements-stage/v13-effective-rank-selection-reconstruction-review-2026-10-01.json` @ `0a91e269671a3a7b30d3ee7d1ef084d959791975`; JSON SHA-256 `424c0348780596e14aec1f1234bdd0842f06e54017846edab33fda694429c186`.
- 固定F6比較: revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`; L2 `docs/helix-harness/L2-requirements/product-requirements.md` SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`; L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`.

## 旧artifactと再配置

|旧artifact|旧ラベル|記録|corrected 131-pool順位|
|---|---:|---:|---|
|`docs/governance/audits/requirements-stage/v13-effective-next20-rows21-40-condition-audit-2026-10-01.json`|21–40（無効）|20|42–45, 50–51, 53–55, 57–67|
|`docs/governance/audits/requirements-stage/v13-effective-next20-rows41-60-condition-audit-2026-10-01.json`|41–60（無効）|20|91–110|

旧artifact HEAD/JSON SHA-256/Markdown SHA-256はJSON `old_mislabeled_audit_artifacts` に保存した。各source rowの旧finding、direct evidence、fixed F6 refs、residual、successor/closure/authority欄はJSON `crosswalk_records` に原値で記録し、再判定していない。

## current source-qualified positions21–40 audit

- Source-qualified audit JSON: `docs/governance/audits/requirements-stage/v13-effective-next20-rows21-40-condition-audit-2026-10-01.json` @ `f25f3e84ecc9f86ded552d8621dc3d15d94547dd`; JSON SHA-256 `6e33ac456eb7f1f58246969d48b1dd1ebf7caae53bae42e8ad5f4da09fc6b791`; Markdown SHA-256 `933168ee8266378eef90aac02f1158649eccbef77b57cd7720bf7c37ba25a4d7。
- 対象positions21–40の20 source IDsは次の通り。statusはpartial 8 / unknown 1 / gap 11。個別source比較と残差は上記監査JSON/MDに保持し、旧raw119 auditの意味記録を上書きしない。

|Corrected rank|Source ID|状態|
|---:|---|---|
|21|`REQSRC-SUP-00077`|partial|
|22|`REQSRC-SUP-00081`|partial|
|23|`REQSRC-SUP-00089`|partial|
|24|`REQSRC-SUP-00097`|partial|
|25|`REQSRC-SUP-00105`|partial|
|26|`REQSRC-SUP-00108`|unknown|
|27|`REQSRC-SUP-00112`|partial|
|28|`REQSRC-SUP-00114`|gap|
|29|`REQSRC-SUP-00146`|gap|
|30|`REQSRC-SUP-00147`|gap|
|31|`REQSRC-SUP-00150`|gap|
|32|`REQSRC-SUP-00151`|gap|
|33|`REQSRC-SUP-00153`|gap|
|34|`REQSRC-SUP-00154`|gap|
|35|`REQSRC-SUP-00155`|gap|
|36|`REQSRC-SUP-00161`|gap|
|37|`REQSRC-SUP-00163`|gap|
|38|`REQSRC-SUP-00165`|partial|
|39|`REQSRC-SUP-00167`|gap|
|40|`REQSRC-SUP-00170`|partial|

`REQSRC-SUP-00171`はsource-qualified poolのrank41であり、新しい21–40 sliceには含めない。旧raw119 artifactにある意味比較記録はrank41 carryoverとして保持する。このpositions21–40 audit統合時点（`f25f3e84ecc9f86ded552d8621dc3d15d94547dd`）では、prior first20、current source-qualified 21–40、rank41歴史carryover、旧40行のunionが81件だった。後続のrank46–49とrank52/56監査は下記current stateへ別途追加した。これらはいずれもsource-ID記録の存在を数え、意味上の完了を数えない。


## current rank46–49 / rank52・56 / rank68–90 condition-audit pins

current reviewed集合へ追加した比較監査記録は次の3 batchである。rank46–49とrank52/56はpartial、rank68–90はpartial 20 / gap 3。全batchでsuccessor 0、source-condition closure 0、authority effect `none`。これらは比較記録の存在を示すだけで、PO採択範囲や候補receiptを旧source row全体のclosureへ拡張しない。

|Pool ranks|Source IDs|Audit JSON @ exact bundle HEAD|JSON SHA-256|Markdown SHA-256|Finding|
|---:|---|---|---|---|---|
|46–49|`REQSRC-SUP-00192`, `REQSRC-SUP-00193`, `REQSRC-SUP-00194`, `REQSRC-SUP-00198`|`docs/governance/audits/requirements-stage/v13-effective-ranks46-49-condition-audit-2026-10-01.json` @ `7b3337910179969378f17692e7fdb044659976e5`|`bb84a298510e03d38d0499030d089592f0f43e3399ecc853c099fc9b7cc721a9`|`64e209e4df9d8f3dfac50863c631046e6312f3b9a37714448a334bed6a84f102`|partial 4|
|52, 56|`REQSRC-SUP-00213`, `REQSRC-SUP-00217`|`docs/governance/audits/requirements-stage/v13-effective-ranks52-56-hyb-002-006-condition-audit-2026-10-01.json` @ `a3d44d939668775c00fd77b66b5d85416b3df65e`|`09bce72838df14a808c731341c0e557d0db3d8922dc9dae6aad7e02c07360d99`|`886757b9b542b3e592fa3a2789d72c541aaf56b9f0850349fa746a1083ff2f75`|partial 2|
|68–90|`REQSRC-SUP-00278`, `00279`, `00284`–`00291`, `00310`, `00312`, `00314`, `00315`, `00319`–`00322`, `00330`, `00332`, `00334`, `00335`, `00337`|`docs/governance/audits/requirements-stage/v13-effective-ranks68-90-condition-audit-2026-10-01.json` @ `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41`|`c8d6b78ee7db427ce1662d150337ba850d3acf20833dda628874da44d89e2b3c`|`a728beb2db32e7c0849a0301fc6fb113ab328579631ef94684f82c2dcc59b07d`|partial/unknown/gap per row|

rank68–90監査を取り込んだ直後のbundle HEAD `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41`時点では、unionは110 reviewed / 21 identity-filter unreviewedだった。さらにrank111–131監査を現在の131-poolへ加えた結果は後段に記録する。直前の87/44はその前のbundle HEAD時点の履歴であり、いずれのidentity complementも意味上の未レビューやclosure残量を表さない。

## 40件のsource-ID crosswalk

|Corrected rank|Source ID|Old artifact label|Old claimed rank|Old finding|Formal successor|Closed|Authority|
|---:|---|---|---:|---|---|---|---|
|42|`REQSRC-SUP-00185`|legacy-rows21-40-label-invalid|21|partial|False|False|none|
|43|`REQSRC-SUP-00186`|legacy-rows21-40-label-invalid|22|partial|False|False|none|
|44|`REQSRC-SUP-00187`|legacy-rows21-40-label-invalid|23|partial|False|False|none|
|45|`REQSRC-SUP-00188`|legacy-rows21-40-label-invalid|24|partial|False|False|none|
|50|`REQSRC-SUP-00209`|legacy-rows21-40-label-invalid|25|partial|False|False|none|
|51|`REQSRC-SUP-00212`|legacy-rows21-40-label-invalid|26|partial|False|False|none|
|53|`REQSRC-SUP-00214`|legacy-rows21-40-label-invalid|27|partial|False|False|none|
|54|`REQSRC-SUP-00215`|legacy-rows21-40-label-invalid|28|gap|False|False|none|
|55|`REQSRC-SUP-00216`|legacy-rows21-40-label-invalid|29|gap|False|False|none|
|57|`REQSRC-SUP-00218`|legacy-rows21-40-label-invalid|30|gap|False|False|none|
|58|`REQSRC-SUP-00219`|legacy-rows21-40-label-invalid|31|partial|False|False|none|
|59|`REQSRC-SUP-00220`|legacy-rows21-40-label-invalid|32|gap|False|False|none|
|60|`REQSRC-SUP-00221`|legacy-rows21-40-label-invalid|33|partial|False|False|none|
|61|`REQSRC-SUP-00269`|legacy-rows21-40-label-invalid|34|partial|False|False|none|
|62|`REQSRC-SUP-00272`|legacy-rows21-40-label-invalid|35|partial|False|False|none|
|63|`REQSRC-SUP-00273`|legacy-rows21-40-label-invalid|36|partial|False|False|none|
|64|`REQSRC-SUP-00274`|legacy-rows21-40-label-invalid|37|gap|False|False|none|
|65|`REQSRC-SUP-00275`|legacy-rows21-40-label-invalid|38|partial|False|False|none|
|66|`REQSRC-SUP-00276`|legacy-rows21-40-label-invalid|39|partial|False|False|none|
|67|`REQSRC-SUP-00277`|legacy-rows21-40-label-invalid|40|partial|False|False|none|
|91|`REQSRC-SUP-00338`|legacy-rows41-60-label-invalid|41|partial|False|False|none|
|92|`REQSRC-SUP-00339`|legacy-rows41-60-label-invalid|42|partial|False|False|none|
|93|`REQSRC-SUP-00340`|legacy-rows41-60-label-invalid|43|partial|False|False|none|
|94|`REQSRC-SUP-00435`|legacy-rows41-60-label-invalid|44|partial|False|False|none|
|95|`REQSRC-SUP-00441`|legacy-rows41-60-label-invalid|45|unknown|False|False|none|
|96|`REQSRC-SUP-00442`|legacy-rows41-60-label-invalid|46|unknown|False|False|none|
|97|`REQSRC-SUP-00443`|legacy-rows41-60-label-invalid|47|unknown|False|False|none|
|98|`REQSRC-SUP-00444`|legacy-rows41-60-label-invalid|48|partial|False|False|none|
|99|`REQSRC-SUP-00445`|legacy-rows41-60-label-invalid|49|gap|False|False|none|
|100|`REQSRC-SUP-00446`|legacy-rows41-60-label-invalid|50|gap|False|False|none|
|101|`REQSRC-SUP-00447`|legacy-rows41-60-label-invalid|51|partial|False|False|none|
|102|`REQSRC-SUP-00451`|legacy-rows41-60-label-invalid|52|partial|False|False|none|
|103|`REQSRC-SUP-00452`|legacy-rows41-60-label-invalid|53|partial|False|False|none|
|104|`REQSRC-SUP-00453`|legacy-rows41-60-label-invalid|54|partial|False|False|none|
|105|`REQSRC-SUP-00454`|legacy-rows41-60-label-invalid|55|partial|False|False|none|
|106|`REQSRC-SUP-00455`|legacy-rows41-60-label-invalid|56|partial|False|False|none|
|107|`REQSRC-SUP-00456`|legacy-rows41-60-label-invalid|57|partial|False|False|none|
|108|`REQSRC-SUP-00457`|legacy-rows41-60-label-invalid|58|partial|False|False|none|
|109|`REQSRC-SUP-00458`|legacy-rows41-60-label-invalid|59|partial|False|False|none|
|110|`REQSRC-SUP-00459`|legacy-rows41-60-label-invalid|60|partial|False|False|none|

## current rank111–131 condition-audit pins

このbounded auditはpositions111–131の21 source IDsをsource-qualified queue identityで照合する。findingはpartial 17 / gap 4、formal successor 0、source-condition closure 0、authority effect `none`。行別残差はaudit自身に保存され、identity membership追加を意味上の完了へ拡張しない。

- Audit JSON: `docs/governance/audits/requirements-stage/v13-effective-ranks111-131-condition-audit-2026-10-01.json` @ `9792c7034dd2d6365b03ea74cd389af7e6ac2d8b`; JSON SHA-256 `9ece6f43f2ee9402cbc0fcf676abf0b099bd383692df3a1fa45b3cac0c4c9d44`; Markdown SHA-256 `2d5b4b1d1e64825b59edbe64c645d05d85b806a89412287ab7d51fb27a6a0d55`。

|Pool rank|Source ID|Finding|
|---:|---|---|
|111|`REQSRC-SUP-00477`|partial|
|112|`REQSRC-SUP-00478`|partial|
|113|`REQSRC-SUP-00479`|partial|
|114|`REQSRC-SUP-00482`|partial|
|115|`REQSRC-SUP-00483`|partial|
|116|`REQSRC-SUP-00496`|partial|
|117|`REQSRC-SUP-00500`|partial|
|118|`REQSRC-SUP-00501`|partial|
|119|`REQSRC-SUP-00502`|partial|
|120|`REQSRC-SUP-00503`|partial|
|121|`REQSRC-SUP-00504`|partial|
|122|`REQSRC-SUP-00505`|gap|
|123|`REQSRC-SUP-00508`|partial|
|124|`REQSRC-SUP-00510`|gap|
|125|`REQSRC-SUP-00511`|partial|
|126|`REQSRC-SUP-00512`|partial|
|127|`REQSRC-SUP-00513`|partial|
|128|`REQSRC-SUP-00516`|partial|
|129|`REQSRC-SUP-00517`|partial|
|130|`REQSRC-SUP-00520`|gap|
|131|`REQSRC-SUP-00521`|gap|
|111|`REQSRC-SUP-00477`|
|112|`REQSRC-SUP-00478`|
|113|`REQSRC-SUP-00479`|
|114|`REQSRC-SUP-00482`|
|115|`REQSRC-SUP-00483`|
|116|`REQSRC-SUP-00496`|
|117|`REQSRC-SUP-00500`|
|118|`REQSRC-SUP-00501`|
|119|`REQSRC-SUP-00502`|
|120|`REQSRC-SUP-00503`|
|121|`REQSRC-SUP-00504`|
|122|`REQSRC-SUP-00505`|
|123|`REQSRC-SUP-00508`|
|124|`REQSRC-SUP-00510`|
|125|`REQSRC-SUP-00511`|
|126|`REQSRC-SUP-00512`|
|127|`REQSRC-SUP-00513`|
|128|`REQSRC-SUP-00516`|
|129|`REQSRC-SUP-00517`|
|130|`REQSRC-SUP-00520`|
|131|`REQSRC-SUP-00521`|

現current stateはreviewed 131 / identity-filter unreviewed 0。直前の110/21（bundle HEAD `4a50e2d3f2272a36bae89ea38df6cdd6954dbd41`）と87/44（bundle HEAD `a3d44d939668775c00fd77b66b5d85416b3df65e`）は履歴として保持した。131/0はこのidentity-filter pool内のsource-ID audit record membershipであり、全意味作業の完了やsource condition closureを示さない。

直前110/21状態の旧補集合は、上表のpositions111–131の21 source identitiesと一致する。これらは当時はidentity-filter complementであり、現在は上記bounded audit recordがある。JSONには旧110/21状態のmembershipとbundle pinを別途保存する。

## 検証と非主張

303/255/124/131の算術、tuple一致、旧40件のID一意性、first20、source-qualified current positions21–40のIDとpin、旧raw119基準監査の歴史的ID、rank41 carryover `00171`を確認し、prior revision 81/50・87/44・110/21の各履歴membership、current reviewed 131件・未crosswalk 0件の補集合、rank46–49/52・56/68–90/111–131 audit SHA pin、および順位境界（00089=23、00170=40、00171=41）を再計算してassertした。旧e748等の誤順位artifact pinsと旧comparison内容は比較史として保持する。JSON syntaxとdiff checkを確認し、archive runtime/CLI/test/CIは実行していない。

この記録は正式successor、source-condition closure、採択binding、承認、retire、authorityを作らない。既存監査の部分的所見や残差を完了扱いに変換しない。
