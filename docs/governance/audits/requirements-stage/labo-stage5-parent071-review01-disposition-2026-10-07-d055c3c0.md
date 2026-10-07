# LABO-071 review01 post-body disposition audit — d055c3c010

- 対象: PR #2645、body revision `d055c3c01095bd4cb67da04f52cb68d254dff342`（parent `4dd580f0fa0537d1530a4ffe457fd64a30e50c80`）、review base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`。
- 正確なreview comment `6024497040` はMajor 1。正式raw本文、依頼comment、exact before/after、raw SHAは同梱JSONに保持。
- Workerが作成した候補をRootが六本文と照合し、時点監査として採用した。既存監査は変更していない。

## 固定親とsource pins

- PO採択判断記録は `3795bf0dcb731231a0b5ca1faa3cb67bdfeda22a`。その記録が固定するL2/L11本文source revisionは `ea6f756f96a7370de78e412d737c7a7ed472114a`。L2 576–594はfull SHA `cae0cf9f564ec607e855fcc98f934801bee1c63be4b9446f9097578748cb70f6` / raw span SHA `3036e4c300ee6f78e74b819657d456c0bad08b8ccb483882cfc3b59fa5bbbe1f`、L11 309–328はfull SHA `39d9ab3605ff6c74fbc4c363ba0125df0461935053e7ef40c50eed1386be882a` / raw span SHA `029c6bcea5a206a15c8bbe9706ff25917fbf9a6496b3891288fc2660634f7bc0`。
- PO live26の採択行50 SHA `2618bf7c08f66ba92b1e4c8fece234c73f05945401d430419d023596ea365676`、071適用限定行72 SHA `410b827982a782cf507851e49843ccef13b48f9dc920f22205dd6769dbd9255f`。行72の「qualificationを操作権限や割当へ自動変換しない」という固定範囲を記録し、要件を拡張しない。
- 旧24 CASE literalと各raw LF SHA、選択した旧source・文脈source、台帳consumer refsをJSONへ保持。旧source/test/runtimeは実行していない。

## 対象本文と修正処置

- six documentsのfull SHA、ceda main prefix SHA/一致、physical suffix bytes・SHA・literalをJSONに記録。6本文のbody bytesはbase bytesからのexact prefixを確認。
- M1: FR-03とAC-03の非生成範囲へmodel/provider/lane選択を追加。FVは各選択fieldを一つずつ生成する3個の単一変異CASEで拒否し、他の入力・field・qualificationを固定、誤ったLABO候補出力の修正へ戻す。ownerや選択契約を新設しない。
- 旧24 IDをすべて保持。review前の28 unique CASEから現在31 unique CASEとなり、追加は `L10-LABO-071-CASE-r01-model-selection`、`L10-LABO-071-CASE-r01-provider-selection`、`L10-LABO-071-CASE-r01-lane-selection`。この件数は完全性の証明ではない。
- R1は表見出し、R2は件数見出しを修正。R3 stale基準、R4 title逆向き生成、R5戻し先具体化はformal原文どおり残余として保持し、この監査で解消扱いにしない。

## 検証境界

- Rootはgovcheck/diff check passを報告済み。この記録ではRootの検収結果として区別する。今回のworker側 `git diff --check ceda1c53b53c53fffb8c23f394add1f2b809deb1...d055c3c01095bd4cb67da04f52cb68d254dff342` はreturn code `0`。
- fixture/NFRは未実行。独立再review、Fable判断、承認、実資格、実権限、完全性、merge admissionを主張しない。
- raw formal historyは同梱JSON `formal_comment_history` に全2 comment本文のまま格納。

JSON: `labo-stage5-parent071-review01-disposition-2026-10-07-d055c3c0.json`
