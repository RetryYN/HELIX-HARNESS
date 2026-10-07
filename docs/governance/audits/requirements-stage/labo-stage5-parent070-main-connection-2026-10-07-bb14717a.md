# labo-stage5-parent070 main接続の照合記録

対象PR #2648。取り込み前HEAD `bb064f005101c9b03fe905fc1747bf5837875fe3`、旧base `d1b377f811e064a2d18ee34a3e8c56bd40332a2f`、新base `bb14717a120f9874dc175d6194ba55ff078435cd`。新mainとの差分path一覧は証拠JSONに記録する。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./labo-stage5-parent070-main-connection-2026-10-07-bb14717a.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
