# Wave45 legacy semantic review Scaffold

このScaffoldは、`origin/main` の `f8abbba3c04fbbd3e0a4787701a53d854d37b889` を起点に、Wave44で未reviewだった32 unitからsource chainの境界を静的に調査する研究候補である。選定は一律10件の機械適用ではなく、旧sourceの複雑性、shared source、composite、asset overlap、phase/product候補を照合して7 unitに絞った。Bindingは `SCF-B-0082` である。

対象unitは次の7件である。

- `IRUNIT-HIL-NFR-20-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-22-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-25-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-31-HELIX-OS`
- `IRUNIT-HIL-NFR-39-HELIX-OS`
- `IRUNIT-HIL-TR-06-HELIX-HARNESS`
- `IRUNIT-HIL-TR-11-HELIX-HARNESS`

旧requirements JSON、保存markdown、decomposition source spanは逐語anchorとして保持し、旧asset catalogのsource、判断史、disposition、failure、copy/read-after、consumerを静的に照合した。今回の結果は14 role edge、10 semantic atom、7 composite_unresolved、7 selected role asset、11 inspected legacy asset、7 missing evidence receiptである。Wave44までの186 unit／538 edgeに加え、累計193 unit／552 edge、残25 unitとなる。この累計は旧IR reviewの進捗であり、四製品の完了率や現行実装率ではない。

候補product、phase、legacy implementation status、現行authority、現行implementation、degradation、consumer closureを別々に保持する。旧台帳のauthority、failure、consumer、実装らしき記述は歴史的記録であり、現行の権限・実装・縮退・phase admissionへ昇格しない。Web／Web-OSの直接scopeを旧UI語や候補assetから推定しない。`NFR-31` はphase/product候補asset poolが0であり、designとimplementation_sourceをmissing evidenceとして記録した。`NFR-20/22/25` はimplementation_source、`NFR-39` はdesignとimplementation_sourceをmissing evidenceとして記録した。`TR-06` と `TR-11` はdesignとimplementation_sourceの直接候補を選定した。

missing roleのcandidate poolはunit／roleごとにasset IDで再集計した。Wave1–44のnon-requirement assetと今回選定済みassetを `consumed`、consumedだが今回選択していないものを`examined_not_selected`、それ以外を`unexamined`として分け、unexaminedは直接証拠・現行実装証拠として扱わない。今回選定したassetはprior waveおよび同一batch内で重複しない。requirement assetはselected role asset分母から除外する。

旧archiveは実行していない。runtime、test、CI、workflow、hook、adapter、sourceの実行結果を検証根拠にしない。候補はScaffold Bindingに限り、正式要求、owner、authority、phase admission、implementation、degradation、consumer closure、merge、release、deploymentは未確定である。

検証は次の現行Scaffold経路で行う。

```text
python3 -B scaffold/legacy-semantic-review-wave45/generate.py
python3 -B scaffold/legacy-semantic-review-wave45/validate.py
python3 -B scaffold/legacy-semantic-review-wave45/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はbase lineage、source digest、metaのcandidate／consumer closure／source identity／routing hold、unit／edge／atom keyset、coverage／atomization hold／routing／selection／bounded query gate、独立phase/product pool、prior cumulative count、同一batch内のnon-requirement asset重複、asset単位のconsumed/unexamined reconciliation、missing evidence reason、非requirement rowのcandidate membership／legacy evidence state／source span整合、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py` は本体validator経路で45件の意味ある負例を検査する。`replacement.issue=0` はDraft PR未割当を表すtracker sentinelであり、PR番号を推定しない。候補はDraft PRで意味reviewへ渡し、正式化とmergeはreview側の境界に従う。
