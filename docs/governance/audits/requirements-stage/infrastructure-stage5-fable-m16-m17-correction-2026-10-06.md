# INFRASTRUCTURE Stage 5 Fable m16/m17補正記録

- 対象本文commit: `5efbd349b56e033ecfbad0828731b18fceebe9e9`（親 `b6b6b8c7cd34b53905fe3dfa35ce2b56559a7de9`）。本記録は本文修正後の時点監査で、以前のauditは変更しない。
- 正式comment 6005366115のm16/m17を照合して補正した。review02依頼comment 6006259427はreview01 21所見を依頼scopeとしていたため、Fable追記2件を別途明示記録する。

## 処置

- **m16 — read-only空write-setと禁止write:** S5-055に`write_set=empty`を加えた。新しいS5-086はS5-055正常baselineから`write_attempt`だけを加える単独変異とし、試行を拒否し、writeを実行せず、前後状態が同じでも拒否を省略しないoracleにした。AC-03/04とNFR-011-S5-01/02へtraceした。旧85 IDを保持し、形式別CASE数は86（unit 54／operation 5／recovery 9／connection-composite 9／scope 2／environment-operation negative 6／partial composite 1）。
- **m17 — S5-058 normal return:** FR/FVとも正常時は戻し先なしとした。path source owner未特定はunknownとして記録するが、正常fixtureで差戻しを発生させない。S5-057の既存正常時戻し先なしは保持した。

## 根拠と比較

固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`を再確認した。L2-010はL2:126–134/L11:132–134、L2-011はL2:138–147/L11:140–150を照合した。L11-010:132–134はread-only fixtureの空write-set、対象scope、write禁止、operation前後値を直接規定する。L11-011:147は構成体操作別oracleで同じ境界を求める。L2-011 L2:145およびL11:149の戻し先は失敗時に適用され、正常なS5-058からowner返却を生成しない。旧OPS-R-02:74–79/OPS-AC-002:27–29はPlan/Receipt分離、target/permission、before/after receiptの比較材料であるが、empty write-set意味の直接根拠ではない。

## 固定値

- L2 full SHA-256: `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`; lines 138–147 span SHA-256: `ddedb41002d72be9322e99d6f82233d231795f3e9cc167d2bc048c2bbe765791`
- L11 full SHA-256: `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`; lines 132–150 span SHA-256: `3cfce31a6cc2d55ddfa8c5ac819a90c87397ec5d7b4454fbfef85795600419f0`
- L3/FV/NFR本文とCASE literal、全行pin、正式comment raw-body SHA、旧監査SHAは隣接JSONに固定した。
- 静的確認: 既存85 IDs保持、新86、FR/FV ID集合・prefix一致、AC/NFR trace、S5-058戻し先一致、`git diff --check`。
- 限界: 合成fixture案であり未実行。旧runtime/test/CIは起動せず、承認・実行許可を生成しない。
