# Wave47 legacy semantic review Scaffold

このScaffoldは、`origin/main` の `f15c3ca2ed1dc865b242b0a21e1516fdeec6f9f6` を起点に、Wave46後の残19 unitから、HELIX-HARNESS／HELIX-OSのNFR-23、NFR-24、NFR-26を対象にした研究候補である。scope-cycle、refactor、obligation/oracle のsource chainと、product境界・phase候補・catalog asset roleを静的に照合して6 unitへ限定した。Bindingは `SCF-B-0089` である。

対象unitは次の6件である。

- `IRUNIT-HIL-NFR-23-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-23-HELIX-OS`
- `IRUNIT-HIL-NFR-24-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-24-HELIX-OS`
- `IRUNIT-HIL-NFR-26-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-26-HELIX-OS`

旧requirements原文、decomposition、保存markdownのsource spanを逐語anchorとして保持し、旧asset catalog、decision、disposition、failure、copy/read-after、consumerを静的に照合した。今回の結果は13 role edge、19 semantic atom、6 composite_unresolved、7 selected role asset、11 inspected legacy asset、5 missing evidence receiptである。Wave46までの199 unit／564 edgeに加え、累計205 unit／577 edge、残13 unitとなる。この累計は旧IR reviewの進捗であり、四製品の完了率や現行実装率ではない。

今回のrole edgeは、NFR-23 HARNESSのimplementation_source、NFR-23 OSのdesign／implementation_source、NFR-26 HARNESS／OSのimplementation_sourceをmissing evidenceとして保持する。NFR-24 HARNESS／OSはdesignとimplementation_sourceの候補を記録する。missing roleごとにcandidate poolを `candidate_asset_ids`、`consumed_asset_ids`、`examined_not_selected_asset_ids`、`unexamined_asset_ids`へ分離し、各件数の和を固定する。unexaminedは直接証拠、現行実装、authority、degradation、phase admissionへ昇格しない。

候補product、phase、legacy implementation status、現行authority、現行implementation、degradation、consumer closureを別々に保持する。旧台帳のauthority、failure、consumer、実装らしき記述は歴史的記録であり、現行の権限・実装・縮退・phase admissionへ昇格しない。Web／Web-OSの直接scopeを旧UI語や候補assetから推定しない。正式owner、採否、successor、acceptance、release、deployment、consumer closureは未確定である。

旧archiveは実行していない。runtime、test、CI、workflow、hook、adapter、sourceの実行結果を検証根拠にしない。候補はScaffold Bindingに限り、正式要求と現行実装の置換は行わない。

検証は次の現行Scaffold経路で行う。

```text
python3 -B scaffold/legacy-semantic-review-wave47/generate.py
python3 -B scaffold/legacy-semantic-review-wave47/validate.py
python3 -B scaffold/legacy-semantic-review-wave47/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はbase lineage、source digest、unit／edge／atom keyset、bounded candidate search、独立phase/product pool、prior cumulative count、同一batch内のnon-requirement asset重複、asset単位のcandidate／consumed／examined_not_selected／unexamined reconciliation、missing evidence reason、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py` は本体validator経路で39件の意味ある負例を検査し、README、plan、inventoryにWave46のtemplate残留がないことも確認する。`replacement.issue=0` はDraft PR未割当を表すtracker sentinelであり、PR番号を推定しない。
