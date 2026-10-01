# v1.3 既存40件監査の順位再配置crosswalk

> 本文はsource-IDによる順位照合記録であり、要求の採択・完了・閉鎖・authorityを決めない。

## 対象と境界

固定v1.3 queue 303行から `primary_residual` かつ `unresolved_for_closure_work` の255行を取り、32個のpinned focused auditをraw ID tokenだけでなくsource tupleで照合した結果、qualified hitは124件、effective identity-filter poolは131件（255−124）となる。source-qualified join proofは `f11655477d7d7846acc04d783a69e53be227f309` のJSONを参照する。candidate4755/#2353等は別母集団として除外する。119件のraw-token no-hit列はすべての意味上未レビュー条件を表さない。

旧artifactの `rows21–40` と `rows41–60` ラベルは131-pool順位として無効である。ここでは旧40行のsource identity tupleをqueueと突合し、既存comparison欄を意味変更せず順位だけを再計算した。旧40件は新poolの連続区間ではなく、rank42–67の一部とrank91–110に分布する。

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

## identity-filter pool内の未監査51件

以下はこの固定pool上でfirst20、true21–40、および旧40行の監査記録にsource-IDが現れないrankである。意味上の未レビュー総数やclosure残量ではない。

|順位|Source ID|
|---:|---|
|23|`REQSRC-SUP-00089`|
|46|`REQSRC-SUP-00192`|
|47|`REQSRC-SUP-00193`|
|48|`REQSRC-SUP-00194`|
|49|`REQSRC-SUP-00198`|
|52|`REQSRC-SUP-00213`|
|56|`REQSRC-SUP-00217`|
|68|`REQSRC-SUP-00278`|
|69|`REQSRC-SUP-00279`|
|70|`REQSRC-SUP-00284`|
|71|`REQSRC-SUP-00285`|
|72|`REQSRC-SUP-00286`|
|73|`REQSRC-SUP-00287`|
|74|`REQSRC-SUP-00288`|
|75|`REQSRC-SUP-00289`|
|76|`REQSRC-SUP-00290`|
|77|`REQSRC-SUP-00291`|
|78|`REQSRC-SUP-00310`|
|79|`REQSRC-SUP-00312`|
|80|`REQSRC-SUP-00314`|
|81|`REQSRC-SUP-00315`|
|82|`REQSRC-SUP-00319`|
|83|`REQSRC-SUP-00320`|
|84|`REQSRC-SUP-00321`|
|85|`REQSRC-SUP-00322`|
|86|`REQSRC-SUP-00330`|
|87|`REQSRC-SUP-00332`|
|88|`REQSRC-SUP-00334`|
|89|`REQSRC-SUP-00335`|
|90|`REQSRC-SUP-00337`|
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

連続rank block: 23, 46–49, 52, 56, 68–90, 111–131.

## 検証と非主張

303/255/124/131の算術、tuple一致、旧40件のID一意性、既存first20とtrue21–40を含むreviewed 80件、未監査complement 51件、順位境界（00089=23、00170=40、00171=41）を再計算してassertした。JSON syntaxとdiff checkを確認し、archive runtime/CLI/test/CIは実行していない。

この記録は正式successor、source-condition closure、採択binding、承認、retire、authorityを作らない。既存監査の部分的所見や残差を完了扱いに変換しない。
