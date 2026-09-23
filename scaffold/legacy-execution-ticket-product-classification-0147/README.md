# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` の資産台帳から、`docs/governance/candidates/execution-ticket-*` の8資産を対象にします。重複比較は、#2094と#2096の両方を含む固定main `be9cf8cf99ee94a487e54d372d7a34e9266b1ee3` のみに統合しました。比較集合は708行／666 distinct IDで、対象とのID・path・source SHA・triple重複はありません。#2096を別集合として数えません。

分類はHARNESS/OSの `multi_product_conflict` が6件、`insufficient_basis` が2件です。visionは実行契約と測定接続を併記し、HARNESSのV-model実行契約とOSの計測・Worker運用の両境界に接するため、複数製品衝突候補としました。これは正式owner決定ではありません。分類とbootstrap候補が異なる6件（recognition、requests、requirements、validation、vision、intake）は各recordにbootstrap候補と差分counterevidenceを保持します。

consumer調査は失敗・consumer inventoryだけで閉じず、`docs/helix-*`、L2 source register、carry-forwardを照合しました。requestsはL2 source registerとHELIX-OS L2要求、validationは同registerとHELIX-OS L11受入に直接接続する記録があります。carry-forwardはsource行保全の証拠として記録し、製品consumerやclosureとは扱いません。consumer closureは全件pendingのままです。

旧archiveは固定Git objectから静的に読み、旧source、test、CI、runtime、hook、adapterは実行しません。LABOはIssue #2089のholdに従って対象外です。分類・phase・実装・consumer・successor・build authorityを更新せず、research-only Scaffoldとして扱います。

検証は固定Git objectからの再導出、意味anchorと分類不変条件、全record/inventory/Binding byte pin、ledger byte digest、独立した1変異1ケースのselfcheck、`scfctl validate`で行います。検証合格は正式採否や完了を生成しません。

```sh
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/generate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/validate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```
