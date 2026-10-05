# HELIX-BRAIN L10 非機能検証 — Stage 1（007/008/028）

**状態：部分草稿・未承認・未実行。** 対測定設計は`../L3-requirements/nfr-grade.md`の技術候補を検証する。全ケースで対象revision・fixture・入力・観測結果を記録し、閾値適用前にcandidate statusを保持する。固定L2/L11範囲を越えるSLA、承認gate、ownerを作らない。

| 親L2 | 測定項目・入力/変異 | L10判定材料（AC/L10 trace） | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-007` | required field coverage: 全8 fieldを満たすnormal fixture、および各fieldを個別にmissing/stale/wrong revisionへ変える。 | 8/8各fieldのsource trace、missing reason、candidate維持、accepted/mature誤遷移0候補を観測。`BRAIN-007-AC-01/02`; C01–C03,C05,C06,C09。 | 実績数/verifier人数は測らず、新しいthresholdにしない。 |
| `HELIXBRAIN-L2-007` | false promotion: AI-generated-only、single success-only、counterexample/limitation欠落、LABO target revision mismatchと、LABO評価／OS登録／OS振分け／独立検証のみを採否へ代用する4変異を個別投入。 | accepted/mature遷移なし。不足field/sourceとLABO評価対象revision mismatchを区別しowner stateを観測。`BRAIN-007-AC-02`; C02–C05,C07。 | 未実行の設計候補。 |
| `HELIXBRAIN-L2-008` | state distinction/pin stability: 5 named stateを個別入力し、Product CoreがRを参照後にR superseded/R2追加する。R参照にR2を返す変異と同revision Rの内容を書き換える変異を個別投入する。 | stateを別値として保持し既存Core R参照とOS usageを維持、owner状態を分離。黙った置換の各変異を拒否／検出しBRAINへ戻す。`BRAIN-008-AC-01/02`; C01,C07,C08,C09。 | state遷移順やretentionは追加しない。 |
| `HELIXBRAIN-L2-008` | unknown handling: identity/revision/state unknown/conflict、actual version欠落、version_targetのactual代用を個別投入。 | currentへの暗黙解決なし、candidate use停止、BRAIN知識stateとOS project-useの相互writebackなし。`BRAIN-008-AC-02`; C02,C03。 | state名・version grammarを新設しない。 |
| `HELIXBRAIN-L2-028` | range/identity matrix: BRAIN-L2-028が指定するdescriptorと採択HARNESS L2-010/011のpack/call境界依存を分け、合成fixtureが宣言するrangeの内側・外側・欠落・解釈未確定を試す（fixture値は試験入力のみ）、descriptor/knowledge fieldを独立変異。 | 宣言range内かつ全field整合時だけapplicable。outside/unknown/mismatchは停止し、knowledge側はBRAIN（L2-008）、descriptor/range側はHARNESS ownerへ戻す。`BRAIN-028-AC-01/02`; C01–C04,C07。 | 固定L2にrange syntax/comparatorはないため製品規則として採択しない。range field自体がfixtureに欠ける場合、その枝は未評価/unknown。 |
| `HELIXBRAIN-L2-028` | boundary ownership: version_target代用とcommon exchange/update/rollback/unfinished-obligation義務のBRAIN移管を個別要求。 | 実版代用を拒否し、common lifecycleはHARNESS契約へ返しBRAINで再定義しない。`BRAIN-028-AC-02`; C05–C06。 | BRAIN専用NFRではなく親境界の測定候補。 |
| `HELIXBRAIN-L2-028` | version軸の取り違え：各軸に異なる合成値を与え、artifact←knowledge revision、knowledge version←contract、descriptor内version入替えとdescriptor／knowledge identityの双方向代入を独立投入。 | 各変異を分母に記録し誤受理0候補、該当field・期待軸・BRAIN（L2-008）／HARNESS owner戻し先を観測。`BRAIN-028-AC-02`; C08。 | 欠測・未評価を分母から除かず、実測合格としない。version構文は決めない。 |

測定値は候補であり未実施。結果をPO判断、L3承認、実装・実行許可へ読み替えない。


## Stage 2b — INFRA候補NFRの対測定

候補境界は固定L2/L11で明示された各対象集合のcoverage 100%・誤受理0件。分母0は割合を算出せず「算出なし」と記録する。missing/unknown/stale/conflict/fixture未実行は分母から除外せず、別stateで保持する。これは製品SLAでも実測結果でもない。

| 親 | 測定候補・入力変異 | L10 case / 観測 | 限界 |
|---|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | 20初期subdomain + 4変更操作。各domain/operationを個別欠落し、Runtime inventory固定も試す。 | `L10-BRAIN-INFRA-001-C01–C05`。coverage 100%候補/誤受理0候補。missing/unknown/stale/wrong-targetを分け、Domain固定negativeを測る。 | fixture上の構造被覆。実資源数や性能を主張しない。 |
| `HELIXBRAIN-L2-INFRA-002` | Domain 2、Pattern 2、Part 8、固定例の全relation endpoint。nodeとendpointを別々に欠落。 | `L10-BRAIN-INFRA-002-C01–C05`。各階層/endpointとrelation typeを個別に照合。 | provider設定や実構成網羅を意味しない。 |
| `HELIXBRAIN-L2-INFRA-003` | L2 20 atomic fieldとL11 18 groupの別分母。trade-off/evidenceは別field。field別evidence/scope義務の追加も変異。 | `L10-BRAIN-INFRA-003-C01–C05`。各分母のcoverage候補100%、missing/unknown/stale/対象違いを別記録。 | 2分母を統合した加重scoreを作らない。 |
| `HELIXBRAIN-L2-INFRA-004` | 10 characteristic、Pattern、required Design Input/relationを個別欠落・unknown化。NIO-L3-01/02はtyped input/design obligation類例。 | `L10-BRAIN-INFRA-004-C01–C05`。値を創作せず、HARNESS/Product Core戻し先を照合。 | 製品閾値、NFR ownerを新設しない。 |
| `HELIXBRAIN-L2-INFRA-005` | 13 failure×6観点=78 cellと、normal configurationへの同一identity/hierarchy/relationを測定。未見failureは別normal fixture。 | `L10-BRAIN-INFRA-005-C01–C05`。各cellと正常構成relationの欠落を別記録。 | 設計候補を実incident証拠にしない。 |
| `HELIXBRAIN-L2-INFRA-006` | 10 recovery候補と予防/復旧区分を独立に欠落。010 relation unknownのまま006を照合。 | `L10-BRAIN-INFRA-006-C01–C06`。C06のunknown relation通常fixtureと010完成gate誤変異を対で測る。 | INFRA-010 completionをgateにしない。 |
| `HELIXBRAIN-L2-INFRA-007` | 6方式×6軸=36 cell。release/deployment actionとstage/state進行を別々にnegative投入。 | `L10-BRAIN-INFRA-007-C01–C06`。36 cellとC06 progress negativeを別集計。 | 実deployの結果を主張しない。 |
| `HELIXBRAIN-L2-INFRA-008` | 8候補×6軸=48 cell。size/scale目的化negative、unknown workload normalを個別測定。 | `L10-BRAIN-INFRA-008-C01–C05`。cell欠落と未知workload扱いを観測し、unknownを適用可へ変換しない。 | 実行能力、workload閾値、SLOを追加しない。 |
| `HELIXBRAIN-L2-INFRA-009` | 11 design observation pointsとPattern/failure relations。raw telemetry知識化、missing/stale/collector停止をnegative投入。 | `L10-BRAIN-INFRA-009-C01–C05`。設計観測点の被覆とfalse healthyを別に記録する。 | 独立secret/PII契約を追加しない。 |
| `HELIXBRAIN-L2-INFRA-010` | backup-only、restore verification、required recovery conditionsを独立変異。 | `L10-BRAIN-INFRA-010-C01–C05`。3条件すべて揃う場合だけRecoverability Evidence Candidateを記録。 | Candidateは実recoverability/RTO/RPOの確定ではない。 |
| `HELIXBRAIN-L2-INFRA-011` | 7 group/8 atomic characteristicを別分母。価格provenanceは価格を含むfixtureだけでprovider/time/sourceを個別変異。 | `L10-BRAIN-INFRA-011-C01–C05`。恒久価格定数化と構造比較からの価格生成をnegativeにする。 | scopeは必須条件でなく、価格なし構造正常fixtureを保つ。 |
| `HELIXBRAIN-L2-INFRA-012` | 1 abstract identity/4 implementation identityとrelations。provider fact evidence/versionを個別欠落しS3→GCS swapを正常fixtureにする。 | `L10-BRAIN-INFRA-012-C01–C05`。abstract identity/relation意味の維持とcompatibility unknownを観測。 | provider approval gateなし。 |
| `HELIXBRAIN-L2-INFRA-013` | 6 resource class/capability relation。providerとcompute classを別個に固定するnegative、unseen edge device normal。 | `L10-BRAIN-INFRA-013-C01–C05`。未見classをabstractとして保持する。 | actual resource state/credential/actionを推定しない。 |
| `HELIXBRAIN-L2-INFRA-014` | 固定2 topology例と9 relation type/type/endpoints/meaning。 | `L10-BRAIN-INFRA-014-C01–C05`。固定例とunlisted topologyを照合し、undeclared edgeはunknownで保持。 | 実topology完全性を主張しない。 |
| `HELIXBRAIN-L2-INFRA-015` | 固定Domain pair relationとunlisted pair。direction/evidence/uncertaintyを個別変異。 | `L10-BRAIN-INFRA-015-C01–C05`。may-affect＋unknownを許容し、根拠ないcauses強化だけを誤受理扱い。 | 全pair適用率やevidence gateなし。 |
| `HELIXBRAIN-L2-INFRA-016` | 11 anti-pattern×4要素=44 cell。L11 signalはmanifestation/detection clue両方へ対応。 | `L10-BRAIN-INFRA-016-C01–C05`。44 cell、signal対応、条件外universal banを別観測。 | 固定親にないsecret/PII条件を追加しない。 |
| `HELIXBRAIN-L2-INFRA-017` | 6 state、BRAIN version/project versionの別軸と固定4入力を個別欠落・不一致。success、複数条件評価、failureは別fixture。 | `L10-BRAIN-INFRA-017-C01–C08`。C06は一回success保持と誤昇格、C08はfailure保持と隠蔽/成功変換を対で測る。 | scopeを新規必須にせず、state閾値を作らない。 |
値は起草候補で未承認・未実測であり、結果をL3承認、実装許可、運用実績へ読み替えない。
