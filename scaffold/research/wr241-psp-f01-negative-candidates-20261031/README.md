# WR241 process-state-port F01 L8 負例候補監査

状態: scaffold研究証拠。正式L8 U-ID、test citation、実行結果、findingを確定しない。

## 比較範囲

WR241のF01だけを対象に、承認済みL3 `/requirements/64`・L10 `/cases/64`、現行L4 `/contracts/1`・L9 `/cases/1`、L5 `/functions/1`、L8 `/cases/1` とQA §3を静的に照合した。固定blindは `source-only-fixed.json` としてSHA-256 `5d69a52e4fd4bce2b76f23c593e597e71f28988968fe955aadc20c6e8106e7e4` のbytesをそのまま保全した。固定後の比較記録は `comparison.json` を参照。

## 結果

L8 primary 22行とL9 F01の通常5行・負例17行はIDで一対一対応する。L8 `expected_partial_values` のtyped envelopeを状態に従って投影すると、9出力fieldは全22行でL9 `expected_material` と一致した。これは既存の期待値同士の静的照合で、処理実行結果でもfindingでもない。

17負例のうち12行は入力・期待の形がL4分類候補と対応する（必要条件欠落5、対象stale 1、役割/権限conflict 6）。残り5行（未委任meaning、未委任authority、実装成功を完了とする例、再開時unresolved、approval unknown）は上流sourceから分類所属を一意に定めない。blindの全行でformed findingはunknown/unformed、observed processing resultは存在しない。

QA §3はL8 U-IDに対象、反例と期待結果、oracle ID、test citationを求める。対象L8 F01および参照したL3/L10/L4/L9 sourceに、このF01用oracle IDまたはtest citationは見つからなかった。旧HELIXの `LEGACY-ASSET-4103AA9615714BD6E9D3`（`L8-gate-evidence-substance.md`）と `LEGACY-ASSET-AC2BD305E065609C98F8`（`L8-ci-verification-plan-unit-test-design.md`）には歴史的なU-ID/test citation例があるが、現行F01のoracle/citationとして転用しない。従って正式L8 U-ID行を追加しない。

## 比較modeと境界

QA §3の現行入力はmarkerなしのため `legacy_casewise_four_layer`。明示modeには4層markerとWR240 checker前提があるが、ここでは有効化しない。現状の全体件数はL4=34、L5=34、L9=182、L8=0で、check-childはこの差分を失敗として報告する。F01 22行の局所的な既存case対応は全体照合成功を意味しない。

`unresolved_assignment_rule` とtrace triggerは未決のまま。L4/L5 algorithm、runtime、test、CIは実行していない。L4/L9正式文書は変更していない。
