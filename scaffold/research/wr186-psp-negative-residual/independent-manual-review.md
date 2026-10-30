# WR186 F03/F04/F05入力監査の再確認

## 確認方法

固定L9 raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` と対象caseのmutationを入力事実として読み、L3/L4の分類文およびL5 failure output条件が要求するclaimが入力資料にあるかを照合した。L9既存 `expected_material` は処理結果の観測ではないため、finding形成根拠に使わない。過去の独立照合メモもL5順序を見ていたため、F03のfinding/order根拠として採用しない。

再確認の入力は `root-wr192-3934-r1-response-R1.json` と、[PR #3934 R1 review comment](https://github.com/RetryYN/HELIX-HARNESS/pull/3934#issuecomment-6527153768)（M1）である。

## F03 14件

- 観点欠落10件は、raw上の未形成/nullだけを示す。L4 `/contracts/3/negative_classifications/1` とL5 `/failure_rules/20` が要求する「未決を成功または空観測へ補った」出力はrawにないため、finding setは `unknown/unformed`。
- trace欠落1件は、mutationでtraceが空になる入力差を示す。しかしL4 `/contracts/3/negative_classifications/0` とL5 `/failure_rules/19` が要求する「trace未供給を成立扱いした」処理出力はrawにない。よってfinding setは `unknown/unformed`。
- wrong-pair 3件は、固定rawの `paired_comparisons` が持つpair入力とmutationでpairのlayer値を変更する入力差を示す。`paired_comparisons` は比較対象の入力であり、処理がpair不一致をどう分類したかという出力ではない。L4 `/contracts/3/negative_classifications/0,2` とL5 `/failure_rules/19,21` が要求する「不一致なのに同一pairとして比較した」処理結果はrawにない。既存 `expected_material` も期待であって実出力ではないため、集合・owner・順序を形成しない。L4はrule orderも定めない。

## F05 8件

対象Port fieldがrawで欠落/nullという入力差は保持する。一方、L4 `/contracts/5/negative_classifications/0` とL5 `/failure_rules/23` が要求する「欠落のままRelease-eligible扱いした」処理出力はrawにない。したがって8件ともfinding setは `unknown/unformed`。

## WR192 F04 7 packetの候補監査

L4 `/contracts/4/negative_classifications/0..6` はProvisional、Integrated、Verified、Accepted、Release-eligible、Deployed、Observedそれぞれの固有原証拠不足を条件にする。`/artifact_state_basis/1..7` は各証拠のstate固有source keyを定め、前stateから次stateを推定しない。L5 `/functions/4/failure_output_contract/conditions/0..6` は同じL4 condition sourceを指定しており、後続実行実測を要求していない。ここではL5をcondition wordingの照合に限って使い、順序や実測結果のoracleにしない。

固定raw `ed3981e7b9419d796adf1981f8990c6b626ecabe` のF04独立source packet 7件を個別に確認した。各packetで該当する `state_proofs.<state>` は明示null。残るstate proofは、nullかどうかだけでなく、state-specific content、外側のidentity/revision/scope/ownerとtarget binding、固有属性を照合した。各残存proof objectは、該当proofを持つ他のaudit packet間で同一canonical hashとなる。

照合した内容は、WorkingのWORK-01/artifact/work_kind、Provisionalのfreeze・rawに `executed=true` と記録されたRed/Green/atomic CI・trace、Integratedの2 obligationsと10 dimension observations/source refs、Verifiedのsystem obligation観測と005/022差分、AcceptedのL11/L2 human originalとAI解釈の分離、Release-eligible Portの8必須参照、Deployedのartifact/environment/digest、ObservedのL12/L1 operation record/value observationである。全ての残存proof outer bindingは対象REQ@r1 / PRODUCT-P / ARTIFACT-A@h2 / ENV-Aに一致した。

ただし、R1 M1はこの確認から漏れていたstate-basis参照を指摘した。Provisional-nullまたはIntegrated-null packetのVerified.content.lower_proof_refsは常に `PROOF-Provisional` と `PROOF-Integrated` を指す。L5 `/functions/4/state_detail/qualification_groups/Verified_lower_proof_refs` はこのfieldをVerifiedの `state_basis` に含める。対象packet内でそれぞれの参照先proofがnullであるため、Verified非発火の根拠はunknownである。L4/L5本文にdangling lower referenceの解釈はなく、missing findingを発火済みとも判定しない。

Release-eligible proofの `content.observations[0]` は `required_ref=observed_ref=proofs@r1` だが、raw packetはその参照先のcontent、source/owner qualification、また個別state_proofsとの対応を含まない。L4 `/artifact_state_basis/5` はPort全必須条件の照合を要求し、L5 `/functions/4/state_detail/qualification_groups/Release-eligible_observations_proofs` は当該observationをstate_basisとする。参照名の一致だけではfixture内content qualificationを満たしたといえない。これにより、Release-eligible proofが非nullの6 packetではRelease-eligible非発火もunknownとなる。missing/unknownな参照をfailure発火へ変換せず、6件（Provisional、Integrated、Verified、Accepted、Deployed、Observed proof null）のfinding setをunknown/unformedへ訂正した。dangling lower reference、参照先content/qualificationとunknown時の部分結果が未定義のため、L5 function 4 detail-design ownerへ契約の定義不足として返す。

Release-eligible proof自体がnullのpacketについても候補を撤回した。L5で`state_basis`とされるWorking.work_record、Provisional.contract/oracle、Integrated.design/observed_boundary、Accepted.l2、Observed.planning/operation_recordは識別子として存在するが、raw packetに参照先の原内容や設計/観測資料への対応付けはない。Verified.lower_proof_refsのIDは同一packet内のproof identityに解決するが、参照先のProvisional/Integrated source basisは未解決である。L4 `/state_evidence_connection` とL5 `/functions/4/state_detail/qualification_rule` は独立原証拠・state-specific contentの照合を求める一方、識別子文字列だけでの解決や部分結果を定義しない。よって他state ruleの非発火が確立せず、Release-eligible nullだけを根拠にsingle-finding candidateは形成しない。未解決はfinding発火とは扱わず、F04全7件をunknown/unformedとする。

全packetは `synthetic_design_fixture_not_actual_owner_or_authority` と資格範囲を明記する。実owner bytes/authority/実source qualificationはunknownである。case metadataは全件 `execution_state=not_executed`, `effect=none` であり、実行や副作用があったとは扱わない。既存 `expected_material` / `negative_class_assignment` は出力観測として使わない。

F04のraw pointer/hash、L4 classification/state basis pointer、Verified lower refs・Release proofs参照およびRelease-null packetの同形state_basis参照の解決状況、7件のunknown/unformed、candidate 0は [f04-audit-rows.json](f04-audit-rows.json) に記録した。これは固定入力から導く候補の確認で、実行結果、formal projection row、ownerへの実配送、製品合格を主張しない。L9のcases/expectations、182件母集団、formal projection row、checker marker、freezeは変更しない。R2修正後のL9集計はcandidate 0、未形成182、形成分類0/34・未形成分類34。7 raw target condition labelsは監査情報として別計上し、finding分類として扱わない。

## 訂正後の状態

対象22件は空集合でもpositiveでもなく、finding set・owner・ordered outputが未形成である。raw hash、raw pointer、mutation pointer、L3/L4 source pointerは各行に保持した。L9のexisting cases/expectations、182件の母集団、formal projection row、checker marker、freezeは変更しない。元の候補主張はgit履歴に残るが、現在の監査正本では撤回済みと明示する。
