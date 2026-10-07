# LABO-066 review05 M1処置監査

- 対象HEAD `fc1c75a1fcf88ba351f7b138d64c902d03df712e`、parent `e839d048fecb2d043eb6eb0fbad05c5401365424`、base `f5a974a4059a209982cb1cdec39c0537f52683b8`。current main check `3c3c512c09320c0494904602b23e544a81206eed`。worktree status: clean（branch ahead 1）。
- これはread-onlyの処置監査。M1修正後の新しい独立reviewは未実施。canonical文書・旧時点監査は変更していない。

## 固定親とformal所見

- 固定L2: `docs/helix-labo/L2-requirements/labo-requirements.md:527` SHA `e77da6f0a4f38af2ceb31f51115c7e875d54f2b1405470a6e44363e9bea2c210`。固定L11: `docs/helix-labo/L11-acceptance/labo-acceptance.md:267` SHA `b4c89b0d1f4bfafb386d35380434978e9817b4be95fba42c63db2e96189c79ab`。両span hashはJSONに保持。
- Formal #2635 comment 6022726411 raw body SHA `03801d8d8d1afbc35435e79adf43ecf73a4e00c4e248bc5de815696eadafe886`、全5026 bytesをJSONに保持。R1–R23履歴参照としてreview04処置監査 JSON SHA `082f6cadd0cb47745ace676d579c54e0dd966a8003f0c5a0a1a42c25f36311d5`、MD SHA `eb939ee34157c5f35e2fbade79425412b72fc388871f9ddbdc114720a197bd15`を保持。旧authoring時点監査はsource commit `b6d47f74b27168c9137559fd227d38d805b063af`でJSON SHA `685b7a391f90294e6e3876fd98802c0ea62617374b65ffa2198bf42e7533cd64`、MD SHA `39e3710c793f6cd5339e1c06ecf784b57aeb71a0f6fb3d0c4c061e2712503bac`。既存記録は書換えていない。

## current body/差分

Labo対象6文書はcurrent main `3c3c512` とbase `f5a974a` が全文byte一致し、各追補はf5のprefixを保持。6文書のbase/current full SHAとsuffix SHAはJSONへ記録。f5→3c3cの差分はHARNESSの6本文と042 decision/audit 5ファイルで、LABOの6本文は変更されていない。

旧body `e839d048` とcurrent `fc1c75a1` の比較では functional-verification の4行だけが差分。各行はexpected列だけが変わり、CASE ID・FR/AC・baseline・mutationは保持。残る5文書は全bytes同一。CASE-066は67 unique IDを維持。4現行行は `/tmp/labo066-review05-m1-fix-candidate.json` の候補行に完全一致。

### L10-LABO-066-CASE-03d（line 3252）

- 旧expected: QunknownをunknownとしてN/記録に残し、rateを確定しない。適用可能性/receiptの既存責務ownerを特定できる場合だけ返し、LABOは評価未完了を維持する。
- 現expected: QunknownをunknownとしてN/記録に残し、rateを確定しない。oracle適用性不足はHARNESSまたは要求ownerへ返し、assignment/run receipt不足はOSへ返す。その他のreceipt不足はその供給元の既存責務区分へ返す。個別owner identityを特定できない場合はidentity unknownを別に保持し、LABOは評価未完了を維持する。

### L10-LABO-066-CASE-03e（line 3253）

- 旧expected: U0のunresolved判定とreceiptを保持し、successだけへの置換を拒否する。解決状態sourceの既存ownerが特定できる場合だけ返し、特定不能はunknownを残す。
- 現expected: U0のunresolved判定とreceiptを保持し、successだけへの置換を拒否する。解決状態source/receiptの不足は、oracle/acceptance適用性ならHARNESSまたは要求owner、assignment/run receiptならOS、それ以外は当該既存sourceの責務区分へ返す。個別owner identity不明はunknownとして別保持し、LABOの評価未完了を維持する。

### L10-LABO-066-CASE-05（line 3255）

- 旧expected: 同一比較として合算せず、method/versionの既存責務ownerが特定できれば返す。できなければunknownを保持する。
- 現expected: 同一比較として合算しない。method version不一致の比較を比較不能/未評価として率を確定せず、method/versionを供給する既存source/責務区分へ返す。個別owner identity不明はunknownとして別保持し、LABOの評価未完了を維持する。

### L10-LABO-066-CASE-06（line 3256）

- 旧expected: 母集団を分離し、cutoff/母集団の既存責務ownerが特定できれば返す。できなければunknownを保持する。
- 現expected: 母集団を分離し、cutoff不一致の比較を比較不能/未評価としてrateを確定しない。cutoff/eligible populationの不足・不一致を原因別の既存責務区分へ返す。task/scope/target入力recordはOSまたは観測source、assignment/run receiptはOS、comparison scope/evaluationはLABOへ返し、個別owner identity不明はunknownとして別保持する。

## R24–R27の現時点

- **R24**: CASE-05/06へ比較不能・未評価を明記したため本文上は対応済み。独立reviewは未実施。
- **R25**: 遡及変更禁止の明文は本M1範囲外で、残余。
- **R26**: A version単独欠落fixtureは追加しておらず、残余。
- **R27**: CASE-21/23/24/43の戻し先懸念は本M1範囲外で、残余。原文はJSONに保存。

## 検証範囲

- 6 full-byte hash、f5/3c3c base一致、旧e839との差、67 ID一意性、固定source line/span pinを静的確認。
- fixture実行、CI、tests、新しい独立reviewは未実施。

詳細JSON: `/tmp/labo-stage5-parent066-review05-disposition-2026-10-07-fc1c75a1.json`
