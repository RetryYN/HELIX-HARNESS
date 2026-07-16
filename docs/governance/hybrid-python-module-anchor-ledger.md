---
title: "Hybrid Python module anchor ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
schema: hybrid-python-module-anchor-ledger.v1
source: docs/governance/hybrid-python-engine-adoption-ledger.md
---

# Hybrid Python module anchor台帳

## §0 抽出契約

29 moduleのSHAはPython採用台帳と29/29一致する。AST分類はmodule直下function=`top`、class配下=`method`、
function内=`nested`とする。main guardとCLI subcommandはcallableへのexposure edgeでありbehaviorへ加算しない。
effect凡例は`R=filesystem/env read`、`W=filesystem mutation`、`P=subprocess`、`N=network/external write`、
`F=fixture-only`である。

## §1 module anchor（29/29）

| module | top/method/nested | main/subcommand | effect | 最小semantic family候補 |
|---|---:|---:|---|---|
| `activation.py` | 3/0/0 | 1/0 | R | scope-contained ID収集、activation分析 |
| `agent_docs.py` | 4/0/0 | 1/0 | R,W | adopted-doc選択、digest render/output |
| `agent_meta.py` | 5/0/0 | 1/0 | R,W | metadata derive、render-upsert、apply-check |
| `assign.py` | 13/0/0 | 1/0 | R,W | assignment、Scrum acceptance、ledger freshness、XLSX/signal |
| `build.py` | 26/0/5 | 1/19 | R,W,P | build、validate/detect、diagram/dependency、schedule/profile、migration、sheets、dispatch |
| `consistency.py` | 7/0/0 | 1/0 | R | banned term、ADR consistency、unregistered term |
| `derive_traces.py` | 11/0/1 | 1/0 | R,W | ID/trace matrix、source enrichment、spec regeneration |
| `diagram_dsl.py` | 11/0/6 | 0/0 | R,W | flow、ER、sequence、wireframe、burnup render |
| `diff_report.py` | 6/0/0 | 1/0 | R,W,P | Git snapshot、semantic compare、report、notes |
| `export_sheets.py` | 1/0/0 | 0/0 | R,N | registered spreadsheet connector push |
| `fix_names.py` | 2/0/0 | 1/0 | R,W | Unicode filename canonicalize/rename |
| `hook_gate.py` | 1/0/0 | 1/0 | P(transitive) | payload filter、gate dispatch、fail-open path |
| `id_utils.py` | 16/0/0 | 0/0 | R | ID parse/scan、definition extraction、contract token、rank |
| `impact.py` | 4/0/2 | 1/0 | R | dependency closure、impact-by-ID/document |
| `md_export.py` | 5/0/0 | 1/0 | R,W | Markdown render、design/WBS export |
| `package.py` | 1/0/0 | 1/0 | R,W | verification、ZIP assembly/count |
| `render.py` | 1/0/0 | 0/0 | memory | document→workbook supporting composer |
| `review.py` | 5/0/0 | 1/0 | R,W | candidate selection、context packet、status/determinism |
| `schedule.py` | 14/0/5 | 1/0 | R,W | WBS/RAG/coverage、assignment/Scrum、cycle、report |
| `schema_check.py` | 1/0/0 | 1/0 | R | scoped schema validation/failure aggregation |
| `scope.py` | 12/0/1 | 1/0 | R,W | activation、path/ID policy、scope resolve、snapshot |
| `selftest.py` | 0/18/0 | 1/0 | W,F | production behavior 0。18 fixture-oracle methods |
| `spec_check.py` | 12/0/1 | 1/0 | R,W | ledger/design RAG、live merge、Scrum validation、graph |
| `spec_trace.py` | 3/0/2 | 1/0 | R | declared/ledger load、test/phase trace completeness |
| `spec_types.py` | 3/0/0 | 1/0 | R | type map、heuristic fallback、coverage report |
| `style.py` | 12/0/0 | 0/0 | memory | workbook style support/container |
| `util.py` | 4/0/0 | 0/0 | R,P | dynamic loader、label、NFC、bounded subprocess port |
| `validate.py` | 2/0/0 | 0/0 | R | scoped iteration、composed validation |
| `verify_files.py` | 3/0/0 | 1/0 | R | tracked/ZIP completeness、verdict |
| **合計** | **188/18/23 = 229** | **22/19** | W 15以上、P 4、N 1 | final atom分母ではない |

## §2 import・effect closure

| metric | count | verdict |
|---|---:|---|
| local import occurrence / unique edge / local module | 63 / 51 / 11 | observed |
| external top module | 23 | dependency disposition pending |
| direct subprocess＋transitive hook | 4 modules | adapter/redesign必須 |
| network/external write | 1 module | default deny＋登録connector必須 |
| clear filesystem mutation | 15 modules以上 | isolated result root＋manifest必須 |

