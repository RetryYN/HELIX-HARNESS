# HELIX-SECURITY Stage 1 結合検証設計

対のL4 raw bytes SHA-256: `efa3757154ef0f54ed37259eb099dfa9323c10bc4879e9bff0aa5e879e9d01d2`。L9からL4への一方向pinであり、L4はL9のSHAを固定しない。

## 1. 対象と判定の読み方

本書はL4 [Stage 1基本設計](../L4-basic-design/stage1-security.md)の対であり、`HELIXSECURITY-L2-001`〜`016`、`020`、`028`、`033`の19親のみを扱う。Stage 2c `031`、後続Stage、Web/1.x sink enforcementは対象外である。合成fixtureを用いる未実行の設計で、実装、実行結果、L3/L10承認、配布許可を主張しない。

各親の固定L3 ACとL10 CASEは次の対応で読む。機能・業務・NFR全6文書の親別pin、section span、decision authorityは[Stage 1義務crosswalk](../../governance/crosswalks/stage1-l3-l10-obligation-crosswalk.md)に従う。L3機能本文は固定全体SHA-256 `f6872a3ee941d63c80a9717bca7e81de832c043ad05cc9ac0c2db77eb264ee9e`、L10機能本文は `0d81d49d2a16cb70b78b5ef7d0379e3b64632bbe18ac6fda9e3302f00c5bb40b`。L4/L9 common-kernelの固定設計にあるK3/K7/G5/K8/K6のAPIとIVを参照する。

| 親 | 固定機能検証 | 主な既存共通kernel trace |
|---|---|---|
| 001–016 | `SECURITY-AC-NNN-01` → `SECURITY-CASE-NNN-01` | K8汎用input-label APIは001の外部入力分類に限定する。014–016のasset identity/classification readはK6 refsとSECURITY固有owner-declared adapterに結び、K8がasset-class readerを実装済みとは扱わない。K3（operation authority）、K6（source/evidence）、K7/G5（009等）はL4 §4で親ごとに限定して使う。 |
| 020 | `SECURITY-AC-020-01` → `SECURITY-CASE-020-01` | K3 authorityとK6 rule bytesを照合し、optional semantic inputは別成分に保つ。 |
| 028 | `SECURITY-AC-028-01` → `SECURITY-CASE-028-01` | K6でcurrent descriptor/artifact/verifier evidenceを照合する。共通lifecycleのownerはHARNESS。 |
| 033 | `SECURITY-AC-033-01` → `SECURITY-CASE-033-01`…`-15` | K3 permission、K7/G5 propagation/fencing、K6 source readを使う。assignmentはOS、実適用はWorker、物理観測はINFRASTRUCTUREがowner。 |

共通判定は各既存K1 component結果を保持する。`Positive`は固定要件に必要な全source、owner、binding、該当適用観測がcurrentである場合に限る。negativeは許可／実行／受入／昇格へ誤変換する結果である。`Unknown`、`Unobserved`、`Stale`、`Rejected(missing_key)`、K6 issuer authenticityの`Unknown(unsupported)`をPositiveへ縮退させない。ある親の未解決sourceは、その親の該当operationだけを保留にする。

### 1.1 既存API型の保持

L4 adapter projectionは既存APIの戻り値を正確な型のまま保持する。authorityはK3 `PermissionCheck = PermissionCheckResult | PermissionCheckDiagnostic`、labelはK8 `ObservedLabel | Rejected(missing_key)`、effectはK8 `Observed<EffectObservation> | Rejected(missing_key)`、verificationはK6 `RequiredResult`、propagationはG5 `Observed<PropagationView>`である。`Observed<PermissionCheck>`や`Observed<InputLabel>`は作らない。`SecurityCaseProjection`自体に横断の`components`／`combined`はなく、各APIの既存result内の成分と合成結果を元の型で保持する。`ProjectionNotApplicable = {projection_state: "not_applicable"}`は固定caseに対するadapter内部のscope sentinelで、K1/K2 resultでも既存API診断でもなく、K1 combineへ渡さない。適用状態不明は既存APIのUnknown/Unobservedとして保持する。将来、機構横断の合成が必要になった場合は、共通kernel K1 §2.5に従い、current完全keyと成分ごとの`PolarityOf`を明示して既存`combine`へ渡す。API diagnosticや内部sentinelをK1 componentとして捏造しない。

