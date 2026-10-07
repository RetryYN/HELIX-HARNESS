# harness-stage3-parent046 main接続の照合記録

対象PR #2643。取り込み前HEAD `6e2dad6dc87bcdbb9b039b75718c165a143b2bf7`、旧base `d27d6f67dcb195f05178faf9bc6597738667d4be`、新base `499f938804b254c9f4f04f30d20bd6e92a097549`。新mainとの差分path一覧は証拠JSONに記録する。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./harness-stage3-parent046-main-connection-2026-10-07-499f9388.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
