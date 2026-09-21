# PHCAP-10／11 Worker実行・CI／Test research premise candidate

これはPHCAP-10「Worker実行」とPHCAP-11「CI／Test」の旧asset、現行4製品境界、欠落・縮退・phase候補・実装状態を、`authority_effect: none`の静的候補として保持するScaffoldである。正式な要求採否、successor、L2／L11、L3／L10、実装、受入、CI green、consumer closureは生成しない。

## 固定した範囲

- rebaseline後の`origin/main`は`43bd941b5fea92e132566e0004e9b9a03f1f84f5`。このcandidateのbranch、Issue、review、CI状態をauthorityへ変換しない。
- PHCAP-10はphase record上のproduct targetがHELIX-OS、current statusが`draft_requirement_and_bootstrap_decision`、旧到達層がL7、phase-level historical summaryが`implemented_with_tests`である。
- PHCAP-11はphase record上のproduct targetがHELIX-HARNESS／HELIX-OS、current statusが`candidate`、旧到達層がL10、phase-level historical summaryが`implemented_with_workflow_and_test_design`である。
- 旧代表assetはPHCAP-10が5件、PHCAP-11が6件。全11件をlegacy dispositionとphase/product bootstrapへ照合し、`Historical`、`disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`、個別decisionなしを固定した。
- 旧sourceのexact spanは22件。archive本文は静的に読み、旧runtime、旧test、旧workflow、旧CI、hook、adapterは実行していない。

## 四製品の分類

| 製品 | PHCAP-10 | PHCAP-11 | 現行実装状態 | 扱い |
|---|---|---|---|---|
| HELIX-HARNESS | direct current refなし | candidate direct ref | unknown／未実行 | HARNESSの検証義務候補とOS実行統制を混同しない |
| HELIX-OS | draft requirement＋bootstrap decision | candidate direct ref | unknown／limited bootstrap | bootstrap decisionはlease、executor、operation_change、CI実装を成立させない |
| HELIX-Web | direct refなし | direct refなし | unknown | 隣接L2／境界だけを保持し、欠落から未実装を推定しない |
| HELIX-Web-OS | direct refなし | direct refなし | unknown | service runtime境界だけを保持し、Worker／CI実装を推定しない |

`product_targets`は旧assetの候補であり、現行ownerや要求採否ではない。旧CI要求、旧workflow、旧test designには複数phase／複数製品候補があるため、unit・connection・compositeの意味分割、formal owner、consumer closureを未解決として残した。

## 検証

```text
python3 -B scaffold/phcap10-11-worker-ci-static/generate.py
python3 -B scaffold/phcap10-11-worker-ci-static/validate.py
python3 -B scaffold/phcap10-11-worker-ci-static/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはphase record、旧asset disposition／phase-product分類、archive bytes／line span、現行ref digest／span、4製品unit、22 edge、decision・failure・consumer残差を検査する。selfcheckはauthority・実装・oracle・direct ref・旧実行・consumer closure・decision・digest・unit統合の昇格を陰性例として拒否する。

## Binding

`scaffold/bindings/SCF-B-0042.json`で、PHCAP-10／11の製品別phase evidence gapと旧asset semantic review候補を登録する。これは正式artifactの代替ではない。正式なL2／L11、L3／L10、CI profile、Worker runtime、product boundary、consumer read-afterが成立した場合は、Scaffold replacement手順で置換確認を行ってから退役する。
