# Wave48 legacy semantic review Scaffold

このScaffoldは、Wave47と#2040 merge後のmainのexact revision `a8f1ab1c7dce529cfb5293e1ddf4a23140877f22` を起点に、残13 unitからHIL-NFR-29、HIL-NFR-32、HIL-NFR-33の5 unitをbounded research candidateとして静的照合する。Layer Ledgerのatomic obligation／pair edge、意味変更のCanonical条件、contract/template coverageを同じ意味境界で扱うため、この3要求系列を選定した。Bindingは `SCF-B-0093` である。

対象unitは次の5件である。

- `IRUNIT-HIL-NFR-29-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-29-HELIX-OS`
- `IRUNIT-HIL-NFR-32-HELIX-HARNESS`
- `IRUNIT-HIL-NFR-32-HELIX-OS`
- `IRUNIT-HIL-NFR-33-HELIX-HARNESS`

旧requirements原文、decomposition、保存markdownのexact source spanを保持し、旧asset catalog、decision、disposition、failure、copy/read-after、consumerを静的に照合した。結果は8 role edge、14 semantic atom、5 composite_unresolved、3 selected role asset、7 inspected legacy asset、7 missing evidence receiptである。Wave47 merge後の累計は210 unit／585 edge、残8 unitとなる。この累計は旧IR reviewの進捗であり、四製品の完了率や現行実装率ではない。

NFR-29 OSはdesign候補7件のうち6件がprior evidenceでconsumed、1件がunexaminedのためdesignをmissingとして保持する。NFR-32 OSはphase／product candidate poolが0でdesign／implementation_sourceをmissingとして保持する。全missing roleについてcandidate／consumed／examined_not_selected／unexamined asset IDを分離し、unexaminedを直接証拠・authority・current implementation・degradation・phase admissionへ昇格しない。

候補product、phase、legacy implementation status、現行authority、current implementation、degradation、consumer closure、acceptanceは未確定である。旧archiveはstatic referenceだけに限定し、runtime、test、CI、workflow、hook、adapter、sourceを実行していない。正式owner、採否、successor、release、deploymentは生成しない。

先行Wave47の受領済みexact HEADは `d5dff5ef176e144c4a45b39a4e18a7e427c4ad17` としてlineageへ固定した。これとmain merge lineageが変わった場合はrebaselineして停止し、Wave48の候補を継続しない。post-merge read-afterは行っていない。

検証経路:

```text
python3 -B scaffold/legacy-semantic-review-wave48/generate.py
python3 -B scaffold/legacy-semantic-review-wave48/validate.py
python3 -B scaffold/legacy-semantic-review-wave48/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はmain merge lineage、先行Wave47 exact HEAD、source digest、unit／edge／atom keyset、bounded candidate search、独立phase／product pool、prior cumulative count、asset pool reconciliation、missing evidence reason、authority／phase／implementation／degradation boundaryをfail-closedに検査する。`selfcheck.py` は本体validator経路で39件の負例を検査する。
