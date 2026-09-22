# Wave46 legacy semantic review Scaffold

このScaffoldは、`origin/main` の `3cdde5dfedfc51ff7c757a2f5fb2eb11a3c6b64c` を起点に、Wave45後の残25 unitから、HELIX-HARNESS／HELIX-OSのNFR-27、NFR-28、NFR-30を対象にした研究候補である。選定はsource chain、product境界、phase候補、catalog asset roleの複雑性を静的に照合して6 unitへ限定した。Bindingは `SCF-B-0086` である。

対象unitは次の6件である。

- `IRUNIT-HIL-NFR-27-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-27-HELIX-OS`
- `IRUNIT-HIL-NFR-28-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-28-HELIX-OS`
- `IRUNIT-HIL-NFR-30-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-30-HELIX-OS`

旧requirements原文、decomposition、保存markdownのsource spanを逐語anchorとして保持し、旧asset catalog、decision、disposition、failure、copy/read-after、consumerを静的に照合した。今回の結果は12 role edge、13 semantic atom、6 composite_unresolved、6 selected role asset、10 inspected legacy asset、6 missing evidence receiptである。Wave45までの193 unit／552 edgeに加え、累計199 unit／564 edge、残19 unitとなる。この累計は旧IR reviewの進捗であり、四製品の完了率や現行実装率ではない。

今回のrole edgeは、NFR-27 HARNESSのimplementation_source、NFR-28 HARNESSのimplementation_source、NFR-28 OSのimplementation_source、NFR-30 HARNESSのimplementation_source、NFR-30 OSのdesign／implementation_sourceをmissing evidenceとして保持する。missing roleがないNFR-27 OSはdesignとimplementation_sourceの候補を記録する。missing roleごとにcandidate poolを `candidate_asset_ids`、`consumed_asset_ids`、`examined_not_selected_asset_ids`、`unexamined_asset_ids`へ分離し、各件数の和を固定する。unexaminedは直接証拠、現行実装、authority、degradation、phase admissionへ昇格しない。

候補product、phase、legacy implementation status、現行authority、現行implementation、degradation、consumer closureを別々に保持する。旧台帳のauthority、failure、consumer、実装らしき記述は歴史的記録であり、現行の権限・実装・縮退・phase admissionへ昇格しない。Web／Web-OSの直接scopeを旧UI語や候補assetから推定しない。正式owner、採否、successor、acceptance、release、deployment、consumer closureは未確定である。

旧archiveは実行していない。runtime、test、CI、workflow、hook、adapter、sourceの実行結果を検証根拠にしない。候補はScaffold Bindingに限り、正式要求と現行実装の置換は行わない。

検証は次の現行Scaffold経路で行う。

```text
python3 -B scaffold/legacy-semantic-review-wave46/generate.py
python3 -B scaffold/legacy-semantic-review-wave46/validate.py
python3 -B scaffold/legacy-semantic-review-wave46/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はbase lineage、source digest、unit／edge／atom keyset、bounded candidate search、独立phase/product pool、prior cumulative count、同一batch内のnon-requirement asset重複、asset単位のcandidate／consumed／examined_not_selected／unexamined reconciliation、missing evidence reason、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py` は本体validator経路で27件の意味ある負例を検査し、README、plan、inventoryにWave45のtemplate残留がないことも確認する。`replacement.issue=0` はDraft PR未割当を表すtracker sentinelであり、PR番号を推定しない。
