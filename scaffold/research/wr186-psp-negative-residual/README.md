# WR186 process-state-port L9入力監査の訂正

## 対象と境界

PR classは `design_verification`、対象V-pairは **HELIX-HARNESS L4/L9**。この記録はL9固定入力・mutation・source pointer/hashの監査に限る。L9の既存期待、case population、checker marker、formal projection row、freezeを変更しない。F04は7 packetのうち1件のみ単一条件候補を維持し、6件は非発火条件を証明できずunknown/unformedへ訂正する。F03/F05監査から新しいfinding候補を形成しない。L8はWR186成果に含めない。

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

L9 negative populationは182件。F04固定raw packet 7件のうち、非発火証拠まで支えられるRelease-eligible proof nullの1件だけを単一条件候補として維持する。残る6件は、Verifiedのdangling `lower_proof_refs` またはRelease-eligibleの未解決`proofs@r1`参照によって他ruleの非発火が不明なため、finding集合をunknown/unformedとする。F03/F05の22件もunknown/unformed監査行である。未形成は従来175件から181件に訂正する。分類コードは7種類とも入力上の候補コードとして識別できるが、6件のcase-level finding集合は形成しない。正式projection rowは0件、checker marker無効、freezeなし。これらの監査行をcase coverageやPASSへ数えない。

現行 `origin/main` `de7908f1c9cb6d05531a339a0054ac577902b58c` とcandidateのL9 `cases` は同一で、既存 `expected_material` を含む正式期待は変更していない。latest-main trialは隔離worktreeで実施し、merge conflictは0、実効差分はL9 audit summaryと5 scaffold pathの計6 pathだった。静的監査PASS（182件母集団、単一条件候補1、未形成181、formal row 0、marker off）、L4/L9 `check-pair` PASS（各7 ID、ownership caps両側PASS）、SCF validateは168件/0失敗、stale=0、JSON parseと `git diff --check` はPASS。L4 SHA-256は `eb0f43e23906d04b9554786a2574c94d01de85faa75f7fb1f33e08eb3276f464`、L9は試験後 `6e906ce86449596648c679f43ad8448e802de723e3004d99d7409ec39988ab17`。L9の差分は負例監査summaryのみで、formal cases/expectations、母集団、formal projection rows、checker markerは不変。製品runtime/test/CI、旧CLI/hook/runtime/CIは起動していない。

## WR192 F04固定raw照合

F04のL4 negative classification 7件は、各state固有の原証拠が不足することを条件とする。固定snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` の各独立source packetでは、対応する1 stateだけが明示nullである。残るstateについてはnullでないことだけで判断せず、state-specific content、外側のidentity/revision/scope/owner、targetのrevision/scope/artifact/environmentとのbinding、および各stateの固有属性を個別に照合した。

R1 M1再確認により、既存F04 7件すべてを単一条件候補とする主張を訂正した。Provisional-nullとIntegrated-nullのpacketでは、Verifiedの`lower_proof_refs`がnullのproofを指す。L5 `/functions/4/state_detail/qualification_groups/Verified_lower_proof_refs` はこれをVerifiedのstate_basisとするが、L4/L5はdangling referenceの扱いを定義していない。そのためVerified非発火を証明できない。さらに6 packetのRelease-eligible proofには`observations/0`の`required_ref=observed_ref=proofs@r1`しかなく、参照先content/source/owner qualificationや、参照先と個別`state_proofs`との対応は固定packetにない。L4 `/artifact_state_basis/5` とL5 `Release-eligible_observations_proofs` がこのobservationをstate_basisに含めるため、文字列一致だけでRelease-eligible proof contentが充足すると判断できない。これらの未解決参照をfailure発火とは扱わず、Provisional/Integrated/Verified/Accepted/Deployed/Observed nullの6 packetはfinding setをunknown/unformedとする。

Release-eligible proof自体がnullの1 packetでは、他6 stateのproof contentとbindingを個別照合し、Verified lower refsは存在するProvisional/Integrated proofを指す。この固定synthetic fixture内では、同packetに明示nullな対象stateがRelease-eligibleだけで、他ruleの非発火が支えられるため単一条件候補を維持する。全packetのqualificationは `synthetic_design_fixture_not_actual_owner_or_authority` であり、実source資格・実owner権限・実state成立はunknownである。L9 `cases` / `expected_material`、182件母集団、formal projection row、checker marker、freezeは変更しない。候補は処理済み結果や製品合格を意味しない。

## 固定入力と再現

固定raw snapshotは `ed3981e7b9419d796adf1981f8990c6b626ecabe` の `docs/helix-harness/L9-integration-verification/process-state-port.json`、file SHA-256 `91d0bcd34b8b451bc8e81f5d13d0c5f413de3ad5f7c70ba90a704134c4af3735`。

```sh
python3 scaffold/research/wr186-psp-negative-residual/validate_l9.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

`validate_l9.py` は基準revisionのcase/expectation不変、固定raw bytesのhash、pointer解決、L9 mutation参照、F04の1 candidate/6 unknown-unformed分類、L3/L4/L5参照先を静的照合する。L4/L5 predicateをコード化・実行せず、findingを算出しない。
