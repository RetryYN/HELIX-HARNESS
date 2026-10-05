# HELIX-HARNESS Stage 2b review03 correction

## 対象と対象revision

正式comment 6000884083（`2bcba20568e427ab9593ba30e399da6f0bf92b0b8ea1ada2c3e8b5b9acacf295`、`/tmp/pr2613-review03-full.md`）のMajor 4件・Minor 5件を対象とする。本文補正commitは `28cadb8071697a4f5fd793188f34a5018b6f43f2`、その直前のbase content HEADは `3972525deeb203fc8c8f98d8f8cdd04059c85573`。Rootが作業treeに置いていた4文書の補正は内容確認後にそのまま保存した。本文の変更範囲はFR/FV/NG/NVの4文書。旧監査は変更せず、SHA-256をJSONへ再記録した。

## 所見対応

Major 1では018の共通上書き禁止を7値に分解し、R048とR050–055で一値だけの変異を作った。Major 2ではPoC meaning differenceのL2-008 BackflowをR080、単体/connection/composite identity欠落をR081–083、trace欠落をR084に分け、FRとACにもidentity/failure/timeout/trace/owner/re-entryの保持を反映した。Major 3は回答矛盾の黙殺をR085として自動解消から分けた。Major 4は外部成果のL2-022同一revision evidence条件をAC-020-03へ加え、要求revision不一致をR023でR022のcontract version mismatchから分けた。

m1はFR-017/018/019へ固定L2/Concept条件を明示、m2は人間専決値unknownをR086へ単独化、m3はR022を外部成果の次単位入力契約ownerへ限定した。m4のPR本文改訂はRootの指示によりこの作業では行わず、final HEAD確定後のRoot作業として監査へ記録した。m5に対し、本JSONの`case_inventory.all_fixture_rows_by_parent`は対象206行すべてのliteral/cells/AC/input/oracle/行SHAを収録し、過去のIDだけの監査を不変保持した。

## CASE・固定親・sourceの照合

FVの対象CASE集合は017=19、018=55、019=23、020=23、024=86、計206件。重複0、18 ACすべてにCASE参照あり。6 canonical文書のbase `5acae384305b01d10e88eeb2e6406f847baf66df` bytesは、各現行文書の完全一致prefixである。本文差分4文書の全SHA/bytes、FV全CASEの幅（4列505行、6列12行）、対象CASEすべての4列、全ID重複0、target AC参照の解決を同JSONに記録した。

固定L2/L11の採択revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` を原文のまま再読・SHA pinした。R014/R020/R021の追加読解では、R014のL2-022段階evidence不足はL2-022/L11-022と一致する。R020/R021は未完義務の保持・合流先照合（L2-020）と各pack owner（L2-010）を根拠にするが、固定親は個々の義務に対する具体的受取人を一律に名指してはいない。CASEはその義務に宣言されたownerを使い、未知ownerの補完や新ownerの創作はしていない。より具体的なowner根拠は未確認として残す。

旧source 17件のID/path/full SHA/span SHA/literalをJSONにpinした。m3と024の根拠であるE78B RDJ-FR-003/007とAD74 RDJ-AC-003/007は旧意味の比較起点だけで、現行のoracle/authorityへ移さない。A2F6、35C7、B7E、63DE等の範囲も限定的な比較起点／test-designとして保持する。Decision `test-reproduction-derivation-2026-09-27.md:34–40`のliteral/full SHA/span SHAもJSONに固定した。旧oracle、schema/runtime、CLI、CIは移植・実行していない。

## 未確認範囲と限界

未確認3群を過去監査の文言だけで完了扱いにしなかった。対象sourceの指定spanは読み・pinした一方、追加のscrum-reverse-*／universal-reverse-redesign系列が019に保持すべき義務を網羅的に持つかは全系列調査をしておらず、未確認のまま記録した。merged-main上の`scfctl stale`も実行していない。m4のGitHub PR本文更新はRootに残る。既存監査はSHA固定し、変更していない。

`git diff --check`とCASE/prefix/AC/table-widthの静的照合のみを行った。これは作成側補正であり、独立review、L3承認、実行証拠ではない。旧runtime・test・CI・CLI、Bun、repository CIは起動していない。
