# PHCAP-07 Verification／L10 Web・Web-OS research premise candidate

これはPHCAP-07「Verification／L10」のHELIX-Web／HELIX-Web-OS製品別証拠gapを静的に保持するresearch premise candidateである。対象product unitは2件、候補edgeは16件、旧代表assetは7件である。正式L10、新世代CI、要求採否、owner、successor、implementation、acceptance、releaseは生成しない。

## 固定した範囲

- capture時点の`origin/main`は`569d7373c32287bbafadeec6043472563937c5c7`。既存Wave23／Wave24と他PHCAP候補は未mergeとして扱い、authorityやbaselineへ変換しない。
- PHCAP-07のphase recordは、候補productをHELIX-HARNESS／HELIX-OS／HELIX-Web／HELIX-Web-OSとする一方、現行直接evidence productはHELIX-HARNESS／HELIX-OSだけである。Web／Web-OSはphase direct refを持たない。
- Web／Web-OSのL2／L11文書は製品固有の隣接draftとして照合した。L11本文も全件未実行であり、画面存在、HARNESS単体test、OS CI成功を受入の代替にしない。
- 旧assetはL8 integration、L9 system、L12 V-model coverage、旧L10 merge admission test design、UX evidence boundary、L11 UAT boundary、旧L10 Scrum typed projection acceptanceの7件である。旧assetのsource、判断史、failure、consumerをread-onlyで照合した。
- phase inventoryの`documented_with_test_design`／最大L12と、selected assetの`implementation_status=unknown`／`legacy_execution_performed=false`を別事実として保持した。旧test、runtime、CI、hookは実行していない。

## 製品単位とgap

HELIX-Web unitは利用者向けConnector／dashboard／service verification、HELIX-Web-OS unitはtenant／Connector／job／service state／deployment／monitoring／recoveryのruntime verificationを候補とする。両者はversioned contract／artifact／receipt／export候補で接続し、shared state、writer、credential、release authorityを推定しない。

旧assetのdecision ledger該当は0件、ledger consumer refsは空、failure execution receiptは0件、current L10 execution receiptは0件である。旧source中のoracle・negative case・test citationは候補findingであり、実行・合格・正式oracle登録を示さない。製品固有L10 contract、oracle registry、formal CI profile/relation、runtime receipt、consumer read-after、failure closureはunknownまたはpendingである。

## 静的検証

```text
python3 scaffold/phcap07-web-verification-l10/validate.py
python3 scaffold/phcap07-web-verification-l10/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

検証はsource digest／exact span、phase・asset ledger、product unit／connection、direct／adjacent／unknown境界、stale capture、negative caseだけを確認する。旧archiveのtest/runtime/CI/hook、正式L10、新世代CIは実行しない。

## Binding

`scaffold/bindings/SCF-B-0031.json`はこの候補の暫定役割を登録する未使用Bindingである。正式artifactが成立した場合はSCF replacement手順で置換・retireする。Bindingのupstreamは現行台帳・現行製品文書・candidate artifactに限り、旧sourceをcopy・実装・oracleへ昇格させない。
