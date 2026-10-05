---
title: "HELIX-INFRASTRUCTURE Stage 1 NFR総合検証候補"
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
layer: L10
kind: verification
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L3-requirements/nfr-grade.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 NFR総合検証候補

本書は[NFR grade候補](../L3-requirements/nfr-grade.md)の候補値をシステム境界上で測る設計である。L3候補値の承認や現在実装の測定結果ではない。未知の数値は承認値に読み替えない。実測はL10設計を用いた後続工程で行う。

## source pin

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`、PO固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11 SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。L2-001 Stage 1 registration `MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`、L2-006 `MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`。005は採択済み依存入力のため、006の5 operation検証で該当する復旧義務を参照するが、本書の直接L3/L10対象に含めない。

## 測定計画

| NFR | 測定母集団と方法 | 正常/negative oracle | 未見正常・差戻し | 記録する材料 |
|---|---|---|---|---|
| INFRA-NFR-001-01 | 母集団は各fixtureで宣言したscope内のresource identitiesと必須field。7属性、environment分離8軸（scope/version/authority/source/config/network/credential scope/data）、承認対象CORE設計revision、runtime revisionを別々に数える。全必須fieldのsource-qualified照合100%を技術候補とする。 | 正常は全宣言fieldを値またはunknownとsource/revisionへ結ぶ。negativeはresource owner/location/dependency欠落、各環境軸不一致を独立に与え、推定補完・誤ったavailable判定を検出する。OS stage release identityをruntime revisionへ置換する変異も分離する。 | 未見resource roleでもdeclared scopeと契約が成立する場合に照合し、返却先ownerが未解決ならunknownと未完の観測範囲を保持し、成功・利用可能にしない。設計意味はCORE、resource source/stateは該当ownerへ戻す。 | identity・field別分母、known/unknown、source/revision、環境軸、不一致・重複・欠落数、返却先、runtime revisionとOS stage identityの別記録。 |
| INFRA-NFR-001-02 | Pathごと8軸、storageごと6属性+recovery referenceを独立に計数する。 | 正常は全axisにvalue/unknownがある。negativeは各axis一つずつ欠落、unknownをcompleteへ写像する。 | 未見protocol/path typeを追加。契約外attributeはunknownを維持し、path ownerへ返す。 | 8軸ごとの有無/unknown、6属性とrecovery参照、environment/source/revision、完結扱い誤り件数。 |
| INFRA-NFR-001-03 | logical connectionとphysical pathの各identityおよびreference edgeを数え、同一化mutationを検出する。候補許容は誤併合0件。 | 正常は2 identity+reference。negativeはname/endpoint一致を理由に併合する。 | 新規logical/path pairでも同じ関係を保つ。未承認routeはCONNECT/path ownerへ戻す。 | identity数、reference数、併合・fallback件数、owner。 |
| INFRA-NFR-006-01 | 各operation requestでtarget/action/revision/scope/別SECURITY authority/expiryの6条件を個別評価し、照合済み比率とinvalid/unknown通過件数を測る。6/6照合・invalid pass 0を技術候補とする。 | 正常は別authorityを含む全条件一致。negativeは6条件それぞれの欠落/mismatch/expiredに加え、通常operationでは有効だが独立recoveryには適用されないauthorityだけを提示する変異を個別に与える。 | 未見resource/revisionでも適用scope内の宣言済み条件を照合する。authorityはSECURITY、resource/path issueは該当ownerへ戻す。 | 6条件結果、別authority identity/revision、operation開始有無、拒否理由、差戻し先。credential値は記録しない。 |
| INFRA-NFR-006-02 | 5 operation種類の各々にnormal/negative/owner returnを持つ候補。coverage 5/5、停止中OS/control planeへの唯一route依存0を測る。 | normalは各操作の限定判定。negativeは第6 operation、停止plane経由、通常authorityの流用、credential/policy unknown、完全自動failoverを1.0合格条件化する変異を独立に照合する。完全自動failover自体は測定・必須条件にしない。 | 未見対象で既知5種のいずれかを照合し、操作種類を増やさない。 | operation coverage matrix、route、attempted action count、別authority、unknown理由、owner。 |
| INFRA-NFR-006-03 | 各health probeの開始/終了時刻と結果を測定。5秒/probe・3連続probe候補（最大15秒）に対し、遅延0/4/6秒・未応答1/2/3回・途中復帰を与える。 | normalは5秒以内応答のprobeごとに記録。negativeは6秒応答を5秒passに丸める、1回欠測からservice-wide failureを確定する、完全自動failoverを1.0条件化する各変異を個別照合する。 | 新resourceで同じprobe契約を照合。operation-healthより広いhealth/severity/incident ownerが固定親で特定されない場合、unknownをL2-004側の該当owner（本Stage対象外）へ渡し、system incident ownerを発明しない。 | per-probe elapsed、timeout、count、operation-health候補、source/revision、authority。business statusや新incident ownerは含めない。 |

## 比較案と候補値の再評価

- 001のcoverageは100% declared-scope inventoryを候補にし、代表抽出、unknown除外、推定補完と比較する。実環境の存在全数は上流scope/sourceが定めるため、fixture上の列挙を実環境全数と主張しない。
- 006のhealth probeは5秒×3回を1秒×1回、10秒×5回と比較する。選定理由は測定可能な上限と一過性遅延観測の両立で、製品SLO/incident policyではない。実際のtimeout retryがHELIX control plane依存の場合は独立性違反として扱う。
- 候補の承認・修正はL3要件承認にまとめ、個別parameterごとにPOへ質問しない。要求の意味、scope、owner、versionが変わる場合だけL2へ戻す。

## Stage 2a 追加範囲 — NFR測定候補

測定対象は[Stage 2a NFR candidates](../L3-requirements/nfr-grade.md)にある6候補。測定設計であり、実行結果、実装合否、product SLOの決定ではない。各candidateのsource/revisionとselected resource/operation scopeを固定してから計測する。normal/negative/unseen-normal/owner-returnを同じ具体fixtureの重複宣言にせず、field failureは個別にmutationする。

| NFR / parent | 測定母集団・方法 | Normal / individual negative oracle | 未見正常 / owner return / 記録 |
|---|---|---|---|
| INFRA-NFR-003-01 / L2-003 | Selected source cyclesのevent/receipt timestamp、interval、clock uncertainty、decision-age。candidate 2×intervalをsource別比較。 | Normal: recent value/ageをsource owner ruleと照合しつつcandidate 2×intervalの測定結果を記録。Negative: missed sample、stale、clock uncertaintyを一つずつ注入し、無期限 freshnessをcurrentへ通さない。技術候補測定はowner maximum未定でも継続し、実operation eligibilityは既存source契約と分離する。 | 独立したsource identity/intervalで再測定。owner maximum未定でもcandidateを測定し、その値だけでoperation eligibilityを決めない。実operationのcurrentnessは既存source契約に従い、契約上未定ならその状態を記録する。raw timestampではなく匿名fixture; age, interval, contract currentness, revision, statusを記録。 |
| INFRA-NFR-003-02 / L2-003 | Operationに必要な各declared resourceのcapacity/current utilization/queue/concurrencyと予測burst。20%を比較候補にし決定値としない。 | Normal: owner-declared limitとobservationを分けて記録。Negative: 0/20/30% headroom scenariosとunknown thresholdを比較し、candidateだけでacceptしない。 | 別resource type/new operation fixtureで同じ測定を行う。operation limit owner不明ならOS/INTELLIGENCEへunknown return。resource別false accept/reject/cost distributionとscopeを記録。 |
| INFRA-NFR-003-03 / L2-003 | Idle, burst, sustained-load windowsのsample countとsource interval。3 samples/2 intervalsをcandidateとして評価。 | Normal: owner/source-defined labelとの一致を記録。Negative: single sample noise、2/3/4 consecutive samplesを比較し、stable labelだけでsafe-to-acceptを出さない。 | 未見source interval/resourceの独立fixtureを追加。label oracle owner不明ならsource ownerへ返す。samples, interval, saturation/rejection/backpressure correlationを記録。 |
| INFRA-NFR-005-01 / L2-005 | Selected isolated reversible artifact restoreのphase elapsed（integrity, dependency reconnect, startup, verification）を複数実行で測る。5mは探索candidateのみ。 | Normal: 全phase evidenceが揃い、5分technical candidateとの差を測る。Negative:各phase未完、5分超過、未宣言scopeを個別注入。owner deadline未定でもcandidate測定を続け、timeoutだけでbusiness incident/operation ineligibilityを確定しない。 | 別source/revisionのrestore fixtureでowner deadline未定でも5分candidateを含むdurationを再計測。candidate測定と既存期限契約に基づく実operation eligibility/SLAを分け、個別owner承認/parameter gateを作らない。phase p50/p95、censoring、scope、source/revision、契約期限の有無を記録。 |
| INFRA-NFR-005-02 / L2-005 | 独立restore runsのrepeatability。3 runsは比較案。 | Normal: 1/3 runsの結果を別々に残し全phase trace可能。Negative: 1,2,3回目で結果が異なるfixtureを作り平均でfailureを隠さない。 | 新しいtarget/revisionでrunを分離。必要反復数のoracle owner不明ならrecovery design ownerへ返し3をpass gateにしない。run identity、phase variance、resource costを記録。 |
| INFRA-NFR-004-01 / L2-004 | Declared required fieldsをresource-type applicability matrixで分類しcoverage ratio算出。 | Normal: applicable required fields全件presentまたは明示unknown。Negative: required fieldごとに1つずつ欠落、optional N/Aと混同、100%未満をhealthy扱いするmutation。 | 新しいresource type/sourceで適用表を別宣言。required-field owner不明ならsource/collector ownerへ返す。分子/分母/optional N/A/source/revision/classificationを記録。 |

ここにbusiness pass/fail、incident severity、placement/cost acceptanceを追加しない。数値候補は通常のL3要件承認に付し、parameter別PO確認を作らない。
