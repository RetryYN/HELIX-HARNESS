# labo-stage5-parent070 main接続の照合記録

対象PR #2648。取り込み前HEAD `0eb0a22b0bb2c73ecaf774557f76cdcaab0ed435`、旧base `bb14717a120f9874dc175d6194ba55ff078435cd`、新base `307b9a699114e7098164959e5e6fec79e587a7f2`。新mainとの差分path一覧は証拠JSONに記録する。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./labo-stage5-parent070-main-connection-2026-10-07-307b9a69.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