`verify_files.py`のZipFileはread-only、`package.py`はwriteであり分離する。`impact.py`は直接writeが確認できない。
`hook_gate.py`はparse failure時fail-openのためPython workerとして再利用せずNode control-plane gateへ再設計する。

## §3 229 anchorのroute規則

1. 全anchorを`behavior/container/exposure/fixture/support`へexactly one primary routeする。
2. main guard 22、subcommand 19は計41本の`exposes` edgeでありanchor分母へ加算しない。static partitionのexposure 16は
   exposure-routed callable anchorで、edge数41とは別軸である。CLI argument 44、leaf route上限40もbehaviorへ直結しない。
3. `style.py`、`render.py`、nested geometry helperは原則support/composesとする。
4. 同一trigger、I/O、authority/effect、failure/retry、state、oracleを共有するcallableをsemantic familyへcomposeする。
5. effect authority、failure code、独立CLI routeが異なる場合だけsplitする。
6. `build.py`の19 subcommandを19 behaviorへ直結せず、semantic familyへrouteする。ただしnetwork、subprocess、
   filesystem replacementはauthorityが異なるため独立atomにする。

## §4 closure

| metric | current | verdict |
|---|---:|---|
| module SHA inventory | 29/29 | PASS |
| callable anchor inventory | 229/229 | PASS |
| deterministic callable candidate rows | 229/229 | PASS（source/span/digest、route pending、coverage credit 0） |
| exposure inventory | main 22、subcommand 19 | PASS |
| static proposed primary route | 229/229 | PROPOSED（behavior 86 / container 5 / exposure-routed callable 16 / fixture 18 / support 104） |
| verified anchor exact route | 0/229 | FAIL |
| verified callable closure edge | 0/229 | FAIL |
| adopted callable | 0/229 | FAIL |
| dynamic call/effect/failure trace | 0/29 | FAIL |
| final behavior atom denominator | unknown | FAIL |
| active adoption | 0/29 | FAIL |

個票artifactは`docs/governance/generated/hybrid-python-callables-semantic-229-v2.json`、契約は
`docs/governance/hybrid-python-callable-edge-contract.yaml`である。229行すべてのsource custodyはmaterializeしたが、
ownership/effect/failure/fixture/gate edgeはverified 0のため採用分子へ算入しない。

static rule v1でroute候補55/229、primary fixture候補18/229、exposure候補37/229、effect候補84/229を個票化した。
primary route pending 211、effect unknown 145、ownership/failure/fixture exact edge unknown 229を維持し、命名だけでbehavior/supportへ
振り分けない。rule digestは`sha256:e93a3dfd628cbd03c52e5f4b931b8425ca2cef545050d328ea79326fee7f38df`である。

semantic proposal v1はbody calls/import/effect/exposureを加えてfamily候補204/229、ambiguous pending25/229、runtime owner候補
229/229、effect authority候補229/229を個票化した。unique family候補96は最終family分母ではない。全行disposition pending、
coverage 0を維持し、rule digestは`sha256:7df772c2ae9dc30d1c04b1fa6f764cb080b43e927f8100081d98e7d27606c97e`である。

v2個別裁定でfamily候補229/229、pending 0、unique候補121へ到達した。`.replace`のfilesystem偽陽性3件を除外し、
effect候補81、unknown148へ是正した。このfamily proposal closureをverified/adopted closureへ読み替えない。

per-callable fixture contractは`docs/test-design/helix/hybrid-python-callable-fixture-contracts-v1.json`へ固定した。
229 callableへexact 1:1 fixture、positive/negative/boundary各229（計687）、unique fixture/case/oracle/failure codeを持つ。
Linux-primary＋macOS/Windows compatibility、Node再検証、timeout/cancel/idempotencyを個別設計したが、fixture実行0/229、case実行0/687、
verified/adopted 0/229、coverage credit true 0/229である。candidate artifactのschema validation PASSはsource/span/digestと
proposal fieldの形式整合だけを示し、closure edge schemaのPASSまたは採用を意味しない。

candidate exact dispositionは
`docs/governance/generated/hybrid-python-callable-disposition-candidates-v1.json`に229/229を固定した。
ADR-009のclosed capability classは`source_atomization 93 / document_engine 52 / detector 32 / product_data 1 / analysis 51`、
candidate判定は`adopt 84 / redesign 7 / reject 18 / defer 120`である。これは静的candidate dispositionであり、
229行すべて`verified_adoption=false`、`coverage_credit=false`、`authority_receipt=null`とする。candidate adoptであっても
fixture 3種、Linux-primary＋2 compatibility profile、Node schema/effect再検証、idempotency、timeout/cancel、独立reviewの
`HPY-VERIFY-*`が実行されるまでactive adoptionは0/229のままである。