## 2. 親ごとの正例・negative・unknown

`IV-SECURITY-*`は本L9のverifier ID、`SECURITY-CASE-*`は固定L10 source case IDである。033の集約行は§2.1への参照に限り、verifier定義として数えない。各行は対応L3 ACとL10 CASEの全義務を下流契約へ結び付ける。field変異と合成入力の詳細は親caseに従い、別のpermission、受領証、threshold、承認stepは追加しない。

| L9 verifier ID | 親 / L3 AC / L10 CASE | 正例oracle（設計） | negative oracle（設計） | unknown／owner戻し |
|---|---|---|---|---|
| `IV-SECURITY-001-01` | 001 / `SECURITY-AC-001-01` / `SECURITY-CASE-001-01` | source/project/revision/classificationがcurrent。外部入力をuntrustedのままK8で分類し、read-onlyとauthority effectを分ける。 | readだけでinstruction/requirement/authority/persistence/learningへ昇格、または各targetへ誤昇格する変異を拒否する。 | 分類不能はunknown/untrusted。reader/source未登録は該当入力だけUnknown。 |
| `IV-SECURITY-002-01` | 002 / `SECURITY-AC-002-01` / `SECURITY-CASE-002-01` | 固定L11の5つの命令様文例をdataとして保ち、policy revision・source・scope・deny/hold理由を追える。 | 各命令様入力からTool args、system instruction、権限operation、credential送信、policy変更へ直接結合する変異を個別に拒否する。 | 境界を証明できないdownstream operationだけ停止してUnknownとする。検出器がないことだけで機能全体を不合格にしない。 |
| `IV-SECURITY-003-01` | 003 / `SECURITY-AC-003-01` / `SECURITY-CASE-003-01` | 明示接続内のproject/適用されるtenant/environment/assignmentを各resourceへ結び、許可scope内だけを判定する。 | project、tenant、environment、assignment/worktree、state、Agent、Hook、credential、memory、artifact、Worker、execution targetの個別越境とidentity collisionを拒否する。 | identity/owner source不明はUnknownとし、OS assignment/INFRA env ownerへ対象scopeだけ返す。tenantが適用されないfixtureに顧客runtimeを要求しない。 |
| `IV-SECURITY-004-01` | 004 / `SECURITY-AC-004-01` / `SECURITY-CASE-004-01` | project/root/HEAD/revision/digest/owner/scopeがcurrent configと一致する。 | stale、別project、unknown field、暗黙defaultを採用しない。 | 構成source/reader未登録または読取不能ならUnknown。 |
| `IV-SECURITY-005-01` | 005 / `SECURITY-AC-005-01` / `SECURITY-CASE-005-01` | 全consumerが同じcanonical secret classifier identity/revisionを参照し、actor/operation/target/environment/scope/expiry/purposeが一致する非公開credential useを判定する。raw valueは露出しない。 | repository secret混入、Worker store直接露出、egress漏えい、receipt値露出、consumer別classifier、unknown class、検査不能、purpose欠落、expired/revoked利用を個別に拒否する。 | classifier/credential/owner source未登録または未観測なら該当useのみhold/denyとし、証拠にsecretを出さない。 |
| `IV-SECURITY-006-01` | 006 / `SECURITY-AC-006-01` / `SECURITY-CASE-006-01` | sender/destination/protocol/endpoint/path/class/bytes/purpose/authority/expiryが明示許可に一致する。別の明示許可による正常caseも維持する。 | source、scope、purpose、authority tupleの各単独不一致とunknown classification/expiryを拒否する。 | 物理network pathが読めない場合はUnknownとしてINFRASTRUCTUREへ返す。quotaや1.x sinkは追加しない。 |
| `IV-SECURITY-007-01` | 007 / `SECURITY-AC-007-01` / `SECURITY-CASE-007-01` | write path、network、credential、environment、timeout、resource、diff、rollback、result collectionの宣言制約をWorkerへ渡し、ownerによる適用と実適用観測を別々に確認する。 | 9制約のいずれかのmissing/unknown/unsupportedを別制約のgreenで相殺しない。read-only labelだけで変更後観測を省かない。 | SECURITY policy/value不足はSECURITY ownerへ、適用不能/未観測は該当dispatchを停止しWorker/INFRASTRUCTUREへ返す。未宣言timeout/resource値は補わない。 |
| `IV-SECURITY-008-01` | 008 / `SECURITY-AC-008-01` / `SECURITY-CASE-008-01` | read/write/execute/network/install/delete/merge/release/deploy/credential-use/security-changeの11 operationごとに、完全一致する7軸tupleを照合する。 | 7軸それぞれのdriftとreadから他operationへの置換を独立して拒否する。Agent利用権から包括write/deployを作らない。 | K3 key/permission sourceのmissing/stale/conflict/unknownはnon-positive。purposeは005/006のoperation inputであり7軸へ混ぜない。 |
| `IV-SECURITY-009-01` | 009 / `SECURITY-AC-009-01` / `SECURITY-CASE-009-01` | revoke/scope drift/credential leak/abnormal communication/runtime deviation/unknownのtriggerを個別にし、該当するOS new assignment、Worker stop/quarantine、CONNECT/credential/artifact recipientのcurrent stateを照合する。無関係なoperationは継続する。 | 該当recipientの未達をsuccessにする、trigger間で結果を流用する、全operationを停止する、SECURITYがowner stateを代行する変異を不合格とする。 | G5 map/recipient/ref/stateの欠落または未観測は該当recipientだけUnknown。固定L2にないlatency上限は追加しない。 |
| `IV-SECURITY-010-01` | 010 / `SECURITY-AC-010-01` / `SECURITY-CASE-010-01` | 15対象それぞれのsource/provenance/digest/dependency/permission/network/config/finding/rollback差分を個別に追う。 | 新versionだけを根拠にする、unknown fieldを採用する、対象差分を代理流用する変異を拒否する。 | 不明fieldを列挙し該当source ownerへ返す。特定scanner/registry/providerを要求しない。 |
| `IV-SECURITY-011-01` | 011 / `SECURITY-AC-011-01` / `SECURITY-CASE-011-01` | before/afterの同一対象revisionとcapability記述を対応付け、version差・能力差・security impactを区別する。 | 同名/hashだけでcapability不変とする、read-onlyからwrite/shell/networkへのdriftを見逃す変異を不合格とする。 | 比較不能なsource/owner declarationはUnknown。 |
| `IV-SECURITY-012-01` | 012 / `SECURITY-AC-012-01` / `SECURITY-CASE-012-01` | package/container/repo/MCP/plugin/Skill/Agent package/model/binaryのsource・producer・version・digest・dependency・permission・network・risk・update・rollbackをcurrent refsで追う。 | unknown fieldをtrustedへ昇格する、後続Core Asset Guard/sink completionを1.0実績へ移す変異を不合格とする。 | unknown field名とstateを維持する。scanner/registry未指定を必須製品の欠落として扱わない。 |
| `IV-SECURITY-013-01` | 013 / `SECURITY-AC-013-01` / `SECURITY-CASE-013-01` | build/validation/distribution/execution artifactを同じidentity/version/digest/provenance/producer chainで照合する。 | producer単独欠落、不一致artifact、工程抜け、digest mismatch、digestからsource trust/verification passを推定する変異を不合格とする。 | chain source/receiptのmissing/stale/unreadableはUnknown/hold。K6 receipt issuer authenticityはunsupportedのまま保持する。 |
| `IV-SECURITY-014-01` | 014 / `SECURITY-AC-014-01` / `SECURITY-CASE-014-01` | memory、training dataset、BRAIN knowledgeを別target classとしてsource/provenance/classificationと理由付きallow/deny/holdへ結ぶ。K8汎用input-label APIはasset分類readerではないため、K6 refsとSECURITY固有owner-declared adapterを使う。 | target mismatchやclassification/source unknownを通さない。単体判定からContext→Memory等のhandoff、保存、LABO評価、BRAIN登録を主張しない。 | source/classification adapterまたはownerが未解決なら該当target判定だけUnknown/holdとしてSECURITY ownerへ返す。 |
| `IV-SECURITY-015-01` | 015 / `SECURITY-AC-015-01` / `SECURITY-CASE-015-01` | 固定資産種別と列挙外資産をowner/identity/source/revision/digestで識別し、同じrevision内でstable identityを保ち、更新版を別版として返す。K8汎用input-label APIをasset identity readerとみなさず、K6 refsとSECURITY固有adapterを使う。内容dumpはしない。 | revision/digest変化後に旧identityを流用する、識別不能をpublic扱いする、Web保護完了とする変異を不合格とする。 | owner/source/identity/adapter未解決は該当assetだけunclassified/Unknown。 |
| `IV-SECURITY-016-01` | 016 / `SECURITY-AC-016-01` / `SECURITY-CASE-016-01` | public/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの6分類と、classification-record自身のowner/source/revisionを資産identityへ結ぶ。K8汎用input-label APIではなく、K6 refsとSECURITY固有classification adapterを使う。 | 資産metadataと分類record metadataを混同し、missing/stale/mismatchをpublic/allowへ写す変異を不合格とする。 | unknown/missing/adapter未解決は該当分類だけUnknownとして保持する。1.x sink適用は対象外。 |
| `IV-SECURITY-020-01` | 020 / `SECURITY-AC-020-01` / `SECURITY-CASE-020-01` | Botなしで8 Guard責務を決定し、必要時のsemantic Bot inputだけを分離する。 | deterministic ruleをBotへ委譲する、blanket Writeを与える、例示Botすべてを1.0必須化する、1.x公開sinkを必須化する変異を不合格とする。 | rule/必要観測未登録は該当enforcement ownerへUnknown/hold。Botがないだけではfailureにしない。 |
| `IV-SECURITY-028-01` | 028 / `SECURITY-AC-028-01` / `SECURITY-CASE-028-01` | HARNESS descriptorの機能identity/contract version/artifact/dependency/compatibility/verification scopeとSECURITY candidate、provenance、実artifact・verification targetのidentity/version/digestを一致させる。 | 欠落/mismatched descriptor/scope/range/target/artifactを受け入れる、SECURITYが共通pack交換/rollback/unfinished lifecycleを所有する変異を不合格とする。 | descriptor不足はHARNESS ownerへ、artifact integrityはSECURITY L1-013へ返す。unknownはacceptしない。 |
| §2.1の15 verifierへの集約参照 | 033 / `SECURITY-AC-033-01` / `SECURITY-CASE-033-01…15` | descriptor/assignment/current HEAD/authority/rule revision/task boundaryを同じtask contextへ結ぶ。既存条件が揃うscoped credential-useにper-task approvalを追加しない。 | binding fieldを個別変更して以前のbindingを流用する、raw secretまたはsecret/confidential task contentを渡す、Worker outputでauthority/assignment/requirements/verified/canonical stateを作る、ownerを反転する変異を不合格とする。scope外の無関係taskは停止しない。 | `SECURITY-CASE-033-02…04`の不足owner分類はOS。`-05…07`の適用観測主体が特定できない場合はUnknown。観測で確認したphysical enforcementのnot-appliedと単なる未観測を分け、未観測をINFRASTRUCTUREの欠落確定へ読み替えない。配送先OS assignmentから不足ownerを推定せず、provider名/追加runtime区分で主Worker条件を狭めない。 |

