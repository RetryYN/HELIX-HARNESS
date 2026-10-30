# WR241 process-state-port F01 L8 負例候補監査

状態: scaffold研究証拠。正式L8 U-ID、test citation、実行結果、findingを確定しない。

## 比較範囲

WR241のF01だけを対象に、承認済みL3 `/requirements/64`・L10 `/cases/64`、現行L4 `/contracts/1`・L9 `/cases/1`、L5 `/functions/1`、L8 `/cases/1` とQA §3を静的に照合した。固定blindは `source-only-fixed.json` としてSHA-256 `5d69a52e4fd4bce2b76f23c593e597e71f28988968fe955aadc20c6e8106e7e4` のbytesをそのまま保全した。固定後の比較記録は `comparison.json` を参照。

## 結果

L8 primary 22行とL9 F01の通常5行・負例17行はIDで一対一対応する。L8 `expected_partial_values` のtyped envelopeを状態に従って投影すると、9出力fieldは全22行でL9 `expected_material` と一致した。これは既存の期待値同士の静的照合で、処理実行結果でもfindingでもない。

固定blind時点では17負例中12行をL4分類候補と対応づけ、5行を分類未確定としていた。blind後にL9既存`negative_class_assignment`と照合すると、12行は分類コード一致、2行（実装成功を完了とする例、再開時unresolved）は両方未割当、3行（未委任meaning、未委任authority、approval unknown）はL9に割当があるがblindでは未確定という差が分かった。行別根拠は追補 [assignment-comparison-r1.json](assignment-comparison-r1.json) に記録する。差は未解決のままで、L4/L9分類を本PRで変更しない。blindの全行でformed findingはunknown/unformed、observed processing resultは存在しない。

QA §3はL8 U-IDに対象、反例と期待結果、oracle ID、test citationを求める。契約単位のoracle参照はL3 `/requirements/64/oracle_ref` の `HARNESS-L10-003-F01`、L10 `/cases/64` とL8 `/cases/1/l10_ref` に存在する。不足しているのは負例行ごとのU-ID用oracle IDとtest citationであり、該当L8 F01 source内には記録がない。旧HELIXの `LEGACY-ASSET-4103AA9615714BD6E9D3`（`L8-gate-evidence-substance.md`）と `LEGACY-ASSET-AC2BD305E065609C98F8`（`L8-ci-verification-plan-unit-test-design.md`）には歴史的なU-ID/test citation例があるが、現行F01の行単位oracle/citationとして転用しない。従って正式L8 U-ID行を追加しない。

## 比較modeと境界

QA §3の現行入力はmarkerなしのため `legacy_casewise_four_layer`。明示modeには4層markerとWR240 checker前提があるが、ここでは有効化しない。現状の全体件数はL4=34、L5=34、L9=182、L8=0で、check-childはこの差分を失敗として報告する。F01 22行の局所的な既存case対応は全体照合成功を意味しない。

`unresolved_assignment_rule` とtrace triggerは未決のまま。L4/L5 algorithm、runtime、test、CIは実行していない。L4/L9正式文書は変更していない。

## R1追補とWR241未達範囲

`comparison.json` と固定blindは比較時点のappend-only証拠であり、bytesを変更しない。R1追補はL9 assignmentとの比較を追加して先行のblind-only分類説明を補う。F01のL8正式負例/U-IDは追加されず、WR241の「L8負例0件を解消」は未達である。対象はF01だけで、他契約の負例は未着手のまま。
