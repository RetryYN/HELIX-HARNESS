# DELEGATED-DOC-003/028 と REF-0303/0759/0760 のatom候補

このdirectoryは、正本台帳にある次の一文書pairと3参照edgeを、意味同値・採否・責務配置を
決めずに静的レビューへ束ねるscaffold candidateである。

- `DELEGATED-DOC-003`: `github-autonomous-operations-requirements.md`（旧L3 requirement、status `confirmed`）
- `DELEGATED-DOC-028`: `github-autonomous-operations-acceptance.md`（旧L10 acceptance pair、status `proposed`）
- `DELEGATED-REF-0303`: requirement frontmatterの`pair_artifact`
- `DELEGATED-REF-0759`: acceptance frontmatterの`pair_artifact`
- `DELEGATED-REF-0760`: acceptance本文のrequirement参照

2文書のarchive blobは合計244行で、行被覆用composite span 14件（003が10、028が4）と、意味分類用atom 59件
（GH-FR 17、GH-NFR 8、GH-AC 13、GH-T 16、metadata/evidence 5）を分離して保持する。各原ID atomは原文行・SHA-256・
candidate kind・target・owner候補・未確認のphase／implementation／consumer状態を持つ。
製品ownerはHARNESS（V-model、要求・設計・検証contract）とHELIX-OS（GitHub／CI／state／closure運転）の候補を併記し、
混合契約は`unresolved` targetへ保持して個別atomの最終ownerを未決にする。旧資産台帳では、両文書とも`Historical`／`unresolved`、implementation unknown、
consumer refs空、consumer closure pending。003のphase候補はPHCAP-16/17/18/20、028はPHCAP-16であり、
いずれも候補分類に留まる。

```text
python3 scaffold/delegated-doc-003-028/validate.py
python3 scaffold/delegated-doc-003-028/selfcheck.py
```

validatorは正本台帳、固定Git archive blob、製品境界候補のdigestとatom spanを照合する。旧runtime／test／CI、GitHub、DBは
実行・更新しない。検証合格はatom化完了、意味同値、要求採用、L2/L3/L10 freeze、implementation、consumer closure、
acceptance、releaseを示さない。