### 2.1 CASE-033の個別coverage

各caseは固定L10の単独fixtureと期待owner分類を保つ。異なるcaseのreceipt/stateを相殺に使わず、unknownを実測済み状態へ合成しない。

| L9 verifier ID | 固定CASE | L4 adapter component | 判定で保持する点 |
|---|---|---|---|
| `IV-SECURITY-033-01` | `SECURITY-CASE-033-01` | K3 authority、OS assignment、Worker descriptor、current HEAD、rule refs | bindingが一致する通常dispatchと有効なscoped credential useを扱う。raw secret値とsecret/confidential task contentは別negativeとする。 |
| `IV-SECURITY-033-02` | `SECURITY-CASE-033-02` | OS assignment／共通Worker contract identity | identityだけをunknownとする。ownerはOS。 |
| `IV-SECURITY-033-03` | `SECURITY-CASE-033-03` | OS assignment／共通Worker contract version | versionだけをunknownとする。ownerはOS。 |
| `IV-SECURITY-033-04` | `SECURITY-CASE-033-04` | OS assignment／共通Worker contract state | stateだけをunknownとする。ownerはOS。 |
| `IV-SECURITY-033-05` | `SECURITY-CASE-033-05` | Worker application／INFRA observation ref | 適用観測contractのidentityがunknown。観測主体も不明のままUnknownを保つ。 |
| `IV-SECURITY-033-06` | `SECURITY-CASE-033-06` | Worker application／INFRA observation ref | 適用観測contractのversionがunknown。観測主体も不明のままUnknownを保つ。 |
| `IV-SECURITY-033-07` | `SECURITY-CASE-033-07` | Worker effective-state observation | 適用済み／未適用のどちらも推定せずUnknownを保つ。 |
| `IV-SECURITY-033-08` | `SECURITY-CASE-033-08` | K3 authority／OS assignment | authority/policyをOSへ誤帰属する単独変異を拒否する。不足ownerはSECURITY。 |
| `IV-SECURITY-033-09` | `SECURITY-CASE-033-09` | Worker/INFRA observed application、SECURITY policyとの比較 | 観測でnot-appliedを確認した場合、該当dispatchを止め、INFRASTRUCTURE接続を候補として返す。 |
| `IV-SECURITY-033-10` | `SECURITY-CASE-033-10` | OS assignment／SECURITY authority | assignmentをSECURITYへ誤帰属する単独変異を拒否する。不足ownerはOS。 |
| `IV-SECURITY-033-11` | `SECURITY-CASE-033-11` | HARNESS selected task-contract ref | 未選択HARNESS contractで代行する変異を拒否する。契約選択ownerが不明ならUnknown。 |
| `IV-SECURITY-033-12` | `SECURITY-CASE-033-12` | OS contract receipt／Worker effective-state observation | OS receiptだけを物理適用証拠に流用する変異を拒否し、Unknownを保つ。 |
| `IV-SECURITY-033-13` | `SECURITY-CASE-033-13` | SECURITY policy declaration／Worker effective-state observation | policy宣言だけを実適用証拠に流用する変異を拒否し、Unknownを保つ。 |
| `IV-SECURITY-033-14` | `SECURITY-CASE-033-14` | Worker self-report／Worker effective-state observation | Worker自己申告だけを実適用証拠に流用する変異を拒否し、Unknownを保つ。 |
| `IV-SECURITY-033-15` | `SECURITY-CASE-033-15` | INFRA observation／SECURITY authority | policy/authorityをINFRASTRUCTUREへ誤帰属する単独変異を拒否する。不足ownerはSECURITY。 |

