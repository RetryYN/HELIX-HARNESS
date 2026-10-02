---
title: "HELIX-INTELLIGENCEの機能単位要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirement
status: draft
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md
parent_l1_candidate: docs/helix-intelligence/L1-planning/intelligence-intent.md
---

# HELIX-INTELLIGENCEの機能単位要求候補

本書は[HELIX-INTELLIGENCE L1企画案](../L1-planning/intelligence-intent.md)を親にする未採択候補である。L1企画案の対象revisionはPO確認待ちであり、本書は採択、要件承認、実装・実行許可を生成しない。既存候補の本文・authority状態は変更しない。

INTELLIGENCEは現在状態を根拠・revision・不確実性付きで理解し、計画・予測・診断・review・配置等の判断候補を生成する。要求・設計・状態・知識・権限の正本にならず、実行・採択・評価はOS、HARNESS、SECURITY、Worker、LABO、BRAIN、Product Coreのownerへ接続する。

各機能packのcommon identity、契約版、成果物版、依存版、compatibility、検証範囲、交換・更新・rollbackはHARNESS-L2-010/011に従う。本書はcommon pack contractを再定義しない。各要求identityは単体・接続・構成体に分かれ、単体成立から接続・全体成立を推定しない。

## Identityと親L1

番号027〜029・046〜059は、起草時に単体・接続・構成体の番号帯を分けた結果の未使用番号であり、予約・要求の省略・延期を表さない。登録済みidentityは保持し、欠番から要求を生成しない。017は接続の責務を明確にした後も同じidentityを保持する。

| L2 identity | 粒度 | 親L1 | version_target |
|---|---|---|---|
| HELIXINTELLIGENCE-L2-001–016, 018–020 | 単体 | 同番号のL1 | 1.0 |
| HELIXINTELLIGENCE-L2-021–025 | 単体 | 同番号のL1 | 3.0 |
| HELIXINTELLIGENCE-L2-017 | 接続横断境界 | HELIXINTELLIGENCE-L1-017 | 1.0 |
| HELIXINTELLIGENCE-L2-026 | 単体（評価packet整形） | HELIXINTELLIGENCE-L1-026 | 3.0 |
| HELIXINTELLIGENCE-L2-030–045 | 個別接続 | 各接続節 | 1.0。3.0接続は個別表示 |
| HELIXINTELLIGENCE-L2-060–065 | 構成体 | 各構成体節 | 1.0/3.0/4.0を各節に記載 |

| version_target境界 | 要求範囲 | 受け先 |
|---|---|---|
| 1.0 | HELIXINTELLIGENCE-L1-001–020の判断能力は既存外部modelを利用する。model/provider/versionと利用元が持つdata-use classの観測・判断記録を保持し、同一scopeで比較する。ローカルmodelの学習/チューニング/自動差替えは含めない | HELIXINTELLIGENCE-L2-001–020、接続030–041/044–045、構成体060–063 |
| 3.0 | LABO材料を使うlocal model training/tuning、data-use class別分離、lineage、比較、限定適格化、独立効果評価 | HELIXINTELLIGENCE-L2-021–026、接続042–043、構成体065 |
| 4.0 | Concept/PO判断に基づく動的開発workflow | HELIXINTELLIGENCE-L2-064 |

1.0で外部modelを利用する既存判断能力と、3.0 local learning、4.0動的workflowを分離する。3.0/4.0は1.0の依存ではない。1.0で保持するdata-use classはsource由来の記録・利用区分であり、学習処理の開始を意味しない。model/provider/versionの追跡と同条件比較は1.0で成立させ、ローカル学習・candidate model評価の拡張は3.0へ置く。

## 単体要求

### HELIXINTELLIGENCE-L2-001 — 判断領域の編成

対象はRequirement/Meaning Support、Design、Implementation、Verification/CI、Integration/Change、Release、Operation/Incident、Worker、Model/Provider、HELIX Self等の判断領域。入力は扱う開発・運用対象、出力はINTELLIGENCE内で追加・分割・統合・退役できるdomain identity。domainを固定enumや独立authorityへせず、粒度が合わない場合は領域編成へ戻す。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-001。入力：開発・運用対象。出力：追加・分割・統合・退役可能なdomain identity。保証：固定enumや独立authorityにしない。単独成立依存：このdomain identityとHARNESS-L2-010/011共通pack contract。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011の共通pack contractへ適用する。

### HELIXINTELLIGENCE-L2-002 — Domain×Capability構成

入力はdomain identityと必要能力、出力はUnderstand/Plan/Predict/Diagnose/Review/Recommendの組合せ。全domainへ全capabilityを強制しない。必要な判断能力が未定なら未構成として扱い、推測で能力を付与しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-002。入力：domain identityと必要能力。出力：domainごとのcapability構成。保証：不要能力を強制せず、未定は未構成として保持する。単独成立依存：domain identityとHARNESS-L2-010/011共通pack contract。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011の共通pack contractへ適用する。

### HELIXINTELLIGENCE-L2-003 — Current Situation Model

入力は各source mechanismの現行情報、出力はtarget、requirement/design revision、ticket、state、dependency、evidence、unresolved finding、worker、model/provider、environment、cost/budget、risk、time、known/unknownを関係づけた判断用model。元sourceと食い違えば元情報を優先し、Situation Modelをauthorityへ昇格しない。source欠落・staleは欠落のまま表示しsourceへ再照合を返す。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-003。入力：接続を許可された各sourceの現在情報。出力：source revision付きSituation Model。保証：source正本を優先し、欠落/staleを補完しない。単独成立依存：少なくとも一つのadmitted sourceとHARNESS-L2-010/011共通pack contract。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011の共通pack contractへ適用する。

### HELIXINTELLIGENCE-L2-004 — Fact・Interpretation・Hypothesis分離

入力はsource observationと推論、出力はObserved Fact、Derived Interpretation、Hypothesis、Unknownの区別とsource/revision/evidence/inference/uncertainty。推論を観測事実へ変えず、根拠が足りない場合はunknownを保持する。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-004。入力：source observationと推論。出力：fact/interpretation/hypothesis/unknownと出所情報。保証：推論を観測事実へ変えない。単独成立依存：入力sourceの区別可能性とHARNESS-L2-010/011共通pack contract。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011の共通pack contractへ適用する。

### HELIXINTELLIGENCE-L2-005 — 作業計画候補

入力は承認済み要求、HARNESS工程contract、current state、dependency、risk、BRAIN knowledge。出力はgoal、target、prerequisite、dependency、order、parallelizable work、expected result、risk、uncertainty、stop condition、fallbackを持つplan proposal。INTELLIGENCEはticketを発行せず、未承認要求・stale contractはOSへ確定案として渡さない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-005。入力：承認済み要求、HARNESS工程contract、現状、依存、risk、BRAIN知識。出力：計画候補。保証：ticketを発行せず、OSへ候補を渡す。単独成立依存：計画入力のadmitted revisionとHARNESS-L2-010/011共通pack contract。OS接続はL2-035の別成立条件。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011の共通pack contractへ適用する。

### HELIXINTELLIGENCE-L2-006 — 将来予測

入力はcurrent stateとchange candidate。出力はrequirement/design/dependency impact、regression、CI failure、integration conflict、performance/release risk、worker failure、cost/timeのpredictionとassumption/evidence/uncertainty/falsification condition。予測は実測事実ではなく、後の実測をLABOへ渡す。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-006。単独成立依存：current Situation Modelのadmitted revisionとchange candidate。検証範囲：要求/設計/dependency impact、退行、CI・統合・performance/release risk、Worker failure、cost/time予測。保証：assumption/evidence/uncertainty/falsificationを各予測に結び、実測と区別する。失敗時戻し先：source revisionがstale/欠落なら該当sourceへ再照合。結果は後の実測とともにLABOへ渡す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-007 — 稼働中診断

入力は発生中のsymptom/error/stallとevidence、出力は候補原因、切り分け証拠、診断案、追加観測・検査。相関一つで原因を確定せず、終了済みの複数episodeを長期評価する責務はLABOへ渡す。evidenceが矛盾・不足ならdiagnosisをprobable/unknownに留める。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-007。単独成立依存：発生中episodeのsymptom/error/stallと識別可能なevidence。検証範囲：候補原因、切り分け証拠、確度付きdiagnosis、追加観測・検査。保証：相関だけで根因を確定せず、現在episode内の証拠と仮説を区別する。失敗時戻し先：証拠不足/矛盾はsourceへ観測要求を戻してprobable/unknownを維持。終了episodeの長期効果はLABOへ渡す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-008 — Review判断

入力はrequirement consistency、design、implementation、test、CI、integration、release preparation、operational change、HELIX自身のtarget revision。出力はfinding/severity/scope/evidence/reproduction/counterexample/suggested route。Review結果のみでmerge、requirement change、release、acceptanceを成立させない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-008。単独成立依存：review対象のrevision、要求/設計/実装/test/CI/integration/release/operation/HELIX artifactsと評価可能なevidence。検証範囲：finding/severity/scope/evidence/reproduction/counterexample/recommended route。保証：対象revisionと範囲に対するfinding一式。review結果でmerge/requirement change/release/acceptanceを成立させない。失敗時戻し先：target artifact/evidenceが不足する場合は該当ownerへ追加材料を戻しfindingをunknown/incompleteとする。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-009 — HELIX全体監査

入力はHELIX各機構のauthority・design・runtime・projection・責務・証拠。出力はauthority mismatch、design/runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、mechanism-boundary violation等の監査候補で、target HEAD/authority/producer/evidence/reproduction/falsificationへ辿れる。自由文だけでauthorityを変更しない。AAFDは既存candidateのまま接続し、UIL/TER/Future Synthesis等を再実装しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-009。単独成立依存：各機構のadmitted authority/design/runtime/projection/responsibility/evidence sourceとexact HEAD。検証範囲：authority/design-runtime mismatch、stale assumption、missing evidence、invalid projection、responsibility leak、unsupported behavior、repeated failure、boundary violation audit finding。保証：各findingがHEAD/authority/producer/evidence/reproduction/falsificationへ辿れる。AAFD/UIL/TER/Future Synthesis ownerは保持する。失敗時戻し先：source/evidence不明は該当ownerへ再照合。AAFD candidateの詳細処理はcandidate ownerへ返す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-010 — Worker配置候補

入力はtask type/domain/complexity/context/tool requirementとsuccess/failure/rework/latency/cost/reliabilityの実績。出力はtask×Worker capability×observed performanceに基づくplacement proposal。価格、model名、benchmark単独で決めず、割当・進行はOSが行う。未評価のWorker/modelを評価済みに扱わない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-010。単独成立依存：ticket/task identity、種類/domain/complexity/context/tool requirementとLABO HELIX-Benchのtask-class evidence、Worker実績・未評価状態。検証範囲：根拠付きticket別Worker placement proposal。保証：task属性と観測実績を使い、未評価を未評価と表示し、割当/進行はOSへ残す。失敗時戻し先：task属性不足はOSへ、Bench/evidence/適用scope不足はLABOへ返し、配置案を未確定にする。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-011 — Model/Provider適性

入力は同一corpus・同一responsibility scopeのmodel/provider結果。出力はdomain/capability別findings、false positives、misses、reproducibility、latency、costの比較。更新だけで上位とせず、同条件がそろわない比較は不確実として返す。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-011。単独成立依存：同一corpus・同一responsibility scopeでのcurrent/candidate model-provider結果と各実行版。検証範囲：domain/capability別findings/false positives/misses/reproducibility/latency/cost比較。保証：比較条件とmodel/provider/versionを表示し、更新だけで優位判定しない。model差替えを自動実行しない。失敗時戻し先：corpus/scope/revisionが揃わない場合は比較不能としてINTELLIGENCE判断へ戻し、追加の同条件結果を求める。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-012 — 不確実性の表現

入力は証拠・推論・矛盾・不足、出力はknown/probable/uncertain/unknown/contradictory等と必要なadditional evidence/Discovery/test/review/human decision。unknownをsafe/success/no-issueへ変換しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-012。単独成立依存：判断に使うevidence、推論、矛盾、情報不足。検証範囲：known/probable/uncertain/unknown/contradictoryと必要な追加evidence/Discovery/test/review/human decision。保証：不確実性を結果として保持し、unknownをsafe/success/no-issueに変換しない。失敗時戻し先：不足条件を該当source ownerまたは必要なDiscovery/test/review/human decisionへ返し、unknownを維持する。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-013 — 判断理由の追跡

重要判断proposalからinput revisions、applicable rules、BRAIN knowledge、observations、assumptions、model/provider/version、reasoning result、uncertainty、rejected alternativesへ辿れる。sourceがdata-use classを提供する場合はその区分も1.0から保持するが、それはtrainingを許可せず学習・チューニングは3.0の範囲とする。完全な再生成は要求しない。根拠が揃わない場合は理由をunknownとして保持する。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-013。単独成立依存：input revisions、applicable rules、BRAIN knowledge、observations、assumptions、model/provider/version、source data-use class。検証範囲：重要判断candidateの根拠・推論・uncertainty・rejected alternativesへのtrace。保証：完全再生成なしで判断根拠を検査可能にし、利用区分を1.0から記録する。class記録はtraining許可ではない。失敗時戻し先：根拠/metadataが欠ける判断はunknownを返し、欠けたsource ownerへ照合を戻す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-014 — 専門Botの発行

入力は反復し、対象・入力・判定条件・停止条件を限定できる判断。出力はINTELLIGENCEとは別identityのBotで、purpose/scope/input/output/allowed action/stop condition/versionを持つ。Bugbot/Helpbot/Crawlerを含み、実作業は特定目的のWorkerとしてOS割当の下で実行する。Botを追加してもauthorityを追加しない。条件が限定できない場合は通常の判断候補へ戻す。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-014。単独成立依存：反復可能なtaskと限定可能な目的/scope/input/judgment/stop condition。検証範囲：別identityのBot manifestと目的別Workerへのhandoff。保証：Botはauthorityを増やさず、実作業はOSが割当てるWorkerとして行う。失敗時戻し先：manifest/scope不足は通常のINTELLIGENCE判断候補へ戻す。assignment/evidence不足はOSへ戻す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-015 — 反復failureからBugbot候補

入力はCI/実行のfailure history。出力はfailure pattern/reproducibility/machine detectability/false positive/scope/repairabilityの評価とBugbot candidate。単発failureは恒久Botへ昇格しない。機械判定性やscopeがunknownなら候補で止める。version_target 1.0（L1条件に従い、ログ蓄積と機械判定可能性が成立した対象）。

- 親：HELIXINTELLIGENCE-L1-015。単独成立依存：複数episodeのCI/実行failure history、pattern/reproduction/detection/false-positive evidence。検証範囲：Bugbot candidateと範囲付きmachine-detectability/repairability評価。保証：一回のfailureは恒久Botにせず、ログ蓄積と機械判定可能性を確認する。失敗時戻し先：反復/再現/誤検出evidence不足なら追加ログ観測へ戻し候補を保留する。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-016 — 限定修復candidateと適用

入力は検出済み限定問題・target revision・actor・write-set・side effect・budget・deadline・retry・impact scope・recovery point。出力はDetect→Diagnose→Repair Candidate→bounded repairの対象範囲付き候補と結果。要求・設計・verification obligationを修復器が変更せず、意味変更は上流へ戻す。stale、scope逸脱、循環、二重実行、予算超過、不明副作用を成功にしない。候補や登録から包括write権限を生成しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-016。単独成立依存：検出済み限定問題、target revision、actor/write-set/side-effect/budget/deadline/retry/impact/recovery情報。検証範囲：scope-bound repair candidateおよび結果。保証：要求/設計/verification obligationを変更せず、stale/逸脱/循環/重複/予算超過/不明副作用を成功にしない。失敗時戻し先：target/scope/副作用情報不明や境界逸脱は修復候補を停止し、該当source/SECURITY/OS ownerへ戻す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-018 — LABOとの時間軸

INTELLIGENCEは現在状態と次の判断候補、LABOは過去episodeと長期効果を担当する。単体出力はcurrent judgmentとhistorical outcomeのラベル分離であり、結果の転送とLABO評価の受取I/OはL2-040/L2-034が定める。INTELLIGENCEは自己評価で長期改善を採択せず、過去評価からcurrent state/authorityを上書きしない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-018。単独成立依存：INTELLIGENCE current decision/resultとLABOの過去episode/evaluation。検証範囲：current judgmentとhistorical effectの区別、LABO feedback input。保証：長期効果の独立評価はLABO、改善提案の登録・振分けはOS、変更の採否は対象ownerの変更手続きに残す。失敗時戻し先：過去評価またはsource scope不明はLABOへ。current state conflictは現在sourceへ照合する。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-019 — BRAIN知識との境界

