---
title: "HELIX-INTELLIGENCE機能単位要求の受入候補"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: acceptance
status: draft
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-intelligence/L2-requirements/intelligence-requirements.md
parent_l1_candidate: docs/helix-intelligence/L1-planning/intelligence-intent.md
---

# HELIX-INTELLIGENCE機能単位要求の受入候補

本書は[HELIX-INTELLIGENCE L2候補](../L2-requirements/intelligence-requirements.md)と対になる。全項目は未実行。採択済要求・設計・実装・操作許可を生成しない。各確認では対象revision、契約/成果物/依存版、source scope、失敗時戻し先を記録し、単体成功を接続・構成体の成立としない。数値閾値はL1/PO sourceにない限り追加しない。

## 親L1・L2/L11粒度・version_target対応

| 親L1 identity | L1粒度 | L2 identity | L2粒度 | L11受入identity | 関連する接続/構成体 | version_target |
|---|---|---|---|---|---|---|
| HELIXINTELLIGENCE-L1-001 | 単体 | HELIXINTELLIGENCE-L2-001 | 単体 | HELIXINTELLIGENCE-L2-001 | なし（単体） | 1.0 |
| HELIXINTELLIGENCE-L1-002 | 単体 | HELIXINTELLIGENCE-L2-002 | 単体 | HELIXINTELLIGENCE-L2-002 | なし（単体） | 1.0 |
| HELIXINTELLIGENCE-L1-003 | 単体（source情報は接続） | HELIXINTELLIGENCE-L2-003 | 単体 | HELIXINTELLIGENCE-L2-003 | HELIXINTELLIGENCE-L2-030, HELIXINTELLIGENCE-L2-031, HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-004 | 単体 | HELIXINTELLIGENCE-L2-004 | 単体 | HELIXINTELLIGENCE-L2-004 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-005 | 単体（OS接続） | HELIXINTELLIGENCE-L2-005 | 単体 | HELIXINTELLIGENCE-L2-005 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-060 | 1.0 |
| HELIXINTELLIGENCE-L1-006 | 単体（LABO比較接続） | HELIXINTELLIGENCE-L2-006 | 単体 | HELIXINTELLIGENCE-L2-006 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-007 | 単体 | HELIXINTELLIGENCE-L2-007 | 単体 | HELIXINTELLIGENCE-L2-007 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-008 | 単体 | HELIXINTELLIGENCE-L2-008 | 単体 | HELIXINTELLIGENCE-L2-008 | HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040 | 1.0 |
| HELIXINTELLIGENCE-L1-009 | 単体 | HELIXINTELLIGENCE-L2-009 | 単体 | HELIXINTELLIGENCE-L2-009 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-010 | 単体（OS接続） | HELIXINTELLIGENCE-L2-010 | 単体 | HELIXINTELLIGENCE-L2-010 | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-061 | 1.0 |
| HELIXINTELLIGENCE-L1-011 | 単体 | HELIXINTELLIGENCE-L2-011 | 単体 | HELIXINTELLIGENCE-L2-011 | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-012 | 単体 | HELIXINTELLIGENCE-L2-012 | 単体 | HELIXINTELLIGENCE-L2-012 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-013 | 単体 | HELIXINTELLIGENCE-L2-013 | 単体 | HELIXINTELLIGENCE-L2-013 | HELIXINTELLIGENCE-L2-041 | 1.0 |
| HELIXINTELLIGENCE-L1-014 | 単体 | HELIXINTELLIGENCE-L2-014 | 単体 | HELIXINTELLIGENCE-L2-014 | HELIXINTELLIGENCE-L2-037 | 1.0 |
| HELIXINTELLIGENCE-L1-015 | 単体 | HELIXINTELLIGENCE-L2-015 | 単体 | HELIXINTELLIGENCE-L2-015 | HELIXINTELLIGENCE-L2-037 | 1.0 |
| HELIXINTELLIGENCE-L1-016 | 単体 | HELIXINTELLIGENCE-L2-016 | 単体 | HELIXINTELLIGENCE-L2-016 | HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062 | 1.0 |
| HELIXINTELLIGENCE-L1-017 | 接続 | HELIXINTELLIGENCE-L2-017 | 接続横断境界 | HELIXINTELLIGENCE-L2-017 | HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062 | 1.0 |
| HELIXINTELLIGENCE-L1-018 | 接続（current/history境界） | HELIXINTELLIGENCE-L2-018 | 単体（内部状態区分） | HELIXINTELLIGENCE-L2-018 | HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-040, HELIXINTELLIGENCE-L2-063 | 1.0 |
| HELIXINTELLIGENCE-L1-019 | 接続（BRAIN/LABO境界） | HELIXINTELLIGENCE-L2-019 | 単体（適用candidate） | HELIXINTELLIGENCE-L2-019 | HELIXINTELLIGENCE-L2-032, HELIXINTELLIGENCE-L2-044, HELIXINTELLIGENCE-L2-063 | 1.0 |
| HELIXINTELLIGENCE-L1-020 | 単体 | HELIXINTELLIGENCE-L2-020 | 単体 | HELIXINTELLIGENCE-L2-020 | HELIXINTELLIGENCE-L2-033, HELIXINTELLIGENCE-L2-045 | 1.0 |
| HELIXINTELLIGENCE-L1-021 | 単体（LABO材料接続） | HELIXINTELLIGENCE-L2-021 | 単体 | HELIXINTELLIGENCE-L2-021 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-022 | 単体 | HELIXINTELLIGENCE-L2-022 | 単体 | HELIXINTELLIGENCE-L2-022 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-023 | 単体 | HELIXINTELLIGENCE-L2-023 | 単体 | HELIXINTELLIGENCE-L2-023 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-024 | 単体 | HELIXINTELLIGENCE-L2-024 | 単体 | HELIXINTELLIGENCE-L2-024 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-025 | 単体 | HELIXINTELLIGENCE-L2-025 | 単体 | HELIXINTELLIGENCE-L2-025 | HELIXINTELLIGENCE-L2-042, HELIXINTELLIGENCE-L2-065 | 3.0 |
| HELIXINTELLIGENCE-L1-026 | 接続（LABO評価） | HELIXINTELLIGENCE-L2-026 | 単体（packet整形） | HELIXINTELLIGENCE-L2-026 | HELIXINTELLIGENCE-L2-043, HELIXINTELLIGENCE-L2-065 | 3.0 |

