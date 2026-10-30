# WR252: CONNECT009 L8の軽量化と参照照合

status: scaffold evidence
authority_effect: none
request: WR252-CONNECT-DIRECTION-L8-SLIM / Issue #3510

## 目的と境界

`docs/helix-connect/L8-unit-verification/direction-order-feedback-relations.json`を、CONNECT009のU-ID表へ軽量化した。HELIX-CONNECTは機構であり、製品ではない。要求、期待する意味、L4/L5/L9/L3/L10の意味は変更していない。L8に残したのは389行の既存U-ID表、1箇所の意味条件だけの共通境界、必要なsource pin、6項目の`removed_materials`である。

表の各行は、元の`id`（既存ID/U-ID）、対象、行固有のcounterexample、短い期待結果、L10 oracle ID、`test_citation: null`を持つ。L7 test codeへの実在参照を確認できなかったため、L9/L10 source refをtest citationとして扱わない。元のcase順・ID・配列位置を保持し、L5の`/cases/N`参照が同じIDへ解決する。`docs/helix-connect`にCONNECT用L7 test文書はなく、確認できたL7は別機構（helix-labo）の文書だけだった。L9 scenario、L9 oracle basis、旧L10 alignment refは監査mapだけに記録する。

## 根拠と旧HELIXとの関係

POの#3510 comment 6447665479は、L8/L9の実装前材料をallowlistで減らし、小さな反例と期待を残すこと、要求意味を変えないこと、旧材料を参考に限ることを定める。各L8 rowを10行へまとめず、現在の各caseの識別・期待差分を個別行で残した。

対象L8に含まれていた旧source比較を再読した。`LEGACY-ASSET-5EE032D657C221184B00`の旧UWJ-FR-006（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:50`）と`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`の旧HIL-NFR-04（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:184`）は、一般loopのreturn/stop/上限/再開checkpointを参照用に読む。`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`のHIL-BR-25（同path:77）は上下層とV-pairの双方向追跡を参照する。`LEGACY-ASSET-23D3D9769B093AFDCC25`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/management-integration-cell-requirements.md:66,132`）の直列merge順はCONNECTのedge順序を定めない。保持するのはloop停止・上限・未完状態とpair参照の観点、変更するのはそれをCONNECTの型付きrelation意味へ読み替えない点である。旧CLI/runtime/test/CIとL4 algorithmは実行していない。

同種のL8過剰材料の事例として、PR #3988（H053のL8 hash 30件撤去、cap 30→0）とPR #3911/#3924/#3929/#3930の軽量化を参照した。いずれも内容を複製せず、対象pathを1件ずつ閉じる形の先例として照合した。

## 変更量と行対応

| 項目 | 開始時 | 完了時 |
|---|---:|---:|
| L8 bytes / lines | 8,607,618 / 179,427 | 193,807 / 3,181 |
| L8 cases / U-ID | 389 cases | 389件の既存`id`（U-ID）を維持 |
| L5 `/functions/*/unit_case_refs` | 110参照 | 110参照、同じ配列index・`id`で解決 |
| L8 `removed_materials` | なし | 6 required keysを保持 |

`case-row-map.json`はPR #4002 R1対応前のhead `83235cc0c28b90531b39cd6a24f30bf0f6750ab3` にある時点記録で、SHA-256は`161c6aa61094aecf20eebc8037925031864728e092bd0b583879ddbb4edef274`。そのファイルは変更していない。元期待・当時の要約digestとID/pointer/source mapをそのまま保持する。R1後の389行別before/after digestと操作状態・保持差分の照合は、新設した`wr252-pr4002-r1-row-meaning-audit.json`に記録する。raw inputとfull returnは含めない。

現行L5は変更していない。L8 pinのL5 revisionだけ、旧`ed42...`からL5の現行bytesに一致するmain `e9cca9f1d3d88b1c2049c3a3e492b36b2c2ec905`へ更新した。L3/L4/L9/L10のpinはbyte一致を維持する。Governance crosswalkの`9fdd43c2`固定main snapshotと2026-10-22のdownstream coverage auditは当時の証拠であり、current pinではないため更新していない。

## PR #4002 R1の行別整理

R1では、関数ごとの共通operation状態を`common_expectation_boundary`へ一度だけ自然言語で置いた。各行は既定と異なる操作状態、行固有の期待、反例だけを残す。`field判定`が先行条件の言い直しになっていた260箇所を除き、固有の未観測範囲1件は保持した。44行の保持例外はfixture値をJSON直列化せず、日本語の平文で表した。

旧`case-row-map.json`はR1前の時点証拠として変更していない。R1後の成果は`wr252-pr4002-r1-row-meaning-audit.json`に記録し、389行すべてに元期待digest、R1前の要約digest、R1後の要約digest、関数共通状態か行例外か、保持差分の平文を対応づけた。これにより、両時点の内容と照合を区別して追跡できる。

## check-child測定

現行checkerの4文書全体を開始時・完了時に読み取り測定した。R1後も同じ4文書の構造照合を再実行した。これは文書ID・参照・ownership cap・pinの静的照合であり、製品testではない。

| check-child項目 | 開始時 | 完了時 |
|---|---:|---:|
| 全体 | fail | fail |
| L4/L9 pair | not evaluated、12 findings（10対0） | not evaluated、12 findings（10対0） |
| L5/L8 pair | not evaluated、391 findings（0対389） | not evaluated、391 findings（0対389） |
| negative 4-way | not evaluated、1 finding | not evaluated、1 finding |
| ownership cap | L4 0 / L9 289 / L5 0 / L8 1,262 findings | L4 0 / L9 289 / L5 0 / L8 0 findings |
| pins | 4層pass | 4層pass（checked counts: 9/9/11/5） |

pair checkとnegative 4-wayは、既存の4層文書がcheckerの`contracts`/`cases`参照形に揃っていないため開始・完了とも評価できない。L9 capの289 findingと上記pairの状態はこのL8作業で変更していない。開始時・完了時の値を隠さず保持する。

## 追加の静的照合

- 現在のL5 unit-case refs 110件が、L8の同じnumeric pointerで同じ既存`id`へ到達する。
- 389件すべてで既存`id`、counterexampleが一意。R1で関数ごとの共通operation stateを10行に一度ずつ記し、異なる状態54行を例外として残した。field判定の言い直し261件中260件を除き、固有の未観測枝1件を維持した。保持例外44行は平文にした。R1行別before/after digestは別auditにある。
- L8の`test_citation`は全件null。L7 test citationが確認できないためであり、L9/L10参照は監査mapにのみ保存した。
- L8の5 source pinは、それぞれ記録したrevisionのbytesと一致する。
- L8 capは1,262 findingから0へ減少した。`scfctl validate`/`stale`の結果と差分チェックはこの記録へ追記する。

`python3 scaffold/tools/scfctl.py validate`はbindings=195、fail=0。`python3 scaffold/tools/scfctl.py stale`はstale=0。`git diff --check`はpass。R1後L8は193,807 bytes／3,181 lines。意味保存の静的照合は、389行の順序・ID、110件のL5参照、389件のL9/L10 source refsの監査map収録とtest citation null、5件のsource pin、`removed_materials`の6 keyを確認した。
