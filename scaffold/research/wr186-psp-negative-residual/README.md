# WR186 process-state-port L9入力監査の訂正

## 対象と境界

PR classは `design_verification`、対象V-pairは **HELIX-HARNESS L4/L9**。この記録はL9固定入力・mutation・source pointer/hashの監査に限る。L9の既存期待、case population、checker marker、formal projection row、freezeを変更しない。F04は既存の単一条件候補を保持し、F03/F05監査から新しいfinding候補を形成しない。L8はWR186成果に含めない。

共有根拠は [SCF-B-0174](../../bindings/SCF-B-0174.json) と、この文書の隣にあるF03/F04/F05監査行に保持する。L9からscaffoldへの参照は置かず、scaffoldからL9監査箇所を参照する。

## #3916候補の訂正

#3916の初期監査では、固定rawの入力欠落からF03 14件・F05 8件についてfinding候補を置いた。しかしL4のnegative classificationとL5 `failure_output_contract` が要求するのは入力欠落だけではない。対象の条件が成立しない/未決のままなのに成功・空へ補った、または欠落のままRelease-eligibleとして扱った、という処理結果まで必要である。L5は、成立が確認されたruleだけを出力し、成立が不明なcodeを作らないと定める。

固定rawとcase mutationを再確認した結果、その22件で確認できるのは入力とmutationであり、要求される「成立扱い」の処理結果は記録されていない。よって元候補を撤回し、finding set・owner・ordered outputをすべて `unknown/unformed` と記録する。これは空集合との判断ではない。元のL9 `expected_material` は既存期待であり、実際の処理結果として使用しない。

| 対象 | 件数 | rawで確認できること | 成立扱いを確認できない理由 |
|---|---:|---|---|
| F03 L9観点欠落 | 10 | 固定rawの対象dimensionが欠落/null | 未決観点を成功・空観測へ補った処理出力がない |
| F03 trace欠落 | 1 | mutationでtraceが空 | trace不足を成立扱いした処理出力がない |
| F03 wrong-pair | 3 | mutationで対象pairのlayer値を変更 | 不一致pairを同一pairとして扱った処理出力がない。L4に出力順もない |
| F05 必須field欠落 | 8 | 固定rawの対象Port fieldが欠落/null | 欠落のままRelease-eligibleとした処理出力がない |

これら22行のraw revision/path/pointer/SHA-256、L9 mutation pointer、L3/L4 source pointerは保持する。L4 classification pointerと過去に候補として挙げたcodeは、撤回履歴を識別する資料としてだけ残し、期待・finding集合として使わない。F03 wrong-pairの旧unordered setも撤回し、順序・集合ともunknownとする。

## 件数とcheckerの扱い

L9 negative populationは182件。既存F04監査候補7件のみを候補として維持し、F03/F05の22件はunknown/unformed監査行、全体の未形成は175件のまま。34分類中、既存候補の扱いは変更せず、残り27分類は未形成。正式projection rowは0件、checker marker無効、freezeなし。これらの監査行をcase coverageやPASSへ数えない。

latest main (`origin/main`、branch base `ca4bd911142cc17789366ae6f9f1f0fee8c7c589`) と修正後で、既存L9 `cases` と `expected_material` は同一である。既存negative 4-way checkerのbase記録と最新HEADでの明示4 path trialは、どちらもL4=34、L9=182、L8=0、L5=34、matched=0、failure=223。内訳はnegative case count 7、presence 216（L4/L5のみ34、L9のみ182）で不変。L4/L9 pair、L5/L8 pair、ownership caps、pinsは今回のtrialでも成功した。F04既存単一finding候補7件は保持し、formal projection rowは0件のまま。これは現行scaffold checkerの文書・構造照合であり、製品testや実行合格を意味しない。

WR192のlatest-main trialは `origin/main` `623f2abc6e0022f5aa781af5d1e21c4babcab7b9` から隔離worktreeに差分を適用して実施した。静的監査はPASS、L4/L9 `check-pair` はpair bidirectional IDsと両層ownership capsがPASS、SCF binding validateは167件/0失敗、stale=0、JSON parseと `git diff --check` はPASS。L4/L9の既存pair sourceとcase/expectationsはmainとの差分なし。製品runtime/test/CI、旧CLI/hook/runtime/CIは起動していない。

## WR192 F04 7候補の固定raw照合

F04のL4 negative classification 7件は、各state固有の原証拠が不足することを条件とする。固定snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` の各独立source packetでは、対応する1 stateだけが明示nullである。残るstateについてはnullでないことだけで判断せず、state-specific content、外側のidentity/revision/scope/owner、targetのrevision/scope/artifact/environmentとのbinding、および各stateの固有属性を個別に照合した。各L4 class conditionとstate basis pointer、raw packet pointer/hash、fixture内で非発火を支持する他6 F04 missing classを [f04-audit-rows.json](f04-audit-rows.json) に記録した。L5 `failure_output_contract.conditions` は条件文の照合に限って参照し、期待を実出力として使わず、実行結果・owner配送・runtime passを主張しない。

したがって既存のF04 7件は固定fixture入力のcontent-levelで導く単一条件候補として維持する。各packetのqualificationは `synthetic_design_fixture_not_actual_owner_or_authority` のため、実source資格・実owner権限・実state成立はunknownである。L9 `cases` / `expected_material`、182件母集団、formal projection row、checker marker、freezeは変更しない。候補は処理済み結果や製品合格を意味しない。

## 固定入力と再現

固定raw snapshotは `ed3981e7b9419d796adf1981f8990c6b626ecabe` の `docs/helix-harness/L9-integration-verification/process-state-port.json`、file SHA-256 `91d0bcd34b8b451bc8e81f5d13d0c5f413de3ad5f7c70ba90a704134c4af3735`。

```sh
python3 scaffold/research/wr186-psp-negative-residual/validate_l9.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

`validate_l9.py` は基準revisionのcase/expectation不変、固定raw bytesのhash、pointer解決、L9 mutation参照、各監査行のunknown/unformed状態、L3/L4参照先を静的照合する。L4/L5 predicateをコード化・実行せず、findingを算出しない。
