# harness-stage3-parent054 main接続の照合記録

対象PR #2646。取り込み前HEAD `752ac23b3f95a124ce0679fcdd82566e990b2810`、旧base `78e7c026c6633730868347040bd0393f4b5d2fb5`、新base `d27d6f67dcb195f05178faf9bc6597738667d4be`。新mainとの差分path一覧は証拠JSONに記録する。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./harness-stage3-parent054-main-connection-2026-10-07-d27d6f67.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
