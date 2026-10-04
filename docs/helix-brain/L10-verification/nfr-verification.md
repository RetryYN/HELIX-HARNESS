# HELIX-BRAIN L10 非機能検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 対測定設計は`../L3-requirements/nfr-grade.md`の技術候補を検証する。全ケースで対象revision・fixture・入力・観測結果を記録し、閾値適用前にcandidate statusを保持する。固定L2/L11範囲を越えるSLA、承認gate、ownerを作らない。

| 親L2 | 測定項目・入力/変異 | L10判定材料（AC/L10 trace） | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage: 全8 fieldを満たすnormal fixture、および各fieldを個別にmissing/stale/wrong revisionへ変える。 | 8/8各fieldのsource trace、missing reason、candidate維持、accepted/mature誤遷移0候補を観測。`BRAIN-007-AC-01/02`; C01–C03,C05,C09。 | 実績数/verifier人数は測らず、新しいthresholdにしない。 |
| `HELIXBRAIN-L2-007` | false promotion: AI-generated-only、single success-only、counterexample/limitation欠落、LABO target revision mismatchを個別投入。 | accepted/mature遷移なし。不足field/sourceとLABO評価対象revision mismatchを区別しowner stateを観測。`BRAIN-007-AC-02`; C02–C05,C07。 | 未実行の設計候補。 |
| `HELIXBRAIN-L2-008` | state distinction/pin stability: 5 named stateを個別入力し、Product CoreがRを参照後にR superseded/R2追加する。 | stateを別値として保持し既存Core R参照とOS usageを維持、owner状態を分離。`BRAIN-008-AC-01/02`; C01,C04,C06。 | state遷移順やretentionは追加しない。 |
| `HELIXBRAIN-L2-008` | unknown handling: identity/revision/state unknown/conflict、actual version欠落、version_targetのactual代用を個別投入。 | currentへの暗黙解決なし、candidate use停止、BRAIN知識stateとOS project-useの相互writebackなし。`BRAIN-008-AC-02`; C02,C03,C05。 | state名・version grammarを新設しない。 |
| `HELIXBRAIN-L2-028` | range/identity matrix: BRAIN-L2-028が指定するdescriptorと採択HARNESS L2-010/011のpack/call境界依存を分け、合成fixtureが宣言するrangeの内側・外側・欠落・解釈未確定を試す（fixture値は試験入力のみ）、descriptor/knowledge fieldを独立変異。 | 宣言range内かつ全field整合時だけapplicable。outside/unknown/mismatchは停止し、knowledge側はBRAIN、descriptor/range側はHARNESS ownerへ戻す。`BRAIN-028-AC-01/02`; C01–C04,C07。 | 固定L2にrange syntax/comparatorはないため製品規則として採択しない。range field自体がfixtureに欠ける場合、その枝は未評価/unknown。 |
| `HELIXBRAIN-L2-028` | boundary ownership: version_target代用とcommon exchange/update/rollback/unfinished-obligation義務のBRAIN移管を個別要求。 | 実版代用を拒否し、common lifecycleはHARNESS契約へ返しBRAINで再定義しない。`BRAIN-028-AC-02`; C05–C06。 | BRAIN専用NFRではなく親境界の測定候補。 |

測定値は候補であり未実施。結果をPO判断、L3承認、実装・実行許可へ読み替えない。