BRAINのPattern/Unit/Part等を判断材料として使い、現在の状況で適用する候補を出す。単体出力は適用candidateと根拠であり、BRAIN inputはHELIXINTELLIGENCE-L2-032、汎用化candidateのLABO routingはHELIXINTELLIGENCE-L2-044が定める。INTELLIGENCEの結果をBRAINのgeneric knowledgeへ直接書かず、候補と知識正本を混同しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-019。単独成立依存：BRAIN Pattern/Unit/Part/applicability/exception/counterexampleとcurrent situation。検証範囲：INTELLIGENCEの適用candidate、および汎用化候補のLABO routing。保証：BRAIN knowledge正本を書き換えず、今回の適用判断と汎用評価を分離する。失敗時戻し先：knowledge applicability/source不明はBRAINへ、汎用化evidence不足はLABOへ戻す。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-020 — Product Coreの意味とBackflow

製品固有requirement/design/meaningを理解材料として使い、矛盾・不足・改善候補に適切なBackflow先を示す。requirement、design authority、acceptance、product-specific meaningをINTELLIGENCEが変更しない。target不明はproduct ownerへの候補で保持する。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-020。単独成立依存：Product Coreの固有requirement/design/meaningとrevision/owner。検証範囲：meaning consistency finding/improvement/backflow candidate。保証：requirement/design/acceptance authorityとproduct meaningをProduct Core ownerに残す。失敗時戻し先：backflow target/revision不明はcandidateのまま保持し、該当Product Core ownerへ照会する。`version_target: 1.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-021 — Domain/Capability専用モデル学習

3.0以降、LABO評価済み事例・反例・学習材料を用いてdomainまたはcapabilityに特化したlocal LLMを学習/調整できる。Requirement理解、Design Review、Implementation/CI診断、Integration Review、Worker placement、Model Router、Audit、Bounded Repair等を含む候補。万能モデルへの統合は要求しない。学習実行はOS ticket/Workerに接続する。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-021。単独成立依存：LABOが評価済みとした事例/反例/learning material、domain/capability target、3.0 model contract。検証範囲：domain/capability専用local model candidate。保証：万能modelを必須にせず、training jobはOS ticket/Worker経由とする。失敗時戻し先：material/evaluation status/scope不明はLABOへ、job/assignment不備はOSへ戻しtraining candidateを進めない。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-022 — Training/evaluation data区分

LABOから渡されたdata classをtraining/validation/evaluation/holdout/prohibitedとして保持し混同しない。評価用隔離例をtrainingに混ぜず、training適合だけで改善判定しない。区分不明は学習・評価材料として昇格しない。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-022。単独成立依存：LABO data-use classとsource dataset revision。検証範囲：training/validation/evaluation/holdout/prohibited区分付きdataset set。保証：evaluation/holdout/prohibitedの隔離、training fitのみで改善判定しない。失敗時戻し先：class/revision不明または混在はLABOへ返し、該当dataを学習・評価に利用しない。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-023 — Model lineage

candidate modelからbase model/version、training dataset revision、tuning method/configuration、domain/capability、training environment、evaluation corpus、known limitations、rollback targetへ辿れる。lineage不明のcandidateを稼働modelへ昇格候補としない。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-023。単独成立依存：base model/version、training dataset revision、tuning method/configuration、environment、evaluation corpus。検証範囲：lineage-complete model candidateとknown limitations/rollback target。保証：candidate生成材料・設定・適用範囲・戻し先を辿れる。失敗時戻し先：lineage field不足は該当model/dataset/config ownerへ戻しcandidateをqualified扱いしない。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-024 — Candidate model比較

candidateとcurrent modelを同一responsibility scope・比較可能corpusでsuccess/findings/false positive/miss/reproducibility/latency/cost/resource consumption/failure patternにより比較する。新しい・大きい・学習済みだけを改善根拠としない。比較条件不一致は判定不能へ戻す。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-024。単独成立依存：current/candidate modelの同一responsibility scope・比較可能corpus結果。検証範囲：比較指標と条件を伴うcandidate/current model comparison。保証：success/findings/FP/miss/reproducibility/latency/cost/resource/failureを同条件で比較する。失敗時戻し先：条件・evidence不一致は比較不能としてLABO/INTELLIGENCEのsource記録へ戻す。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-025 — Model適用範囲

modelごとにDomain×Capabilityの適格範囲を付ける。一領域の性能向上からINTELLIGENCE全体を置換せず、未評価範囲へ外挿しない。適格範囲が不明なら当該範囲で未評価とする。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-025。単独成立依存：domain/capability別評価evidenceおよびmodel lineage。検証範囲：限定されたeligibility map。保証：適格範囲外を未評価と表示し、単領域結果を全体へ外挿しない。失敗時戻し先：適格scope evidence不足はLABOへ戻し、未評価表示を維持する。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-026 — LABO評価用実績packet

candidate/採用modelの実利用結果をquality/false positive/miss/rework/time/cost/human intervention/ops load/regressionを含むeffect-evaluation packetに整形する。単体出力はpacketであり、送達契約はL2-043が定める。INTELLIGENCE内評価だけで恒久改善を確定しない。version_target 3.0。

- 親：HELIXINTELLIGENCE-L1-026。単独成立依存：candidate/adopted modelの実利用結果、prior-method comparator、quality/FP/miss/rework/time/cost/intervention/ops/regression data。検証範囲：LABOへの独立効果評価packet。保証：独立評価はLABO、改善提案の登録・振分けはOS、変更の採否は対象ownerの変更手続きに残し、INTELLIGENCE内scoreだけで恒久改善にしない。失敗時戻し先：比較material/episode不足はLABOへ評価不足として戻し、恒久改善を確定しない。`version_target: 3.0`。実契約版・成果物版・依存版・互換範囲・交換/更新条件はHARNESS-L2-010/011共通pack contractを適用する。

## 個別接続要求

個々の接続は専用connector・source revision・契約を持つ。HELIXINTELLIGENCE-L2-017は限定修復の4接続を同じtarget revision/scopeに束ねる境界条件で、HELIXINTELLIGENCE-L2-036～039の個別I/Oを置き換えない。

### HELIXINTELLIGENCE-L2-017 — 限定修復の接続横断境界

本identityは限定修復におけるSECURITY・Worker・HARNESS・OS間の境界受渡し全体を確認する接続横断契約であり、各connectorの個別I/OはHELIXINTELLIGENCE-L2-036～039で定める。INTELLIGENCEは包括write権限を得ず、いずれのowner責務も代替しない。version_target 1.0。

- 親：HELIXINTELLIGENCE-L1-017。依存：HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039各接続のadmitted contractと同一target revision/scope。入力：permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。出力：境界別の未完/完了状態を保持した統合修復結果。保証：いずれのowner責務・authorityも修復candidateで代替されない。失敗時戻し先：結果欠落は当該SECURITY/Worker/HARNESS/OS ownerへ戻し修復を未完了にする。`version_target: 1.0`。

### HELIXINTELLIGENCE-L2-030 — HELIX-HARNESS → Situation Model

- 親：HELIXINTELLIGENCE-L1-003。
- 入力：HARNESSの許可されたrequirement/design revision、工程contract、verification obligation。
- 出力：Situation Modelにsource revision付き情報。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：HARNESS正本とadmitted source revision。
- 失敗時戻し先：source revision不明またはstaleならHARNESS sourceへ照合を戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-031 — HELIX-OS → Situation Model

- 親：HELIXINTELLIGENCE-L1-003。
- 入力：OSの許可されたticket/current state/dependency/evidence。
- 出力：Situation ModelにOS revision付き情報。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：OSがstate/authorityを所有する。
- 失敗時戻し先：stale/unknownはOS sourceへ戻して再照合。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-032 — BRAIN → INTELLIGENCE

- 親：HELIXINTELLIGENCE-L1-019。
- 入力：BRAIN Pattern/Unit/Part/applicability/exception/counterexample。
- 出力：INTELLIGENCEの判断材料。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：BRAIN knowledge正本を保持する。
- 失敗時戻し先：適用性やrevision不明ならBRAINへ戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-033 — Product Core / HARNESS → INTELLIGENCE

- 親：HELIXINTELLIGENCE-L1-020。
- 入力：Product Coreのrequirement/design/meaningとHARNESS工程contract/verification obligation。
- 出力：INTELLIGENCEの理解材料とsource別revision。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：各sourceのowner・意味を保持し独断統合しない。
- 失敗時戻し先：矛盾・revision不明は該当source ownerへ戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-034 — LABO → INTELLIGENCE（1.0評価材料）

- 親：HELIXINTELLIGENCE-L1-018, HELIXINTELLIGENCE-L1-010, HELIXINTELLIGENCE-L1-011。
- 入力：LABOの過去evaluation、success/failure/counterexample、Worker/model実績、Bench水準、未評価印。
- 出力：scope付き判断材料。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：過去評価のownerはLABO、配置案のownerはINTELLIGENCE。
- 失敗時戻し先：未評価/適用scope不明はLABOへ戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-035 — INTELLIGENCE → OS（計画・判断候補）

- 親：HELIXINTELLIGENCE-L1-005, HELIXINTELLIGENCE-L1-006, HELIXINTELLIGENCE-L1-007, HELIXINTELLIGENCE-L1-008, HELIXINTELLIGENCE-L1-010, HELIXINTELLIGENCE-L1-016。
- 入力：plan/placement/diagnosis/review/repair candidateと根拠・停止条件・依存。
- 出力：OSが受け取れる候補。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：ticket登録・割当・実行・進行はOS。
- 失敗時戻し先：候補が不完全/staleならINTELLIGENCEへ戻し、ticket化しない。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-036 — INTELLIGENCE ↔ SECURITY

- 親：HELIXINTELLIGENCE-L1-017。
- 入力：操作candidateと対象scope/revision。
- 出力：SECURITY permission/constraint/revocation照合結果を修復candidateへ返す。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：permission・isolation authorityはSECURITY。
- 失敗時戻し先：許可結果が欠落/失効/不明ならSECURITYへ戻し実行しない。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-037 — OS → Worker（INTELLIGENCE candidate実行）

- 親：HELIXINTELLIGENCE-L1-005, HELIXINTELLIGENCE-L1-010, HELIXINTELLIGENCE-L1-016, HELIXINTELLIGENCE-L1-017。
- 入力：OSが発行し割当したticket。
- 出力：Workerのactor/scope付き実行結果をOS/INTELLIGENCEへ返す。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：OSが発行/割当、Workerが実行する。
- 失敗時戻し先：ticket/scope/assignment不明ならOSへ戻し実行しない。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-038 — HARNESS → 限定修復の検証義務

- 親：HELIXINTELLIGENCE-L1-016, HELIXINTELLIGENCE-L1-017。
- 入力：HARNESS contractのrequirement revision/oracle/expected failure/independent verification/consumer acceptance/backflow condition。
- 出力：修復scopeに束縛した検証義務。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：修復器は義務を追加/削除しない。
- 失敗時戻し先：義務未達はHARNESSへ戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-039 — OS → 限定修復の検収

- 親：HELIXINTELLIGENCE-L1-016, HELIXINTELLIGENCE-L1-017。
- 入力：scope付きrepair candidate、実行証拠、HARNESS検証結果。
- 出力：OS acceptanceへの検収入力。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：検収と進行はOS。
- 失敗時戻し先：evidence/検証欠落は各ownerへ戻しacceptanceしない。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-040 — INTELLIGENCE → LABO（1.0実績）

- 親：HELIXINTELLIGENCE-L1-006, HELIXINTELLIGENCE-L1-007, HELIXINTELLIGENCE-L1-008, HELIXINTELLIGENCE-L1-010, HELIXINTELLIGENCE-L1-016, HELIXINTELLIGENCE-L1-018。
- 入力：prediction/diagnosis/review/placement/repair resultとsource revision。
- 出力：LABOの過去評価材料。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：長期効果のownerはLABO。
- 失敗時戻し先：source revision/実測結果不足はINTELLIGENCE/LABOへ戻す。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-041 — 各source mechanism → Situation Model

- 親：HELIXINTELLIGENCE-L1-003, HELIXINTELLIGENCE-L1-004, HELIXINTELLIGENCE-L1-012, HELIXINTELLIGENCE-L1-013。
- 入力：各admitted source機構の許可されたcurrent state/evidenceとrevision。
- 出力：source別Situation Model入力。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：sourceごとに個別connector/authorityを維持する。
- 失敗時戻し先：source scope/revision欠落はそのsourceへ戻す。Web/WEB-OSはadmitted contractがない限り依存しない。`version_target: sourceごとに定義`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-042 — LABO → INTELLIGENCE（3.0学習材料）

- 親：HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025。
- 入力：LABO evaluated episode/training material/counterexample/evaluation setとdata-use class。
- 出力：3.0 learning materialとlineage付きsource revision。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：evaluation/holdout/prohibitedをtrainingへ混ぜない。
- 失敗時戻し先：class/lineage不明ならLABOへ戻し学習/評価に使わない。`version_target: 3.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-043 — INTELLIGENCE → LABO（3.0 model result）

