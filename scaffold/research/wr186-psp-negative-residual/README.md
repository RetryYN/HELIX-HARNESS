# WR186 process-state-port L9入力監査の訂正

## 対象と境界

PR classは `design_verification`、対象V-pairは **HELIX-HARNESS L4/L9**。この記録はL9固定入力・mutation・source pointer/hashの監査に限る。L9の既存期待、case population、checker marker、formal projection row、freezeを変更しない。F04 7件すべてのfinding setはunknown/unformedであり、単一条件候補は形成しない。F03/F05監査から新しいfinding候補を形成しない。L8はWR186成果に含めない。

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

L9 negative populationは182件。F04固定raw packet 7件はすべてfinding set unknown/unformedとし、単一条件候補は0件。Release-eligible proofがnullのpacketでも、他のnon-null proofに含まれるstate_basis参照の原内容・対応付けを固定rawから解決できず、L4/L5も文字列だけでの参照解決や未解決時の扱いを定義していない。これをfinding発火とは推定しない。F03/F05の22件もunknown/unformed監査行である。未形成は182件、候補分類は0/34、未形成分類は34。raw target condition codeは7種類を監査情報として記録するがfinding分類とは扱わない。正式projection rowは0件、checker marker無効、freezeなし。これらの監査行をcase coverageやPASSへ数えない.

前段のlatest-main trial結果はR1 revision時点の記録であり、candidate 1・未形成181・形成分類1/34という件数は本R2修正で撤回した。現在の修正ではL9 `cases` と正式期待を保持し、静的validatorで182件母集団、candidate 0、未形成182、形成分類0/34、formal row 0、marker offを再確認する。L4 SHA-256は `eb0f43e23906d04b9554786a2574c94d01de85faa75f7fb1f33e08eb3276f464`。R1時点のL9 SHA-256 `25a850073b17f9a086c94d2fcb15f144578abe8937e0f26e2669c79805c77650` は旧集計を指し、今回のL9 SHA-256は `ccac38abfa3a204fdd1b5c325b67835e13957914f5a8f239e87efe55d190dff5`。L9の差分は負例監査summaryのみで、formal cases/expectations、母集団、formal projection rows、checker markerは不変。今回の静的validator PASS、L4/L9 check-pair PASS、SCF validate 165件/0失敗、stale=0、JSON parse、`git diff --check` PASS。製品runtime/test/CI、旧CLI/hook/runtime/CIは起動していない。

## WR192 F04固定raw照合

F04のL4 negative classification 7件は、各state固有の原証拠が不足することを条件とする。固定snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` の各独立source packetでは、対応する1 stateだけが明示nullである。残るstateについてはnullでないことだけで判断せず、state-specific content、外側のidentity/revision/scope/owner、targetのrevision/scope/artifact/environmentとのbinding、および各stateの固有属性を個別に照合した。

R1 M1再確認により、既存F04 7件すべてを単一条件候補とする主張を訂正した。Provisional-nullとIntegrated-nullのpacketでは、Verifiedの`lower_proof_refs`がnullのproofを指す。L5 `/functions/4/state_detail/qualification_groups/Verified_lower_proof_refs` はこれをVerifiedのstate_basisとするが、L4/L5はdangling referenceの扱いを定義していない。そのためVerified非発火を証明できない。さらに6 packetのRelease-eligible proofには`observations/0`の`required_ref=observed_ref=proofs@r1`しかなく、参照先content/source/owner qualificationや、参照先と個別`state_proofs`との対応は固定packetにない。L4 `/artifact_state_basis/5` とL5 `Release-eligible_observations_proofs` がこのobservationをstate_basisに含めるため、文字列一致だけでRelease-eligible proof contentが充足すると判断できない。これらの未解決参照をfailure発火とは扱わず、Provisional/Integrated/Verified/Accepted/Deployed/Observed nullの6 packetはfinding setをunknown/unformedとする。

R2 M1のsource-only再確認では、Release-eligible proof自体がnullのpacketも単一条件候補から撤回した。Working.work_record、Provisional.contract/oracle、Integrated.design/observed_boundary、Accepted.l2、Observed.planning/operation_recordはL5でstate_basisとされるが、raw packetに参照先の原内容・対応付けがない。Verified.lower_proof_refsはproof identityに解決する一方、その先のProvisional/Integrated根拠は同じく未解決である。L4 `/state_evidence_connection` は独立した原証拠との照合を求め、L5 `/functions/4/state_detail/qualification_rule` は各state資料を個別に資格確認するが、識別子文字列のみの解決や参照未解決時の部分結果は定義していない。したがって他state ruleの非発火は証明できず、Release-eligible nullというraw conditionだけでcandidateを形成しない。未解決を発火とは扱わずF04全7件をunknown/unformedとする。全packetのqualificationは `synthetic_design_fixture_not_actual_owner_or_authority` であり、実source資格・実owner権限・実state成立はunknownである。L9 `cases` / `expected_material`、182件母集団、formal projection row、checker marker、freezeは変更しない。候補は処理済み結果や製品合格を意味しない。

R3 M1では、同じcanonical proof hashを持つstate proofのstate_basis参照をpacketごとに異なる扱いにしていた点を訂正した。L4 `/state_evidence_connection` は独立原証拠との結合を求め、L5 `/functions/4/state_detail/qualification_rule` はstate資料を個別に資格照合するが、参照先の原内容・qualificationは固定packetにない。同じproofを含むcase間で資格差を示すsourceもないため、各F04行でtarget以外の6コードをunknown/unformedに統一し、confirmed non-firingは空とした。参照未解決をfinding発火とは扱わない。静的validatorは各行のtarget/code分類、present proof hash、適用可能なraw referenceとL5 `state_basis` pointer/valueの一致を確認する。

## 固定入力と再現

固定raw snapshotは `ed3981e7b9419d796adf1981f8990c6b626ecabe` の `docs/helix-harness/L9-integration-verification/process-state-port.json`、file SHA-256 `91d0bcd34b8b451bc8e81f5d13d0c5f413de3ad5f7c70ba90a704134c4af3735`。

```sh
python3 scaffold/research/wr186-psp-negative-residual/validate_l9.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

`validate_l9.py` は基準revisionのcase/expectation不変、固定raw bytesのhash、pointer解決、L9 mutation参照、F04の0 candidate/7 unknown-unformed分類、同形state_basis参照のL4/L5 pointerを静的照合する。L4/L5 predicateをコード化・実行せず、findingを算出しない。