K6のdigest/read/receiptが一致してもissuer authenticityは`Unknown(unsupported)`であり、過去実行の真正性や物理適用を証明したとは判定しない。K3の許可PositiveもOS assignment/Worker実行/INFRA物理観測のPositiveではない。

## 3. L3業務境界とNFR測定

### 3.1 業務境界

19親には独立したbusiness ACがない。L10 businessの照合では上表のfunctionalな正例／negative／unknown結果を再利用する。次の変異を業務成功として表現した場合は不合格とする。

| 入力変異 | 期待境界 |
|---|---|
| SECURITY allow/deny、receipt、policy decisionのみ | OS assignment、実行、受領、承認、保存、評価、登録のsuccessを作らない。 |
| AC-009 revoke/propagationの観測 | recipient ownerのstate変更をSECURITYが代行しない。 |
| AC-014 target別判定 | target ownerへのhandoff/save、LABO評価、BRAIN登録を主張しない。 |
| AC-028 pack descriptor/artifact検査 | HARNESS共通交換・rollback・unfinished obligation lifecycleをSECURITY受入にしない。 |
| AC-033 Worker output | authority、approval、assignment、requirement、verified、canonical stateを生成しない。 |

業務意味は既存SECURITY/OS/Worker/CONNECT/HARNESS/LABO/BRAIN ownerに残す。追加のBR、AC、業務ownerは作らない。

