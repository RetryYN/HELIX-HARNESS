# RDP-001 delegated reference-edge subset（SCF-B-0021）

この候補は、RDP-001 reference holding 788 edgeから、既にisolatedされた30 edge（main統合済み26 edgeと、PR #1953に残る未merge draft 4 edge）および既存pairの文書pathを除き、構造上の責務・authority・L1/L3/L12接続を優先した24 edgeを分類するbounded scaffoldです。候補IDは `RDP-001-SCF-B-0021-REF-CLASSIFICATION-024`、capture revisionは `c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3` です。capture revisionは固定入力の来歴であり、常に最新mainと一致させるgateではありません。

選択した関係keyは `l3_progression_authority` 8件、`related_l3` 5件、`authority` 2件、`related_l12` 6件、`related_l1` 3件です。全edgeの固定source lineとtarget blob digestを記録しました。

選択IDは次の24件です。

```text
DELEGATED-REF-0001  DELEGATED-REF-0016  DELEGATED-REF-0027
DELEGATED-REF-0041  DELEGATED-REF-0054  DELEGATED-REF-0273
DELEGATED-REF-0285  DELEGATED-REF-0295  DELEGATED-REF-0296
DELEGATED-REF-0298  DELEGATED-REF-0310  DELEGATED-REF-0328
DELEGATED-REF-0329  DELEGATED-REF-0335  DELEGATED-REF-0338
DELEGATED-REF-0352  DELEGATED-REF-0356  DELEGATED-REF-0357
DELEGATED-REF-0361  DELEGATED-REF-0369  DELEGATED-REF-0382
DELEGATED-REF-0384  DELEGATED-REF-0385  DELEGATED-REF-0747
```

source lineは `0001/0016/0027/0041/0054/0273/0335/0369=7`、`0285=11`、`0295=12`、`0296=13`、`0298=9`、`0310=11`、`0328=11`、`0329=12`、`0338=18`、`0352=9`、`0356=12`、`0357=13`、`0361=12`、`0382=12`、`0384=12`、`0385=13`、`0747=26`です。24 edgeのsource line spanはすべて一意で、24件のtarget blob参照もedgeごとに固定しています。target blobは共有されるため、ユニークな固定blobは7個です。main統合済みだけを先に除いた残りは `788 - 26 - 24 = 738 edge`、未merge draft 4 edgeも合わせたcombined候補の残分母だけが `788 - (26 + 4) - 24 = 734 edge` です。734をmain統合済みの残分母として扱いません。

各edgeはholdingのID、source/target path、source line、source line exact text、source/target SHA、origin、relation key、target class、carry statusを保持します。さらに、candidate role、owner product候補、phase候補、actor、authority条件、negative条件、consumer refs、failure候補、未解決質問をedge単位で記録しています。ownerは候補のまま、phase authorityはunconfirmed、legacy implementationはunknownまたはnon-executable source only、consumerはpendingです。

sourceとtargetを合わせた22文書について、旧asset disposition、phase/product classification、append-only decision log、consumer refs、failure/rule inventoryを読み取り専用でjoinしました。source snapshotの一部は `source_snapshot_preservation`、残りは `unresolved` です。decision logに存在する記録はそのまま保持し、未記録を採用・棄却へ変換していません。failure/rule inventoryはpathが一致する記録を保持し、該当しないpathは `no_source_path_match_unresolved` としています。対象pathでは `helix-harness-requirements_v1.3.md` に123件、`l3-progression-authority-rebaseline-2026-07-19.md` に7件のfailure/rule記録がjoinされ、他pathの不一致をfailureなしとは解釈していません。

## 文書atomizationとの境界

この候補はreference edgeの分類だけを扱います。document full-line coverage、semantic atom、original ID partition、L3/L10 pair closureは実施していません。`document_atomization.status=not_performed`、`source_document_count=0`、`semantic_atom_count=0`、`full_document_line_coverage=false`、原ID分母0として固定しています。edgeの存在は文書採用、要求受入、target closure、文書atom化完了を意味しません。

closure guardは全fieldを固定し、`authority_effect=none`、`meaning_change_applied=false`、successor空、human decision null、adoptionなし、holding closure未実施です。正式owner、product authority、phase authority、legacy implementation、consumer closure、requirement acceptance、L3/L10 freeze、runtime/CI readinessは生成していません。

## 静的検証

```bash
python3 scaffold/rdp001-ref-subset-0021/validate.py
python3 scaffold/rdp001-ref-subset-0021/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` はholdingの全788行、選択edgeの完全集合、既存30 edge（main統合済み26＋PR #1953未merge 4）との非重複、固定archive source line／target blob digest、asset／phase／decision／failure／consumer join、文書atomization未実施をfail-closeで検査します。main残分母738とcombined候補残分母734を別々に検査し、734をmain統合済みの残分母へ読み替えません。`selfcheck.py` はedge identity、source/target digest、line、relation/class、owner／phase／implementation／consumer昇格、asset／decision／failure観測、文書atomization、残分母、closure guard全fieldの47負例を検査します。旧archiveのruntime・test・CI・hookは実行していません。

変更は `scaffold/` 配下の候補artifactとBindingに限り、commit、push、PR、merge、Issue、外部作用は行いません。