### §4.1 candidate disposition独立semantic review

独立review正本は`docs/governance/generated/hybrid-python-disposition-semantic-review-v1.json`
（SHA-256 `23da39faf27529a08ed530b4b874a75aa4174c18586c28ae4c16dd3c33e76aa3`）である。
ADR-009 closed class、Node owner/effect、Python proposal-only、semantic anchor、fixture 1:1＋3 case、failure codeを
capability class別に229/229照合した。

- reviewed disposition: adopt 84 / redesign 7 / reject 18 / defer 120（candidateからの変更0、overlay 0）。
- adopt 84のstatic edge failureは0。
- boundary mismatch 26はredesign 7、reject 18、product-data defer 1へ既に隔離済み。
- fixture executed 0、runtime executed 0、verified adoption 0、coverage credit 0、authority receipt 0。

このreview PASSはcandidate分類の意味整合だけを示す。adopt 84をactive/verifiedへ昇格せず、各`HPY-VERIFY-*`、
Linux/macOS/Windows、Node schema/effect再検証、timeout/cancel/idempotency、独立runtime receiptまでfreezeを維持する。

## §5 static route proposal

| module | anchors | behavior | container | exposure | fixture | support | semantic family候補 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `activation.py` | 3 | 2 | 0 | 1 | 0 | 0 | 2 |
| `agent_docs.py` | 4 | 2 | 0 | 1 | 0 | 1 | 2 |
| `agent_meta.py` | 5 | 2 | 0 | 2 | 0 | 1 | 3 |
| `assign.py` | 13 | 3 | 0 | 2 | 0 | 8 | 4 |
| `build.py` | 31 | 14 | 3 | 1 | 0 | 13 | 7 |
| `consistency.py` | 7 | 4 | 0 | 1 | 0 | 2 | 3 |
| `derive_traces.py` | 12 | 4 | 0 | 1 | 0 | 7 | 3 |
| `diagram_dsl.py` | 17 | 5 | 2 | 0 | 0 | 10 | 5 |
| `diff_report.py` | 6 | 4 | 0 | 1 | 0 | 1 | 4 |
| `export_sheets.py` | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| `fix_names.py` | 2 | 1 | 0 | 1 | 0 | 0 | 1 |
| `hook_gate.py` | 1 | 1 | 0 | 0 | 0 | 0 | 1（Nodeへredesign） |
| `id_utils.py` | 16 | 8 | 0 | 0 | 0 | 8 | 4 |
| `impact.py` | 6 | 2 | 0 | 0 | 0 | 4 | 2 |
| `md_export.py` | 5 | 2 | 0 | 1 | 0 | 2 | 2 |
| `package.py` | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| `render.py` | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| `review.py` | 5 | 3 | 0 | 0 | 0 | 2 | 3 |
| `schedule.py` | 19 | 7 | 0 | 1 | 0 | 11 | 4 |
| `schema_check.py` | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| `scope.py` | 13 | 6 | 0 | 1 | 0 | 6 | 4 |
| `selftest.py` | 18 | 0 | 0 | 0 | 18 | 0 | 0 |
| `spec_check.py` | 13 | 5 | 0 | 1 | 0 | 7 | 4 |
| `spec_trace.py` | 5 | 1 | 0 | 0 | 0 | 4 | 1 |
| `spec_types.py` | 3 | 2 | 0 | 0 | 0 | 1 | 2 |
| `style.py` | 12 | 0 | 0 | 0 | 0 | 12 | 0 |
| `util.py` | 4 | 2 | 0 | 0 | 0 | 2 | 2 |
| `validate.py` | 2 | 1 | 0 | 0 | 0 | 1 | 1 |
| `verify_files.py` | 3 | 2 | 0 | 1 | 0 | 0 | 2 |
| **合計** | **229** | **86** | **5** | **16** | **18** | **104** | **69** |

この表はqualified callableを数えたstatic proposalであり、最終採否ではない。machine recordは
`anchor_id/qualified_name/primary_route/family_candidate_id/composes_target/effect_authority/adapter_obligation/confidence/unresolved_reason`
を持ち、`primary_route`をexactly oneにする。dynamic reachability、間接effect、failure/retry/idempotency、CLI oracleをfixtureで
再現できた行だけを`verified`へ昇格する。69 familyは候補分母であり、source span→requirement→design→assertion→gate edgeが閉じるまで
coverage分母として使用しない。
