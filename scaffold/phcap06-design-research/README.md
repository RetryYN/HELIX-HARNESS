# PHCAP-06 Design／L3 research premise candidate

これはPHCAP-06（Design／L3）の製品別gapを静的に調べた候補束である。`status`は
`research_premise_candidate`、`authority_effect`は`none`であり、現行のL3、実装、運用、受入、
owner、採否を生成しない。基準HEADは`569d7373c32287bbafadeec6043472563937c5c7`（2026-09-22取得）である。
旧workflow、runtime、test、CI、hook、adapterは実行していない。旧assetはsource、判断史、failure、consumerを
read-onlyで参照した。

## 重複確認と対象

最新`origin/main`の`scaffold/`と既存worktree／候補を確認した。PHCAP-06専用候補は存在せず、PR #1953の
`SCF-B-0017`と`delegated-doc-007-016-030-034`は別のdelegated L3／L10 pairで、今回の6資産、current refs、
製品gapとは重複しない。未使用Binding IDは全worktreeを走査し、`SCF-B-0030`を採用した。

## 旧phaseとassetの状態

phase inventoryはPHCAP-06を`design_l3`、到達層L3／L4／L5／L6、最大L6、
`documented_with_implementation_assets`、transition `degraded_to_candidate`として記録する。これはphase-level
historical summaryであり、現行のper-asset implementationやpassを意味しない。代表6件は次の通りである。

- `LEGACY-ASSET-F1F753F31DB8D874EF21`: L3 system synthesis requirements
- `LEGACY-ASSET-4F5A1F0739EC1111D91D`: L4 design-template JSON authority
- `LEGACY-ASSET-EBEF9C2559936172AD8F`: L5 design registry
- `LEGACY-ASSET-D8A9E08B9BDD62096AEF`: L6 design-artifact source digest
- `LEGACY-ASSET-26F088BF0ED22B11BED8`: design registry implementation source
- `LEGACY-ASSET-462F60E486F8DB80687E`: design-artifact digest lint source

6件すべて、asset dispositionは`unresolved`、`implementation_status`は`unknown`、`consumer_refs`は空、
`authority_status`は`historical`、判断ログ該当は0件である。failure／consumerはsource spanから候補として記録したが、
現行oracle、pass、consumer closureには昇格させない。関連asset 8件（L4／L5／L8のtest design、registry consumer、digest
baseline、L3 authority reference）も同じread-only状態で保持した。

## 製品別境界

phaseの`product_targets`はHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの4製品である。一方、直接current
candidate refはHARNESSとOSだけである。HARNESSはtemplateの意味・適用性・design obligation・backflow候補、OSは
approved templateのlifecycle・exact selection・evidence候補として記録する。両方ともdraft／proposed境界で、正式L3
freezeや実装を確定しない。

HELIX-WebとHELIX-Web-OSはL1／L2／L11のadjacent refだけであり、PHCAP-06 direct L3導出、template／registry／lint
reuse、current authorityは`unknown`である。直接refの不在から未実装とは推論しない。Webはuser-facing experience、
Web-OSはdeployed service runtimeの境界候補として保持し、4製品のtargetを1つのcurrent authorityへ統合しない。

## 分母と候補範囲

phase/product classification bootstrapを`candidate_phase_targets`にPHCAP-06が含まれる行として集計した分母は、phase
candidate 375行、うち`candidate_product_targets`非空のphase×product候補235行である。これは代表6件のclosureを意味せず、
残りの候補とunit／connection／composite split、consumer closure、reuse modeは未解決である。

inventoryはsource span／semantic atom 29件、current ref 18件（audit／phase context 2件、direct 4件、adjacent 12件）、related ref 8件、
decision record 0件、legacy consumer closure 0件、未解決14件を固定する。矛盾4件は削除・解決せず保存する。

## 検証

`validate.py`はarchive bytesのsource digest、exact line span、asset／phase／decision ledger、current ref、製品分類、
negative boundary、矛盾、未解決項目を静的に照合する。`selfcheck.py`はauthority／implementation／consumer／decisionの
昇格、Web／Web-OS直接証拠の捏造、source改変、旧実行、矛盾／未解決の削除を陰性例として拒否する。

検証対象は`scaffold/`内の候補とBindingに限る。正式なL3／L10、current implementation、CI、acceptance、release、
external API、Issue／PR／DBへの作用はこの候補の責務外である。