- 親：HELIXINTELLIGENCE-L1-026。
- 入力：3.0 model candidate/current modelのprediction/decision/failure/quality/cost/intervention/ops result。
- 出力：LABO独立効果評価材料。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：長期改善のownerはLABO。
- 失敗時戻し先：比較scope/実測不足はLABOへ戻す。`version_target: 3.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-044 — INTELLIGENCE → BRAINへの非直接更新境界

- 親：HELIXINTELLIGENCE-L1-019。
- 入力：INTELLIGENCE decision/candidateと汎用化候補。
- 出力：candidateをLABO評価経路へ渡す。BRAINへの直接出力なし。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：BRAIN knowledge正本を保持する。
- 失敗時戻し先：汎用性/evidence不足ならLABOへ戻しknowledgeを更新しない。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

### HELIXINTELLIGENCE-L2-045 — INTELLIGENCE → Product Core Backflow

- 親：HELIXINTELLIGENCE-L1-020。
- 入力：Product Coreに関するmeaning矛盾/不足/improvement candidateとsource revision。
- 出力：該当Product Coreへのbackflow candidate。
- 依存：各記載source/consumer ownerと専用HELIX-CONNECT connectorのadmitted contract。
- 保証：正本変更はProduct Core owner。
- 失敗時戻し先：target不明ならrouting候補のまま該当ownerへ照会。`version_target: 1.0`。契約/成果物/依存版・compatibility・交換更新rollbackはHARNESS-L2-010/011共通pack contractを適用する。

## 構成体要求

### HELIXINTELLIGENCE-L2-060 — 自動開発計画

BRAIN、HARNESS-CORE、INTELLIGENCE、OSが構成する。INTELLIGENCEは承認済み要求・工程contract・現状・知識から計画候補を作り、OSがticket/推進を行う。これはHELIXINTELLIGENCE-L1-005の1.0計画候補を機構間で接続した構成体であり、Concept 4.0の動的workflow（064）とは区別する。4.0 workflowを前提にしない。

- 親：HELIXINTELLIGENCE-L1-005。入力：承認済み要求、HARNESS工程contract、現状、BRAIN知識。出力：根拠・依存・停止条件付きplan candidateをOSへ渡す。依存：BRAIN、HARNESS-CORE、INTELLIGENCEの該当入力とOS ticket受領。保証：ticket発行・推進はOSに残り、動的workflow 4.0を要求しない。失敗時戻し先：入力不足・staleは該当source、ticket化不能はOS。未完義務：OSの進行と各sourceの正本更新を完了扱いしない。`version_target: 1.0`。

### HELIXINTELLIGENCE-L2-061 — Worker配置

LABOが作業種別別水準を提示し、INTELLIGENCEがtask別配置案を作り、OSが指定・割当てする。価格/名称/benchmark単独の決定やLABOの割当てをしない。1.0。

- 親：HELIXINTELLIGENCE-L1-010。入力：task identity、LABOの作業種別別水準、Worker実績。出力：INTELLIGENCEのtask別placement proposalからOS assignmentへの引継ぎ。依存：LABOの適用可能な評価材料、INTELLIGENCE判断、OS割当。保証：実割当はOS ownerに残る。失敗時戻し先：未評価・不一致はLABO、scope不明はINTELLIGENCE、割当不可はOS。未完義務：配置案を実割当・実績評価とみなさない。`version_target: 1.0`。

### HELIXINTELLIGENCE-L2-062 — 限定自動修復

INTELLIGENCEの検出・診断・repair candidate、SECURITYの許可/隔離、Workerの限定実行、HARNESSの検証義務、OSの検収を同一target revision・scopeへ接続する。どの主体の成立も他の成立を代替しない。1.0。

- 親：HELIXINTELLIGENCE-L1-016, HELIXINTELLIGENCE-L1-017。入力：限定repair candidate、SECURITY permission/isolation、Worker実行結果、HARNESS検証義務。出力：scope・evidence・検証結果付きOS acceptance入力。依存：SECURITY、Worker、HARNESS、OS各ownerの個別成立。保証：各段階の成立は他段階を代替しない。失敗時戻し先：permissionはSECURITY、実行はWorker、検証はHARNESS、検収はOS。未完義務：途中失敗をrepair完了としない。`version_target: 1.0`。

### HELIXINTELLIGENCE-L2-063 — 継続的自己改善

LABOが過去を評価し、BRAINが汎用知識、INTELLIGENCEが現在判断、OSが実行、HARNESSが工程contractを担う循環。Intelligence単独で改善効果や知識正本を決めない。1.0。

- 親：HELIXINTELLIGENCE-L1-018, HELIXINTELLIGENCE-L1-019。入力：INTELLIGENCEの判断結果、LABOの過去評価、BRAINの汎用知識。出力：評価付き判断材料と汎用化候補のowner別引継ぎ。依存：LABO評価、BRAIN knowledge、OS実行、HARNESS工程contract。保証：長期効果はLABO、汎用知識正本はBRAINが所有する。失敗時戻し先：評価不足はLABO、知識source不明はBRAIN、実行未完了はOS。未完義務：INTELLIGENCE単独で改善採択・knowledge更新をしない。`version_target: 1.0`。

### HELIXINTELLIGENCE-L2-064 — 動的開発workflow

BRAIN、HARNESS-CORE、INTELLIGENCE、OSが構成するConcept 4.0の将来能力。INTELLIGENCEが計画候補を出しOSが進行する。4.0であり1.0の依存にしない。

- 親：HELIXINTELLIGENCE-L1-005とPO判断記録のConcept 4.0構成。入力：BRAIN知識、HARNESS-CORE工程contract、INTELLIGENCE plan candidate。出力：OSが進行する動的workflow。依存：4.0として別途成立するBRAIN/HARNESS-CORE/INTELLIGENCE/OS接続。保証：plan提案とOS progressionを分離する。失敗時戻し先：各source ownerまたはOS。未完義務：4.0を1.0要求の成立条件にしない。`version_target: 4.0`。

### HELIXINTELLIGENCE-L2-065 — Local Intelligence Learning cycle

LABO評価材料→INTELLIGENCE学習/調整→lineage付きcandidate→同責務scope/corpus比較→限定適格化→OS ticket/Worker execution→LABO独立効果評価。Training/validation/evaluation/holdout/prohibitedを分ける。3.0であり1.0の依存にしない。

- 親：HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025, HELIXINTELLIGENCE-L1-026。入力：LABO評価材料とdata-use class、既存model/lineage。出力：比較・適格範囲・戻し先付きmodel candidateとLABO効果評価材料。依存：3.0 L2-021–026および個別接続042–043。保証：学習/比較/限定適格化/独立評価を別段階に保つ。失敗時戻し先：data class/評価不備はLABO、lineage/model比較はINTELLIGENCE、実行はOS/Worker。未完義務：candidateの自動交換・1.0依存化をしない。`version_target: 3.0`。

## L1からL2/L11への完全対応

L1本文の各条件は、同番号L2 identityで受け、同番号L11 identityで成功条件・反例・不成立時の戻し先を確認する。L1の要求粒度とL2の要求粒度が異なるものは表でその対応を示す。関連接続/構成体identityは機構間の成立条件を追加で受け、単体の成立に含めない。

| 親L1 identity | L1粒度 | L2 identity | L2粒度 | 関連する接続/構成体 | version_target |
|---|---|---|---|---|---|
| HELIXINTELLIGENCE-L1-001 | 単体 | HELIXINTELLIGENCE-L2-001 | 単体 | なし（単体） | 1.0 |
| HELIXINTELLIGENCE-L1-002 | 単体 | HELIXINTELLIGENCE-L2-002 | 単体 | なし（単体） | 1.0 |
| HELIXINTELLIGENCE-L1-003 | 単体（source情報は接続） | HELIXINTELLIGENCE-L2-003 | 単体 | HELIXINTELLIGENCE-L2-030, HELIXINTELLIGENCE-L2-031, HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-004 | 単体 | HELIXINTELLIGENCE-L2-004 | 単体 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-005 | 単体（OS接続） | HELIXINTELLIGENCE-L2-005 | 単体 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-060 | 1.0 |
| HELIXINTELLIGENCE-L1-006 | 単体（LABO比較接続） | HELIXINTELLIGENCE-L2-006 | 単体 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-007 | 単体 | HELIXINTELLIGENCE-L2-007 | 単体 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-008 | 単体 | HELIXINTELLIGENCE-L2-008 | 単体 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-009 | 単体 | HELIXINTELLIGENCE-L2-009 | 単体 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-010 | 単体（OS接続） | HELIXINTELLIGENCE-L2-010 | 単体 | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-061 | 1.0 |
| HELIXINTELLIGENCE-L1-011 | 単体 | HELIXINTELLIGENCE-L2-011 | 単体 | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-012 | 単体 | HELIXINTELLIGENCE-L2-012 | 単体 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-013 | 単体 | HELIXINTELLIGENCE-L2-013 | 単体 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-014 | 単体 | HELIXINTELLIGENCE-L2-014 | 単体 | HELIXINTELLIGENCE-L2-037 | 1.0 |
| HELIXINTELLIGENCE-L1-015 | 単体 | HELIXINTELLIGENCE-L2-015 | 単体 | HELIXINTELLIGENCE-L2-037 | 1.0 |
| HELIXINTELLIGENCE-L1-016 | 単体 | HELIXINTELLIGENCE-L2-016 | 単体 | HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062 | 1.0 |
| HELIXINTELLIGENCE-L1-017 | 接続 | HELIXINTELLIGENCE-L2-017 | 接続横断境界 | HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062 | 1.0 |
| HELIXINTELLIGENCE-L1-018 | 接続（current/history境界） | HELIXINTELLIGENCE-L2-018 | 単体（内部状態区分） | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-040, HELIXINTELLIGENCE-L2-063 | 1.0 |
| HELIXINTELLIGENCE-L1-019 | 接続（BRAIN/LABO境界） | HELIXINTELLIGENCE-L2-019 | 単体（適用candidate） | HELIXINTELLIGENCE-L2-032, HELIXINTELLIGENCE-L2-044, HELIXINTELLIGENCE-L2-063 | 1.0 |
| HELIXINTELLIGENCE-L1-020 | 単体 | HELIXINTELLIGENCE-L2-020 | 単体 | HELIXINTELLIGENCE-L2-033, HELIXINTELLIGENCE-L2-045 | 1.0 |
| HELIXINTELLIGENCE-L1-021 | 単体（LABO材料接続） | HELIXINTELLIGENCE-L2-021 | 単体 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-022 | 単体 | HELIXINTELLIGENCE-L2-022 | 単体 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-023 | 単体 | HELIXINTELLIGENCE-L2-023 | 単体 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-024 | 単体 | HELIXINTELLIGENCE-L2-024 | 単体 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-025 | 単体 | HELIXINTELLIGENCE-L2-025 | 単体 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-026 | 接続（LABO評価） | HELIXINTELLIGENCE-L2-026 | 単体（packet整形） | HELIXINTELLIGENCE-L2-043, HELIXINTELLIGENCE-L2-065 | 3.0 |

HELIXINTELLIGENCE-L1-017はHELIXINTELLIGENCE-L2-017の接続横断境界要求としてHELIXINTELLIGENCE-L2-036～039を同一target revision/scopeへ結び、個別connectorのI/Oを重複定義しない。HELIXINTELLIGENCE-L1-018は現在/過去を分けるINTELLIGENCE内部状態区分をHELIXINTELLIGENCE-L2-018で定め、LABOへの結果送達/評価受取はHELIXINTELLIGENCE-L2-040/HELIXINTELLIGENCE-L2-034で定める。HELIXINTELLIGENCE-L1-019はBRAIN知識を用いる適用candidateをHELIXINTELLIGENCE-L2-019で定め、知識入力はHELIXINTELLIGENCE-L2-032、汎用化candidateのLABO routingはHELIXINTELLIGENCE-L2-044に分ける。HELIXINTELLIGENCE-L1-026は独立評価用packetの内部整形をHELIXINTELLIGENCE-L2-026、LABOへの送達をHELIXINTELLIGENCE-L2-043に分ける。

HELIXINTELLIGENCE-L1-001–020は1.0要求、HELIXINTELLIGENCE-L1-021–026は3.0 local-learning要求である。1.0は既存外部modelでの判断、model/provider/versionとsource由来data-use classの記録・同条件比較を保持する。data-use classの記録は学習の許可ではない。3.0ではLABO材料によるlocal model learning、data class分離、lineage、比較、適格化、独立評価を追加する。4.0の動的workflowはHELIXINTELLIGENCE-L2-064に隔離する。後続版だけの成立を1.0の依存/受入条件にしない。

## 既存候補と旧sourceの対応

候補・旧要求の掲載は新L2への採択、旧承認の継承、実装許可を意味しない。既存candidateはその原文と状態のまま維持する。

| Source / asset | 本書で保持する条件 | 整理・変更の境界 |
|---|---|---|
| HELIX-INTELLIGENCE候補 `audit-bounded-repair-requirements.md`（AAFD-BR-01..04、BBR） | AAFD proposalのHEAD/authority/producer/evidence/reproduction/falsification、内部UIL/外部TER区別、影響を受けるprojectionのみ再評価、同一corpusでmodel再比較。BBRのtarget revision/actor/write-set/side effect/budget/deadline/retry/impact/recovery、候補・許可・適用・検収分離、stale/競合/二重実行/循環/不明副作用停止、禁止修復、repair後のHARNESS検証 | candidateは未採択のまま参照。全AAFD-R/BBR-Rのcandidate-only条件を本L2へ自動昇格せず、HELIXINTELLIGENCE-L1-009/016/017に親付けした条件のみを下のIDへ整理 |
| LEGACY-ASSET-8247A056F30FF91E4B8D `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md:20-37` SHA `d78bbcc0ca184bfb87dc2bbc932291f97a58bf9f0fd703481489f15944be9b76` | AAFD-BR-01 exact HEAD/authority/producer/evidence/reproduction/falsifiability、02 internal/external owner、03 affected projection invalidation、04 same corpus/responsibility model comparison | 既存 UIL/TER/Future Synthesis ownerを維持し、agentic audit freedomから新route/DB/authorityを作らない |
| LEGACY-ASSET-EB3700B0088F311C2295 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:23-110` SHA `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a` | AAFD-R-01..15: proposal identity/authority/duplicate/expiry, deterministic detector priority, qualified UIL/TER source receipts, deterministic delta/dedupe, unknown preservation, exact snapshot join, bounded projection invalidation, stale execution prevention, replay, model revision revalidation/receipt/nonpromotion | AAFDはold draft candidate L3である。HELIXINTELLIGENCE-L1-009の範囲を超えるfuture-state compiler/Future Synthesis/UIL runtimeは別ownerのcandidateとして維持し、ここで移管・再実装しない |
| LEGACY-ASSET-35F5F438E0F8755B1CCE `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md:18-34` SHA `20f549aa879d84e92196976ab2106bacedb393767d7a9946483c4d308576024e` | GH-FR-011の既存許可範囲と追加権限差分を分ける。既存mechanism内の自動修復を一律停止せず、新scope/write権限を登録のみで拡張しない | 新しいrepair authorityや広範な自動writeを推測で追加しない |
| LEGACY-ASSET-D881AF6AFD277B1DE934 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:17-64` SHA `81dc848cde93395e5cf5e49d5545856f482403d41c7eae75cae993a9c4229dbb` | BBR-R01..05: scope/revision/write-set/budget/stop/recovery, candidate vs permission/apply/inspection, duplicate/cycle/stale/ownership protection, prohibited repairs and HARNESS after-repair obligations | 候補L3の詳細を新設の普遍的承認手続きへ広げず、既存Security/Worker/HARNESS/OS境界へ接続 |
| LEGACY-ASSET-CF1129DCA8779904F6B3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md:103-105` SHA `b387f8a4ffd324d2abd210439bc791611d4e6c8aa2498fe5facccc48fc7f552f` | GH-FR-011のCI失敗を同一episodeで記録・分類・修正・局所検証・再pushし、根拠なしrerun/test削除/閾値緩和/required leg除外で緑化しない、反復上限はRecoveryへ | 旧GH operationを起動・一律適用せず、既存契約内の挙動と新scope差分を分離 |
| LEGACY-ASSET-11E8FE0479751F02A4A3 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:各要求` SHA `a428f2de8652b9508456aed358152865a1f96f6978e5d204b1e2dfd3a1d2e1ba` | create/design/review/integrationの能力とreview独立性、WIP/backpressureの区別 | provider名・固定人数を現行配置規則として継承しない。OSがcapacity/割当を決める |
| LEGACY-ASSET-F172CBC75CAA4FCFC2EB `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requirements.md:各要求` SHA `d2df9851fcd3db79ffaed03116f85118da43fe26f943412045215a58cfa3804e` | capacity fields・作成/レビュー/統合能力を分ける旧根拠 | provider別pool数・8-slot・burst数等の固定値は継承せず、実績の判断材料とOS割当境界に限定 |
| LEGACY-ASSET-50CA1C554747F12266D3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666` SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | RLO-FR-040: task class別Bench evidence、未評価表示、score単独でscope/branch/assignment/merge authorityを変更しない | Worker配置案はINTELLIGENCE、assignmentはOSへ分離。旧provider defaultは新規固定規則としてコピーしない |
| LEGACY-ASSET-3A15E5645D2D2A59DFF5 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349-351` SHA `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | HXB-FR-015: observed/scored/qualified/expiredと改善候補はBenchが返し、registry/admission ownerがtask/risk/profile/freshness/independence等を判断。Benchはmodel切替・権限拡大をしない | evidenceを提案・配置材料にし、最終配置/割当はINTELLIGENCE/OSの分担を保持 |
| LEGACY-ASSET-F2C2755C8809C2C0DEAD `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:各RCLS-BR-001..006` SHA `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c` | responsibility owner、CASE/SCENE/PATTERN/LOG/VERIFY、最小packet、段階昇格、stale/revocation、authority non-write | RCLSはLABO candidateであり、INTELLIGENCEのlearning pipelineへ重複実装しない。HELIXINTELLIGENCE-L1-021..026はLABO材料を使う範囲に限る |

### 候補・人判断として残る点

1. INTELLIGENCE L1の対象revisionはPO確認待ち。本PRから確認済み・採択済みにしない。
2. AAFD/Bugbot candidateの採否・target-specific detailed contractはそれぞれ元candidateに残す。本L2は候補を圧縮して採択せず、HELIXINTELLIGENCE-L1-009/015-017で既に示された境界を対で受ける。
3. Domain一覧はL1にある例示を固定enumにしない。model/tool/budget/acceptanceの閾値を捏造しない。
4. Web/WEB-OS source connectionは採択済みsource contractがある場合のみ。Webの未採択候補や後続versionをINTELLIGENCE 1.0の必須依存としない。

旧source SHAは[資産台帳](../../governance/legacy-asset-disposition.jsonl)とarchive bytesで照合した。旧runtime・CLI・test・hookは実行していない。

### HELIXINTELLIGENCE-L2-066 — 配置案の人代行入力・受領契約（接続候補、1.0）

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **親L1**：自機構primary parentはHELIXINTELLIGENCE-L1-010。接続contextはHELIXOS-L1-003、HELIXOS-L1-009。各L1は候補状態であり、本節は確認・採択を生成しない。
- **関係**：HELIXINTELLIGENCE-L2-010に定めた配置候補のinput/output契約を参照し、そのINTELLIGENCE実装を呼べない初回経路でも人が同じ候補schemaを供給できる接続条件を定める。L2-010の契約本文は適用するが、INTELLIGENCE runtimeの存在・実行結果を依存にしない。新しい配置機構を作らず、OSのassignment判断・LABOの水準評価を引き受けない。
- **入力**：OS ticket/task identity、task type/domain/complexity/context/tool requirement、選択可能Workerのcapability/version、利用するLABO evidenceまたは未評価状態とそのrevision/scope、適用するL2-010および共通pack契約version。
- **提供**：人が記入した配置候補をL2-010の同じproposal schemaでINTELLIGENCE/OS境界へ渡し、機械生成候補との状態差を明示する受領材料。
- **保証**：代行案はproposal状態で、推奨Workerと根拠、未評価/unknown、除外理由、入力source・revision、task/scope、契約version、作成actor/時点、OS受領actor/時点を含むreceiptに束縛する。入力・版・scopeのいずれかが不一致または欠落ならOSはassignment材料として受領しない。人代行案は評価実績やINTELLIGENCE出力を捏造せず、配置決定・実行許可・権限を与えない。
- **単独成立の依存**：HELIXINTELLIGENCE-L2-010のproposal contract/schema（実装実行依存ではない）、LABO-L2-054／055の選択scopeまたは明示的な未評価状態、OS ticketと受領記録、HARNESS-L2-010／011の該当契約version。
- **失敗時の戻し先／未完義務**：task属性/OS ticket不足はOS、Bench evidence/version/scope不足はLABO、proposal schema/contract不明はINTELLIGENCEへ戻し、未完・未評価状態を保持する。
- **束ねる既存条件**：INTELLIGENCE-L2-010の根拠付きtask別配置候補、L2-061のLABO evidence→配置案→OS assignment三段、L2-013の理由追跡。人代行時も同じ境界を保ち、INTELLIGENCEの出力を偽装しない。

