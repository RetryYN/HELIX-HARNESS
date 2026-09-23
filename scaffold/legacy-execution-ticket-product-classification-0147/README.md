# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` の資産台帳から、`docs/governance/candidates/execution-ticket-*` の8資産を対象にします。#2094はこのBASEへ統合済みでmain集合に一度だけ含め、比較対象から除きました。open PR #2096はHEAD `ab0a1faa4e2b310206b97a786c329334a2a0e151` に固定しています。このHEADが進んだ場合は作業を停止し、新HEADとmainを再確認してから再集計します。固定比較集合はmain 651行／609 distinct ID、#2096 57行／57 distinct IDで、対象とのID・path・source SHA・triple重複はありません。

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
