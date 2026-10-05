# HARNESS Stage4 026–029 作成側時点記録（2026-10-05）

対象はHARNESS-L2-026/027/028/029の1.0 L3/L10候補のみ。PO判断 `633bf12ea8f948db8ba3d6600179c4a9507377a7` の登録候補4件はL3起草対象であり、この記録は承認、独立review、実装、releaseを意味しない。

本文は `c608bf612cc72c54b6354ebcd77076eda7297cd9` に固定した。6 canonical全てでmain基点 `0a150fba9c98fd99f491c79a0652ddb3bdf4434a` のprefix bytesを保ち、Stage4 suffixだけを追記した。本文SHA、物理line span、各line literal/hashと固定・旧source pinは対のJSON時点記録に記録した。

| 親 | FR | AC | functional CASE | NFR候補 | NFR CASE | 独立business要件 |
|---|---:|---:|---:|---:|---:|---:|
| HARNESS-L2-026 | 1 | 5 | 28 | 1 | 1 | 0 |
| HARNESS-L2-027 | 1 | 5 | 19 | 1 | 1 | 0 |
| HARNESS-L2-028 | 1 | 5 | 13 | 1 | 1 | 0 |
| HARNESS-L2-029 | 1 | 5 | 19 | 1 | 1 | 0 |

旧SYN要件・対acceptance、template、VDH要件・対acceptance、Harness FR-14・AT-FR-14の対象spanを個別に再読し、reuse/re-derive/replaceと変更理由を記録した。HIL-FR-04/HAT-HIL-04/HST-HIL-002/018は別identityの隣接failure形に限った。固定L11:396–403もsource-selection/操作条件の境界としてpinした。

固定値のない性能閾値・回数・実行許可は新設していない。技術候補は根拠、比較案、測定方法、適用限界を対L10へ結んだ。独立business requirement/oracleは固定親にないため追加していない。

検証: scfctl validate 147 bindings/0 failure、stale=0、residuals=0、govcheck atoms=7622/requirements=57/files=58、Stage4表列数一致、AC→CASE参照とCASE重複なし。旧runtime/CLI/test/CIは起動していない。これは作成側の静的確認であり独立reviewではない。
