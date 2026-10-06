# LABO070 起草時点監査（Root検収用）

- 対象worktree `/home/tenni/.helix-worktrees/l3-labo-stage5-parent070`、branch `l3-labo-stage5-parent070`、HEAD `395fee3c7ed5562d5f69377ba63f1af40499a07d`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`。working tree clean=true.
- Root integration checkpoint: `/tmp/root-labo070-integration-checkpoint.json` (143104 bytes, SHA-256 `991a5477fcfaf30630939c652ff88a7d4ff0c5d642f3c48ab1be8f55ee52f329`)。最終候補: `/tmp/labo070-six-suffixes-final-candidate-worker.json` (910726 bytes, SHA-256 `50503ed9ed1318b431d38285d3803b3c3977d3abb916acb58e84fc54a9f35276`)。JSONにcheckpoint・候補入力・旧literal84行・現行98行・六本文pinを格納。

## 本文・固定source・判断記録

- 6本文はbase `ceda1c53b53c53fffb8c23f394add1f2b809deb1`からのRoot checkpoint差分と現HEAD bytesを物理照合した。候補artifact内の初期`base_pin`は `a1bcdba15b4c10271d80291dc6062cf31250cf3e`を含み、別の`final_six_suffixes`は最新cedaを基準にする。a1からcedaまでにmainへ入った067等の本文と、Rootによる正常oracle補強を保持するため、初期pinと候補suffixだけから現HEADを再構成しない。この基底差を隠さずJSONに記録し、現HEAD判定はRoot integration checkpointとceda prefixで行った。全本文のfull/suffix bytesとSHA-256はJSONの `six_documents_actual_pins` に記録。
- 固定L2/L11は `ea6f756f96a7370de78e412d737c7a7ed472114a` の実spanを読んだ。両spanは従来固定 `0abb2894a73487439408ffc980bfac5e9298c616` の同範囲とbyte一致。PO live26 49行目の `MPR-RC-HELIXLABO-L2-070-001` 採択記録もbase上で実読した。
- 旧source `execution-ticket-requirements.md:399` と対応する旧acceptance consumer `execution-ticket-acceptance.md:84–104` を旧snapshot `a4a365dcdfe824ebb28d040c8bc3bc924556efad` から再取得し、span/full hashとcandidate pinを照合。9 selected source atomも登録source `048a1770d10f5a1f24f7cf0a95f43dfdc318591d` の実行なしraw行と照合した。

## 旧84 literalと現98行

- 旧snapshotのFV全体と旧84定義literal/各物理行SHAを照合し、84件すべて一致。旧literalは時点監査JSONへrawで保持。
- 現HEAD FVのCASE-LABO-070六列定義表を物理抽出し、98行・98 unique ID、旧84 ID保持、追加CASE-85–98を照合した。件数は意味完全性を証明しない。
- CASE-01正常oracleは、4種durationのsource-defined計算、defect既存oracle/relation、rollback receipt、overhead実測receipt、freshness差分、適用可能な067/068元receipt値を照合するRoot補強文と現行本文で一致するかを確認した。これはfixture実行ではない。

## 検証範囲

- Root報告のgovcheck/diffcheck PASSは再実行せず報告値として保持。旧runtime/CI/Bun、fixture、独立review、承認、canonical編集は行っていない。
- 再計算チェック: `PASS`。

詳しいsource raw、98行の6列全行、84旧literal、すべてのsha256、照合結果は同名JSONを参照。
