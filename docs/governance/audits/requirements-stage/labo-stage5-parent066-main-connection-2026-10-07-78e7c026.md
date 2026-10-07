# labo-stage5-parent066 main接続の照合記録

対象PR #2635。取り込み前HEAD `1fb8ac074be463e4292a532fa039bd34a6cca287`、旧base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、新base `78e7c026c6633730868347040bd0393f4b5d2fb5`。新mainは049の採択済み六本文と関連記録の統合である。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./labo-stage5-parent066-main-connection-2026-10-07-78e7c026.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