### HELIXINTELLIGENCE-L2-067 — 既存Worker配置proposalの入力契約補強（単体候補、1.0）

status: draft_candidate; authority_status: not_adopted; kind: unit; version_target: 1.0. このidentityは新しい配置engine、ranker、worker routerを作らない。既存 `HELIXINTELLIGENCE-L2-010` のticket別配置proposalが、作業scopeに適用可能な既決の品質gate・優先関係と、比較結果を正しい範囲で利用できるよう入力契約を補強する候補である。

- **親・owner**：primary parent `HELIXINTELLIGENCE-L1-010`。比較evidenceのcontext `HELIXINTELLIGENCE-L1-011`。L2-010が配置proposal、L2-011がmodel/provider比較、LABOが過去結果の独立評価、OSがticket/assignment/進行を所有する。
- **既存候補との関係**：L2-010を置換せず、その入力契約と提案理由を補う。L2-011の比較ロジックを複製せず、L2-034で受けたLABO結果の範囲付き参照を使う。新しいdecision engine、score、恒久ranking、model/effort auto-switchは導入しない。
- **入力**：既存L2-010のticket/task identity、domain/type/complexity/context/tool requirementsと、次のscope-bound材料を受け取る。
  1. Human/PO ownerが既に決めたdecision recordのidentity/revision/state/evidence/owner/effective period、対象task/work scope、quality gate/oracle revision、費用・完了時間・human interventionのpriority orderまたはpartial order、許容悪化とhard prohibition。L2-067は優先値を発明・補完しない。有効decisionはその適用scope/revision内で再利用し、runごとの再確認を求めない。未決、失効、矛盾、適用境界を越える変更時だけ該当ownerへ戻す。
  2. 既存INT `HELIXINTELLIGENCE-L2-034` 経由のLABO scope-bound evaluation/comparison evidence。評価結果にはsource/target revision、task/scope、quality oracle、attempts、effort/Worker/model version、failure/retry/rescue/rework、人修正・review、結果receipt、cohortと比較条件、cost/price provenance、duration/介入実測、欠測/未評価状態を対応づける。L2-034の現在契約は「LABOの過去evaluation、success/failure/counterexample、Worker/model実績、Bench水準、未評価印」をscope付き判断材料として受け取るため、一般評価結果の既存受渡し先として利用できる。本追補ではLABO-L2-059が出す各比較フィールドを、既存LABO-L2-035からINTELLIGENCE-L2-034で受ける評価packetの入力条件として明示する。送受両側の契約版・scope・互換範囲と同一結果receiptを照合できる場合だけ利用し、不一致・欠落は未受領/未評価のまま送信元へ戻す。priority decisionは当該判断ownerの入力であり、LABOが決定した値へ読み替えない。具体wire schemaはこの要求候補で固定せず、接続の既存責務とidentityを保つ。
  3. Bench作業種別/model classの水準が必要な場合は既存 `HELIXLABO-L2-055` の水準を使い、Bench専用受渡しは既存 `HELIXLABO-L2-054` に限る。L2-054はLABO-L2-059の一般効果評価packetを運ぶ汎用connectorではない。L2-059の比較・救援・費用評価のINT受渡しは既存LABO-L2-035/052とINTELLIGENCE-L2-034の評価材料経路を使う。
- **提供するもの**：既存L2-010 proposalの中で、同じtask/scopeの候補Worker/model classおよびeffort条件、採用候補と除外理由、使用したquality gate/decision record/LABO receipt、cost/time/intervention evidence、未評価・比較不能・適用外を示す。これは配置・effortに関する判断候補であり、OS assignment、実行許可、実run、evaluation acceptanceではない。
- **比較条件**：`baseline/current/candidate/hybrid` は既存LABO-L2-006のexperiment-condition軸として保持し、`HELIXなし/historical旧HELIX/新版HELIX` は比較cohort軸として別々に識別する。L2-010のproposalには根拠に使ったcohort、条件、task/oracle/protocol/revisionを結びつけ、異なるcohort/条件の成績を混ぜない。`no-Harness` は他のHELIX支援構成を持ちうるため、HELIXなしと同一視しない。
- **品質先行・限界**：quality gate/hard constraintはcost/time/intervention preferenceより先に判定し、未達品質を安さ・速さで相殺しない。有効priorityがない比較指標は未選好の測定値として示し、勝者を決めない。missing price、人時間の未貨幣化、欠落/不適用cohort、unknown effortはunknownのまま示し、未評価をqualifiedへ変えない。人時間をapproved換算率なしに0円とせず、総費用完全性を主張しない。
- **依存と版**：`HELIXINTELLIGENCE-L2-010` proposal contract、必要なmodel/provider比較結果を持つ `HELIXINTELLIGENCE-L2-011`、既存 `HELIXINTELLIGENCE-L2-034` LABO評価材料受入、送信側のLABO-L2-035/052 evaluation contract、必要時のみLABO-L2-054 Bench handoff、HARNESS-L2-010/011共通pack contract。decision・quality oracle・evaluation・source/target・artifact・task・run/cohort/experiment conditionの各revision/versionをreceiptに残す。
- **失敗時の戻し先**：task/scope/assignment/result receipt欠落はOS/source ownerへ、oracle/quality gate不明はHARNESS/requirement ownerへ、LABO実績・比較scope・価格根拠・receipt不足はLABOへ、priority/tolerance未決・失効・適用境界外・矛盾はdecisionを持つownerへ戻す。proposalを確定扱いにしない。
- **保証しないこと**：任意domainへの普遍適性、最適Worker、model/providerの永続優位、cost/time/human interventionの一律順位、適用範囲外への一般化、配置・assignment・run起動・model差替え・authority変更。

**L2-011への対応**

L2-011は既存の同一corpus/responsibility scope比較を所有したままにする。G13のL11判定では、既に比較可能なreceipt/evidenceがある場合にfailure/rescue/retry/rework、総費用内訳、完了時間、人介入量を分解して照合する。本候補を適用する比較入力は、同じcorpus・responsibility scope・実行版についてfailure/rescue/retry/rework、費用内訳、完了時間、人介入量を結果receiptに結び付ける。未測定項目はunknownとして別掲し、記録がない値を0としない。新engineやL2-067へ比較責務を移さず、優先値の決定・変更はdecision ownerに残す。LABO-L2-059は受け取った有効値を比較結果の評価へ適用して報告し、L2-067/L2-010は同じ値を配置proposalの比較へ再利用する。

**対の受入への接続**：既存034/035の契約版・scope・互換条件が一致するLABO059 packetを与えたとき、LABO-L2-052が同一revision・scopeで追跡する結果/受領receiptと、入力された有効decisionに沿うproposalを返す。scope違い、欠落receipt、互換外のpacketは選択根拠に使わずLABO/sourceへ戻す。成功した単体比較を送達成功・割当許可へ読み替えない。