### 3.2 NFR候補のL10照合

候補適用親・測定方法・ownerは固定L3 NFR/L10 NFRの適用表をそのまま使う。下記の候補数値は合成fixture集合に対する技術候補であり、承認済み実装値、実測値、SLOではない。

| L9 verifier ID | 候補NFR | 適用する親 | L10の静的oracle／unknownの扱い |
|---|---|---|---|
| `IV-SECURITY-NFR-001` | SEC-NFR-001 | 005, 033 | 合成secret markerを全task context/outputで走査する技術候補では、raw valueの露出を0とする。valueは記録しない。 |
| `IV-SECURITY-NFR-002` | SEC-NFR-002 | 008 | 7軸tupleを個別にdriftさせ、各negativeでallowを0とする候補。purposeは別の006 input。 |
| `IV-SECURITY-NFR-003` | SEC-NFR-003 | 016 | 6/6分類照合とし、unknownをpublic/allowへ写す件数を0とする候補。1.x sinkは分母に含めない。 |
| `IV-SECURITY-NFR-004` | SEC-NFR-004 | 020 | 8 Guardでdeterministic ruleへの委譲と必須Guard条件の抜けを0とする候補。Bot稼働数はpass条件にしない。 |
| `IV-SECURITY-NFR-005` | SEC-NFR-005 | 009 | 該当recipientの未達/未観測をsuccess扱いする件数と、無関係なglobal stopを0とする候補。latency上限はない。 |
| `IV-SECURITY-NFR-006` | SEC-NFR-006 | 007 | 各適用制約についてrequestからWorker適用観測までの欠落を0とする候補。未宣言値で補わずunknownを保つ。 |
| `IV-SECURITY-NFR-007` | SEC-NFR-007 | 005, 008, 009, 033 | dispatch/resume/retry時にcurrent authority/bindingを再照合する比較候補。expiry A/Bは未採択の解釈で、本設計では採択しない。時間幅を追加しない。 |
| `IV-SECURITY-NFR-008` | SEC-NFR-008 | 005, 009, 010, 013, 033 | owner宣言のverification window内に必要なsource/revision/reason/recipient stateを照合し、raw-secret-free evidenceを使う候補。retention期間はない。 |
| `IV-SECURITY-NFR-014-01` | SEC-NFR-014-01 | 014 | memory/training/BRAINのtarget別trace欠落を0とする候補。保存/handoff結果は対象外。 |
| `IV-SECURITY-NFR-028-01` | SEC-NFR-028-01 | 028 | 固定L2-028のfinite descriptor/scope/target-artifact fixturesでcoverage 100%、false acceptance 0とする候補。運用SLAではなく、unknownをpassに数えない。 |

