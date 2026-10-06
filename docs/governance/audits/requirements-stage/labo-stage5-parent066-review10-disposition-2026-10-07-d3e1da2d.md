# LABO-066 review10 postbody時点監査

Rootが採用した本文 `d3e1da2d44f22bba59926056468c6e9c3da1d7bb` を読み、統合checkpointおよび採用候補との一致を検算した。監査対象はPR #2635、base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`、worktree `/home/tenni/.helix-worktrees/l3-labo-stage5-parent066`。Rootが行ったcanonical commit/修正を本workerは変更していない。

候補・checkpoint rawとR1–R37正式レビュー履歴、旧74物理literal、旧67 raw literalは監査JSONへ保全した。CASE-66/67のRoot最終行raw、全76行ID・physical line・line SHA-256も同JSONに記録した。

## 照合結果

- six whole-document pins: 6/6 がRoot checkpointのbytes/SHA-256と一致。LABO-066各suffixもRoot accepted candidateとbyte一致。
- functional verification: 76 unique ID、各行6列。旧74 IDを全て保持し、CASE-66/67を表末に連続追加。
- 旧literal: 67/67 raw SHA一致を候補記録で確認。
- M1 fixture: N=5固定、全条件/oracle applicabilityは正常、candidate群Q5のoracle判定receiptのみ欠測。欠測はunknownとしてNに保持し、理由/影響caseを示しrateを出さない。
- CASE-67: 同じ欠測入力/正しいunknown出力から`eligible_denominator_case_ids`だけQ5を外す出力変異。rateは非出力のまま、分母誤りをLABO出力処理で訂正しreceipt供給責務へ転嫁しない。
- fixed source actual spans: L2/L11-066は318ec4aのL2 518–528 / L11 261–268。L2-059 lines 416–440は比較のshared contextに限る。L11 G13 lines 164–170はshared contextと059 acceptance row。別候補を066 parentへ含めない。
- 旧pin metadataがL11-059としていた243–260はL2-065 qualification本文である。誤りは履歴に残し、修正済みpinの根拠には使っていない。
- Root reports govcheck/diffcheck PASS; this worker did not rerun them. Fixture/oracle/comparison run、独立review、L3承認は未実施。

JSON: `/tmp/labo066-review10-postbody-audit-d3e1da2d.json`
