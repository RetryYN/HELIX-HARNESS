# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` の資産台帳から、`docs/governance/candidates/execution-ticket-*` の8資産を対象にします。重複比較は、#2094と#2096の両方を含む固定main `be9cf8cf99ee94a487e54d372d7a34e9266b1ee3` のみに統合しました。比較集合は708行／666 distinct IDで、対象とのID・path・source SHA・triple重複はありません。#2096を別集合として数えません。

分類はHARNESS/OSの `multi_product_conflict` が6件、`insufficient_basis` が2件です。visionは実行契約と測定接続を併記し、HARNESSのV-model実行契約とOSの計測・Worker運用の両境界に接するため、複数製品衝突候補としました。これは正式owner決定ではありません。分類とbootstrap候補が異なる6件（recognition、requests、requirements、validation、vision、intake）は各recordにbootstrap候補と差分counterevidenceを保持します。

consumer調査では固定BASEの`docs/helix-*`と`docs/governance`を候補basenameごとに走査し、実際のpath・line・text・file digestと参照種別を記録します。phase capability inventory、implementation crosswalk bootstrap、pre-isolation holding、source audit、overlap cluster、L2 source register、現行L2/L11の参照を含みます。参照はsource ledger、bootstrap候補、source preservation、候補crosswalk、現行L2/L11接続などに分け、いずれもconsumer closureとは扱いません。carry-forwardの各source lineは別の保全receiptに集約します。requestsとvalidationの現行L2/L11参照は接続の反証情報として示し、consumer closureは全件pendingのままです。

旧archiveは固定Git objectから静的に読み、旧source、test、CI、runtime、hook、adapterは実行しません。LABOはIssue #2089のholdに従って対象外です。分類・phase・実装・consumer・successor・build authorityを更新せず、research-only Scaffoldとして扱います。

検証は固定Git objectからの再導出、意味anchorと分類不変条件、全record/inventory/Binding byte pin、ledger byte digest、独立した1変異1ケースのselfcheck、`scfctl validate`で行います。検証合格は正式採否や完了を生成しません。

比較main `be9cf8cf99ee94a487e54d372d7a34e9266b1ee3` は観測snapshotです。現在のmainがこのrevisionから進んでいたら、この候補選定と重複判定を使わず停止し、最新main全体で比較集合・候補範囲・ID/path/SHA/triple重複を再導出します。再比較で候補範囲か重複結果が変われば選定を停止し、新しいscopeの研究資料として再作成します。

```sh
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/generate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/validate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```