HELIXINTELLIGENCE-L1-017は、同じtarget revision/scopeに対する4接続の境界受入をHELIXINTELLIGENCE-L2-017で確認し、個別接続受入HELIXINTELLIGENCE-L2-036～HELIXINTELLIGENCE-L2-039はそれぞれの専用I/Oに限定する。HELIXINTELLIGENCE-L1-018/HELIXINTELLIGENCE-L1-019のL2単体受入は内部の状態区分・適用candidateを確認し、LABO/BRAINとの受渡しはHELIXINTELLIGENCE-L2-034/HELIXINTELLIGENCE-L2-040、HELIXINTELLIGENCE-L2-032/HELIXINTELLIGENCE-L2-044で別々に確認する。HELIXINTELLIGENCE-L1-026のL2単体受入は評価packet整形を確認し、LABO送達と独立効果評価handoffはHELIXINTELLIGENCE-L2-043で確認する。

HELIXINTELLIGENCE-L1-001–020は1.0（既存外部modelでの判断、model/provider/versionおよびsource由来data-use classの記録・同条件比較）、L1-021–026は3.0（LABO材料によるlocal learning/data class分離/lineage/比較/限定適格化/独立評価）で確認する。data-use classの記録は学習許可を意味しない。Concept 4.0 dynamic workflowはL2-064だけで確認し、1.0依存にしない。

## 単体の受入

