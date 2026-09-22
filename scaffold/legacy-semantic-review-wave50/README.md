# Wave50 legacy semantic review Scaffold

Wave49 の修正版 exact HEAD `36795d575e379f18eb67e21cc56dde38c4057c63` を含む #2044 merge と #2045 merge 後の最新 main `c52f27093869a0ecbdfbc416fb0bffdb49b85071` を base に、旧IR direct semantic review の残2 unit `HIL-NFR-20`／`HIL-NFR-22` を bounded research candidate として静的照合する。Binding は `SCF-B-0097` である。main merge の親は `dbe43847bfc7f4677c7e5d186b0afb82d38bab3b` と `fe23832e4a384572f62dadfddb5491b52e7a208a` である。

選定対象は次の2件で、いずれも `HELIX-OS`、phase candidate は `PHCAP-07` である。

- `IRUNIT-HIL-NFR-20-HELIX-OS`: source／evidence／manifest 境界を持つ design candidate `LEGACY-ASSET-614BF1FA7A7310E3BB4A` を1件選定。
- `IRUNIT-HIL-NFR-22-HELIX-OS`: design candidate は同じ phase/product pool の先行/current reviewで全て consumed のため直接選定せず、examined-not-selected として記録。

両unitの `implementation_source` は missing として保持する。NFR-22 の design を含め、各 role の candidate／consumed／examined-not-selected／unexamined asset ID を meta に再照合した。旧 source、判断史、failure/read-after、consumer は静的に参照し、候補assetを正式 authority、current implementation、degradation、formal successor、phase admission、consumer closureへ昇格しない。authority effect は none、implementation／degradation は unknown、legacy execution は not run とする。

Wave50 は current 2 unit／3 role edge／3 semantic atom／2 composite unresolved／1 selected role asset／5 inspected legacy asset／3 missing evidence receipt である。累計は旧IR研究分母として 218 unit／598 edge、残0 unitとなる。`218/218` は旧IR研究の分母進捗だけを示し、四製品の完了、owner、authority、現行実装、formal successor、degradation の確定を意味しない。

旧 archive は source、判断史、failure、consumer の reference として読むだけで、runtime、test、CI、workflow、hook、adapter、source は実行しない。新規実装、owner決定、successor割当、release、deploymentは生成しない。Wave49 exact HEAD または main が変わった場合は rebaseline してから review 依頼へ進み、merge、close、post-merge read-after は実行しない。

検証経路:

```text
python3 -B scaffold/legacy-semantic-review-wave50/generate.py
python3 -B scaffold/legacy-semantic-review-wave50/validate.py
python3 -B scaffold/legacy-semantic-review-wave50/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は latest main merge lineage、Wave49 exact HEAD、旧 source／asset／decision／failure／consumer receipt、unit／edge／atom、独立 phase／product pool、candidate accounting、authority／implementation／degradation boundaryを fail-closed に検査する。`selfcheck.py` は同じ validator 経路で意味ある負例と Wave49 template 残留を検査する。