適用がunknown、source未登録、fixture未成立、実適用未観測、K6 issuer authenticity unsupportedの場合、その状態を0/passへ丸めず、該当NFRの対象成分だけを未評価/Unknownのまま返す。候補がない親にlatency/retention/quota/thresholdを追加しない。

## 4. 共通kernel IVとの結合点

本pairは共通kernel IVを再定義せず、SECURITY親fixtureから既存IVへのtraceを保つ。

| SECURITY側の義務 | 既存L4/L9 oracle |
|---|---|
| K6 source/read-set/receipt consistency、issuer authenticityの限界、`authority_effect=none` | common-kernel IV-K6-01…15（特にread-set欠落、receipt integrity、authority非生成）。 |
| K3 tuple/current permission/query input/unique effective decision | common-kernel IV-K3-01…20と、K3のoperation-specific required-input/current-record checks。 |
| K7 current permission fence、pointer move postcheck、rollback-required state | common-kernel IV-K7-05…09、IV-K7-14/15。G5 recipient closure/unknown propagationはIV-G5-01…10。 |
| K8 untrusted input label、read/effect分離、current key、lookup state | common-kernel IV-K8-01…26。SECURITY L2-001起点のgeneric label transitionに限定する。 |
| 028 descriptor ownerの分離 | K6 source-verification oracleと固定HARNESS descriptor ownerを使う。common pack lifecycleはHARNESS L2-010/011に残す。 |
| 033 OS/Worker/INFRA ownerと物理状態の区別 | 上記K3/K6/K7/G5 IVの結果を再利用し、物理状態を別receipt型で捏造しない。CASE-033-05…07はsourceの主体不明をUnknownとして保つ。 |