[親L1 identityごとの要求・受入・version_target対応表](../L2-requirements/intelligence-requirements.md#l1からl2l11への完全対応)に従い、受入の対象revisionを固定して確認する。

| L2 identity | 成功条件・検証範囲 | 反例・不成立条件 | 失敗時戻し先 |
|---|---|---|---|
| HELIXINTELLIGENCE-L2-001 | 追加/分割/統合/退役できるdomain identityを保持し、任意列挙でない | domainを固定enumにする、domain追加を別authorityへ昇格する | domainの粒度不明はdomain編成へ戻す |
| HELIXINTELLIGENCE-L2-002 | 必要なDomain×Capabilityだけを構成し、不要能力を未設定にできる | 全domainへ全capabilityを強制する | capability/source不足は該当domainのINTELLIGENCE判断設計へ戻す |
| HELIXINTELLIGENCE-L2-003 | 全required situation fieldsとsource revision/known-unknownを集め、source正本を優先できる | sourceより古いprojectionで判断する、modelをauthorityとして使用する | 欠落/stale/矛盾は該当source ownerへ再照合 |
| HELIXINTELLIGENCE-L2-004 | fact/interpretation/hypothesis/unknownをsource/evidence付きで区別できる | AI推論を観測事実表示する、unknownを推定で埋める | source/evidence不足はsource ownerへ照合しunknown保持 |
| HELIXINTELLIGENCE-L2-005 | 計画候補にgoal/target/prerequisite/dependency/order/parallel/result/risk/uncertainty/stop/fallbackが入り、ticketはOSへ渡る | INTELLIGENCEがticket発行/割当を行う、未承認要求からplanを確定する | 要求/工程contract/current state不足は各sourceへ、ticket化不能はOSへ戻す |
| HELIXINTELLIGENCE-L2-006 | predictionにassumption/evidence/uncertainty/falsificationが付き、後の実測と区別してLABOへ渡る | predictionを実測事実扱いする、反証条件がないのに確定表示する | stale/欠落stateは該当sourceへ照合。後の実測はLABOへ渡す |
| HELIXINTELLIGENCE-L2-007 | symptomから候補原因/evidence/discrimination/追加観測へ辿れ、診断案の確度を表す | 相関一つで根因確定する、終了済み履歴から長期改善を自評する | 証拠不足/矛盾はsourceへ追加観測を戻しprobable/unknown維持 |
| HELIXINTELLIGENCE-L2-008 | finding/severity/scope/evidence/reproduction/counterexample/routeを返す | review結果だけでmerge/requirement change/release/acceptance成立とする | artifact/evidence不足は対象ownerへ戻しfindingをincomplete扱い |
| HELIXINTELLIGENCE-L2-009 | audit findingからexact HEAD/authority/producer/evidence/reproduction/falsificationへ辿れる | 自由文のみでauthority変更、UIL/TER/Future Synthesisを重複実装する | source/evidence不明は該当mechanism ownerへ再照合 |
| HELIXINTELLIGENCE-L2-010 | task capability・過去実績に応じた配置候補を出し割当はOSへ残す | price/model name/benchmarkだけで決定する、未評価をqualifiedにする | task属性不足はOSへ、Bench/evidence不足はLABOへ戻し配置案保留 |
| HELIXINTELLIGENCE-L2-011 | same corpus/responsibility scopeでfinding/FP/miss/reproducibility/latency/costを比較する | model更新名だけで優位判定、比較条件違いを隠す | 同条件corpus/scopeが揃わない場合は比較不能としてsource記録へ戻す |
| HELIXINTELLIGENCE-L2-012 | known/probable/uncertain/unknown/contradictoryと不足時の必要条件を表す | unknownをsafe/success/no-issueへ変換する | 不足evidenceはsource ownerまたはDiscovery/test/review/human decisionへ返しunknown維持 |
| HELIXINTELLIGENCE-L2-013 | 重要候補からinput revision/rules/BRAIN/evidence/model/version/uncertainty/rejected alternativesへ辿れる | 完全再生成がないことを理由に根拠を省略する、推論理由を観測へ偽装する | trace field不足はsource ownerへ照合し判断理由unknownを維持 |
| HELIXINTELLIGENCE-L2-014 | Bot identityとpurpose/scope/input/output/allowed action/stop/versionをINTELLIGENCEから分離する | Bot追加をauthority追加とする、未限定判断を恒久Botへする、Botの実作業をOS割当外で実行する | scope/manifest不足は通常判断へ。assignment/evidence不足はOSへ戻す |
| HELIXINTELLIGENCE-L2-015 | 反復failureのpattern/reproducibility/machine detectability/FP/scope/repairabilityによりBugbot candidateを作る | single failureから恒久Botを作る、機械判定性不明で昇格する | 反復/再現性/検出evidence不足は追加log観測へ戻しBugbot candidate保留 |
| HELIXINTELLIGENCE-L2-016 | repair対象のrevision/actor/write-set/side effect/budget/deadline/retry/impact/recoveryを束縛し、意味変更/未信頼/二重実行/循環/予算逸脱/不明副作用を止める | 候補/登録から包括write権限を得る、requirements/verificationを修復する、staleを適用する | target/scope/side effect不明または逸脱時はsource/SECURITY/OS ownerへ戻し修復停止 |
| HELIXINTELLIGENCE-L2-018 | current judgmentとhistorical outcomeを内部で分け、current state/authorityを上書きしない | INTELLIGENCEの自己評価またはLABO評価だけで長期改善を採択し、OS登録・対象ownerの変更手続きを飛ばす | historical evidence不足はLABOへ、current conflictはcurrent sourceへ戻す |
| HELIXINTELLIGENCE-L2-019 | BRAIN知識を根拠とする今回の適用candidateとknowledge正本を内部で区別する | INTELLIGENCE結果をBRAINへ直接writeする | applicability/source不明はBRAINへ、generic evidence不足はLABOへ戻す |
| HELIXINTELLIGENCE-L2-020 | Product Coreのmeaning/authority保持とBackflow候補を確認する | INTELLIGENCEがrequirement/design/acceptance/product meaningを変更する | backflow target/revision不明は該当Product Core ownerへ照会しcandidate保留 |
| HELIXINTELLIGENCE-L2-021 | 3.0でdomain/capability-specific local modelを作れ、万能modelを必須にしない | 3.0を1.0前提にする、model数を固定する | material/scope不明はLABOへ、job/assignment不備はOSへ戻す |
| HELIXINTELLIGENCE-L2-022 | training/validation/evaluation/holdout/prohibited classの区別と隔離を保つ | evaluation/holdoutをtrainingへ混ぜる、training fitだけで改善判定 | class/revision不明・混在はLABOへ返して当該data利用停止 |
| HELIXINTELLIGENCE-L2-023 | base/version/dataset revision/tuning/config/domain/capability/environment/eval corpus/limitation/rollback lineageが辿れる | lineage不明candidateをqualified/operationalとする | lineage不足はmodel/dataset/config ownerへ戻しcandidate保留 |
| HELIXINTELLIGENCE-L2-024 | same scope/corpusでsuccess/finding/FP/miss/reproducibility/latency/cost/resource/failure pattern比較 | newer/larger/trainedだけで昇格、条件不一致で改善判定 | 比較条件不一致は比較不能としてLABO/INTELLIGENCE source記録へ戻す |
| HELIXINTELLIGENCE-L2-025 | modelのDomain×Capability eligibilityを限定して表示する | 一領域の改善を全体へ外挿する | scope evidence不足はLABOへ戻し未評価表示維持 |
| HELIXINTELLIGENCE-L2-026 | 運用実績をscope付きeffect-evaluation packetに整形し、INTELLIGENCEが効果を確定しない | INTELLIGENCE内評価またはLABO評価だけで変更を採択し、OS登録・対象ownerの変更手続きを飛ばす | 評価material不足はLABOへ返し効果判定未完了を維持 |

## 個別接続の受入

| L2 identity | 成功条件・検証範囲 | 反例・不成立条件 | 失敗時戻し先 |
|---|---|---|---|
| HELIXINTELLIGENCE-L2-017 | 同一target revision/scopeでHELIXINTELLIGENCE-L2-036～HELIXINTELLIGENCE-L2-039のpermission/Worker/HARNESS/OS各結果を別々に保持し、未完義務を引き継ぐ | いずれかの結果で別ownerのpermission/execution/verification/acceptanceを代替する | 欠落stageのSECURITY/Worker/HARNESS/OS ownerへ戻し修復未完了 |
| HELIXINTELLIGENCE-L2-030 | HARNESS source revision/contract/evidenceをSituation Modelへ渡しsource正本を保持する | stale sourceをcurrent化する、HARNESS authorityを移す | source revision不明/staleはHARNESS sourceへ戻し再照合 |
| HELIXINTELLIGENCE-L2-031 | OS ticket/state/dependency/evidenceをOS revision付きで渡す | Situation ModelからOS stateを書き換える | stale/unknownはOS sourceへ戻し再照合 |
| HELIXINTELLIGENCE-L2-032 | BRAIN Pattern/Unit/Part/applicability/counterexampleを判断材料として受け取る | INTELLIGENCE判断でBRAIN正本を直接変更する | applicability/revision不明はBRAINへ戻す |
| HELIXINTELLIGENCE-L2-033 | Product Core/HARNESS要求・設計・検証義務を各source revision付きで受け取る | 異なるownerの意味を黙って統合する | 矛盾/ revision不明は該当Product Core/HARNESS ownerへ戻す |
| HELIXINTELLIGENCE-L2-034 | LABO評価/反例/Bench level/未評価状態をscope付きで受け取る | LABO historyから現在割当を直接更新する | 未評価/scope不明はLABOへ戻す |
| HELIXINTELLIGENCE-L2-035 | 計画/配置/診断/Review/repair候補をOSへ返し、OSがticket化・進行する | INTELLIGENCEがOS ticket/assignmentを生成する | candidate不完全/staleはINTELLIGENCEへ戻しticket化しない |
| HELIXINTELLIGENCE-L2-036 | 操作候補のSECURITY permission/constraint/revocationを照合し、authorityをSECURITYに残す | 許可を推測する、INTELLIGENCEからpermissionを変更する | permission欠落/失効/unknownはSECURITYへ戻し実行しない |
| HELIXINTELLIGENCE-L2-037 | OS assignment済みticketがWorkerへ渡り、actor/scope/resultが区別される | INTELLIGENCEをWorkerにする、OS割当を飛ばす | ticket/scope/assignment不明はOSへ戻し実行しない |
| HELIXINTELLIGENCE-L2-038 | HARNESS verification obligations/oracle/backflow conditionが修復ticketへ紐づく | repairerがverification obligationを削る/作る | 義務欠落/未達はHARNESSへ戻す |
| HELIXINTELLIGENCE-L2-039 | 修復candidate/evidence/HARNESS resultをOS acceptanceへ渡す | repair successだけでacceptanceを生成する | evidence/verification欠落は各owner/OSへ戻しacceptanceしない |
| HELIXINTELLIGENCE-L2-040 | INTELLIGENCE判断/予測/配置/修復の実績がLABO過去評価へsource-boundで返る | INTELLIGENCEが効果評価を自分で採択する | 実測/source revision不足はINTELLIGENCE/LABOへ戻す |
| HELIXINTELLIGENCE-L2-041 | 各source mechanismの個別connectorごとにscope/revisionを保持し、authority所有者が変わらない | connectorをsource間共有してidentity/scopeを混ぜる、Web/WEB-OS未採択contractを必須にする | scope/revision欠落は該当source ownerへ戻す |
| HELIXINTELLIGENCE-L2-042 | LABO data class/training/eval setが3.0材料として正しい区分・revision付きで届く | holdout/prohibited dataをtrainingへ混ぜる、3.0を1.0依存にする | data-use class/lineage不明はLABOへ戻し学習に使わない |
| HELIXINTELLIGENCE-L2-043 | 3.0 model outcome/evidenceがLABOへ返り、独立比較に使われる | INTELLIGENCE内部scoreのみで恒久改善を確定する | 比較scope/実測不足はLABOへ戻す |
| HELIXINTELLIGENCE-L2-044 | BRAIN knowledgeへの直接writeがなく、generic candidateはLABO評価経路へ行く | INTELLIGENCE判断からBRAIN knowledge自動更新 | generic化evidence不足はLABOへ戻しBRAINを更新しない |
| HELIXINTELLIGENCE-L2-045 | product meaning issueが該当Product Coreへbackflow candidateで届く | INTELLIGENCEがProduct Core正本を書き換える | backflow target不明はProduct Core ownerへ照会 |

## 構成体の受入

| L2 identity | 成功条件 | 反例・不成立条件 |
|---|---|---|
| HELIXINTELLIGENCE-L2-060 | BRAIN/HARNESS-CORE/INTELLIGENCE/OSの計画候補からOS ticketへの流れがあり、INTELLIGENCEはticketを発行しない | 4.0 workflowを1.0必須にする、OSの進行authorityを置換する |
| HELIXINTELLIGENCE-L2-061 | LABO evidence→INTELLIGENCE placement proposal→OS assignmentの三段がtask identityで追える | LABOが配車する、price/model名のみで決定する |
| HELIXINTELLIGENCE-L2-062 | SECURITY/Worker/HARNESS/OSの修復責務を同一修復scopeへ接続し全段階の証拠を別々に保つ | 修復結果でpermission/isolation/verification/acceptanceを省略する |
| HELIXINTELLIGENCE-L2-063 | LABO/BRAIN/INTELLIGENCE/OS/HARNESS間の自己改善loopで、各正本owner・効果評価を保持する | INTELLIGENCE単独で過去効果やBRAIN knowledgeを確定する |
| HELIXINTELLIGENCE-L2-064 | Concept 4.0 workflowにINTELLIGENCEを加え、plan candidateとOS progressionを分けて記録する | 4.0をINTELLIGENCE単体の権限とする、1.0前提化 |
| HELIXINTELLIGENCE-L2-065 | 3.0 learning data separation/lineage/model comparison/scope/LABO effect cycleを追跡する | learned candidateを自動交換する、3.0を1.0 preconditionにする |

## 候補状態・境界の確認

- AAFD-BR-01..04、AAFD-R-01..15は元候補のまま保持し、自由文からauthorityを生成しない。UIL/TER/Future Synthesisのownerを分け、stale/unknown projectionをassignment/release/retireへ使わない。
- BBR-R01..05とBBR-AC01..07は未採択候補のまま維持する。通常GH-FR-011内の許可済修復を一律止めず、新しいscope/write authorityを追加するなら既存owner契約とL1 authorityへ戻す。未信頼repair、write-set逸脱、stale、lease/fence競合、累積budget超過、循環、二重実行、禁止修復を反例として扱う。
- RCLS-BR-001..006はLABO責務のcandidateとして維持し、responsibility ownership/CASE-SCENE-PATTERN-LOG-VERIFY/minimal packet/staged promotion/expiry-revocation/authority non-writeを二重実装しない。
- HELIX-Bench evidenceはobserved/scored/qualified/expiredを区別し、配置候補と実割当を分ける。固定provider poolやmodel名を適格性としない。
- 3.0 local learningと4.0 dynamic workflowが未成立でも1.0判断候補の確認は可能である。3.0/4.0の結果だけで1.0 acceptedとしない。

旧runtime、旧CLI、旧test、旧CIを実行しない。status表、PR、validatorだけでPOのL1 revision確認・採択を生成しない。

### HELIXINTELLIGENCE-L2-066 配置案の人代行入力・受領契約

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **入力・版**：task/ticket identityと必要属性、Worker capability/version、LABO evidenceまたは未評価状態とsource revision/scope、L2-010 proposal schemaおよびpack contract version。
- **正常例**：INTELLIGENCE-L2-010のproposal schema/契約revisionを用いて、人が暫定配置候補を作る。実装されたINTELLIGENCEが出力できる場合はLABO-L2-055/054の同scope評価を受けて通常のLABO→INTELLIGENCE→OS三段へ戻り、INTELLIGENCEの案をOSが別途審査する。INTELLIGENCE実装を使わない場合も人の候補を同じschemaで作り、推奨Worker、根拠、除外理由、不確実性、未評価表示、source/契約revision、task/scope、actor/時点を添える。OSはreceiptに入力と受領actor/時点を記録し、assignment判断を別状態で行う。L2-010の契約本文は使うが、同機能の実装実行は依存しない。
- **反例**：人の候補をINTELLIGENCEが生成した出力または評価済み性能として表示する、source/evidenceのversionやscopeを省く、未評価をqualifiedにする、OS受領receiptなしで割当を開始する、配置案だけでauthority/scope/branchを拡張する。
- **失敗・未完義務**：ticket/task属性不足はOSへ、LABO evidence・revision・scope不足はLABOへ、schema/version不明はINTELLIGENCEへ戻す。矛盾・unknownは保持し、受領またはassignmentを成立扱いしない。
- **境界確認**：L2-066は接続と代行案のprovenanceのみを受け入れる。配置候補の意味はL2-010、LABO水準はLABO-055/054、最終指定・割当・実行はOS-018/027、人間確認はOS側のattempt記録に残る。

## 成果の内容品質に関する受入追補候補（G12）

本節は既存L2 identityのL11追補候補である。L2本文の意味・採否・owner・版範囲を変更せず、試験を実施済みとも扱わない。

### 適用方法と共通判定

各対象行は、記載する限定scopeのfixtureに対し、正常例・誤りを含む例・作成側に伏せた未見例を実施する。例ごとに、入力source/target revision、契約/成果物/依存版、capabilityと適用domain、期待する具体的な結果、判定根拠、失敗時戻し先を事前に固定し、実出力の内容を比較する。field/evidenceの存在、自己申告confidence、候補の体裁だけは合格oracleとしない。未見は未知全般を意味せず、公開していない入力組合せを同じ適用規則とscope内で評価することをいう。scope外・未構成能力・oracle不在・不足/stale/矛盾の結果は「未評価/unknown/不成立」とし、成功に補完しない。数値閾値はL1/PO根拠がないため設定せず、測定値と人が決める必要のある合否基準を分ける。

各L2 identityは単体受入。接続identityはsource/consumerの引渡しだけを別に評価し、単体結果で接続成立を導かない。以下の接続先IDはcontextであり、追補のprimary ownerではない。全行のauthority owner、戻し先、既存単体/接続/構成体の境界を維持する。1.0は既存外部modelによる判断に限り、3.0 local learning（L2-021–026）・4.0 workflow（L2-064）を前提にしない。17件の親L1はすべて完全IDで記す。

### 既存L11単体行への本文追補

下表は既存の成功条件/反例を補強する候補である。すべて未実行であり、期待結果の合格はこの文案だけでは主張しない。

| Primary L2/L11 | 親L1 full ID、粒度・scope、接続context | 受入追補本文（正常／誤り／未見と内容oracle） |
|---|---|---|
| HELIXINTELLIGENCE-L2-003 | 親: HELIXINTELLIGENCE-L1-003。単体（Situation Model、許可されたsource接続を介する）。接続context: HELIXINTELLIGENCE-L2-030, HELIXINTELLIGENCE-L2-031, HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: 固定したOS/HARNESS source revisionのtask例から、sourceにあるstate/dependency/evidenceを同じ対象へ対応づける。oracleは各値・関係・revisionが正本と一致し、ない値はunknownで残ること。**誤り**: stale projectionまたは別ticketのdependencyを混ぜた例で、誤った現在値として結合すれば不合格。矛盾を検出し該当source ownerへ戻す。**未見**: 未公開のsource field順序/欠落組合せでも識別子とrevisionで対象を混同せず、既知/unknownの対応が正本と一致すること。field一覧やtrace存在のみを成功としない。 |
| HELIXINTELLIGENCE-L2-004 | 親: HELIXINTELLIGENCE-L1-004。単体（fact/interpretation/hypothesis/unknown分類）。接続context: HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: sourceが明示した観測値、そこから導く解釈、追加仮説、欠落を含むcaseで、oracleは観測値がsourceと一致し推論/unknownを正しく分離すること。**誤り**: 推論文がsource factとして提示される、または欠落値が事実補完されると不合格。**未見**: 別source表現で同じ根拠関係を与え、事実と推論の分類が期待ラベルと一致すること。複数解釈をoracleが定めていない場合は不合格扱いにせず判定不能として基準を人へ戻す。 |
| HELIXINTELLIGENCE-L2-005 | 親: HELIXINTELLIGENCE-L1-005。単体（plan proposal）。接続context: HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-060。1.0。 | **正常**: 承認済み目標、A→B依存、独立作業C、stop条件付きtask graphで、oracleを満たす順序はA前にBを置かずCだけを独立化し、停止条件時に指定fallbackへ戻る計画。**誤り**: BをAより先にしたり、未承認要求/未充足prerequisiteを実行可能としたら不合格。**未見**: 別のheld-out graphと一つのrisk条件に対し依存順序・実現可能性・stop/fallbackが事前oracleと一致すること。INTELLIGENCEはticket/assignmentを出さず、OSへ渡すproposalであることも確認する。 |
| HELIXINTELLIGENCE-L2-006 | 親: HELIXINTELLIGENCE-L1-006。単体（事前prediction）。接続context: HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040。1.0。 | **正常**: prediction対象・target revision・scope・観測windowを先に固定し、予測された依存影響/回帰等と同じ範囲の後続実測を比較する。oracleは事前に示した結果方向/範囲と実測の一致差を記録すること。**誤り**: 回帰なし予測の対象testで既知regressionが生じる等の不一致を「成功」へ読み替えたら不合格。**未見**: 未公開change fixtureの後続実測でも事前固定predictionと比較し、scopeずれ/stale/missing実測はunknownにする。confidence/assumption欄の存在を正解扱いしない。精度threshold未決なら結果を測定値として記録し、pass/適格化は判定しない。LABOへの送達成立はL2-040で別判定する。 |
| HELIXINTELLIGENCE-L2-007 | 親: HELIXINTELLIGENCE-L1-007。単体（稼働中episode diagnosis）。接続context: HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040。1.0。 | **正常**: symptomに対して識別可能な証拠が原因Aを支持し、追加観測がA/Bを分けるfixtureで、oracleは候補/確度と観測後の支持・反証が一致すること。**誤り**: 相関一つで確定診断にする、反証を無視する、または無関係な追加検査を指示したら不合格。**未見**: 別のheld-out symptomで、原因を決める証拠が不足する場合にprobable/unknownを維持し、識別に必要な観測を示すこと。終了episodeの長期評価をINTELLIGENCEが自己評価せずLABOへ渡す境界も確認する。 |
| HELIXINTELLIGENCE-L2-008 | 親: HELIXINTELLIGENCE-L1-008。単体（指定revision/scopeのreview）。接続context: HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-040。1.0。 | **正常**: oracle ownerが仕込んだ既知must-fix欠陥を、場所/影響scope/reproductionとともに指摘し、severity・counterexample・推奨routeもfixtureの欠陥内容と適用規則に照らして一致する。clean artifactでは裏付けのないfindingを出さない。**誤り**: seeded欠陥miss、またはclean例への誤指摘、誤severity、反例の取り違え、誤routeをそれぞれfailureとして判定する。**未見**: 未公開の別位置/表現の欠陥とclean caseを、明示したreview ruleの適用範囲内で評価し、oracleに照らして真陽性/見逃し/不要指摘を分類する。scope外欠陥は未評価として記録する。finding単独でmerge/requirement change/release/acceptanceを作らない。 |
| HELIXINTELLIGENCE-L2-009 | 親: HELIXINTELLIGENCE-L1-009。単体（指定機構・HEAD・authority/evidenceを対象にした監査finding）。接続context: HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: oracleで既知のauthority/design-runtime mismatchを置き、対象HEAD・producer・source・evidence・reproductionを該当箇所へ辿り、ownerを正しく示す。各findingを反証する条件とその証拠へのtraceもfixtureのfalsification oracleへ照合する。**誤り**: 別HEAD/sourceへ結びつける、根拠なしfinding、別findingの反証証拠を結ぶ、反証traceを欠く、またはfinding文からauthorityを変えると不合格。**未見**: 未公開の別mismatch類型でも、監査対象scope内のevidenceとowner routeがoracleと一致すること。証拠を取れない項目はunknownで戻し、AAFD等の既存owner機能を重複実装しない。 |
| HELIXINTELLIGENCE-L2-010 | 親: HELIXINTELLIGENCE-L1-010。単体（ticket別placement proposal）。接続context: HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-035, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-061。1.0。 | **正常**: task capability/tool/domainと同scopeの実績とLABO HELIX-Benchの作業種別・model class別水準/根拠を示し、候補Workerの条件適合をexpected evidenceで照合する。oracleは適合条件と配置案理由が実績およびBench task-class evidenceの適用範囲に合うこと。**誤り**: price/nameだけの順位、scope外実績の適用、未評価Workerのqualified扱い、Bench作業種別/適用範囲の不一致を無視した配置案を不合格とする。Bench水準が未評価なら候補も未評価を保ち、証拠不足はLABOへ戻す。**未見**: 未公開task/worker profile組合せで適合scope内の候補だけを提示し、証拠がなければ未評価を保つ。OSがassignment/進行を行うことを確認し、INTELLIGENCEのproposalを実割当成功としない。 |
| HELIXINTELLIGENCE-L2-011 | 親: HELIXINTELLIGENCE-L1-011。単体（同一corpus/responsibility scopeのmodel/provider比較）。接続context: HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: current/candidate双方へ同じtask corpus/task snapshot・scoring version・run protocol・hardware classと独立oracleを適用し、実際のfinding、FP、miss、再現性、latency、costの比較値がrun記録と一致する。cacheや手介入を含む実行条件を揃え、費用にはpricing source/currency/effective timestamp/charging classを結び付ける。**誤り**: corpus/version/scope/protocol/hardwareやcache/手介入条件の違いを隠して同条件比較とする、価格根拠の違い・欠測を隠す、miss/FPを落とす、またはversion名だけで優位判定すれば不合格。**未見**: held-out例についても事前に同条件化した比較からscope別実績を出し、比較条件欠落は比較不能にする。データがない指標はunknownであり順位や一般優位を生成しない。 |
| HELIXINTELLIGENCE-L2-012 | 親: HELIXINTELLIGENCE-L1-012。単体（判断結果の不確実性状態）。接続context: HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: 十分な一致証拠ならknown、適用規則の下で一候補を支持する限定証拠ならprobable、複数の可能性を絞れない不確実性が残る例ならuncertain、両立しない証拠ならcontradictory、判断材料なしならunknownを返すfixtureで、oracleの状態と追加証拠要求に一致する。**誤り**: unknownをsafe/success/no-issueへ、または相反証拠を単一factへ変換すると不合格。fixtureでuncertainと定めた例をprobable/knownへ縮める誤りも識別する。状態境界自体の規則が未定なら判定不能として戻し、数値閾値を新設しない。**未見**: 未公開のmissing/stale/conflict組合せで状態を適切に保ち、解消に必要なsource/Discovery/test/review/human decisionを示す。閾値未定の確率を勝手に分類基準としない。 |
| HELIXINTELLIGENCE-L2-013 | 親: HELIXINTELLIGENCE-L1-013。単体（重要判断proposalの根拠trace）。接続context: HELIXINTELLIGENCE-L2-041。1.0。 | **正常**: 一つの判断のsource revision、rule、observation、assumption、model/version、uncertainty、rejected alternativeから、各主張が実source/推論のどちらに由来するか照合できる。**誤り**: sourceにない事実をtraceへ結びつける、または異版をcurrent根拠として提示したら不合格。**未見**: 未公開の別判断traceでも各根拠edgeを原sourceへ辿り、欠落箇所をunknownとする。完全再生成やtrace field存在だけを要求/合格にしない。data-use class記録はtraining許可でない。 |
| HELIXINTELLIGENCE-L2-014 | 親: HELIXINTELLIGENCE-L1-014。単体（限定purposeのBot manifest/候補とhandoff）。接続context: HELIXINTELLIGENCE-L2-037。1.0。 | **正常**: 反復可能でscope・入力・判定条件・停止条件が限定されたtaskに、事前oracleと一致するBot purpose/input/output/allowed action/stopのmanifestを作る。**誤り**: scope外操作/停止後実行、またはmanifestからauthorityを追加したら不合格。**未見**: 未公開の別task例で、限定不能な判断を通常INTELLIGENCE proposalへ戻し、Bot化しない判断ができること。manifestだけでworker実行/OS assignmentが成立せず、実作業はOS割当Workerへ戻す。 |
| HELIXINTELLIGENCE-L2-015 | 親: HELIXINTELLIGENCE-L1-015。単体（反復failureからのBugbot candidate）。接続context: HELIXINTELLIGENCE-L2-037。1.0。 | **正常**: 同じ範囲で繰返し観測・再現できるfailure pattern fixtureに、同じ規則で検出しscopeに適合するcandidateを作る。oracleは別episodeでpattern再現し、指定reproductionと検出結果が一致すること。**誤り**: single failureを恒久Bot化、変異した非該当例まで検出、またはfalse positiveを無視すれば不合格。**未見**: 未公開の別実装表現で同一failure patternと近似するclean例を提示し、pattern検出と誤検出を内容照合する。ログ/再現材料不足ならcandidate保留。repairability unknownを成功としない。 |
| HELIXINTELLIGENCE-L2-016 | 親: HELIXINTELLIGENCE-L1-016。単体（scope-bound repair candidateと適用結果）。接続context: HELIXINTELLIGENCE-L2-036, HELIXINTELLIGENCE-L2-037, HELIXINTELLIGENCE-L2-038, HELIXINTELLIGENCE-L2-039, HELIXINTELLIGENCE-L2-062。1.0。 | **正常**: 固定target revision、許可actor/write-set、限定side effect/budget/retry/recovery付きの既知局所欠陥に対する修復候補とOS割当Workerの修復結果を受け取り、修正後に元のtest/oracleが通り要求/設計/verification obligationが同一であることを照合する。**誤り**: seeded counterexample未修正、既存正常case退行、write-set逸脱、義務変更、二重実行なら不合格/停止。**未見**: 未公開の同scope variantで同じ既存oracleを再実行し、回帰なしを確認。新たな種類やscope外の問題は未評価として止める。SECURITY許可、Worker実行、HARNESS検証、OS検収は別stageであり、単体品質から接続成功を導かない。 |
| HELIXINTELLIGENCE-L2-018 | 親: HELIXINTELLIGENCE-L1-018。単体（current judgmentとhistorical outcomeの内部区分）。接続context: HELIXINTELLIGENCE-L2-034, HELIXINTELLIGENCE-L2-040, HELIXINTELLIGENCE-L2-063。1.0。 | **正常**: current source revisionの状態と過去episodeのLABO評価を同時に与え、oracleはcurrentを現行ラベル、過去評価をhistoricalに保持し、current正本を上書きしないこと。**誤り**: 古い成功評価でcurrent authority/stateを更新、またはINTELLIGENCE自己評価で長期改善確定なら不合格。**未見**: 未公開の遅延/out-of-order outcomeでも対象episodeとrevisionを区別し、欠落はhistorical unknownにする。LABOへの受渡し・受領は専用接続で別判定する。 |
| HELIXINTELLIGENCE-L2-019 | 親: HELIXINTELLIGENCE-L1-019。単体（BRAIN knowledge適用candidate）。接続context: HELIXINTELLIGENCE-L2-032, HELIXINTELLIGENCE-L2-044, HELIXINTELLIGENCE-L2-063。1.0。 | **正常**: applicability条件を満たすPattern/Unit/Partとcurrent situationを与え、candidateの適用理由・対象scopeがoracleと一致し、知識正本は変化しない。**誤り**: applicability exception/counterexample成立時も適用する、またはINTELLIGENCEからBRAINへ直接writeしたら不合格。**未見**: 未公開の近似状況で適用条件境界を照合し、条件不明はBRAINへ戻す。generic化候補はLABOへ送る別責務であり、単体判定に含めない。 |
| HELIXINTELLIGENCE-L2-020 | 親: HELIXINTELLIGENCE-L1-020。単体（Product Core meaning finding/backflow candidate）。接続context: HELIXINTELLIGENCE-L2-033, HELIXINTELLIGENCE-L2-045。1.0。 | **正常**: 製品固有requirement/designとrevision/ownerに、oracle既知の意味不整合を仕込み、findingと候補戻し先が該当owner/意味を変える層に一致する。**誤り**: INTELLIGENCEがrequirement/design/acceptance/product meaningを直接変更、または誤ownerへbackflowすれば不合格。**未見**: 未公開の別不整合でも根拠scopeと正しい候補先を識別し、target/revision不明ならcandidate保留とする。接続受渡しはL2-033/045の個別条件で別判定する。 |

### capability網羅・境界

指定17 identityの全件は上表に1回ずつ出現する（003,004,005,006,007,008,009,010,011,012,013,014,015,016,018,019,020）。L2-002のDomain×Capabilityは全domainへ全capabilityを強制しない。能力が構成済みのdomain/scopeにのみ該当行を適用し、未構成は欠落能力と見なさない。Understandは003/004/013/018/019/020、Planは005、Predictは006/011、Diagnoseは007/015/016、Review/auditは008/009/011、Recommendは010/014/019/020とする。横断情報（012 uncertainty、013 provenance、018 time boundary）は各能力行を置換しない。能力間の説明・handoffがfixture scope内にある場合だけ関連行を組み合わせ、全域包括保証を導かない。

L2-017は接続横断境界であり本追補の17件ではない。L2-030–045のconnectorおよびL2-060–065構成体も本案では変更せず個別の接続/構成体受入に残す。L2-021–026の3.0 learning、L2-064の4.0 workflowを1.0 oracleの依存にしない。品質oracleが未定義、対象fixtureを作れない、期待判定の人選択が未了の場合は、L11をpassにせず、scope/fixture/未決値を記録して該当ownerへ戻す。

### 原文と旧資産

[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第4項、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)を起点とする。旧VDH-FR-004〜013 / AC-004〜013の設計義務・対の検証・変更影響、旧UWJ-FR-002〜014 / AC-002〜014の判断・配分のproposal境界と品質計測、旧Bench R-03〜08 / AC-003〜014のtask/oracle/条件を固定した結果比較を読み、正常・誤り・未見の限定fixtureで内容を判定する受入へ再導出する。旧schema・runner・閾値・runtimeは移植/実行しない。

- `LEGACY-ASSET-335176749F6322C3CD8D`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:42–51`、SHA-256 `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d`。
- `LEGACY-ASSET-879D95C07B789C9502CF`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:20–29`、SHA-256 `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191`。
- `LEGACY-ASSET-5EE032D657C221184B00`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:46–58`、SHA-256 `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b`。
- `LEGACY-ASSET-6FFD7F4E58066D08B053`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:18–30`、SHA-256 `1c4e07263eba5254cfe66b920c4baf46227e0e07cb47ff60ac2e854740645db3`。
- `LEGACY-ASSET-28FB139B26CD61CC51EE`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76–147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`。
- `LEGACY-ASSET-A952A3A175EB82A4781B`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30–41`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`。
