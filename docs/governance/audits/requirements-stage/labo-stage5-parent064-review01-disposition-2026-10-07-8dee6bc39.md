# HELIXLABO-L2-064 review01 disposition監査候補

この監査候補はPR #2632のreview01 comment 6020402005に対するM1補正のsource・literal・状態を固定する。対象本文はworktree内commit `8dee6bc39130395107b76ed24af6688287b54869`。追跡枝は記録時点でlocalが1 commit先行し、remote PR head更新は未確認である。独立再reviewは未完了なので、M1解消・承認・Ready・merge admissionを主張しない。

## 固定された根拠

正式comment bodyはUTF-8 7,619 bytes、SHA-256 `a64d45149e60eb0d190040a1569304e35e6900a464f967ff24561e17a42bdd8d`。原文全文とM1部分、残余R1–R13の原文行をJSON companionに保持する。

固定親は`docs/helix-labo/L2-requirements/labo-requirements.md` commit `0857205ecb7a18db9d8d926142e865776c1bf6e2`、lines 493/497/500。該当raw-line+LF SHA-256はそれぞれ `286296d7aa281fd8e6720cc146c9d87a3b40f77374edec91802a578d2bff05ef`、`1139266a5128c72c4087fe51b39aea961021f66d23619042b9edccf52472f1cc`、`4000f0fd2cef8b4fd4d58cdca54a3c420d890ec53d4f032a1905d38753657a8d`。L11 lines 233–239のspan SHA-256は `4f51be505b3c169f08aa61c2dd192b21b1b185db0f5243f556853bcb3e1a1fe3`。

## 差分とCASE literal照合

現行6本文のfull SHA-256とsuffix checkpointはJSONの`fixed_source_pins.current_six_requirement_bodies`に、Git repository path・base commit・correction commitとともに記録した。PR本文へ対応する固定6文書すべてをcommit objectから再計算し、checkpointと一致した。

FV `docs/helix-labo/L10-verification/functional-verification.md`では、修正前commit `63c78c8593e022e3b9253f6cf5d47456d2151b13`の064節が42定義・42 unique、修正commit `8dee6bc39130395107b76ed24af6688287b54869`が49定義・49 unique。旧42 raw行はbyte-identicalで、追加はCASE-40–46の7行、すべてAC-03。各raw literal、行番号、LF込みhashをJSONに保持した。行数やID数は意味完全性の証明ではない。

FR `docs/helix-labo/L3-requirements/functional-requirements.md`のAC-03へ、既存OS assignmentと適用SECURITY許可を入力要件として照合し、評価・比較結果から許可やWorker起動、assignment/admissionを生成しない文を追加した。missing/unknownの場合は元run/条件を保持し、比較未評価とtask/evaluation ownerへの再評価義務を残す。新しいowner/許可経路は設けていない。

## 残余と監査参照

初回commentに記録されたR1–R13を原文のまま保持し、いずれもこの追補で閉じない。R11–R13にあった初回監査のtmp参照・状態・行keyの指摘も、初回記録を書き換えずに保持する。この新記録では6本文をGit path + commit + full SHA/suffix SHAで指し、L2 line pinsとFV064節限定CASE literalsを明示する。source evidenceとしてローカル`/tmp`を参照しない。

今回の初回needle検査は共通見出しをrepo全体から一意検索して失敗したため、064 Stage 5節内へ限定して再計算した。table-only regexがbullet定義2件を落とした先行起草確認とは別経緯である。tmp候補段階のCASE-41、HOT-HIL-54 asset pin、L2:497/500参照の訂正もJSONに区別して記録した。最終照合は42 before / 49 after、旧42 raw lines byte-identical、7 unique additions、6 full-body hashes一致。

検査は文書・ID・SHAの静的照合に限定した。runtime、tests、CI、Bunは実行していない。独立再reviewの結果は別の時点記録へ残し、この監査は書き換えない。
