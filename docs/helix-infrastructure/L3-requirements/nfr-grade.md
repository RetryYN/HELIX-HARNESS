---
title: "HELIX-INFRASTRUCTURE Stage 1 NFR grade候補"
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
layer: L3
kind: requirement
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L10-verification/nfr-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 NFR grade候補

以下の数値・判定値はL3承認前の技術候補で、固定親にない製品値を承認済みと扱わない。候補には根拠、比較案、測定方法を付け、通常のL3承認へまとめる。parameter別PO質問は作らない。業務成功・incident severity・利用可否・費用採否をoracleとして作らず、該当するownerの契約がない場合はunknownとする。

## 固定親・旧NFR処置

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`、対象L2/L11固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11 SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。

| NFR対象 | 旧source / 再利用区分 |
|---|---|
| gradeを要件/測定/証拠へ結ぶ書式 | `LEGACY-ASSET-8CC5ABFC98C0D00183CA`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md` L1–73、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`。gradeとtest evidenceの対応形式を意味再導出する。旧Grade 3/固定閾値は移さない。 |
| INFRA-001 environment identity・resource・credential reference observation | 部分再利用: `LEGACY-ASSET-17C4BF78919578FEBB18`, 旧L3 `product-lifecycle-operations-requirements.md` L68–73、全文SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`、span SHA-256 `90ec4ca119bf860db25efd2126095d80376a2fa1ce3db2159a5da49fc5610f14`; 旧対AC `LEGACY-ASSET-F46AB11BD14F2C0469F4`, `product-lifecycle-operations-acceptance.md` L26、全文SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`、span SHA-256 `f14b760580d8ec6a8b1a01bd0d4ef197a9b9b670fb8201f4ff8c1c8630b20657`。完全なscope率や全property schemaは再導出し、旧provider/credential方式や旧数値は不使用。 |
| environment / health / rollback observation | `LEGACY-ASSET-17C4BF78919578FEBB18`, 旧L3 `product-lifecycle-operations-requirements.md` L74–98,108–119,140–171、SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`。source/revision/unknown/rollback evidenceの意味のみ再導出し、旧SLOや全体lifecycleは置換する。 |
| verification pair oracle | `LEGACY-ASSET-F46AB11BD14F2C0469F4`, 旧test design `product-lifecycle-operations-acceptance.md` L20–39、SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`。正常・negative oracleの形を再導出し、旧受入率/approval/profileを移さない。 |

## 候補値と測定

| ID / parent | 技術候補値 | 根拠と比較 | L10観測・判定材料 |
|---|---|---|---|
| INFRA-NFR-001-01 / L2-001 | 対象scope内resourceの7属性、environment分離8軸（scope/version/authority/source/config/network/credential scope/data）、承認対象CORE設計revision、runtime revisionのうち対象fixtureで宣言された必須項目を全てsource-qualifiedで照合する候補。値未観測はunknownとして保持する。 | L2-001の7属性・8分離軸・CORE設計参照・minimum 13 runtime versionとL11-001のenvironment別resource inventory、source/revision、unknownに基づく。代表抽出やunknown除外案と比較し、declared fixture scope内の必須項目を分母にして可視化する案を候補とする。OS stage release identityは別識別子として保つ。 | L10がdeclared fixture scopeのresource identityと各必須fieldを分母化し、値またはunknown、source/revision、重複・欠落件数を照合する。owner unknownを成功に丸めず、source/CORE設計ownerへ返す。返却先owner識別不能ならunknownと未完の観測範囲を保持し、成功・利用可能にしない。実環境全数をfixtureから主張しない。 |
| INFRA-NFR-001-02 / L2-001 | declared network pathごと8/8軸、storageごと6/6属性+recovery referenceを値またはunknownで記録する。 | 8 network軸と6 storage属性は固定L2に列挙された契約面である。軸の一部だけを記録してcompleteとする案より、全軸可視化する方が境界/owner/復旧参照欠落を検出できる。unknownは適合を意味しない。 | L10は1〜8 network軸の個別欠落/unknown、およびstorage6属性/recovery参照の個別欠落/unknownをmutationし、記録の可視性と誤ってcompleteにしないことを見る。 |
| INFRA-NFR-001-03 / L2-001 | HELIX-CONNECT logical identityとphysical path identityを常に別identityで参照する（混同許容0件）。 | L2-001明示の論理接続/physical path分離が根拠。一本の共用identity案と比較し、通信契約と実経路の変更を区別できる2 identity案を候補にする。 | L10は等しい名前/endpointを持つlogical/physical fixtureと誤併合mutationを使い、参照関係は維持しidentityが独立しているかを確認する。 |
| INFRA-NFR-006-01 / L2-006 | 独立operation eligibility照合で、target/action/revision/scope/別SECURITY authority/expiryの6条件を全て照合する候補（欠落/unknown通過0件）。通常operation用authorityだけでは独立recoveryを通さない。 | L2-006の限定対象・操作と通常authorityとは別のSECURITY authorityを要する明示条件に基づく。action・expiry等の入力細目は、Stage 1対象外の採択済みL2-010 L129/L132を横断参照する。条件の一部だけで通す案と比較し、6条件を個別に照合する案を候補とする。 | L10で各6条件を個別に欠落・不一致・expiredとし、通常operationで有効なauthorityだけを与える変異も別に照合する。正常fixtureは別authorityを含む全条件とoperation開始recordを持つ。 |
| INFRA-NFR-006-02 / L2-006 | operation matrix coverageは5/5種（bootstrap, health check, service stop, rollback, recovery）の個別case候補。OS/control plane停止fixtureで通常planeへの依存経路は0。 | L2-006/L11-006の5操作列挙と「完全自動failoverは含まない」境界に基づく。代表operationだけで一般化する案と比較し、5操作各々を個別確認する。 | L10は5種を別々に照合し、停止plane経由、通常operation authority流用、credential/policy unknown、完全自動failoverを1.0条件化する変異を分離して観測する。failover trigger/countを要件にしない。 |
| INFRA-NFR-006-03 / L2-006 | 1回のhealth observation timeout候補を5秒、同じ操作内のprobe回数を3回とする。結果は各回後に記録し、3回とも未応答ならoperation-health=unavailable candidateとし、service全体/incidentの判定はunknownのままL2-004側の該当owner（本Stage対象外）へ渡す。 | 固定L2はhealth checkを要求するがtimeout/retry値を指定しない。比較候補は1秒×1回、5秒×3回、10秒×5回で、有限時間と一過性遅延観測を比較する。5秒×3回は初期技術候補であり、製品SLOや全体health policyではない。 | L10は遅延0/4/6秒、未応答1/2/3回、途中復帰、完全自動failoverを1.0合格条件に加える変異を別々に照合する。failure/incident ownerが固定親に特定されない場合はL2-004側の該当ownerへunknownを渡し、ownerを推測しない。 |

## owner / scope / version guard

resourceの意味上の設計はCORE、資源と観測stateはINFRASTRUCTURE、作業/change stateはOS、authority/credential/network/isolationはSECURITY、実操作はSECURITY制約下のWorker、配置/容量判断案はINTELLIGENCE、効果評価はLABOが所有する。NFR候補はこれらの境界を移さない。

`HELIXINFRASTRUCTURE-L2-005` は採択済み入力であり、006復旧時に当該操作へ適用される復旧義務を参照する。005のL3未着手を理由に006の親revisionを未採択/未承認扱いしない。逆に、006が005のbackup/restore/rollback L3やL10まで本Stageで完成させたとも扱わない。Fully automatic failover、autoscaling、multi-cloud、L2-012以降のversion holdは1.0要件/受入条件に含めない。

## Stage 2b suffix — HELIXINFRASTRUCTURE-L2-002/007 NFR候補

状態：候補のみ。対象は採択済み HELIXINFRASTRUCTURE-L2-002/007、version_target 1.0。固定L2/L11が要求意味のauthority、PO決定は親identity/revision/versionの採択登録、G0は実装順序のみを記録する。このL3/L10本文は未承認・未実行であり、実装・実行・配布の許可を生成しない。対象範囲とsource pinsは[Stage2b公開cutout監査](../../governance/audits/requirements-stage/l3-l10-infra-stage2b-main-publication-cutout-2026-10-05-72fa2f08.json)に固定する。

### 対象・適用範囲 — HELIXINFRASTRUCTURE-L2-002/007

対象は採択済みHELIXINFRASTRUCTURE-L2-002/007のみ、version_target 1.0。固定L2/L11の意味・scope・担当・版を保持する。本cutoutはこの2親だけを対象とし、他の親やstageを追加しない。候補草稿・未承認・未実行。

| 親 / NFR ID | 根拠・比較案 | 測定候補と対のL10 |
|---|---|---|
| L2-002 / INFRA-NFR-002-01 | TER-R-02/05の宣言・実効分離とversion不変driftを部分再導出。固定親の9差異類型を独立照合する案Bと、versionだけを比べる案Aを比較しBを候補とする。 | C01〜09の宣言scopeで9/9類型識別、design/target/actual三state無言変更0、unknownから一致0を候補として測る。freshness時間や全環境SLAは新設しない。 |
| L2-007 / INFRA-NFR-007-01 | 旧distributionのclean consumer/入力版/実結果照合を隣接例として部分再導出。backup/文書存在だけの案Aに対し、再構築・再接続・起動・検証の4段階を結ぶ案Bを候補とする。 | C01〜08で4/4段階source trace、元machineにしかない必要情報依存0、未完から誤success0を測る。固定RTO/RPO・機種値や旧release standing authorizationを継承しない。 |

各scopeで契約上必要なfield/段階/変異を結果より前に分母化し、missing/unknown/stale/未観測を除かない。適用条件そのものが不明なら分母不明であり0/非適用へ丸めない。可観測と合格を分け、正しい拒否も照合可能な結果に数える。未実行は未測定。別の技術値が必要なら根拠・比較・測定方法付き候補として通常L3承認へまとめる。

## Stage 2a 追加範囲 — 根拠付き技術NFR候補

下記は採択済み003/004/005/009/010の機能境界を測る技術候補であり、現行実装の合格値、L2の数値、business oracleではない。009/010は固定L2/L11に根拠付けられる数値候補がなく、数値NFRを追加しない。選択scope内のFR/AC/CASEをsource-qualifiedに追跡し、未解決義務・未完operationを保持する質的検証を対にする。候補値のscopeは対象source/resource/operationに限定する。現行source ownerのauthorized SLA/limitがある場合はそれを参照し、独立したparameterごとのPO質問は作らない。要求のmeaning/scope/owner/versionが変わる場合だけ該当L2へ差し戻す。L2-019の詳細freshness/confidenceや後続版を1.0 gateへ入れない。

旧`nfr-grade.md`のgrade→測定→証拠を結ぶ書式は意味再導出し、旧IPA grade、数値、CI/runtime、pass thresholdは置換する。旧source pin: `LEGACY-ASSET-8CC5ABFC98C0D00183CA`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md:1-73`, SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`。

| Candidate / parent | 候補値とscope | 根拠・比較 | 測定方法・oracle境界 |
|---|---|---|---|
| INFRA-NFR-003-01 / L2-003 | Per-source observation age candidate = 2× declared sample interval; cap unset. owner maximum未定でも候補値の比較・測定・起草を行う。これは技術候補の測定であり、実operationのcurrentness/eligibilityは既存source契約で別に決め、未定義を新gateや個別owner承認にしない。 | 003 source/revision, 004 stale-not-currentが根拠。1×はjitterでfalse stale、2×は1 missed sampleを許容、unboundedはstale混入。L2-019詳細freshnessは後続版。 | event/receipt timestamp、sample interval、clock uncertainty、判断時ageをsource class別cycleで測定。1 missed sampleを注入してunknown境界を見る。thresholdをglobal固定しない。 |
| INFRA-NFR-003-02 / L2-003 | Selected operationの候補headroom 20% free capacity。親またはowner limitがない限り、この値だけでsafe-to-acceptを決めない。 | 0%は即時saturation risk、20%はburst reserve候補、30%はscarce GPUなどのresource消費増候補。いずれも親規定値でない。 | recorded utilization/queue/concurrencyとburst traceでresource type別false accept/rejectとcostを比較。許可owner thresholdが無ければ観測candidateに留める。 |
| INFRA-NFR-003-03 / L2-003 | stable observation label candidate: 3 consecutive samples across at least 2 source intervals. | Single sampleは安価だがnoisy、3はtransient依存を減らす候補、長窓は遅延し短いspikeを隠す。親はcountを指定していない。 | idle/burst/sustained load windowsを測り既存source label/saturation/rejection/backpressureと比較。安定性は記述値で自動accept oracleにしない。 |
| INFRA-NFR-005-01 / L2-005 | Isolated reversible artifact restoreでexploratory timeout candidate 5 minutes。一般deadlineではなく、他operationへ適用しない。 | Parentはintegrity/reconnect/startup/verificationを求めるがtimeout値なし。1分はfalse timeout増加、5分は初期候補、15分は完了を長く塞ぐリスクとして比較する。候補は親規定値でない。 | 同じ合成artifact/scope/revisionを用いた独立restoreで各phase elapsedを測り、1/5/15分のtimeout結果・phase別censoringを比較する。owner期限未定でも測定し、既存期限契約があるoperationのeligibility/SLAとは分離する。timeout超過だけでincident/business failureを生成しない。 |
| INFRA-NFR-005-02 / L2-005 | Restore repeatability candidate: 3 independent runs。採択済みpass thresholdではない。 | 1 runは一回の成立のみ、3はintermittent behaviorを見つける候補だがresource costが増える。L2/L11に回数指定なし。 | 各runのsource/revision/resultを独立記録し、phase pass consistency/varianceを測定。3回未達だけでrestore可否/incident closureを決めない。 |
| INFRA-NFR-004-01 / L2-004 | Telemetry coverage = required applicable fieldsの100%。scope applicabilityでoptional fieldはN/Aとして分母から分ける。 | Global all-field completenessは非該当fieldでfalse failure、any-fieldはblind spotを通す。L2はmissing telemetryをhealthyとしないが全signalを全resourceに適用しない。 | Resource type別applicability matrixを宣言し、required fieldごとのmissing mutationを注入してunknown/unobservedとowner returnを確認。割合をbusiness health scoreへ変えない。 |

Candidateの受入/採用は一つの通常L3判断へまとめ、数値ごとの個別PO承認を新設しない。

## Stage 4 追加範囲 — HELIXINFRASTRUCTURE-L2-008/025

この追記は採択済み `HELIXINFRASTRUCTURE-L2-008` と `HELIXINFRASTRUCTURE-L2-025` の1.0候補である。固定要求意味はmain `633bf12ea8f948db8ba3d6600179c4a9507377a7` のL2/L11、PO確認対象は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。既承認prefixのbytesを保ち、この追記の承認・実装結果は別に判断する。実装順序はG0案Bに従う。後続版、自動配置最適化、高度な自動増減、Web展開を受入条件へ加えない。

### Stage 4の測定候補

| NFR / parent | 根拠と比較 | 測定候補 |
|---|---|---|
| INFRA-NFR-008-S4 / 008 | 固定L2のdesign revision/scope・target/actual分離、L11の未承認/別revision負例。名前一致だけの比較候補1に対し、宣言scopeの全必須参照を照合する比較候補2を候補とする。 | 各fixtureの必要入力・参照・ACを事前に分母化し、照合可能率100%を技術候補として観測する。missing/unknown/staleを除かず、可観測率と合格率を分ける。設計無言変更/誤承認生成は0件の期待oracle。新latency/expiry値は設けない。 |
| INFRA-NFR-025-S4 / 025 | 固定L2/L11の資源/Worker区別、隔離、ticket/要求/責務/未完保持と元資源/移動先状態。Worker応答のみの比較候補1に対し、実stateと作業参照を別に追う比較候補2を候補とする。 | 選択Worker/resource/移動scopeの必要resource属性・隔離条件・lineage参照を事前に分母化し、全件のvalue/unknownとsource/revision追跡を候補とする。unknownを成立へ丸めた件数、未完義務消去、正本移管は0件。自動最適化の性能値は測らない。 |

旧grade→測定→証拠という形式を再導出し、資源identityと実適用の意味根拠は機能本文の旧OPS/WCC/Conceptに限定する。既存NFRの数値をこの2親へ転用しない。候補値の判断は通常のL3承認へまとめ、parameter別PO質問は作らない。要求meaning/scope/owner/versionの変更は該当L2へ戻す。

## Stage 5 追加範囲 — HELIXINFRASTRUCTURE-L2-011

L2-011 1.0に数値SLO、時間/回数threshold、性能保証を追加しない。以下は固定L2/L11へ追跡するfixture設計・静的分類候補であり、未実行である。合成値は測定値ではない。

| 候補 | 分母/層別 | oracleと記録 |
|---|---|---|
| `INFRA-NFR-011-S5-01` | functional CASE集合の全86件をunit 54、operation 5、recovery 9、connection/composite 9、scope境界 2、environment/operation negative 6、partial composite 1の7区分とitem/variant別に列挙。unknown/unobserved/stale/mismatch/unauthorizedを分母から除かず、適用外には固定根拠と理由を記録する。 | 可観測な入力/期待/結果の有無とoracle一致を別記する。S5-086では禁止write試行、拒否結果、writes=none、前後状態不変を別々に観測する。L11:146が拒否するunknown/unobserved/stale/mismatch/unauthorizedの誤受入分類の期待件数0は静的候補に限り、実測・runtime保証としない。分母0は率なし、未実行は未測定。|
| `INFRA-NFR-011-S5-02` | 18最低項目、該当connectionとoperation/recoveryのsource/revision/owner/unfinished-duty参照をCASEごとに追跡する。read-only操作はempty write-set/write禁止の適用根拠と通常操作・独立recovery例外のscope境界も追跡する。 | owner不明はunknown。OS停止中ticket不要と復帰後syncは別CASE。S5-086では拒否結果が操作起因changeなしと一致するか、許可・状態変更へ誤転換されないかを静的に分類する。capacity観測をOS/INTELLIGENCE採否へ換算しない。率・閾値・合格を未実行で報告しない。|

この候補は個別PO質問、追加owner/authority、閾値または実装scopeを作らない。
