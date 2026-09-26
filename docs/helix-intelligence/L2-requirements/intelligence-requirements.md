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
