# labo-stage5-parent071 main接続の照合記録

対象PR #2645。取り込み前HEAD `7490cc5d0038f198ae70961d0322b7a6547b9f4a`、旧base `78e7c026c6633730868347040bd0393f4b5d2fb5`、新base `d1b377f811e064a2d18ee34a3e8c56bd40332a2f`。新mainはLABO068の採択済み六本文と関連記録の統合である。

各対象本文について新mainの全文をprefixとし、旧baseに対する当該親の追加bytesをそのまま接続した。六親suffixと既存判断記録・時点監査のbytesは不変。変更前後全文hashは[証拠](./labo-stage5-parent071-main-connection-2026-10-07-d1b377f8.json)に固定する。

この記録は静的接続検算であり、旧レビューから新baseの承認やmerge admissionを生成しない。新exact HEADの独立reviewへ渡す。六本文変更時は新revisionの条件1・2と判断記録追補が必要で、六本文不変の場合も保持可否をreview側が照合する。fixture未実行。