### 4.1 state・結果の必須分離

- permission requestとpermission record、K3 `PermissionCheck`、OS assignment、Worker execution state、INFRA resource observationは別成分である。
- G5のrecipient map/current owner declarationと、各recipientの受領/適用/未達/未観測は個別に保持する。receiptがないことをsuccessとしない。
- `observed physical not-applied`はownerが実際に観測し「適用されなかった」と返した結果である。`unobserved`は適用状態の証拠がない状態であり、欠落確定でもnot-appliedでもない。特に033のCASE-05…07では両者を混同しない。
- K6 bytes digest、reproduction、issuer authenticityは別々のassuranceである。K6 issuer authenticityは未証明（`Unknown(unsupported)`）のまま維持する。
- K2 lookupでcurrent recordが`Stale`、同revisionでdigestが競合、identity set changeにより`Unobserved(not_run)`となる場合は、その型を保ち、新しいcheckのNegativeやPositiveへ変換しない。
- assignment/source/owner completenessがunknownでも全Stageを停止しない。影響するoperationだけをnon-positiveにする。

## 5. 保持する版境界・未解決

本設計はSECURITY Stage 1のL3/L10固定範囲と共通kernel既存契約だけを接続する。SECURITYは全操作に既存operation-specific authorityを適用するが、新しいpermission kind/tuple軸/approval actor/receiptは追加しない。HARNESSが持つ028のdescriptor/lifecycle、OSが持つassignment、Workerが行う制約適用、INFRASTRUCTUREが持つ実資源/物理観測をSECURITYで置き換えない。

物理enforcement source、OS assignment source、actual producer graph、recipient declarationが登録されていないか、current owner sourceから結び付けられない箇所は未解決である。設計では関連operationのみUnknown/holdとし、欠落が確認された観測と未観測を分離する。新たなsourceやownerが現れた場合も、source authorityを読んでからこのadapterに結ぶ。現L2意味、policy値、owner、versionを変える必要が見つかった場合のみ既存上流へ戻し、単なる下流実装不足から要求変更や人間gateを作らない。
