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
| L8 bytes / lines | 8,607,618 / 179,427 | 273,631 / 3,167 |
| L8 cases / U-ID | 389 cases | 389件の既存`id`（U-ID）を維持 |
| L5 `/functions/*/unit_case_refs` | 110参照 | 110参照、同じ配列index・`id`で解決 |
| L8 `removed_materials` | なし | 6 required keysを保持 |

`case-row-map.json`は旧`id`、配列pointer、oracle、L9 source refs、旧raw input digest・旧期待JSON digest・要約期待digestを対応づける。389行すべての旧/新期待digestを対にし、共通の意味条件だけを境界へ集約したことと行固有保持差分を記録する。raw inputとfull returnは含めない。counterexample文字列と旧`id`は389件すべて一意である。

現行L5は変更していない。L8 pinのL5 revisionだけ、旧`ed42...`からL5の現行bytesに一致するmain `e9cca9f1d3d88b1c2049c3a3e492b36b2c2ec905`へ更新した。L3/L4/L9/L10のpinはbyte一致を維持する。Governance crosswalkの`9fdd43c2`固定main snapshotと2026-10-22のdownstream coverage auditは当時の証拠であり、current pinではないため更新していない。

## check-child測定

現行checkerの4文書全体を開始時・完了時に読み取り測定した。これは文書ID・参照・ownership cap・pinの静的照合であり、製品testではない。

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
- 389件すべてで既存`id`、counterexampleが一意。期待要約の前後digestを行別に照合し、共通意味境界と44行の保持差分を記録した。各行のL10 oracle IDは対象function suffixに一致する。
- L8の`test_citation`は全件null。L7 test citationが確認できないためであり、L9/L10参照は監査mapにのみ保存した。
- L8の5 source pinは、それぞれ記録したrevisionのbytesと一致する。
- L8 capは1,262 findingから0へ減少した。`scfctl validate`/`stale`の結果と差分チェックはこの記録へ追記する。

`python3 scaffold/tools/scfctl.py validate`はbindings=195、fail=0。`python3 scaffold/tools/scfctl.py stale`はstale=0。`git diff --check`はpass。意味保存の静的照合は、389行の順序・ID、110件のL5参照、389件のL9/L10 source refsの監査map収録とtest citation null、5件のsource pin、`removed_materials`の6 keyを確認した。