**原文・旧資産と差分**：[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第5項を、HELIXINTELLIGENCE-L1-010の配置案とL1-011の同条件比較へ具体化する。旧RLO-FR-040 / AC-030のtask-class別effort、未評価の明示、scoreでauthorityを変えない意味を保持する（`LEGACY-ASSET-50CA1C554747F12266D3`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666`、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`、ACは `LEGACY-ASSET-437A6A68F9A9E0AE1B9E`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md:43`、SHA-256 `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`）。比較条件・費用の旧Bench sourceは[LABO059の起点記録](../../helix-labo/L2-requirements/labo-requirements.md)のasset/path/行/SHAを参照。差分は、価格やeffort単独で選ばず、scopeに有効な品質・優先・許容悪化と救援等込みの結果を既存proposalへ入力すること。旧runtimeや固定provider、全域順位は継承しない。

### HELIXINTELLIGENCE-L2-068 作業中Workerへの診断・設計/テスト支援候補（単体候補）

- **PO起点**：[補強原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第5項、[判断記録](../../governance/decisions/worker-support-derivation-2026-09-27.md)。
- **親L1**：primary parentはHELIXINTELLIGENCE-L1-002（能力選択）、HELIXINTELLIGENCE-L1-005（計画候補）、HELIXINTELLIGENCE-L1-007（異常/停滞の診断）、HELIXINTELLIGENCE-L1-008（test/code/design review）。contextはHELIXINTELLIGENCE-L1-003（source-owned situation）、HELIXINTELLIGENCE-L1-012（unknownと不足入力）、HELIXINTELLIGENCE-L1-013（根拠trace）、HELIXINTELLIGENCE-L1-019（BRAIN適用候補とLABO汎用化の分離）、HELIXINTELLIGENCE-L1-020（製品固有meaningのBackflow）。HELIXINTELLIGENCE-L1-010の配置判断はこの能力の親/出力ではなく、元WorkerのOS assignment identityを入力として引き継ぐ。
- **関係・既存条件**：既存HELIXINTELLIGENCE-L2-002（領域×能力の選択）、HELIXINTELLIGENCE-L2-005（作業計画候補）、HELIXINTELLIGENCE-L2-007（稼働中診断）、HELIXINTELLIGENCE-L2-008（review判断）の能力を、Worker作業を支える限定処理へ補強するunit candidateである。これら既存要求の所有能力を置換・重複所有しない。元Workerの作業前または作業中に、必要な設計、code、過去のfailure例、BRAIN候補を選択し、限定相談、subtask、修正指示とtest/oracle候補を返す。詰まりの診断・consultは必要なoperationだけであり、事前test/指示準備や相談不要の支援candidateを妨げない。HARNESS-L2-022が対の検証・受入義務とoracleのauthorityを持ち、HELIXOS-L2-020がOS管理下のtest/CI実行を運転する。INTELLIGENCEのtest/oracle案はこの契約を満たす材料の候補であり、既存oracle・requirement・受入を変更/追加確定しない。HELIXOS-L2-028は別connectionとして支援案を実相談/Worker handoffへ渡し、HELIXOS-L2-029は実作業・検証・必要な修正往復までの構成体を扱う。本単体はHELIXOS-L2-028の相談完了やHELIXOS-L2-029の一周成功を前提にせず、有効なticket/input/output contractがあれば不足・候補・相談案を作れる。
- **受け取るもの**：OSが選択した元Worker assignmentまたは着手予定assignmentとtask/ticket identity、対象scopeとrequirement/design revision、HARNESS-L2-022 pair・oracle・受入条件と既存検証義務、選択可能な設計/code/failure/BRAIN sourceのprovenance/applicability、割当budget/期限/停止条件、OSから渡される最小context/restart packet（利用時）。事前test/指示準備ではfailure/blocked evidenceを要求しない。作業中diagnosis/consult operationの場合に限り詰まり/失敗source・再現材料を加える。packetを使う場合はAIDOCのsource/revision/authority・要約非authority条件とOS L2のCLR-R06最小restart packet条件を保ち、必要情報の欠落を隠さない。
- **提供するもの**：詰まりの観測・解釈・仮説/unknownを分けた診断候補、問題に関係する最小限の設計/code/過去failure contextと出典、subtaskと依存/受入条件/停止条件案、必要時の限定相談質問と期待する返答、元Workerへの修正案、HARNESS-L2-022既存oracleに紐づく追加test case/oracle拡張の提案、検証者向けevidence/coverage checklist。いずれもcandidateで、採択済み要求・test/oracle変更・OS ticket・assignmentではない。
- **保証すること**：sourceのfact、AI推論、unknownを区別し、必要な時だけ相談を提案する。test/oracle候補は承認済みrequirement・HARNESS-L2-022の対象scopeと対にtraceし、境界値・権限・状態遷移等の欠落を指摘しても、oracleをINTELLIGENCE単独で確定しない。作業を支援した相談者/助言者/修正指示者は、その変更の独立reviewerや利用者受入者にならない。元Workerは修正・実装の責任を維持する。INTELLIGENCEは割当、test実行、CI、受入、merge、requirement/design authority、BRAINへの直接generic promotionを行わない。
- **常時必須**：元task/ticket identity・scope、source revision/ownerと状態、入力/output contract、必要な既存requirement/pair/oracleと停止条件、data-use/authorityに関係する制約、入力根拠と不確実性（診断operationでは失敗evidenceを追加）。sourceが不明、stale、conflictまたはrestrictedならそのsource利用/候補を止め、不足として返す。元Workerが未評価ならBench未評価を保ち、配置適性判断を代行しない。
- **操作時必須**：停滞の診断、相談提案、task分解、test/oracle候補生成、修正指示のうち実施したoperationとそのtrigger、期待する出力・scopeを記録する。相談自体の実行はHELIXOS-L2-028の別handoff/assignmentを通す。HARNESS-L2-022の契約に従うtestを実行する場合はHELIXOS-L2-020の実行・証拠に渡し、INTELLIGENCE自身の提案を実行結果と扱わない。
- **選択入力時必須**：実際に選んだdesign/code/failure/BRAIN/context sourceについてidentity/version/scope/provenance、利用許可、applicability・制約を保持する。必要sourceが選択済みなのに入手/判定不能ならcandidateを閉じず不足へ戻す。未選択のsourceを無条件依存にしない。
- **参照のみ**：未選択のpattern/source候補や一般会話は背景参照のみ。対象ticketに課されたHARNESS-L2-022 oracle、必要sourceの制約、OS budget/停止条件、選択済packetに含む未完義務は参照のみへ落とさない。
- **版・単独成立の依存**：`version_target: 1.0`（候補目標で実版・採択・v0.1収載を決めない）。HELIXINTELLIGENCE-L2-002／HELIXINTELLIGENCE-L2-003／HELIXINTELLIGENCE-L2-005／HELIXINTELLIGENCE-L2-007／HELIXINTELLIGENCE-L2-008／HELIXINTELLIGENCE-L2-012／HELIXINTELLIGENCE-L2-013／HELIXINTELLIGENCE-L2-019／HELIXINTELLIGENCE-L2-020と対象判断の契約、OSからの有効task/scope context、HARNESS-L2-022の既存検証/受入契約。相談の実実行はHELIXOS-L2-028、端から端の作業往復はHELIXOS-L2-029に依存する別能力であり、この単体候補の生成依存にしない。HELIXOS-L2-020は契約に沿う実行結果を求めるoperation時の実行経路であり、提案生成を可能にする常時runtime dependencyではない。AIDOC/CLR-R06はpacket/contextを使うときその意味契約を参照する。HELIXLABO-L2-055は利用できる場合の歴史材料であり未評価は未評価のまま。
- **失敗時の戻し先／未完義務**：状況sourceはowner、requirement/design/oracleの意味はHARNESS/対象owner、権限はOS/SECURITY、BRAIN applicabilityはBRAIN、長期効果評価はLABOへ返す。候補が役立つ証拠や必要入力が足りないとき、推測で修正指示やpassを作らず、未解決点・必要証拠・停止/再開条件を返す。
- **束ねる既存条件**：HELIXINTELLIGENCE-L1-002/HELIXINTELLIGENCE-L1-003/HELIXINTELLIGENCE-L1-005/HELIXINTELLIGENCE-L1-007/HELIXINTELLIGENCE-L1-008/HELIXINTELLIGENCE-L1-012/HELIXINTELLIGENCE-L1-013/HELIXINTELLIGENCE-L1-019/HELIXINTELLIGENCE-L1-020、HELIXINTELLIGENCE-L2-002/HELIXINTELLIGENCE-L2-003/HELIXINTELLIGENCE-L2-005/HELIXINTELLIGENCE-L2-007/HELIXINTELLIGENCE-L2-008/HELIXINTELLIGENCE-L2-012/HELIXINTELLIGENCE-L2-013/HELIXINTELLIGENCE-L2-019/HELIXINTELLIGENCE-L2-020。HARNESS-L2-022はverification/acceptance authority、HELIXOS-L2-020は検収・CI運転、HELIXOS-L2-028は支援handoff、HELIXOS-L2-029は構成体の一周をそれぞれ維持する。AIDOCのsource/summary authority boundaryとOS-CLR-R06のpacket completenessを使い、最小packet/会話継続能力を重複実装しない。

## G17 設計モデルを条件付きで計算し、結果を比較する候補

起点は[PO原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第3項と[判断記録](../../governance/decisions/design-model-calculation-derivation-2026-09-27.md)。現行Concept（`docs/concept/helix-concept.md:22`）の上位目的、およびHELIXINTELLIGENCE-L1-003／HELIXINTELLIGENCE-L1-004／HELIXINTELLIGENCE-L1-006／HELIXINTELLIGENCE-L1-013の意味を具体化する追加candidate案であり、L1意味の変更・対象revisionの採択・v0.1収載をこの案から確定しない。HELIXINTELLIGENCE-L2-006の説明的将来予測とは別identityで、有限の設計モデルに条件を適用し、明記された遷移・依存・工程・負荷規則を計算する機能として区別する。

設計modelの製品固有正本・revision authorityはHARNESS Product Coreに残す。INTELLIGENCEは許可されたrevisionを読み、有限モデルのシナリオ計算・比較候補を返す。LABOは計算結果と後続実測の独立評価を担う。OSは実環境、実Worker、資源割当・運転を所有する。モデル内の仮想Worker数を2から4へ変えることは、OSの実Worker割当・起動・設定変更ではない。要求・設計正本、OS/SECURITY authority、Workerや資源の状態を書き換えない。

### HELIXINTELLIGENCE-L2-069 有限設計モデルの条件付き計算（unit candidate）

- **親L1候補（既存意味の具体化）**：primary `HELIXINTELLIGENCE-L1-006`（現在状態と変更候補から影響・性能・費用・時間等を予測し、前提・証拠・不確実性・反証を持たせる）。context `HELIXINTELLIGENCE-L1-003`（各機構sourceに従属する現在状況model）、`HELIXINTELLIGENCE-L1-004`（fact / interpretation / hypothesis / unknownを分離）、`HELIXINTELLIGENCE-L1-013`（入力revision・規則・観測・仮定・model/version・代替へのtrace）。これらの親revisionはcandidateであり未承認。新しいL1要求を前提にしない。
- **隣接identityと責務**：`HELIXINTELLIGENCE-L2-006`はcurrent state/change candidateからの予測を出す既存要求。本候補は、既存のHELIXINTELLIGENCE-L2-006が所有する予測目的を、HARNESS Product Coreから受けた有限・version-boundな設計modelに条件を与え、その明示規則を反復可能に計算する能力pack/unitとして具体化する。独立した第二の予測製品、別の予測authority、またはHELIXINTELLIGENCE-L2-006の置換ではない。HELIXINTELLIGENCE-L2-006は既存の予測能力と出力責務を保ち、必要な場合に本計算resultを入力材料として使う。自由文の見通し、未接続の推論、物理環境の高精細再現をモデル計算証拠として扱わない。
- **種別・版・範囲**：unit、`version_target: 1.0` candidate。単一product/project・model revision・initial state・scenario・負荷window・単位系の組を対象とし、そのモデルが表現する有限状態、dependency、process、loadだけを評価する。
- **受け取るもの**：許可されたProduct Core設計modelのidentity/revision/digest（HELIXINTELLIGENCE-L2-033のsource別receiptを保持）、model schema・状態集合・遷移/依存/工程/負荷規則、initial state、選択したbaselineとscenario条件、入力event/load series、容量・service rate・時間・価格・通貨・有効時点、単位、仮定・不確実性・打切り条件、対象scope/operation、source ownerとdata-use/access境界。必要な値がsourceで定まらない場合は、勝手な係数や線形則を補わず計算不能/部分unknownを返す。
- **提供するもの**：条件・不変条件付きscenario result。input/outputには、model/source revisionとscenario identity、使ったrule/係数/単位、順序付きstate transition / dependency propagation trace、到達state・queue/load・詰まり/失敗箇所、有限モデル上の所要時間・費用とbaseline差、適用した仮定、不確実性、unknown/unsupported、計算打切り、反証可能な期待結果、後続の実測との対応先を含める。結果は仮想計算であり実測結果・設計変更・実環境状態ではない。
- **保証すること**：同一revision・入力・規則から同じ計算を再現できる範囲を固定し、状態・edge・行動を入力model外から生成しない。計算可能なfieldとunknownを分け、未対応領域へ外挿しない。説明予測とモデル計算結果、仮想条件と実資源状態を区別する。重要結果の根拠をHELIXINTELLIGENCE-L1-013 traceへ結ぶ。
- **常時必須**：source-bound model revision/owner/許可scope、モデル表現とschema版、対象initial state、明示遷移・依存/負荷規則、scenario identity、計算に使う単位・係数・境界、入力revision、適用するdata-use/authority制約、推論・unknownの区別、停止条件。HELIXINTELLIGENCE-L2-003／HELIXINTELLIGENCE-L2-004／HELIXINTELLIGENCE-L2-012／HELIXINTELLIGENCE-L2-013とHARNESS-L2-010/011、および適用operationを宣言したHARNESS-L2-023の既存依存契約に従う。
- **特定操作時のみ必須**：所要時間を数値計算する場合はmodelに明示された工程/service rate・並列度・遅延単位。費用を数値計算する場合は単価、通貨、計上単位、価格source revision/effective timestamp。failure propagationは明示failure edgeと状態遷移・retry/recovery rule。仮想Worker比較はmodel内worker capacity・共有資源上限・スケジューリング規則。利用者が期待結果を指定して検証を求めるoperationでは、その期待結果と独立oracleも必要。通常のscenario計算は期待結果oracleを前提にせず、明示model/ruleから算出したtrace・値・unknownを返す。未指定の指標は数値を作らずunknown。
- **選択した入力元に応じて必須**：利用者が選択したProduct Core/HARNESS model、baseline revision、scenario/load/profile、price/capacity sourceごとの許可済みidentity、版・scope・provenance・receipt。未選択のsourceは未観測であり、別revisionや別製品のmodelへsilent fallbackしない。
- **参照資料のみ**：背景説明や一般例。要求/設計正本、model revision、係数・単位・遷移規則、security/data-use条件は依存閉包から外さない。独立oracleはL11受入fixtureまたは利用者が期待結果を指定した検証operationでのみ、そのoperationの照合条件となり、通常scenario計算の入力依存にはしない。
- **単独成立依存**：有効な入力model・scenario receipt、HELIXINTELLIGENCE-L2-003／HELIXINTELLIGENCE-L2-004／HELIXINTELLIGENCE-L2-012／HELIXINTELLIGENCE-L2-013、HARNESS-L2-010/011/023の適用契約。単体計算の入力依存は既存HELIXINTELLIGENCE-L2-033のCORE/HARNESS入力receiptだけであり、connection candidate HELIXINTELLIGENCE-L2-070の完了receiptやHELIXINTELLIGENCE-L2-040／HELIXLABO-L2-024送達receiptを前提にしない。HELIXINTELLIGENCE-L2-033はsource input受領、HELIXINTELLIGENCE-L2-069はその入力に対する計算、HELIXINTELLIGENCE-L2-040は計算後result送達、HELIXLABO-L2-024はconsumer側受領の別段階を所有する。HARNESSが計算実行主体になることを要求しない。
- **失敗・戻し先**：source revision・owner・permissionはProduct Core/HARNESS/SECURITYへ照合。schema・遷移・domain未対応はmodel ownerへ範囲不足として戻す。観測/推論の混同はsource ownerへ戻す。通常scenario計算に必要な係数・規則が不足する場合は計算不能/部分unknownとし、選択された検証operationの期待結果oracleが不足する場合はscenario author/該当source ownerへ戻してその検証を保留する。期限/計算resource不足・停止条件到達は途中結果と打切り位置を残し、OS運転成功や実Worker配置へ変換しない。

### HELIXINTELLIGENCE-L2-070 CORE model input / LABO result handoff（connection candidate）

- **親L1候補**：`HELIXINTELLIGENCE-L1-003`, `HELIXINTELLIGENCE-L1-004`, `HELIXINTELLIGENCE-L1-006`, `HELIXINTELLIGENCE-L1-013`。L1-003のsource-owned situation model、L1-004のfact/interpretation分離、L1-006の予測と後の実測比較、HELIXINTELLIGENCE-L1-013の根拠traceを、既存CORE→INTELLIGENCEおよびINTELLIGENCE→LABOのconnection境界へ結ぶ案。L1意味の追加や承認済みrelationではない。
- **既存connectionとの関係**：入力側は既存`HELIXINTELLIGENCE-L2-033`（Product Core/HARNESSのrequirement/design/meaningとHARNESS工程contract/verification obligationをsource別revision付きでINTELLIGENCEへ渡す）を通し、専用CONNECT connector・source owner・contractを維持する。HELIXINTELLIGENCE-L2-070はHELIXINTELLIGENCE-L2-033のpayload/schemaや設計正本を重複定義しない。HELIXINTELLIGENCE-L2-033 input stage receiptは計算前に独立して記録し、HELIXINTELLIGENCE-L2-069 calculation result後にHELIXINTELLIGENCE-L2-040 output handoff、HELIXLABO-L2-024 consumer receiptを別々のstage receiptとして追う。connection全体の完了は最終受領後に限る。simulationに必要なmodel element/typed relationが現契約payloadの範囲に含まれないなら、このcandidateで黙って新fieldを必須化せず、欠落/unknownとして記録し、採択前にsource/contract ownerへ戻す。出力側は既存`HELIXINTELLIGENCE-L2-040`（predictionとsource revisionを含む結果をLABO過去評価材料へ渡す）およびLABOの`HELIXLABO-L2-024`（INTELLIGENCE判断/予測結果のAggregate取込）を使う。receipt/fieldを重複実装しない。
- **LABO実照合と境界**：LABO `HELIXLABO-L2-006`は同条件baseline/candidate/hybridの実験をOS割当Workerが実行し、OS ticket/assignmentとWorker結果を同一experiment・対象版へ結んで評価する。したがってHELIXINTELLIGENCE-L2-070は仮想simulationを実験実行・実測へ偽装しない。HELIXINTELLIGENCE-L2-040／HELIXLABO-L2-024で、prediction結果と後のsource-bound observationを別々に渡す。後続実測とのprediction comparisonは既存HELIXINTELLIGENCE-L2-006 L11 oracleを再利用する。同じtarget revision/scope/windowを固定し、予測した方向/範囲と実測の一致差を記録し、既知regressionを誤予測した結果を成功扱いしない。数値精度閾値に有効なscope decisionがなければ測定値だけを記録し、pass/適格化を判定しない。HELIXLABO-L2-024は受領evidence、HELIXLABO-L2-006は実験/実測と独立評価のownerを保つ。新能力や一律のPO問合せは追加しない。
- **種別・版・範囲**：connection、`version_target: 1.0` candidate。source Product Core/HARNESS model revisionからscenario/result receiptを経てLABO受領revisionまで、個別product・target revision・scenario/windowの範囲で結ぶ。worker/実環境のruntime telemetryは別source connectionとする。
- **受け取るもの**：入力stageでは既存HELIXINTELLIGENCE-L2-033の許可済みsource receipt（design/model/requirement/contractのownerとrevisionを分離）。計算後の送達stageではHELIXINTELLIGENCE-L2-069 scenario/result receiptとHELIXINTELLIGENCE-L2-040 contract。consumer受領stageではHELIXLABO-L2-024 permitted-input contractとLABO consumer receipt。各段階に対象product/scenario/observation identity、data-use分類、仮想結果と実測を分ける状態fieldを保持する。
- **提供するもの**：CORE/HARNESS model sourceからINTELLIGENCE scenario result、さらにLABO受領までの相関ID・source/consumer contract版・対象/条件/scope・仮想/実測区分・未知・受領状態を保持するconnection receipt。LABO評価結果はLABO ownerに残す。INTELLIGENCEは結果の独立評価を自己承認しない。
- **保証すること**：source authorityを移さず、設計model revisionとderived scenario、仮想結果と後続実測、predictionとLABO evaluationを別statusに保つ。scope/版/compatibility不一致や未受領は接続未完とし、結果利用の成功にしない。CORE inputの成立とLABO output receiptは個別に確認する。
- **常時必須**：入力stageのHARNESS/CORE→INTELLIGENCE既存HELIXINTELLIGENCE-L2-033 admitted source contractとsource receipt、送達stageのHELIXINTELLIGENCE-L2-040 contract/result receipt、consumer受領stageのHELIXLABO-L2-024 contract/receiptをstageごとに保持し、該当段階に達するまで後段receiptを要求しない。HARNESS-L2-010/011および適用時023の接続scope/版/provenance/data-use/権限・相関ID。
- **特定操作時のみ必須**：後続実測と予測を比較する利用では、実測側source contract/revision、同じtarget/model/scenario identity・scope/windowへの照合規則、HELIXINTELLIGENCE-L2-006 L11 oracleを使う。数値精度閾値は有効なscope decisionがある場合のみ判定条件にし、なければ測定値として記録する。実測を取り込まない仮想scenario result handoffに実測接続を要求しない。
- **選択した入力元に応じて必須**：選択したProduct Core/HARNESS model source、baseline/scenario、後続実測/actual workload sourceについて個別connector・revision・scope。未選択の機構/環境sourceは未観測とする。
- **参照資料のみ**：一般説明や対応外モデル例。source owner、connector receipt、prediction/actual distinction、data-use condition、受領状態は参照資料扱いにしない。
- **単独成立依存**：既存HELIXINTELLIGENCE-L2-033／HELIXINTELLIGENCE-L2-040、HELIXLABO-L2-024、HARNESS-L2-010/011/023のconnection contractと対象source/consumer専用connector。HELIXLABO-L2-006のWorker実験は後のactual comparisonを行う場合の別operation依存であり、simulation resultを渡すconnection自体のruntime dependencyではない。HELIXLABO-L2-052の評価材料循環は有効な1.0 material loopを使う場合に接続文脈として扱うが、INTELLIGENCEからLABOへのHELIXINTELLIGENCE-L2-040／HELIXLABO-L2-024送達を代替しない。
- **失敗・戻し先**：source/model revision不明はProduct Core/HARNESSへ、connector/schema/compatibility不一致はCONNECT・source/consumer ownerへ、data-use制約はSECURITYへ、LABO受領/評価oracle不明はLABOへ戻す。predictionと実測が別identity/時点なら比較を保留し、未受領/unknownのまま保持する。後続実測との比較は既存HELIXINTELLIGENCE-L2-006のL11 oracleに従い、受領evidenceはHELIXLABO-L2-024、実験/実測の評価ownerはHELIXLABO-L2-006に残す。

### HELIXINTELLIGENCE-L2-071 条件変更・モデル計算・結果比較（composite candidate）

- **親L1候補**：`HELIXINTELLIGENCE-L1-003`, `HELIXINTELLIGENCE-L1-004`, `HELIXINTELLIGENCE-L1-006`, `HELIXINTELLIGENCE-L1-013`。現在状況と出典・不確実性を保ち、変更候補から予測を返す既存親意味を、有限モデルへ条件を与えた比較の一周にまとめる案。L1-006と既存HELIXINTELLIGENCE-L2-006を置換しない。
- **構成関係**：HELIXINTELLIGENCE-L2-069 unit calculationとHELIXINTELLIGENCE-L2-070 connection receiptを組み合わせ、CORE/HARNESSの同一model revision上でbaselineとscenarioを計算・比較し、結果をLABOへsource-boundで渡す。単体計算成功だけでcomparison/connection/composite成立としない。処理順はHELIXINTELLIGENCE-L2-033の入力receipt確認→HELIXINTELLIGENCE-L2-069の計算→HELIXINTELLIGENCE-L2-040のresult送達→HELIXLABO-L2-024のconsumer受領であり、入力時に後段のreceiptを要求しない。
- **種別・版・範囲**：composite、`version_target: 1.0` candidate。明示したmodel revision・product・finite state/edge範囲・初期状態・負荷window・scenario条件のみ。異なるmodel version/productをまたぐ比較はそれぞれの条件が閉じない限り行わない。
- **受け取るもの**：HELIXINTELLIGENCE-L2-033のvalid CORE model input receiptと適用connector contract、HELIXINTELLIGENCE-L2-069で計算可能なschema/rule/coefficients、baseline condition、明示したsingle-or-multi condition changes、同一単位/価格期間のload series、停止条件、既知unknown/unsupported範囲。利用者が期待結果を指定して検証を求めるoperationに限り、その期待結果と独立oracleも受け取る。通常scenario計算に期待結果oracleは要しない。計算後にHELIXINTELLIGENCE-L2-040送達、HELIXLABO-L2-024受領を順に行い、HELIXINTELLIGENCE-L2-070の全体receiptを入力前提にしない。
- **提供するもの**：baseline/scenarioごとの条件差分・不変条件、対照可能な状態transition/propagation trace、queue/stall/failure arrival point、数値計算可能な所要時間/費用とdelta、非影響branch、unsupported/unknown/assumption/打切り、LABO handoff/receipt。利用量増加、DB断、仮想Worker 2→4は個別scenarioとして計算し、Worker数はmodel変数としてのみ扱う。
- **保証すること**：通常scenarioでは同じ入力に対する計算trace・結果を返し、明示された因果edge以外の影響を追加しない。利用者が期待結果を指定した検証operationではその期待値を独立oracleへ照合する。共有bottleneck/直列工程/retry制約を含むmodelは計算へ適用し、worker増加から速度比例や費用改善を仮定しない。費用・時間係数のない比較は数値化しない。unsupported domainへ精度・一般性を外挿しない。
- **常時必須**：HELIXINTELLIGENCE-L2-033の入力receipt、計算後に取得するHELIXINTELLIGENCE-L2-069計算receipt（開始前には要求しない）、同一model/source revision・baseline/scenario/scope identity、明示規則・入力/単位・trace、仮想結果と実測の分離、HARNESS-L2-010/011/023適用契約、HELIXINTELLIGENCE-L1-013へ辿るprovenance。結果送達を行う段階でHELIXINTELLIGENCE-L2-040／HELIXLABO-L2-024の各receiptを後続条件として記録する。
- **特定操作時のみ必須**：load増加比較はarrival seriesとservice/queue rule、DB断はfailure transition/propagation/recovery rule（recovery未定義なら停止/blocked）、Worker数変更は仮想worker service rate・shared DB ceiling・scheduler・価格と稼働単位。利用者が期待結果を指定して検証を求めるoperationでは、その期待結果と独立oracleを照合条件とする。結果の後続実測比較はHELIXINTELLIGENCE-L2-006 L11 oracle、HELIXLABO-L2-024の受領evidence、HELIXLABO-L2-006の実験/実測評価ownerへ接続する。数値精度閾値のscope decisionがない場合は測定値を記録して合否を付けない。
- **選択した入力元に応じて必須**：比較に選ばれたCORE model、capacity/cost/input series、failure event、実測sourceごとのversion/scope/receipt。未選択sourceから数字や遷移を補わない。
- **参照資料のみ**：提示例や一般性能指標。L11受入fixture、または期待結果を指定した検証operationではfixture/operationの入力値・規則・expected output・独立oracleをその照合条件として必須にする。通常scenario計算には期待値oracleを求めない。
- **単独成立依存**：HELIXINTELLIGENCE-L2-069、HELIXINTELLIGENCE-L2-070、source contract、同じrevisionのscenario inputs。独立oracleはL11受入fixtureまたは期待結果付き検証operationを選んだ場合のみ依存する。LABO比較自体はLABO ownerの既存評価契約と有効なactual sourceがある場合に依存し、intelligence candidateから評価を自己認定しない。
- **失敗・戻し先**：CORE model authority/schemaはProduct Core/HARNESSへ、stale/欠落状況はsource ownerへ、operation/data-use許可はSECURITY/ownerへ、入力実資源割当はOSへ、後の独立比較oracleはLABOへ戻す。条件・規則不足、unsupported state/edge、外部のsource conflictはunknown/unmodeled/blockedで返し、自由推定で埋めない。

**旧source照合（保持・変更）**：G17旧source検索結果は[判断記録](../../governance/decisions/design-model-calculation-derivation-2026-09-27.md)の旧source照合を再利用する。検索対象は`archive/legacy-generation-2026-09-14/`配下の旧source、特に`root/docs/design/helix/`、`root/docs/governance/candidates/`、旧`root/CLAUDE.md`、検索語`simulation|simulate|シミュレーション|what-if|条件.*動か|負荷.*試算`。設計modelの有限状態・dependency・process/load規則へ条件を与えて仮想計算し、伝播・時間・費用を比較する旧requirement/candidateは見つからず、旧runtime/testは実行していない。唯一の該当語`pre-merge simulation`は`LEGACY-ASSET-50CA1C554747F12266D3`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:1114–1124`、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`で、PR差分のgovernance projectionを仮適用しmerge後違反を調べる意味。**保持**：変更前の影響を前提・証拠・反証とともに予測し、実績で比較するConcept/L1の意味。**変更/再導出**：旧projection実装、旧CLIやapprovalを移さず、PO第3項を根拠に有限設計modelを条件付きに評価する新candidateを作る。Conceptや旧不在を新runtime/実環境制御の根拠にしない。

### HELIXINTELLIGENCE-L2-072 Judgment pack候補とshadow評価（単体候補、version_target: 1.0）

- **状態**：未採択候補。既存の採択済L2本文を変更せず、候補identityを別に提案する。1.0はINTELLIGENCE-L1-001/002の目標版から導く候補目標で、実版・採択・強制適用の許可ではない。
- **親L1**：`HELIXINTELLIGENCE-L1-001`、`HELIXINTELLIGENCE-L1-002`、`HELIXINTELLIGENCE-L1-008`、`HELIXINTELLIGENCE-L1-012`、`HELIXINTELLIGENCE-L1-013`、`HELIXINTELLIGENCE-L1-020`。
- **能力境界**：判断能力の候補を、対象の工程・domain・risk・failure mode・適用authorityに結び付く版付きjudgment packとして表現し、その候補の適用範囲と評価状態を返す。特定provider、固定checklist、全domain一律の能力構成を要求しない。INTELLIGENCEはpackを候補として提案する。要求・設計・検証義務、対象機構のgate authority、実行割当ては変更しない。
- **入力**：対象判断のscopeとrevision、該当工程・domain・risk・failure mode、参照すべき既存authority identity/revision、既存packを更新する場合はそのidentity/version、選択したskill/rule・BRAIN知識のsource/version、適用条件、必要evidence、unknown/contradiction、評価を行う段階では評価用caseと期待oracle。情報が該当しない場合は非適用理由を記録し、推測で補わない。
- **出力**：候補pack descriptorとsource/applicability trace、shadow評価の入力・結果・欠測・反例、実施済み段階の独立review receiptまたは未実施義務、candidate/shadow/review済み等の状態。pack identity・contract/artifact/dependency version・compatibilityの共通表現は`HARNESS-L2-010`／`HARNESS-L2-011`に従う。候補の作成や評価だけでgateを生成・変更・有効化しない。
- **依存区分**：
  - **常時必須**：`HELIXINTELLIGENCE-L2-001/002`の選択domain identityとcapability構成、対象scope/revision、生成後の候補packのidentity/versionと入力source、適用条件、authority参照、根拠と不確実性を結ぶ`HELIXINTELLIGENCE-L2-003`／`HELIXINTELLIGENCE-L2-004`／`HELIXINTELLIGENCE-L2-012`／`HELIXINTELLIGENCE-L2-013`、および共通pack contractの`HARNESS-L2-010`／`HARNESS-L2-011`と依存宣言・有効閉包の`HARNESS-L2-023`。以下の区分は023を再利用し、全domainへの能力自動付与や未構成能力の実行可能扱いをしない。
  - **操作時必須**：候補を判断gateの強制規則へ昇格させる前に、候補とその適用scopeを変えないshadow評価結果と、作成側とは別のreviewer identity・context・authority・review routeによる独立reviewを揃える。shadow評価の比較条件・oracle・結果は同一pack版/scopeへ結ぶ。有効な既存case/fixtureのshadow評価証拠を再利用でき、新しいWorker実験を毎回要求しない。新たな実験を選ぶ場合は`HELIXLABO-L2-006`のOS割当Worker・結果対応、system化/operation配分を評価する場合は`HELIXLABO-L2-007`の条件を適用する。評価ownerはLABOに残し、INTELLIGENCEが自己評価だけで有効性を確定しない。INTELLIGENCEのreview能力は`HELIXINTELLIGENCE-L2-008`に従う。どちらか未完なら候補のまま留める。
  - **選択入力時必須**：BRAIN知識または外部skill/ruleをpack内容に選んだ場合だけ、そのsource identity/version、applicability、provenanceと、source側が提供する利用区分をsource ownerの契約に従って結ぶ。BRAIN知識を選ぶ場合は`HELIXBRAIN-L2-028`の知識revision/stateと宣言された互換範囲も照合する。BRAIN知識を選ばない場合はBRAINの知識入力を要求しない。
  - **参照のみ**：説明用checklistや過去packの例は、適用条件・authority・source/version・評価結果の代替にしない。固定providerや旧runtime形式は要件化しない。
- **保証と失敗時**：適用条件外、版不一致、authority/scope不明、shadow比較不能、review独立性不明ならunknownまたは未完を保持し、強制規則へ昇格させない。shadowとreviewの両方が揃っても、既存の対象authorityがpackを強制規則として採用した事実をINTELLIGENCEが代行しない。戻し先は、judgment意味・範囲は該当する要求/対象owner、knowledge sourceはBRAIN、実験材料と効果評価はLABO、pack共通契約はHARNESSへ返す。
- **旧sourceとの関係**：`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`（旧`infinity-loop-platform-requirements.md:81`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`）HIL-BR-29の「工程/domain/risk/failure mode/判断authorityに適合するversioned judgment pack」と「shadow評価・独立review前に強制gateへ昇格しない」を保持する。独立性の判定は2026-09-26 PO判断（`worker-execution-model-po-decisions-2026-09-26.md:56–67`）に従い、reviewer identity/context/authority/routeを作成側と分ける。provider/modelの一致・不一致は独立性の基準にせず、固定providerを置かない。旧IR `requirements.json#/HIL-BR-29`（SHA-256 `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）は`HR-FR-HIL-21`、`HAC-HIL-21a/b/c`、`HAT-HIL-21`へのdownstream obligationを`pending_pair_descent`としている。旧HR-FR-HIL-21に束ねられたagent team生成、未許可tool拒否、詳細registry composition/stale policy等はBR-29単独の要求へ混ぜず、対応する旧identityのholdingを解除しない。
- **選定理由**：`HELIXBRAIN-L2-028`はBRAIN knowledge revisionと共通pack descriptorのversion/compatibilityを照合するunitで、判断packの内容・shadow・gate非強制状態を扱わない。採択済本文へ意味を足すとBRAIN knowledgeとINTELLIGENCEの判断候補を混同する。現行INTELLIGENCE-L2-002/008/012/013も能力選択・review・unknown・traceの汎用条件であり、BR-29固有のpack lifecycleを受け入れる単体identityではない。したがって、既存本文の改変ではなくINTELLIGENCEの新しい単体候補として切り出す。

- **生成前後の分離**：候補の作成開始には既存pack identityやshadow/review結果を要求しない。入力scope/sourceから候補identity/versionを付け、shadow結果と独立review receiptは後段で取得する。未実施なら未完義務として出力し、候補起草を止めない。外部skill/ruleを選ぶ場合も既存の利用可能なsource契約と版の範囲に限り、外部知識取得の2.0能力を1.0前提にしない。
- **照合固定点**：現行L1/L2/L11と09/26判断はcommit `84bd5e27e4001603744f59df3bd09342bbd513f3`。旧L1 pathは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:81`。旧判断skillの内容契約を現行INTELLIGENCEの判断候補、LABOの比較評価、対象ownerの適用authorityへ再導出する。

**既存配置案との差分と人の判断（R2225-01）**：固定commit `84bd5e27e4001603744f59df3bd09342bbd513f3`の `docs/governance/crosswalks/concept-mechanism-version-requirement-crosswalk.jsonl:66`（HIL-BR-29）は、所属を「HELIX-HARNESS／HELIX-OS」、版を「1.0候補（pack運用・gap/効果評価のみ）」とし、「3.0 Intelligenceへの出所付き入力接続は後続版候補。1.0の完成条件に学習・調整を含めない」と記録している。`docs/governance/crosswalks/concept-requirement-po-decision-packet.md:956`も同配置案である。この既存案を採択済み配置とは読まず、変更を隠さず次の選択肢を残す。

- **A：既存HARNESS／OS配置案を維持**。HARNESSが判断packの工程・検証契約を、OSが登録・状態を持ち、INTELLIGENCEは判断候補の提示先として接続する。072の配置をその境界へ分け直す必要がある。
- **B：072の判断pack候補の意味・適用範囲をINTELLIGENCEへ置く（推奨）**。現行Conceptの1.0判断支援と、09/28に固定確認されたINTELLIGENCE-L1-001/002/008/012/013/020が、領域×判断能力、review、unknown、根拠、authority非変更を持つため、判断能力の候補表現をここへ置く。HARNESSは共通pack・工程・検証契約、OSは登録・状態・実行、LABOは比較と効果評価を引き続き所有する。

既存案の「pack運用・gap/効果評価のみ」のうち、072はpack候補の適用範囲・不足/unknown・shadow/review状態を提示する。登録/運転はOS、効果評価はLABOへ残し、学習やモデル調整を追加しない。候補descriptorの生成は既存1.0の判断支援であり、3.0の学習・調整や学習入力接続の前倒しではない。旧BR-29のversioned pack・非強制shadow・独立review前の強制禁止という条件は両案で保持する。

所属をHARNESS／OS案からINTELLIGENCE案へ変える点と、この1.0範囲を、最後の新候補一覧でPOへ確認する。推奨B、PR統合、review0件から配置確定・要求採択を生成しない。影響対象は新規HELIXINTELLIGENCE-L2-072と対のL11、BR-29の対応記録であり、既存HARNESS/OS/LABO本文と3.0の学習接続は変更しない。

既存配置案の固定SHA-256：crosswalk `sha256:06345757faf6491c848340356a7f58f6c407161070a4691e2a51bb17729f7a41`、判断packet `sha256:3aa2789aa7abf0fc1aa235240b40686f2cf66a8c9a888b93953a05207d0caa65`。


#### 旧HIL-FR-57/58のpack構成・昇格保護と版境界（未採択候補の追補）

- **pack構成**：候補packは対象工程/domain/risk/failure mode/既存authorityに加え、判断目的、判断観点、反証質問、必要evidence、severity、escalation/停止条件、model適性、適用条件、versionをsource/revision付きで表す。モデル適性が未評価、根拠欠落、またはsourceがunknownの場合はunknown/未評価で保持し、推測で埋めない。特定provider/model、固定checklist、未確定閾値を要件化しない。
- **合成の記録**：`judgment-core`、role judgment、task lens、専門skill等を選択する場合、各componentのidentity/version/applicabilityとpack内のsource edgeを残す。同一意味の重複を整理する場合も由来edgeは失わない。異なる要求、反証、evidence、severity、停止条件が競合する場合はconflict findingと未解決箇所を返し、INTELLIGENCEが優先順位やauthorityを創作して黙って統合・削除しない。この候補はruntime compilerや強制gateを定義しない。
- **FR58の1.0保持範囲と後続版**：FR58原文は1.0保持部分と後続版へ残す部分に分ける。072の1.0候補に保持するのはwith/without shadow比較、false-positive/false-negative、独立review、rollback evidence、および対象ownerの採択後だけactive化する境界である。finding、review reversal、retry、escaped defect、skill efficacyから不足観点を作り、pack改善へ使うloopは072の1.0責務に含めない。2026-09-24のHMC-BR-003に従い、知識の評価・保持は1.0〜2.xでLABO、Intelligenceによる改善利用は3.0以降の候補とする。HELIXINTELLIGENCE-L1-021は3.0の学習・調整を定める。適用範囲内の評価・Feedbackは、既存LABO-L2-050の契約または未採択のLABO-L2-063候補で扱う範囲へ戻し、後者の採択・拡大を先取りしない。本候補が全signal処理をLABOへ新たに要求しない。後続版部分はsource holdingとcrosswalkに残し、本候補を3.0の成立条件・許可へ拡張しない。
- **比較とrollback証拠**：昇格を検討する対象versionについては、同じ対象scope/revision、case集合、oracleおよび比較条件に対するcandidateあり/なしのshadow結果を結び、false-positive/false-negative、unknown、反例を識別可能にする。適用可能なrollback先・戻し条件・rollback evidence/receiptも同じversionに結ぶ。具体的な数値閾値やrollback方式は本候補で新設しない。既存ownerの手続きで有効な比較・rollback evidenceがない間は未完とする。
- **独立reviewとactive境界**：shadow比較と独立reviewは別々の証跡とする。reviewerは作成側と異なるidentity/context/authority/review routeで証拠を確認し、作成側の結論を引き継がない。pack候補を作ったWorker自身またはそのsubagentのreviewは独立扱いしない。別runtimeという構成だけで独立とせず、同じruntimeという理由だけでも不独立としない。全証跡が揃ってもINTELLIGENCEはcandidate状態を維持し、対象ownerの既存authority手続きによる採択・active化とOS側の記録を代行しない。採択・active化・rollbackのreceiptは既存owner/OSから参照し、072自身が生成した実行receiptと誤認させない。


### HELIXINTELLIGENCE-L2-073 未知finding探索の自由文からの直接投影境界（unit candidate、version_target: 1.0）

- **親と位置づけ**：親は採択済み`HELIXINTELLIGENCE-L1-009`。採択済み`HELIXINTELLIGENCE-L2-009`が定める監査finding traceと「自由文だけでauthorityを変えない」境界を補い、旧AAFD-R-04全体が独立に示す検出器優先と4つの宛先を限定して受けるcandidateである。旧sourceは`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:45-46`（file SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`、line SHA-256は45行`e7d58c59ce05eff5e2807b1a123e36e30d95dd8eddea9b26ae8de88406fa0de3`、46行`333d4deb1ee4f9c39d411fb9749a8e3d6c5d397972bf29b5c5d52f03ba696412`）。AAFD-R-01〜03、R-05〜15と他のAAFD詳細は範囲外。
- **種別・版・範囲**：単体candidate、`version_target: 1.0`。未知finding探索の自由文だけを入力とする時の決定論的検出器との関係、およびIssue・Requirement・CI・merge authorityへのdirect projection境界を対象にする。正確なL2/L11本文は未採択であり、この追記から採用、実装、運用変更を生成しない。
- **要求**：Agentic Audit Probeによる未知finding探索はUILのdeterministic detectorを置換しない。未知finding探索の自由文だけを根拠に、Issueを直接作成/更新せず、Requirementの意味・revision・承認状態を直接変更せず、CIの定義・実行・結果・完了状態を直接変更せず、merge authority・admission・merge状態を直接変更しない。finding/candidateを各ownerへ提示することはできる。適格な別根拠と独立したowner判断を経る既存経路を禁止、変更、追加する要求ではない。
- **既存owner境界**：finding検出・qualificationは既存UIL owner、Requirement意味は上流owner、CI/verificationは既存OS/HARNESS owner、PR review/merge admissionは現行GitHub authority経路に残る。本候補はIssue route、detector、CIまたはmergeの新しいgate、動作、手順、許可、禁止条件を定義せず、自由文単独のdirect projectionとdetector置換だけを対象とする。
- **単独成立依存・戻し先**：`HELIXINTELLIGENCE-L2-009`の監査finding/source/evidence traceと、UILおよび各宛先の既存owner境界を参照する。qualificationまたは根拠が不足する場合はcandidate/findingとしてownerへ戻す。対象・根拠・適用経路が不明ならunknownのまま保つ。`version_target: 1.0`は候補の目標版であり、採択や実装許可ではない。

### HELIXINTELLIGENCE-L2-074 評価済み返却feedbackの配置proposal入力（単体候補、version_target: 1.0）

- **親と状態**：`HELIXINTELLIGENCE-L1-010`に接続する未採択候補。採択済みL2-010 Worker配置候補と既存候補L2-067の入力条件を補う限定candidateであり、それらの意味を暗黙変更しない。
- **入力と提供**：LABOから、返却reason class、欠けた入力/oracle、再発行後の検証成立状況を含む評価済みevidenceを受け取る。evidenceはtask class/domain、対象revision、scope、観測母数・window、source completeness、LABO評価状態を伴う。INTELLIGENCEは同scopeのWorker実績へ適用可能な場合に限り、次回のticket別placement proposalの根拠として引用し、提案・根拠・適用範囲・未評価/不確実性・再評価条件を示す。
- **適用保証**：未評価、比較不能、stale、別task class/scope/revisionのfeedbackは適合実績として扱わず、placement入力から除外するか未評価として示す。少数/単一feedbackから恒久的なWorker資格・順位、因果的な能力差、model更新を決めない。既存L2-010のsuccess/failure/rework/latency/cost/reliability evidenceを利用し、LABOの評価だけでproposalを正しいと保証しない。
- **境界**：INTELLIGENCEは配置proposalを出す。指定、ticket発行/再発行、assignment、dispatch、Worker/modelの自動昇格/除外はOS/既存ownerに残し、候補evidenceから要求意味・authority・ticketを生成しない。新しい承認経路は設けない。
- **戻し先**：task属性不足はOSへ、Bench/evidence/scope/revisionまたはLABO評価不足はLABOへ返し、該当proposalを未評価/未確定とする。
- **旧sourceとの対応と限界**：旧ticket/feedback sourceの成功・失敗・reworkと再発行後評価を次回配置判断に使うというO2の入力要望を、既存L2-010の配置案責務へ限定接続する新規案。旧sourceは配置案への自動学習やworker資格の恒久更新を根拠づけないため追加しない。候補は実際の配置変更や改善効果を主張しない。

### HELIXINTELLIGENCE-L2-075 Agentic Audit Probe proposal identity and qualification boundary（unit candidate、version_target: 1.0）

- **状態と親**：未採択candidate。親は採択済み`HELIXINTELLIGENCE-L1-009`と、採択済み`HELIXINTELLIGENCE-L2-009`の監査finding trace。これは旧AAFD-R-01〜03から、Probeのproposal identity、authority-bound evidence、qualificationへのhandoffを限定して再導出する候補である。採択済み`HELIXINTELLIGENCE-L2-073`（AAFD-R-04のdetector優先/direct-projection境界）を置換・拡張せず、AAFDの他条件が採択済みだとも扱わない。
- **proposal identity**：`AgenticAuditProbeProposalV1`候補は、proposal ID、audit episode、producer provider/runtime/model/version/session、repository、候補HEAD、worktree identity、authority revision/digest、責務／不変条件ID、観測挙動、evidence、reproduction recipe、counterevidence、confidence、expiry、finding advisory、remediation advisory、proposal digestを結ぶ。PR review findingとsystem audit proposalは別identityとschemaに保つ。field欠落を他fieldの値で補わない。
- **identity受入**：exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceの有無と一致を個別に確認する。欠落または不一致は当該proposalをfail-close/incompleteとし、未評価の別field・別sourceで補わない。各fail-close/incomplete結果には、失敗した対象項目と、検出した欠落または不一致に対応する個別reasonを残す。reasonの語彙・enum・schemaは固定しない。current、compatibility、historical authorityを区別し、historical evidenceをcurrent claimに読み替えない。
- **qualificationの戻し先**：AI自己評価のみからverified、P0/P1、owner、route、remediation adoptionを確定しない。duplicate Issue／existing ownerとの照合、独立再現、反証、expiry、supersessionは既存UIL-01〜04へ渡す。finding proposalとremediation proposalは別identity・別判定とする。本候補はUILのqualificationやrouteを再実装せず、Issue/Requirement/CI/merge動作の追加を要求しない。
- **失敗・境界**：evidence、責務owner、authority/revisionがunknownまたは矛盾する場合はunknown/incompleteのまま既存ownerへ返す。expiry/supersession/duplicate判定不能時に新しいproposalをverifiedとせず、remediationを実行しない。`HELIXINTELLIGENCE-L2-073`の採択範囲外を同候補の自由文境界へ畳み込まない。
- **sourceと限界**：要求sourceは旧asset `LEGACY-ASSET-EB3700B0088F311C2295`、archive `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:23-41`、file SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`。個別reasonのnegative oracleは別asset `LEGACY-ASSET-CAC0C64EB7540180B1FE`、archive `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:16`、file SHA-256 `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`、line SHA-256 `8936ee3c03122a898b13a701aedf077e3ce5e65360a45f80cd9e7be0d86bda78`。6項目それぞれの失敗理由を結果へ残す条件を追加する。採択済みL2-009の一般的なtrace要件を具体化する候補だが、詳細なschema/qualification条件の採否は本候補から生成しない。future-state delta adapter、UIL/TER qualification runtime、Future Synthesisは対象外。

### HELIXINTELLIGENCE-L2-076 Model revision revalidation and comparison evidence（unit candidate、version_target: 1.0）

- **状態と親**：未採択candidate。親は採択済み`HELIXINTELLIGENCE-L1-011`と、採択済み`HELIXINTELLIGENCE-L2-011`の同一corpus/responsibility scope比較である。現L2-011が既に要求するfindings、false positives/misses、reproducibility、latency、cost比較を重複採択しない。
- **revalidation proposal**：provider/model/runtime/version変更をTER eventとして記録し、同じaudit corpus、responsibility scope、policy、oracle revisionを使うrevalidation proposalへ結ぶ。model名の文字列変更だけで既存qualificationを継承しない。TER event記録・発火・qualification自体は既存ownerに残す。
- **比較evidence proposal**：new/lost finding、false positive/negative、duplicate、remediation correctness、authority drift、reproduction success、cost、latencyを独立metricとしてsource/revision付きで記録する候補。単一scoreへ潰さず、同条件が揃わない値は比較不能/unknownのまま保持する。hidden oracleをWorker contextへ渡さない。
- **差分境界**：L1-011が明示する同条件比較と「更新だけで優位判定しない」は現L2-011に保持済み。TER変更を再評価triggerとすること、remediation correctness/authority drift/duplicate metrics、およびhidden-oracle confidentialityをL1-011に追加する採否は未決であり、本候補は意味変更を適用しない。3.0学習・適格化はL2-065の境界に従い、1.0の依存へ前倒ししない。 同条件不足時を比較不能/unknownとし、L11で欠測・scope違い・policy/oracle revision違いを同様に扱う提案は、採択済みL1-011の同条件比較と現行L2-011のunknown保持から導いた候補条件であり、旧AAFD-R-13/14の原文4行そのものに含まれる条件ではない。
- **sourceと限界**：旧asset `LEGACY-ASSET-EB3700B0088F311C2295`、archive `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:94-104`、file SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`。旧R-13/14のcandidate-only比較案であり、TER runtime、benchmark運用、model昇格、閾値や新承認手続きは作らない。

### HELIXINTELLIGENCE-L2-077 AAFD qualified delta source and non-write boundary（unit candidate、version_target: 1.0）

- **状態と親**：未採択候補。親は固定済みHELIX-INTELLIGENCE L1-009（version_target: 1.0）。この候補の`version_target: 1.0`は旧AAFD本文から推定せず、現行親L1-009の版指定を引き継ぐ。採択済みL2/L11-009の監査finding traceと自由文からauthorityを生成しない境界を使う。L2/L11-073のAAFD-R-04検出器優先/direct projection、075のR-01〜03 proposal identity/qualification、076のR-13〜14 model comparisonを置換・再採択しない。
- **sourceからdelta候補への限定条件**：delta候補は既存source ownerがqualifiedと示すinternal/UILまたはexternal/TER source receiptに結び付く場合だけ作れる。source identity/revisionとowner、origin typeを別々に保ち、internalとexternalを同じenum identityへ潰さない。source qualification、UIL/TERのobservationやqualification、Future Synthesis intake/invalidation、route/owner assignment自体は本候補で再実装しない。選択receiptが読めない、revision/qualification照合に失敗する、またはそのownerを確認できない場合はunknown/incompleteのまま選択source ownerへ戻し、別receipt・未選択source・reference-only資料へ暗黙fallbackしない。外部releaseの観測だけからHELIX defectを確定しない。internal driftをexternal/TERへ、external driftをinternal/UILだけへ付け替えない。
- **unknownとauthority境界**：delta候補のunknownを`0`、`neutral`、`unchanged`、`observed`へ補完しない。deltaまたはその候補はRequirement、Design、Release、Assignment、merge authority/stateを直接変更しない。候補・evidenceを既存ownerへ提示することはできるが、別途定められた適格source、既存authority、owner判断を代替しない。
- **責務・未確定点**：source ownerはsource receiptのqualificationとidentityを持つ。INTELLIGENCEはL1-009の監査提案範囲でdelta candidateの意味・根拠・unknownを保持する。OSは既存のticket/state/assignment運転を、LABOは既存の評価を、INTELLIGENCEは既存の分析を担う範囲でのみ対応する。将来delta consumer、正式なowner/route、UIL/TERという旧名の現行実体はこの候補から新設・推定しない。対応source ownerまたはconsumerが特定できない入力はunknown/incompleteとして保持し、該当する既存要求ownerへ照合する。
- **依存区分**：対応するHARNESS-L2/L11-023で採択済みの4区分（常時必須、特定操作時のみ必須、選択した入力元に応じて必須、参照資料のみ）を候補の適用条件にも分けて示す。source/authorityの適用契約と対象revisionは評価の常時必須、delta候補を作る操作に限ってqualified source receiptが必要、internal/UILかexternal/TERかは選択されたreceiptに応じて結び、歴史source/candidateは参照資料として扱う。区分を混ぜた常時必須化、未選択sourceの成功・不在推定、unknown条件の参照扱いはしない。HARNESS-L2/L11-023は依存分類規則であり、本候補のAAFD source ownerやdelta consumerを決めない。
- **旧sourceとの対応と意味境界**：`LEGACY-ASSET-EB3700B0088F311C2295`の旧AAFD-R-05（旧要求:52-53）およびR-08（旧要求:71）、別asset `LEGACY-ASSET-CAC0C64EB7540180B1FE`のAC-005（旧受入:19）、AC-008（旧受入:22）と否定oracle（旧受入:39-40,42,44）を起点に意味を再導出した。旧本文はUIL/TER/Future Synthesisを特定owner・adapterとして規定するが、現行L1-009はその移管先やdelta compilerを確定していない。保持するのはsource起点・origin/ownerの区別、unknownの列挙補完拒否、直接変更拒否とそれらの反例だけであり、旧route/API/schema/runtimeは現行へ移さない。
- **人の意味判断材料**：選択肢A（推奨）：L1-009の現scope内で監査candidateと境界を保ち、formal delta consumer/ownerの対応はunknownのまま既存L1/L2 ownerの根拠照合を待つ。選択肢B：INTELLIGENCEにdelta consumer/projectionを持たせるなら、L1-009の責務・出力意味を明示変更してから対応するL2/L11を再検討する。選択肢C：別機構がconsumerなら、その既存L1・採択済みL2/L11とsource owner接続を特定してから配置する。推奨Aは旧UIL/TERを新設せず上流意味を推測しないためである。影響対象はHELIXINTELLIGENCE-L1/L2/L11-009、HELIXOS-L2/L11のticket/assignment境界、HELIXLABO-L2/L11の評価境界、および選択肢により特定されるsource/consumer要求。候補本文はPO判断を待たず比較材料を提示するもので、意味選択を採択扱いしない。
- **範囲外**：AAFD-R-06/07/09〜12のdelta schema、determinism/dedupe、snapshot join、bounded invalidation、stale execution、replay、AAFD-R-13〜15のmodel evaluation/promotion、将来差分全体のowner移管やruntime実装は本candidateで保持・閉鎖を主張しない。

### HELIXINTELLIGENCE-L2-078 AAFD future-state delta integrity and bounded intake boundary（unit candidate、version_target: 1.0）

- **状態・親**：未採択候補。親は固定済みHELIXINTELLIGENCE-L1-009（現行表のversion 1.0）。`version_target: 1.0`は現行親から対応づける。旧AAFD本文は版を指定していない。候補はL1-009の監査提案・source/evidence trace・自由文からauthorityを生成しない境界の下で、R-06/R-07/R-09〜12のdelta/invalidation/intake/replay意味だけを表す。formal Future Synthesis consumer、producer、runtime ownerの割当てや採択を生成しない。
- **R-06 — delta情報の意味保持**：対象sourceの選択結果からdelta候補を表すとき、stable ID、source receipt revision/digest、HEAD・authority・environment identity、affected responsibilities、changed dimensions、previous/observed state、evidence/counterevidence、confidence、unknown、projection/future type/assumptionのinvalidation exact set、再合成要否、delta digestの意味をすべて保持する。changed dimensionsのauthority、responsibility、runtime、provider、dependency、security、verification、capacity、cost、migration、releaseは個別に識別し、一つへ畳み込まない。これらは旧sourceが挙げた意味要素であり、現行field名、保存schema、物理column、digest encodingをこの候補で固定しない。
- **R-07 — 同入力再現と重複拒否**：source receipt、registry、policyが同じなら、再評価のdelta exact setとdigestは同一結果を示す。stale revision、wrong HEAD、wrong authority、missing receipt、duplicate changeをそれぞれ不成立として返し、retry、event順序変更、at-least-once deliveryから別episodeを無限に増殖させない。sourceは同一結果の意味を要求するが、canonicalization algorithm、episode ID scheme、delivery implementationを指定しない。
- **R-09 — snapshotへのexact join**：intakeのdelta source identityをF0 Current State Snapshotの対応するsource identityへ結び、比較するsnapshot revision/digestが一致する場合だけjoin結果を対象にできる。不一致、staleまたは比較情報不足はjoin成功に読み替えず、staleまたはreobservation requiredを返す。snapshot構造、物理adapter、保存方式は決めない。
- **R-10 — invalidationの範囲と再投影**：affected Future Type、assumption、projection、directiveを個別に列挙したexact setだけstaleにし、必要範囲だけを再投影する。unaffected projectionはstale化・再生成しない。構造変更はproposal-onlyとして扱い、旧sourceが指す`#1037`を現行Issue/route/ownerと推定しない。構造変更の候補からwhole-system plannerのcurrent-write parkingを解除しない。
- **R-11 — stale/unknown/missing sourceからの操作抑止**：stale Future Directive、unresolved unknown、missing source receiptからassignment、release、retire、requirement writeまたはdesign writeを発行しない。Future Synthesis側でUIL/TERのobservationやqualificationを再実装しない。これはR-08のdelta non-writeと同じ保証へ一括せず、R-11のstale/unknown/missing-input条件に対する個別結果として扱う。
- **R-12 — authority/event journalからの再構築**：repository authorityとevent journalを入力にdelta、invalidation、intake projectionを再構築し、DB削除後も同一exact set/digestを返す。受入対象のevent順序変更でも同結果であることを確認する。event journalのschema、DB種別、実装・起動方式を固定しない。
- **既存pairとの比較**：採択済みL2-009は監査findingのHEAD/authority/producer/evidence/reproduction/falsification traceと自由文からauthorityを変更しない一般境界を持ち、L2-012は不確実性を保持するが、R-06のdelta情報要素一式、R-07の同入力exact set/digest・duplicate判定、R-09/10のsnapshot join/invalidation scope、R-11のstale操作拒否、R-12のDB deletion replayを要求しない。採択L2-073はAAFD-R-04 detector priority/direct projection、未採択候補075はR-01〜03、未採択候補076はR-13〜14を扱う。それらの採択・候補状態から本候補の条件を補完しない。別PR #2509のINT077案はR-05/R-08に限定された未採択案であり、本候補の根拠・採択・実装証拠にしない。
- **依存区分**：採択済みHARNESS-L2/L11-023の適用契約に従い、dependency identity、owner、dependency contract version/range、4区分、適用条件、対象operation、selected sourceをpack identity・pack contract revisionへ束縛して適用根拠として扱う。**常時必須**＝評価対象scope/revision、current repository authority、選択receiptのidentity/revision/digest、比較対象registry/policyと適用契約。**特定操作時のみ必須**＝delta生成時のR-06/07、F0 intake時のsnapshot join、invalidation/resynthesis時のR-10、DB削除後の再構築を確認するreplay操作のR-12。**選択した入力元に応じて必須**＝実際に選択したsource receiptとそのauthority/identityだけを対応づける。未選択sourceの成功・不在・qualificationを推測せず、選択receiptの読取、revision、authorityまたはqualification照合が失敗したらunknown/incompleteのままそのsource ownerへ戻し、別receipt/sourceへfallbackしない。**参照資料のみ**＝旧schema/runtime/adapter/CLI/old tests、historical issue `#1037`とE2E/CI green行は意味照合の背景だけとし、現行依存、owner、route、実行gateへ昇格させない。旧R-06の項目意味自体と採択済み023の適用契約は参照資料のみへ落とさない。適用条件を解釈できない依存、欠落/unknownのidentity・owner・版range・適用根拠は非適用や参照のみへ変換せず、その条件の操作を保留して宣言ownerまたはauthority ownerへ戻す。同じpack identity/revision・契約版・operation/scope/source選択・authority/evidence入力では、常時必須＋成立した操作条件＋選択source条件によるeffective dependency closureと分類理由を同じにする。これはR-07のdelta exact set/digest再現性とは別の保証である。
- **責務・差分と判断材料**：候補の所属はL1-009下のINTELLIGENCE要求案に限る。現在のL1-009と採択L2-009はformal Future Synthesis consumer/ownerを特定していない。旧AAFDの記述からINTELLIGENCE、OSまたはLABOへ実行責務を推定しない。選択肢A（推奨）：INTELLIGENCEはsource付きdelta/invalidation/intake意味を候補として表し、formal consumer/ownerと実行routeはunknownで保持する。選択肢B：INTELLIGENCEをformal consumerとするなら、L1-009の出力/責務意味を人が明示変更した後にpairを整える。選択肢C：別の既存機構がconsumerなら、その対象L1と採択L2/L11、source→consumer接続を特定して配置する。Aを推奨する理由は、旧UIL/TER/Future Synthesis routeや`#1037`を現行所有物と誤認せず、現在のL1意味を変えないこと。影響対象はHELIXINTELLIGENCE-L1/L2/L11-009/078、選択に応じて特定されるOS planner/write boundary、source owner/qualification、Future Synthesis consumer要求。候補作成や静的受入oracleの提示はこの人判断を開始gateにしない。
- **旧source・範囲外**：asset `LEGACY-ASSET-EB3700B0088F311C2295`の旧AAFD-R-06/R-07/R-09〜12要求物理行と、別asset `LEGACY-ASSET-CAC0C64EB7540180B1FE`のAC-006/007/009〜012と否定oracle lines 43/46を、paired source ledgerの各line/hash単位で保持する。旧AAFD-R-05/R-08は別候補077、R-01〜03は075、R-04は採択073、R-13/14は076の別scopeであり本候補へ混ぜない。旧L10 AC-016〜018のE2E/runtime/regression/CI-green條件は今回のsource atom外であり、新L11 runtime green gateへ転記しない。R-15 promotion、full AAFD closure、旧runtime/API/schema、具体DB/serialization/digest algorithm、実装・実行・採択は主張しない。旧sourceと旧acceptanceはread-only参照し、旧runtime/CLI/test/CIは起動しない。
### HELIXINTELLIGENCE-L2-079 AAFD benchmark promotion and qualified-source boundary（unit candidate、facet別version target）

- **状態・範囲**：未採択候補。AAFD-R-15のsource atoms `LEGACY-CAND-LINE-000179`と`000180`（requirements lines 108-109の続き一文）、対応するAC-015 atom `LEGACY-CAND-LINE-000064`（acceptance line 29）、独立bypass negative `LEGACY-CAND-LINE-000074`（acceptance line 41）を、混同しないfacetとして扱う。採択済みL2/L11-065の学習・lineage・比較・限定適格化・LABO独立評価の段階境界を置換せず、そのcandidate自動交換禁止を再採択しない。
- **benchmark候補境界**：一つのmodel revisionに対するbenchmark結果はLearning Systemへのcandidate evidenceとして保持する。その単独結果からrule、provider routing、Requirement、Designの各対象を自動変更・昇格しない。4対象は個別に確認し、一つの対象の拒否結果で他の対象の状態を代用しない。
- **昇格条件の対応**：候補を昇格対象として扱う判断では、該当model revisionに結び付く独立VERIFY、counterexample、expiry、およびhuman gateを別々に確認する。独立VERIFYの不在または独立性不明、counterexampleの欠落、expiryの欠落・期限切れ状態不明、human gateの不在・対象不一致は、candidate evidenceを未昇格のままにする。これらを満たした候補の提示も、本候補による昇格・適用・要求変更の許可を意味しない。
- **source経路境界（version target未指定）**：`LEGACY-CAND-LINE-000074`に由来する独立facet。Future Synthesisに使うと主張するaudit findingは、選択されたUILまたはTERの適格なsource receiptに結び付く必要がある。source種別、owner、revision、qualified receiptの根拠を同じ入力へ結び、どれか不明ならunknown/incompleteとする。UIL/TERを飛ばした自由文をFuture Synthesisへ直接投入して適格入力として扱わない。旧UIL/TER名は原文条件の照合用であり、現行owner、正式route、runtime、APIをこの候補から設けない。このsource行は版も現行親も指定しないため、R-15の3.0配置を継承せず、current parent/version targetを未割当のままにする。
- **依存区分**：採択済みHARNESS-L2/L11-023の4区分をfacet別に適用する。**常時必須**はR-15 facetについてのみ、親L1-021〜026とrevision、採択済みL2/L11-065の3.0境界、本候補と対oracleのidentity/版である。`LEGACY-CAND-LINE-000074` facetには現行親または版の根拠がないため、これらを親・版として流用しない。**特定操作時のみ必須**はR-15 benchmark昇格適格性を照合する操作時のmodel revision、独立VERIFY、counterexample、expiry、human gateの各根拠である。**選択した入力元に応じて必須**は000074 facetでFuture Synthesis用findingとしてUILまたはTER経路を選んだ時のsource/owner/revision/qualified receiptであり、両経路を常時要求せず未選択を未観測とする。**参照資料のみ**は旧#1035/#1384、旧runtime/APIおよび背景資料で、現行owner・契約・実行根拠へ昇格しない。HARNESS-023の区分規則は採択済みだが、本候補の採択を意味しない。
- **正常例**：一つのmodel revisionのbenchmark結果をcandidate evidenceとして記録する。昇格適格性を照合するfixtureでは、別に発行された独立VERIFY、counterexample、当該revisionのexpiry情報、当該candidateと対象に結び付くhuman gateの根拠を各々照合する。Future Synthesis向けfindingを入力に選ぶfixtureでは、既存fixtureに示された適切なUILまたはTER source/owner/revisionのqualified receiptへ結ぶ。結果はcandidate evidenceと各条件の照合状態を分けて返し、この候補自体は対象の変更を実行しない。
- **反例**：benchmark単独からrule変更、provider routing変更、Requirement変更、Design変更となる4 mutationを個別に拒否する。candidate producer自身の評価だけを独立VERIFYとする、counterexampleを落とす、expiryを落とす/期限切れを有効扱いする、human gateのない候補を昇格する例もそれぞれ拒否し、未昇格状態を保つ。自由文findingをUIL/TER qualified receiptなしにFuture Synthesisへ直接投入した例はsource適格性を拒否する。候補は自由文をfinding/candidateとして記録する余地を塞がず、直接投入のoracleだけを扱う。
- **未見・unknown**：未見のmodel revisionまたはfindingで、独立VERIFYとの関係、counterexample、expiry、human gate、選択source receiptのいずれかが欠落・不明・不一致なら該当条件をunknown/incompleteとして未昇格にする。選択sourceが欠落または不適格でも別receipt、未選択source、自由文、旧#1035/#1384への暗黙fallbackを行わない。現行ownerやformal successorを特定できないときは推測せずunknownのまま保持する。
- **意味判断材料**：R-15選択肢A（推奨）は、旧AAFD-R-15を既存3.0学習・限定適格化の境界へ候補追補し、LEGACY-CAND-LINE-000064の4対象と独立VERIFY/counterexample/expiry/human gateを一つずつ確認する。R-15選択肢Bはこのfacetをsource holdingに残し、L2-065本文を変更しない。000074選択肢A（推奨）は、sourceの行き先を決めずversion target未指定の独立negative oracle候補として保持する。000074選択肢Bは、適用するcurrent parent/ownerを人が特定するまでこのfacetをsource holdingに残す。推奨はR-15の3.0根拠を保ちながら000074を後版へ勝手に移さず、Future Synthesis owner/routeも推測しない。影響対象はHELIXINTELLIGENCE-L1-021〜026/L2/L11-065、採択済みL2/L11-073の外側にある自由文source条件、Future Synthesisの現行ownerが別途特定された場合の対象要求である。どの選択肢も本候補から採択・昇格・実行を生成しない。
- **facet別version targetの根拠と限界**：旧R-15自体はversionを指定しない。R-15 facetの3.0候補配置は親L1-021〜026の現行version_targetに基づき、既存3.0要求意味の採択や正式なLearning System successorを宣言しない。`LEGACY-CAND-LINE-000074` facetはsource/現行親の直接根拠がなくversion target未指定であり、R-15との同一candidate登録から版を継承しない。旧#1035/#1384は歴史source内の参照に限る。human gateは当該promotion判断の旧source条件を保持するもので、通常処理ごとの追加承認や新しい承認手続き、旧runtime起動を要求しない。


### HELIXINTELLIGENCE-L2-072: HIL-NFR-34選択source変更時のstale候補（未採択revision 005）

- **状態・親**：未採択の追補候補。親は固定確認済みの`HELIXINTELLIGENCE-L1-001/002/008/012/013/020`と、条件付き採択済み`HELIXINTELLIGENCE-L2-072`のrevision 004である。004のL2/L11本文と既存追補はそのまま保ち、この節は新しい候補partとして末尾に追加する。revision 005の提案から採択・実装・実行・dispatch権限を生成しない。
- **入力**：候補pack identity/revision、対象scope/revision、生成元snapshot identity/digest、packに選択したdependencyごとの種別（`scope`、`requirement`、`template`、`skill`、`model catalog`、`allowlist`）、source identity/revision/digest、選択・適用根拠、source owner参照、現在の適用状態とunknown/conflictを受け取る。どの種別もpackが実際に選択・参照する場合に限って当該candidateの依存として対応付ける。具体provider/model、固定template、実装schema、閾値は定めない。
- **候補能力**：候補生成またはshadow評価に使う選択済みsourceのidentity/revision/digestがsnapshot時点から変わったと分かった場合、対象pack/candidate facetを旧revisionのまま`current`または適用可能と表現しない。該当facetを`stale`として示し、source ownerへ現行revision・digestとapplicabilityを照合するために戻す。照合・候補更新・必要なshadow再評価が済むまでは、同じcandidate/shadow入力として旧facetを再利用しない。変更の適用根拠やownerが欠ける場合は`unknown`を保持し、非該当として読み替えない。
- **変更scope**：source文の六種を維持し、選択された依存に関する変更だけをこの追補のstale判定へ結ぶ。target scope/revision自体の変更も同じ候補内で照合する。packが選択していないcatalogの変更で、無関係なpackすべてをstale化する規則は追加しない。未選択かどうかを証拠で確定できない場合は`unknown`である。
- **依存4区分**：HARNESS-L2/L11-023の採択済み分類を再利用する。対象scope/revisionとpack identity/revision、実際に選択されたsource identity/revision/digestとapplicabilityは、この候補生成またはshadow operationで必要な選択入力である。評価時に選ばれた既存case/oracleはそのoperation時のみ必須。選ばれていないsourceは未観測であり、参照資料は依存へ昇格しない。欠落・unknown/staleは選択入力の適用状態を完了扱いせず、当該candidate facetを保留する。
- **保証と責務境界**：本候補が返すのはcandidate/shadow段階のsource状態と戻し先である。INTELLIGENCEは要求・設計・verification義務、対象ownerの採否、HARNESS gate、OS assignment/dispatch、SECURITYのtool authorityを生成・変更しない。後続の実dispatch可否は既存OS/SECURITY契約に従い、本候補はその条件を広げず、dispatch拒否という新しい実行義務を作らない。shadow/独立review前にcandidateを判断gateの強制規則へ昇格させない004の条件を保持する。
- **source保持と差分**：旧IR `HIL-NFR-34`の原文はsource atomとして全体を保持する。この追補が候補対応するのは、選択した六種sourceのrevision変更で該当candidateをstaleとして識別し、旧facetを再評価前にcurrent入力として再利用しない範囲だけである。snapshot/digest bindingと提案時の非権威は既存072候補の適用範囲でのみ参照する。未監査pack、tool拒否、自己検証、subagent上限、工程外completion authority、agent生成・muster全体、HR/HAC/HAT全体の閉鎖はこの追補で閉じず、`MPR-SH-IR-003#HIL-NFR-34`へ保持する。候補追加は旧sourceの意味変更やsuccessor/owner決定ではない。
- **人の判断が残る点（sourceのscope差）**：原文は`scope/requirement/template/skill/model catalog/allowlist`の変更でstaleとする。Aは六種のいずれかに変更があれば全packをstale化する読み、B（推奨）は各packが選択・使用した依存または対象scope/revisionの変更に限って該当facetをstale化し、未選択依存を未観測のままにする読みである。005候補はBを検討用に具体化したもの。A/Bの採択は人に残し、変更が影響するのは072の適用範囲、候補/shadowの再評価対象、HARNESS-L2-010/011/023との依存閉包である。どちらもOS dispatch権限や旧要求全体の採否を決めない。

#### 旧配置・採択004およびL2-076との境界（未採択revision 005）

- 旧crosswalkのHIL-NFR-34行43と`PRC-HIL-NFR-34-001`は、NFR-34全体の候補配置をOSとして記録する（後者は`authority_effect:none`、`meaning_change_applied:false`のrouting候補）。一方、PO判断記録57の85行は`HELIXINTELLIGENCE-L2-072-004`をB配置として条件付き採択し、1.0を候補生成とshadow評価までに限定する。005がINTELLIGENCE-072へ置くのは、その採択済み配置に沿った選択source staleの候補/shadow facetだけであり、row 85は005の採択・配置変更を承認していない。旧NFR-34の実行時stale判定・guardとdispatch責務は既存OS契約に残り、005から新しいOS runtime義務やdispatch gateを作らない。
- 未採択のL2-076はprovider/model/runtime/version変更をTER eventからmodel再検証proposalへつなぎ、比較・qualification evidenceを扱う。005はpackが選択したmodel-catalog sourceのrevision/digest変化で当該candidate facetをstaleとして戻すだけで、modelの適格性を再判定せず、076の採択も意味しない。model-catalogが当該packで未選択なら005では未観測のままであり、別途のqualification再検証条件は076候補の範囲に残る。
