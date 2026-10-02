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

## 効果判定の優先関係に関する受入追補候補（G13）

[LABOの比較評価候補](../../helix-labo/L2-requirements/labo-requirements.md) HELIXLABO-L2-059および[INTELLIGENCEの配置入力契約候補](../../helix-intelligence/L2-requirements/intelligence-requirements.md) HELIXINTELLIGENCE-L2-067との責務境界を保持する。対象scopeに有効な品質・優先・許容悪化の判断は再利用し、未決・失効・適用境界外のみ判断ownerへ戻す。本追補は未実行の受入候補であり、実測改善や要求採択を生成しない。

| 対応要求 | 合格条件 | 反例 |
|---|---|---|
| `HELIXINTELLIGENCE-L2-010` L11補強（単体、parent `HELIXINTELLIGENCE-L1-010`; input-contract context candidate `HELIXINTELLIGENCE-L2-067`） | 既存L2-010のplacement proposalが、入力契約候補L2-067で定めるscope/revision有効なquality gate・priority/toleranceと、既存L2-034経由のLABO比較材料を使い、Worker/effort候補の理由・除外・不確実性・未評価を示す。proposalはOS assignment/進行へ別handoffする。 | 価格/model/benchmark単独で決める／必要品質未達・unknown・未評価を隠す／既決decisionが適用境界内なのに毎run確認を求める／proposalが割当・実行許可になる／human interventionを除いた費用を総費用として扱う。 |
| `HELIXINTELLIGENCE-L2-011` L11補強（単体、parent `HELIXINTELLIGENCE-L1-011`） | 同一corpus/responsibility scope、quality oracle、run version/protocolを揃え、findings/FP/miss/reproducibility/latency/costとrescue/rework/human interventionを別々に比較する。baseline/current/candidate/hybridは実験条件、HELIXなし/旧/新はcohortとして別軸に保持する。priority/toleranceのない指標に勝敗を付けず、必要scopeの結果に限定する。 | model更新名や価格だけで上位認定／同条件でない結果を順位化／救援・人修正を除外／欠測費用をゼロとする／比較結果から自動差替えする。 |
| `HELIXINTELLIGENCE-L2-067` L11受入補強（単体候補、primary parent `HELIXINTELLIGENCE-L1-010`, comparison context `HELIXINTELLIGENCE-L1-011`） | scope/revision有効な決定・quality oracleと、HELIXINTELLIGENCE-L2-034経由で受けた比較材料が、既存L2-010 placement proposalの根拠・適用範囲・未評価状態を保ったまま使われる。LABO035→INT034の送受契約版・互換範囲・scopeが一致し、LABO052で同一結果の受領receiptを追跡できる正常例を確認する。不一致・欠落例は未受領/未評価のままsourceへ返す。決定が未決/失効/範囲外なら提案を確定せずownerへ戻す。 | 決定値が異なるscopeに適用される／L2-034のsource/scope/revisionが失われる／LABO035とINT034の契約版・互換範囲不一致や未受領receiptを選択根拠にする／入力契約候補が新engine、assignmentまたはworker/model切替になる。 |

### HELIXINTELLIGENCE-L2-068 作業中Workerへの診断・設計/テスト支援候補の受入（単体候補）

- **入力・版**：元Workerの有効ticket/scopeまたは着手予定assignment、approved requirement/design revision、HARNESS-L2-022の事前oracle、source/use contractを共通入力とする。failure/詰まりのsourceは全operation共通の必須入力ではない。事前test・指示準備ではfailure報告がなくても候補を作成できる。詰まりの診断や既発生failureの原因推定を行うoperationでは、その症状・観測・再現材料と出典を追加入力として求める。INTELLIGENCEは有効なoperation別入力があれば支援候補を単独で返せること。HELIXOS-L2-028の実相談完了/HELIXOS-L2-029のloop成立を候補生成の依存にしない。`version_target: 1.0`。
- **正常例とoracle**：作業開始前、`PATCH /applications/{id}`の実装ticketと、`draft`申請は許可・保存され、`approved`申請は編集拒否・保存値不変とする承認済み要求/API状態遷移設計、HARNESS-L2-022の既存oracleを受け取る。失敗報告や過去failure例がまだなくても、要求とoracleからtest candidateを準備できる。validator設計/codeや他の過去例を実際に選択した場合は出典identity/revision/scopeを付す。candidateは`draft`更新の許可・永続化、`approved`更新の拒否・永続値不変、境界値および無関係なfieldへの副作用を区別する。別途、診断operationとして`approved`状態へのPATCHが200を返した観測とrequest/responseまたは再現材料を受けた場合は、その証拠に結び付けて症状・仮説・unknownを分け、必要なら相談問いを「approved判定の契約と拒否時にDBを書換えない条件を確認」に限定する。受入oracleは、準備candidateが要求条件にtraceし、診断candidateは入力された観測を越えて原因を断定せず、未知のoracle差分はHARNESS ownerへ戻し、INTELLIGENCE自身がtestを実行/承認しないことである。
- **誤りを含む例**：似たコードの過去例から「approvedでも編集可」と助言し要求意味を拡張する、過去例のsource/版/適用scopeを落とす、相談が必要な未知入力を推測、INTELLIGENCEが新しいaccepted oracleを確定する、支援者のtest作成結果を独立reviewに使う。oracleは候補にmissing/contradictory sourceとして表示し、正しいownerへBackflowし、requirement/oracleを勝手に変更しないこと。
- **未見例**：別のendpoint/state modelで類似の承認後不変条件が現れるが、同じoracleの適用性や更新操作の副作用が不明。INTELLIGENCEは必要なrequirement/design evidence、oracle ownerへの質問候補、適用可能性unknownを返し、generic ruleやpassを作らない。
- **出力oracle**：selected source, assumption, observed fact, inference, uncertainty, alternative, return targetと、候補にしたtest caseが対象requirement/oracleへ追跡できる。AIDOC/CLR-R06 packet利用時にはsource authority/revisionと必要情報を維持し、secret/private reasoning/未承認結論をpacketへ注入しない。
- **相談/実行/独立review境界**：INT単体の相談案作成は合格可能だが実相談は未成立である。実相談はHELIXOS-L2-028のreceipt、元Workerの変更・検証までの一周はHELIXOS-L2-029、OS管理下のoracle/test実行はHELIXOS-L2-020、oracle/段階/受入契約はHARNESS-L2-022により別評価する。元Worker/助言者/支援者を同じ作業の独立reviewerに数えない。
- **失敗・未完義務**：共通入力、選択source/version/authority/oracle applicabilityが欠ける場合、または診断operationに必要な症状・証拠が欠ける場合、そのoperationのcandidateを保留し不足とownerを返す。ただし診断証拠の欠落を理由に、入力が揃った事前test/指示準備candidateまで保留しない。実相談の返答やworker change、評価結果がない候補を有用・採用済みと断定しない。

## G17 条件付き設計model計算・接続・比較の受入候補

対象candidateはHELIXINTELLIGENCE-L2-069／HELIXINTELLIGENCE-L2-070／HELIXINTELLIGENCE-L2-071（各`version_target: 1.0` candidate）。以下は未実行の内容oracle案であり、受入fixtureの小さな有限modelに対する独立計算との一致、revision/provenance、未対応範囲を判定する。このfixture oracleは通常scenario計算に期待結果を要求するものではない。通常計算はsource-bound model/rule/単位から算出し、trace・unknownを返せる。独立oracleはこのL11 fixtureと、利用者が期待結果を指定して照合を求める検証operationでのみ必要となる。fixture入力modelのsource/owner、schema・rule版、scenario・scope・単位・oracleを先に固定し、説明文・trace fieldの存在を合格にしない。合格は実機性能保証、実環境/Worker変更、設計採択、L1/L2承認を生成しない。

### HELIXINTELLIGENCE-L2-069 unit — 有限modelの条件付き計算

**親L1候補**：`HELIXINTELLIGENCE-L1-003`, `HELIXINTELLIGENCE-L1-004`, `HELIXINTELLIGENCE-L1-006`, `HELIXINTELLIGENCE-L1-013`。**scope**：一つのsource-bound model revision、単位付き条件、有限状態/edge/工程/負荷window。

**正常例（利用量増加と数値oracle）**：小さなqueue modelを与える。状態`q`は各step開始時のqueue件数、各stepのservice上限は8件、処理数を`served=min(q+arrival,8)`、終了queueを`q_next=q+arrival-served`とする。初期`q=0`。baselineは到着5件/5件、scenarioは5件/10件で、同じservice rule・scope・windowを使う。独立算術oracleはbaselineの処理数5/5・終端`q=0/0`、scenarioの処理数5/8・終端`q=0/2`である。INTELLIGENCEの遷移trace・処理数・最終queueが同じmodel/rule版から一致し、「詰まり」は2step目以降のqueue増として示す。queue初期値・処理能力・1step時間が与えられていなければ時間や費用を数値化せずunknownとする。

**正常例（DB断伝播）**：modelには`DB=available`からevent`database_disconnected`で`DB=unavailable`へ移る規則、`order_processor requires DB.available`のedge、`order_processor→order_tx=waiting_for_db`のfailure遷移、`retry_queue`への未完数移送規則を明記する。独立graph-walk oracleは、イベントを受けたorder処理だけが`waiting_for_db`になり規則どおりretry queueへ移ること、DB依存edgeのない`reporting` branchのstateは変化しないことを期待値とする。recovery ruleがなければDB復旧・retry成功を生成せずblockedで終える。

**正常例（仮想Worker 2→4・bottleneck/時間/費用oracle）**：同一load 18 jobs、1仮想Worker service rate 3 jobs/min、shared DB ceiling 8 jobs/min、throughput=`min(worker_count×3,8)`、worker rate 0.20 credit/(worker·min)、DB rate 0.10 credit/min、線形同時処理・稼働時間は全work完了まで、queue/overheadなしと全入力されたscenarioを使う。独立計算は2-worker時 throughput 6 jobs/min、elapsed 3 min、cost `(2×0.20+0.10)×3=1.50 credits`、4-worker時 throughputはDB bottleneckの8 jobs/min、elapsed 2.25 min、cost `(4×0.20+0.10)×2.25=2.025 credits`。時間差 -0.75 min、費用差 +0.525 creditsとなる。4-workerで2倍速とせず、shared DB上限が律速であり費用は増えるとtraceと比較結果に示す。これら数値はfixtureの単位・係数から出た算術であり、製品閾値・実環境性能・価格主張ではない。worker countはsimulation inputだけでOS assignmentや実worker数は変わらない。

**誤りを含む例**：別revisionのservice capacityとcost rateを混ぜる、unit変換なしに秒/分や通貨を比較する、shared DB ceilingを落としてworker追加を2倍速とする、DB failure edgeのないreporting branchまで失敗にする、未定義recoveryを自動補完する、AI explanationをtransition evidenceとして出す、予測を実測と表示する場合は不合格。根拠不足箇所はunknown/unsupported/blockedを保つ。

**未見例**：作成側に伏せた別queue modelまたは未見の状態名・dependency field・failure edge順序を与え、独立した小規模interpreter/graph-walk oracleで結果を照合する。schema/ruleの適用範囲内ならstate mapping、計算値、影響先がoracleと一致し、未対応要素は局所unknownで残る。未知domain/edgeに対する説明の説得力やconfidenceだけで評価成功・一般適用をclaimしたら不合格。

### HELIXINTELLIGENCE-L2-070 connection — CORE inputとLABOへの結果hand-off

**正常例**：Product Core/HARNESSからのmodel・requirement/design・工程contract/verification obligation receiptについて、HELIXINTELLIGENCE-L2-033のsource identity、owner、model/design revision、connector contract版、scopeが一致するinputを受ける。receiptは入力・計算・送達・受領の段階ごとに分ける。HELIXINTELLIGENCE-L2-033 input receiptを先に記録し、HELIXINTELLIGENCE-L2-069 resultを同一source revision/scenario identityに束ねた後でのみ、HELIXINTELLIGENCE-L2-040 contractを通してLABOへ送る。HELIXLABO-L2-024 consumer receiptは送達後の独立段階で受ける。HELIXLABO-L2-024に届くreceiptには仮想calculationのsource revision、scenario・model rule版、対象scope/window、prediction/simulated status、assumptions・unknownが残り、LABO側の受領identity・版と往復照合できる。後の実測は別source revision/observationとして同じscenario keyへの関連を示し、当初のsimulation resultを書き換えない。独立期待値はsource/consumer fixture receipt ledgerとの照合であり、単なるfield存在ではない。

**誤りを含む例**：別product/model revisionのCORE inputを結ぶ、HELIXINTELLIGENCE-L2-033の許可scope/connectorを飛ばす、source design authorityをINTELLIGENCEに移す、HELIXINTELLIGENCE-L2-040／HELIXLABO-L2-024 receiptの版/相関ID/対象scopeを混ぜる、仮想結果をWorker実測として送る、LABO受領がないのにhand-off済みとするなら不合格。現行HELIXINTELLIGENCE-L2-033 payloadが要るtyped model relationを提供しない部分は不足としてsource/contract ownerへ戻し、candidateのみで新fieldを既成契約に追加しない。

**LABO側の境界例**：HELIXLABO-L2-006はOS assignmentに従うWorkerの実験実行と、同一experiment/target versionの結果比較を扱う。simulation receiptだけを渡したcaseでは、実Worker runが存在しないため「実験実行済み」「実測比較済み」としない。predictionと後日実測の比較には既存HELIXINTELLIGENCE-L2-006 L11 oracleを再利用する。同じtarget revision/scope/windowで予測方向/範囲と実測の一致差を記録し、既知regressionの誤予測を成功扱いしない。数値精度閾値に有効なscope decisionがなければ測定値だけを記録してpass/適格化を判定しない。HELIXLABO-L2-024は受領evidence、HELIXLABO-L2-006は実験/実測と独立評価のownerを保ち、INTELLIGENCEは自己採点しない。

**未見例**：未公開schema版や遅延/重複/out-of-order LABO receiptを与える。version/compatibility/scopeが一致するreceiptだけを受領に紐づけ、重複を重複eventとして識別し、欠落・stale・未対応consumer fieldはnot_received/unknownとして残す。共通schemaの一例から他source/製品へのcompatibilityを外挿しない。

### HELIXINTELLIGENCE-L2-071 composite — 条件変更→計算→比較

**正常例（受入fixture）**：最初にHELIXINTELLIGENCE-L2-033の入力receiptで同一model revisionとscenario条件を固定する。baselineは2stepの到着5/5、負荷増scenarioは5/10、各stepのservice上限は8とし、HELIXINTELLIGENCE-L2-069のqueue oracleを適用する。その後に利用load増、DB断、仮想Worker 2→4を別々のscenario runとして計算し、計算結果ができてからHELIXINTELLIGENCE-L2-070を使いHELIXINTELLIGENCE-L2-040送達、HELIXLABO-L2-024受領へ進める。HELIXINTELLIGENCE-L2-069のqueue/graph/numeric oracleに各runを照合し、HELIXINTELLIGENCE-L2-071 bundleでは①変更した条件と不変条件、②順序付きstate/impact propagation、③各scenarioのqueue/bottleneck/blocking state、④数値化できる時間と費用・baseline差、⑤未解決のsource/coefficients/edge、⑥LABO向けsource-bound結果receiptを一つのscope付き比較表で追える。上記worker fixtureなら2→4の見かけの容量増よりDB ceilingが支配し、completionは3 minから2.25 min、費用は1.50から2.025 creditsへ変化するという独立算術oracleに一致する。DB断例では明示edge上のorder processのみblockedとなり、recovery未定義を維持する。単体calculationとconnectionが通ってもcompositeのscope/比較/receiptが不一致なら不合格。この受入oracleはfixtureの期待値であり、通常scenarioに期待値がない場合も計算結果・trace・unknownを返せる。

**誤りを含む例**：baselineとscenarioで異なるmodel/revisionを使う、複数scenario間で共通の単位/係数/時間windowを確認しない、Worker数を実資源設定と見なす、DB failureからモデルにないrollback/retry/recoveryを作る、影響edge外へfailureを伝播する、未定義のcostを0とする、単体結果を実測/LABO評価済みとする場合は不合格。該当scenarioだけをholdし、他の有効scenarioも依存関係を保って報告する。

**未見例**：held-outの有限modelで、既知構造と新しいdependency/failure edgeが混在するfixtureを与える。明示ruleの範囲内のfixture scenario結果は独立oracleに照合し、未見edge/domainはunknown/unsupported、後の実測receiptなしは未比較とする。通常scenarioで期待結果が指定されていない場合、独立oracleなしでも適用可能な明示ruleから計算し、unsupported箇所をunknownとして返す。実測比較にはHELIXINTELLIGENCE-L2-006 L11 oracleを使い、数値閾値のscope decisionがなければ測定値のみを記録して合否を付けない。良好な小規模fixtureだけで精密・汎用simulation適格を宣言しない。

### 共通依存区分・scope

HELIXINTELLIGENCE-L2-069／HELIXINTELLIGENCE-L2-070／HELIXINTELLIGENCE-L2-071ごとにHARNESS-L2-023の4区分を利用条件・operation単位で閉じる。HELIXINTELLIGENCE-L2-069はHELIXINTELLIGENCE-L2-033 input receiptのみを計算入力に要し、HELIXINTELLIGENCE-L2-070全体の送達完了を前提にしない。HELIXINTELLIGENCE-L2-070はHELIXINTELLIGENCE-L2-033 input→HELIXINTELLIGENCE-L2-069 result→HELIXINTELLIGENCE-L2-040 send→HELIXLABO-L2-024 consumer receiptの独立段階、HELIXINTELLIGENCE-L2-071はHELIXINTELLIGENCE-L2-033入力→計算→result送達→consumer受領の順で成立を判定する。

- **常時必須**：適用するHARNESS-L2-010/011 pack identity・契約revision・scope・provenance、対象Product Core/model source identityとrevision、HELIXINTELLIGENCE-L2-003／HELIXINTELLIGENCE-L2-004／HELIXINTELLIGENCE-L2-012／HELIXINTELLIGENCE-L2-013のfact/推論/unknown/trace条件、シミュレーション結果を実測にしない区分と停止条件。connection operationにはHELIXINTELLIGENCE-L2-033 input、HELIXINTELLIGENCE-L2-040 result handoff、HELIXLABO-L2-024 consumer contract/receiptを段階ごとに含む。
- **特定操作時のみ必須**：数値時間/費用は単位付きrate/price/effective time、DB断はfailure/propagation/recovery rule、Worker scenarioは仮想capacity/shared-resource ceiling/schedulerを要する。L11受入fixtureと利用者が期待結果を指定した検証operationでは独立oracleを照合条件に含める。通常scenario計算には期待値oracleを要求せず、明示model/ruleから算出した結果・trace・unknownを評価する。後続actual comparisonはsource receiptと既存HELIXINTELLIGENCE-L2-006 L11比較oracleが操作条件として必要。HELIXLABO-L2-024は受領evidence、HELIXLABO-L2-006は実験/実測と評価のownerを保つ。条件のない利用には数値計算やactual comparisonを必須化しない。
- **選択した入力元に応じて必須**：選択model, baseline, load, price/capacity, failure event, later observationのidentity/version/scope/provenance/access契約。未選択sourceは未観測。別製品、branch、環境、Worker telemetryへ黙ってfallbackしない。
- **参照資料のみ**：背景説明・例題・未選択pattern。source/design authority、model/rule revision、unit/price/source、data-use/security条件を参照資料扱いに落とさない。独立期待値oracleはL11受入fixtureまたは期待結果付き検証operationでその照合条件となり、通常scenario計算には必須にしない。

**受入範囲外／未解決**：高精細な物理simulation、未入力の条件を推定補完する万能model、HARNESS-COREから独立した汎用model正本、OSの実worker配賦/起動や実環境/resource configuration変更、モデルが存在しないdomainへの外挿はこのcandidateに含めない。後続実測比較は既存HELIXINTELLIGENCE-L2-006 L11 oracleを使い、HELIXLABO-L2-024が受領evidence、HELIXLABO-L2-006が実験/実測の独立評価を所有する。数値精度閾値に有効なscope decisionがない場合は測定値を記録し、pass/適格化を判定しない。新能力や一律のPO問合せを要求しない。

## R2187-01：1.0能力別の未見結果oracle追補

この追補はG12 PO判断が求める内容oracleを、監査で指定された1.0対象だけ具体化する。各fixtureは対象IDの能力とscopeを固定し、正常・誤り・未見入力について結果の意味を照合する。項目やreceiptの存在だけでは合格にしない。source authority、各owner、既存L2条件、操作ごとの依存を維持する。適用scopeまたは宣言済み互換範囲の外、または判定基準が未決の結果はunknown/未評価として該当ownerへ戻し、万能能力を主張しない。

| L2 identity | 正常例と期待結果 | 誤り例と期待結果 | 未見例と期待結果 |
|---|---|---|---|
| `HELIXINTELLIGENCE-L2-001` | 「deployment」「incident response」の二領域と各責務記述を渡す。出力は別domain identityを保ち、共有責務だけを明示する。 | 二つの責務を一つのdomainへ無根拠に統合する入力では、統合を確定せず衝突箇所を示す。 | 未fixtureの「data governance」を追加する入力では新しいdomain候補と根拠を返し、責務定義のないcapabilityを割り当てない。 |
| `HELIXINTELLIGENCE-L2-002` | 構成済みの「deployment × Plan/Diagnose」だけを有効化する。別domainに未選択能力を補わず、構成どおりの組だけを実行対象にする。 | 「各domainに全能力を適用」とする入力は、選択契約に反すると指摘し全能力を自動有効化しない。 | 新しいdomain/capability組合せで、設定に定義済みならその組だけを評価し、未定義ならunknownとして構成ownerへ返す。 |
| `HELIXINTELLIGENCE-L2-017` | 同一target revision/scopeについて、SECURITY permission、Worker実行結果、HARNESS検証、OS検収の別々の証拠を受ける。操作時点で有効だったpermissionと、その後の失効時刻を区別し、各段階の対応する証拠がそろった場合だけ完了する。 | 実行時点ですでに期限切れ/revoked、または別scopeのpermissionで実行した場合は不許可として扱い、完了にしない。HARNESS obligationが欠落した修復成功もOS検収済みに昇格させずHARNESS/OSへ戻す。 | 未見の段階順序では対象scopeとreceiptを照合する。後日失効したpermissionでも、実行時点に有効であった記録があれば過去の実行証拠として保持し、後日の失効で消去しない。実行時点のauthorityが確認できない場合だけ当該段階を保留する。 |
| `HELIXINTELLIGENCE-L2-030` | HARNESSのrequirement/design revisionとcontract receiptを同じsource identityでSituation Modelへ反映し、HARNESSを正本ownerとして残す。 | 古いcontract receiptをcurrentとして使おうとした場合、staleと判定し、設計義務を上書きせずHARNESSへ戻す。 | 未見の互換version pairは、宣言済みcompatibility範囲に含まれる時だけ接続し、範囲外/未宣言ならunknownのまま送受契約ownerへ返す。 |
| `HELIXINTELLIGENCE-L2-031` | OS ticket `T-17` のstate revision 8と依存一覧を入力すると、Situation Modelはその版を表示し、OS stateは不変である。 | revision 7の遅延eventがrevision 8の後に届いてもstateを巻き戻さず、古いeventとして識別する。 | 未fixtureのstate value/eventも、宣言済みOS state/event契約内であればticketとrevisionに照合し、その定義どおりSituation Modelへ渡す。契約外または定義不明の種別だけをunknownとしてOSへ照会する。 |
| `HELIXINTELLIGENCE-L2-032` | BRAIN Patternの適用条件を満たす状況と対応counterexampleを示し、判断候補には適用理由と該当Pattern revisionを付す。 | counterexampleが現在scopeで成立する入力ではPattern適用を棄却し、BRAIN知識を書き換えない。 | 未fixtureのPattern種別/版でも、宣言済みの互換範囲と適用scopeに入り、条件・counterexampleを照合できれば適用候補の根拠として受け入れる。未宣言/範囲外または互換性・根拠が不明なものだけBRAINへ戻す。重複Patternはidentity/revisionで別々に保ち、根拠なく統合しない。 |
| `HELIXINTELLIGENCE-L2-033` | Product Core requirementとHARNESS verification obligationを別source/revisionで受け、候補の各主張を対応するownerへ追跡可能にする。 | 同じ語の異なる意味やrevision不一致を一つの事実に融合した場合は不合格とし、矛盾した両sourceを保って各ownerへ戻す。 | 未見の要求schema版は宣言済み契約で読める場合のみ受領し、それ以外はunsupportedとしてsource ownerへ返す。 |
| `HELIXINTELLIGENCE-L2-034` | LABOの評価済み結果と対象scope、また別caseの明示的な未評価結果を受ける。前者だけを該当scopeの評価証拠にし、後者は未評価のまま保持する。 | source/scopeが異なるBench評価を対象Workerの適格証拠として使おうとしたら拒否し、LABOへ戻す。 | 未見の評価状態またはversionでは、LABOが定義したstatus/compatibilityを照合し、対応不明なら未評価のままにする。 |
| `HELIXINTELLIGENCE-L2-035` | 承認済み目標・依存関係を含む候補をOSへ渡す。INTELLIGENCEの出力はcandidate receiptまでで、ticket発行はOSが別に行う。 | 目標未承認、依存不足、古い候補をticket化済みとして扱わず、INTELLIGENCEへ差し戻す。 | 未見task classへのOS ticket mappingがなければcandidateを保存してmapping unknownとし、独自ticketを作らない。 |
| `HELIXINTELLIGENCE-L2-036` | 特定action/actor/target/scopeに有効なSECURITY許可と制約を照合し、そのactionの候補状態を表す。許可の発行/変更は行わない。 | revoke済み、期限切れ、別scopeの許可は有効と扱わず、該当操作を実行可能にしない。 | 未見actionは別actionの許可から推論せずSECURITYへ戻す。該当scopeの許可がunknownなら保留する。 |
| `HELIXINTELLIGENCE-L2-037` | OSがticketとWorker/version/scopeを割り当てた後、その対応を保持し、Worker resultを同ticketの結果として扱う。 | assignmentのないWorker結果や異なるticketのresultを受けても割当済み扱いせずOSへ戻す。 | 未fixtureのWorker versionでも、OS assignmentがあり宣言済みcompatibilityとtask/scope条件を満たすなら対応を照合して受け入れる。版の互換範囲が未宣言/不明、またはtask適合が確認できない場合だけOSへ戻し、INTELLIGENCEから実行許可を追加しない。 |
| `HELIXINTELLIGENCE-L2-038` | HARNESSの要求revisionに結び付くverification obligation一式をrepair ticketへ渡し、実行後も同じobligationを照合する。 | repairerがfailureを隠すためoracleを除去/弱化した場合、変更後を検証完了としないでHARNESSへ戻す。 | 未見obligation種別は結果なしにpass扱いせず、HARNESSが判定可能にするまで未充足に保つ。 |
| `HELIXINTELLIGENCE-L2-039` | 同一修復scopeのcandidate、Worker結果、HARNESS検証結果をOS向けに区別してhandoffし、OSが独自に受入判断できる証拠を残す。 | Worker successだけ、または古いHARNESS結果だけではOS acceptanceを成立させない。順序逆転/重複receiptも新たな受入証拠にしない。 | 未見receipt versionは相関ID/scope/互換契約を照合し、不一致なら未受領として各producer/OSへ戻す。 |
| `HELIXINTELLIGENCE-L2-040` | INT predictionと後続actual outcomeを同一episode/scopeへ紐付け、両者のsource revisionと観測windowを分けてLABOへ渡す。 | predictionのみをactual resultと称した場合はLABO評価入力として受領済みにせず、実測不足とする。 | 遅延/重複actual eventはepisode/revisionで照合し、重複を別成功に数えず、未対応結果をLABOへunknownとして送る。 |
| `HELIXINTELLIGENCE-L2-041` | HARNESSとOSを個別connector/source identityで読む。各sourceのrevision、scope、authorityを個別に保持する。 | 同名fieldをOSとHARNESSの同一identityへ統合した場合は不合格とし、sourceごとに分離する。 | Web/WEB-OS connector契約が未選択または未採択なら未観測として記録し、既存機構に常時必須のsourceとして要求しない。選択済みで未知版なら該当source ownerへ戻す。 |
| `HELIXINTELLIGENCE-L2-044` | 評価対象のgeneric candidateと出典・適用scopeをLABOへ渡し、BRAIN knowledge正本は変えない。 | 未評価/証拠欠落candidateからBRAIN更新を起こそうとしたら拒否し、評価不足をLABOへ返す。 | 新しいpattern種別は一般化可能と断定せず、対象scopeの評価例がない状態をunknownのままにする。 |
| `HELIXINTELLIGENCE-L2-045` | Product Coreのissueを該当product/revision/ownerに結び付けてbackflow candidateにする。正本の変更はownerに残す。 | target ownerやrevisionが不明なissueを別のProduct Coreへ送ったり、INTELLIGENCEが設計を直接直したら不合格。 | 未見product identityはtargetを推測せずunrouted candidateとして残し、Product Core ownerを特定する。 |
| `HELIXINTELLIGENCE-L2-060` | approved requirement、HARNESS process contract、current OS state、適用可能なBRAIN knowledgeから依存順付きplan candidateを作る。ticket発行はOSへ渡す。 | 未承認requirementやstale stateで実行可能planとした場合、または4.0 workflowを1.0の必須前提にした場合は不合格。 | 未見task graphで明示依存A→Bと独立Cがあれば順序を保ち、循環/未知依存は解消済みとして並べず該当ownerへ返す。 |
| `HELIXINTELLIGENCE-L2-061` | 同一task identity/revisionのLABO作業種別評価をINT proposalが参照し、そのproposalをOS assignmentへ別handoffする。各段階のreceiptは独立する。 | 価格/nameのみ、別taskの評価、またはINT proposalだけからassignment済みとした場合は不合格。 | 未見task classにLABO evidenceの互換性がなければ適性/評価を未確定に保ち、LABOまたはOSの該当ownerへ返す。 |
| `HELIXINTELLIGENCE-L2-062` | 同一修復revision/scopeでSECURITY permission、Worker execution result、HARNESS verification、OS acceptanceを段階別証拠として照合する。 | permission欠落、途中結果欠落、順序違いのrepair successで後段を完了扱いしない。 | 未見のpermission/verification receipt版では既存契約の互換性を照合し、unknownなら該当stageを保留する。必要receiptの重複は一段階の完了を二重にしない。 |
| `HELIXINTELLIGENCE-L2-063` | LABOの過去評価、BRAINの一般知識、INTELLIGENCEの今回判断、OSの実行、HARNESS工程証拠を別owner/時点で結び、効果結論はLABOへ残す。 | INT自己評価や未承認BRAIN candidateで効果/恒久知識を確定したら不合格。 | 遅着/重複のhistorical outcomeは過去episodeに紐付けて現判断を上書きせず、適用不明はLABO/BRAIN ownerへ戻す。 |
| `HELIXINTELLIGENCE-L2-066` | 人がL2-010 schema/versionに基づきtask scope、source revision、未評価状態、actor/timeを持つproposalを作り、OS receipt後にOSがassignmentを別記録する。 | 人案をINT生成・評価済み・assignment済みと偽装する、schema版不明を現行とみなす、同一proposal重複を新規根拠として使う場合は保留する。 | 未見contract版または遅延receiptはversion/scopeを照合し、互換性不明ならOSへ戻す。receiptがなくても提案内容の記録は可能だが、assignment成立とはしない。 |

本表の正常fixtureに対する結果が合格しても、fixture外性能、未指定の互換version、未構成能力、または実環境一般の適格性を保証しない。未知入力の失敗状態は対象能力の限定であり、全INTELLIGENCE能力の普遍的失敗/成功を意味しない。

### HELIXINTELLIGENCE-L2-072 Judgment pack候補とshadow評価 — 受入候補

- **前提**：未採択candidateとして検証する。受入は実装・実行・gate適用の許可を作らない。対象scope/revision、pack identity/version、評価入力とoracle、reviewer identity/context/authority/routeを固定し、欠けた値を補完しない。独立性は2026-09-26 PO判断に従い、provider/modelが同じかどうかでは判定しない。
- **正常例**：候補packが対象工程・domain・risk・failure mode・既存authorityへ適用可能な根拠を持つ。候補は本番判断へ影響しないshadowとして、同じscope/revisionに対する評価結果・unknown・反例を記録する。候補作成側と異なるidentity/context/authority/routeのreviewerがpackの適用根拠とshadow結果を独立に確認する。両証拠が揃っても状態は候補/review済みのままであり、対象ownerの既存authority手続きに採用結果がなければgateは強制されない。
- **誤りを含む例**：評価前または独立review前に候補を強制gateへ使う、候補の結果を既存の判断結果として扱う、作成者や同じ作成contextのreviewを独立とする、scope/risk/authority/versionの不一致や欠測を互換・適用可能と推測する、shadow比較不能を成功にする場合は不合格。candidateの作成・shadow・review完了から強制gate化や追加authorityを自動生成した場合も不合格。
- **未見例**：初回fixtureと異なる工程またはfailure modeを持つ未公開scopeを与える。packの適用条件に含まれなければunknown/非適用を返し、既定checklistへ自動fallbackしてgateを強制しない。既知scopeでもsource revisionや必要evidenceが欠ければ評価未完として保持する。
- **判定oracle**：shadow中の候補が実判断・gate結果を変えないこと、packと評価が対象scope/revision・版へ結び付くこと、適用外/unknownが適用可能に変換されないこと、shadow評価と独立review双方が揃う前に強制規則へ昇格しないことを確認する。両方が揃った後も既存対象authorityの採用記録なしに強制しない。provider/model名を固定要件にせず、使った実版はHARNESS共通pack contractに記録する。
- **境界**：この受入はjudgment pack単体の適用条件と非強制shadow状態に限る。旧HAC-HIL-21aの最小専門team生成、HAC-HIL-21bに含まれる未許可tool/自己検証拒否、HAC-HIL-21cのcatalog変更時stale/rebuild/retireはHR-FR-HIL-21の他identityとの合成条件であり、本候補だけの合格でそれらを閉じない。旧IRの`DOWNSTREAM-HIL-BR-29`はpair descentまで未完として保持する。

- **未完の正常例と自己依存の反例**：scope/sourceだけからpack候補を生成し、identity/versionを付ける。shadow/reviewは未実施としてその後の義務へ残せる。生成前にその候補のshadow/review済receiptを要求する、未実施を評価済みにする、2.0外部知識取得を全1.0候補へ必須化する入力契約は不合格。

- **構成・選択依存の反例**：packをL2-001のdomain identityとL2-002の選択capability構成へ結べない、未構成能力を実行可能扱いする、HARNESS-L2-023の有効依存閉包にunknown/staleを含むまま強制適用する例を拒否する。BRAIN知識を選択した場合だけ028のstate/互換範囲を照合し、記録した版番号だけで利用可能とはみなさない。
- **評価証拠の再利用**：対象pack版/scope・oracle・shadow結果が一致する有効な既存証拠を使える。新規実験を行わなかったという理由だけで新しいWorker実験を一律要求しない。実験を選ぶ場合はLABO006のOS assignmentと実行結果、system化/operation配分を評価する場合は007の証拠条件を確認する。再利用元がstale/比較不能なら未完に戻し、INTELLIGENCEの自己評価だけで有効性を確定しない。

- **配置・版の判断境界（R2225-01）**：BR-29の既存HARNESS／OS・1.0 pack運用案と、072のINTELLIGENCE判断候補配置案はL2のA/BでPO確認に残す。072の受入案が整ってもB採択済みと表示しない。正常例は判断候補/適用gap/shadow状態までとし、OS登録・LABO効果評価の責務を維持する。3.0の学習入力接続、ローカルモデル学習・調整を1.0成立条件にした例、または旧配置案との差分を記録せず確定した例を拒否する。


#### HIL-FR-57/58追補fixture（未採択候補、FR58の版境界付き）

- **正常**：適用可能な工程/domain/riskと既存authority、判断目的/観点/反証質問/evidence/停止条件、構成sourceと版を結んだpack candidateを作る。重複componentの整理でもsource edgeを保持し、競合sourceがあればconflict/unknownとしてcandidate内に残す。欠けたsource、実績、評価結果を捏造しない。
- **未完だが正常な段階**：候補descriptorを作成した時点でshadow、独立review、rollback evidenceが未実施なら、各々を未完義務として出力できる。これらのreceiptを候補生成の事前条件にして自己依存させない。ただし未完の候補をshadow済み、review済み、rollback確認済み、activeとして表示しない。
- **比較fixture**：同一scope/revision/case/oracleのcandidateあり・なし結果を対照し、既知false-positive、false-negative、unknown、seeded counterexampleをscorecardへ反映する。比較条件が一致しない結果は比較不能/未評価とする。case追加や閾値の創作で差を成功扱いしない。
- **独立性fixture**：作成側と異なるreviewer identity/context/authority/routeが独立にevidenceを読む例を受け入れる。作成側worker自身または同workerのsubagent reviewは拒否する。provider/modelまたはruntimeが同じ/異なるという事実だけでは独立性を判定せず、2026-09-26 PO判断の条件を適用する。
- **rollback/active境界fixture**：rollback先・戻し条件・該当versionのrollback evidenceが欠ける、またはshadow/独立reviewが未完の候補をactive/強制gateとして出したら不合格。全証跡が揃った例でも、対象authorityの採択記録なしに072がactive化した場合は不合格。owner/OSの既存採択・rollback記録があれば参照し、INTELLIGENCEの自己評価receiptで代替しない。
- **FR58の版境界**：finding/reversal/retry/escaped defect/skill efficacyからINTELLIGENCEが不足観点を候補化し、1.0 packを自動改善する例は不合格。1.0〜2.xの知識評価・保持はHMC-BR-003に従いLABOの範囲に残し、INTELLIGENCEによる改善利用は3.0以降の保留として扱う。3.0の利用を1.0の依存・受入条件にしない。
- **未見**：初回と異なるrisk/failure mode、構成skillの衝突、source revision・評価状態のunknownを含む例で、適用外/unknown/conflict/未評価を返す。未見を既定pack適用可、改善根拠、activeへ自動変換しない。


### HELIXINTELLIGENCE-L2-073 未知finding探索の自由文からの直接投影境界 — 受入候補

- **前提**：未採択candidateとして、未知finding探索の自由文だけを入力する独立fixtureで確認する。候補の存在・提示・受入案はIssue、Requirement、CI、merge authorityの変更や実行を許可しない。既存owner経路を変更する受入にはしない。
- **正常例**：既存UIL deterministic detectorの役割・結果を維持し、Agentic Audit Probeの探索自由文をその代替として扱わない。自由文のみのfindingを記録し、4つの宛先への直接projectionが発生しないことをそれぞれ確認する。必要な場合は対象ownerへfinding/candidateとして提示し、未判断状態を保つ。別途、適格根拠とowner判断が揃う既存経路の処理はその既存条件に従う。
- **Issue宛先の誤り**：自由文だけからIssueを直接作成または更新した場合は不合格。UIL等の既存owner経路が独立に作成・受理する場合まで恒久禁止する解釈も不合格。
- **Requirement宛先の誤り**：自由文だけからRequirement本文・identity・revision・採否/承認状態を作成、変更、確定した場合は不合格。ownerの独立した既存判断を経た後続処理まで永久に禁止する解釈も不合格。
- **CI宛先の誤り**：自由文だけからCI定義・実行要求・実行結果・pass/完了状態を作成または変更した場合は不合格。新しいCI停止・起動動作やgateを候補から追加することも範囲外。
- **merge authority宛先の誤り**：自由文だけからmerge可否・admission・merge操作の権限または状態を作成、変更、成立させた場合は不合格。既存の独立review/merge admissionを置換または追加制約することも範囲外。
- **未見例**：既知fixtureと異なる未知finding文を与え、detector優先と4つの宛先を別々に照合する。ownerへのfinding/candidate提示は保持できる一方、Probeでdeterministic detectorを置換すること、および自由文のみからの各direct projectionはそれぞれ拒否される。根拠/authorityが不明ならunknownを保つ。いずれか一つの宛先の拒否で別宛先を代用しない。
- **判定oracle**：deterministic detector非置換と、Issue作成/更新、Requirement変更、CI変更/実行authority、merge authority/admissionの各negative oracleを独立に照合する。自由文単独のdirect projectionまたはdetector置換のどれか一つでも成立すれば不合格。CI/merge behaviorを新設せず、ownerの独立判断後の既存経路も一律禁止しない。

### HELIXINTELLIGENCE-L2-074 評価済み返却feedbackの配置proposal入力の受入候補

- **状態**：L2-074と対になる未採択・未実行候補。L2-010のproposal boundaryを維持する入力caseであり、model/runtime動作を主張しない。
- **正常例**：LABO評価済みのticket返却reason、同scopeの再発行後検証結果、task class/domain、source/revision、観測母数/windowを与える。INTELLIGENCEが同scopeのWorker実績として根拠を引用した配置proposalを出し、未評価範囲と再評価条件を明示する。OSはproposalを参考情報として受け、発行・指定・割当の既存判断を別に行う。
- **拒否例**：LABO未評価、比較不能、欠測、stale、異なるscope/revisionまたはtask classの結果を評価済み根拠へ昇格した場合は不合格。単一feedbackからWorkerを恒久除外/昇格、modelを自動更新、ticketを直接発行、assignment/dispatchを実行する場合も不合格。
- **不足例**：task属性不足ならOSへ、LABO評価/evidence/scope不足ならLABOへ返し、proposalを未確定とする。未評価を既定Workerや「成功」と補完しない。
- **未見例**：同じ理由classでも対象scopeの異なるfeedbackを与え、適用できないevidenceがproposalへ混ざらず、適用可能範囲とunknownが区別されることを確認する。
- **受入限界**：配置精度の因果改善、固定threshold、資格の恒久化、model更新・自動学習、実dispatchは検査・要求対象外。proposal受入からOSのticket/assignment決定を生成しない。

### HELIXINTELLIGENCE-L2-075 Agentic Audit Probe proposal identity and qualification boundary — 受入候補

- **状態・対象**：未採択候補の静的な意味oracle案。AAFD-R-01〜03だけを対象にし、R-04のdetector優先/direct-projection境界は採択済みL2-073に残す。旧runtime、UIL/TER、Issue、CI、mergeを実行しない。
- **正常例**：Probe proposalの全fieldを一組のaudit episode、producer session、repository、exact HEAD、resolved worktree、authority revision/digest、責務ID、観測・証拠・反証・再現手順・expiry・finding/remediation advisoryへ結ぶ。PR review findingとsystem audit proposalのidentityを分け、content/digestとsource/target revisionが一致する。
- **identity拒否例**：exact HEAD、worktree、authority digest、producer session、responsibility owner、evidenceを一項目ずつ欠落・改変・異版にする。各該当条件を個別にincomplete/rejectedとし、その結果に失敗した項目と検出した欠落または不一致に対応する個別reasonを残す。汎用の拒否理由へ集約して項目固有の理由が分からなくなったら不合格。別field、別HEAD、current扱いしたhistorical evidenceで補完したら不合格。current/compatibility/historical authorityを混同したら不合格。reasonの語彙・enum・schemaは固定しない。
- **qualification拒否例**：AI自己評価だけでverified、P0/P1、owner、route、remediation adoptionを確定したら不合格。duplicate/existing owner照合、独立再現、反証、expiry/supersessionが不足する例は未qualifiedのまま既存UIL ownerへ返す。finding/remediationを同一proposal identityや単一decisionへ統合したら不合格。
- **未見・oracle**：別producer/session、別HEAD、stale evidence、期限切れproposal、superseded/duplicate proposalを個別に与え、unknown/incompleteと必要な既存ownerへのhandoffを保つ。Proposal生成・受入だけでUIL/TER/Future Synthesis runtime、Issue/Requirement/CI/merge操作を起動または変更しない。固定閾値や新routeをcandidateから作らない。

### HELIXINTELLIGENCE-L2-076 Model revision revalidation and comparison evidence — 受入候補

- **状態・対象**：未採択候補。現L2-011が定める同一corpus/responsibility scopeでのfindings、false positives/misses、reproducibility、latency、cost比較を再採択しない。TERイベント・qualificationは既存ownerに残す。
- **正常例**：provider/model/runtime/versionの変更とTER event identityをrevision/source付きで記録し、同じaudit corpus・responsibility scope・policy・oracle revisionを用いるrevalidation proposalへ接続する。旧モデル名の文字列だけが一致/変化した例からqualificationを継承しない。
- **比較例**：new/lost finding、false positive/negative、duplicate、remediation correctness、authority drift、reproduction success、cost、latencyを個別metricとして残す。欠測、scope違い、policy/oracle revision違いは比較不能/unknownとする。単一scoreで差を消したり、hidden oracleをWorkerに見せたりしたら不合格。
- **境界例**：candidate結果だけでmodel/providerを採択・route変更・自動切替せず、3.0 learning/qualificationを1.0の依存へしない。本candidateがL1-011へ追加するtrigger/metricの採否は未決であり、受入candidateを対象revisionの人間decisionや実運用の承認と扱わない。

### HELIXINTELLIGENCE-L2-077 AAFD qualified delta source and non-write boundary — 受入候補

- **状態・対象**：未採択candidate。AAFD-R-05/R-08とAC-005/008および指定された否定oracleだけの意味oracle案。既存AAFD-BR-02/03、L2/L11-073/075/076、HARNESS-L2/L11-023を置換しない。
- **依存区分**：HARNESS-L2/L11-023で採択済みの①常時必須、②特定操作時のみ必須、③選択した入力元に応じて必須、④参照資料のみを区別する。①対象authority/revisionとsource/consumer適用契約を照合する。②delta candidate生成を選んだ操作時だけqualified receiptの条件を照合する。③選択されたinternal/UILまたはexternal/TER receiptとそのowner/source revisionを結ぶ。④archive sourceと旧候補は意味照合の参照に限る。未選択sourceは未観測で、成功・不在・qualificationを推測しない。HARNESS-023の採択は分類規則を支えるだけであり、AAFD candidateや将来delta ownerの採択を意味しない。
- **正常例**：別々のfixtureで、既存source ownerがqualifiedと示したinternal receiptとexternal receiptを評価する。例示tupleは、internal側がreceipt identity `r-int-7`、receipt revision `rev-3`、origin type `internal`、fixtureに与えた既存source owner identity `owner-int-existing`、external側がreceipt identity `r-ext-4`、receipt revision `rev-2`、origin type `external`、fixtureに与えた既存source owner identity `owner-ext-existing`であり、identity・revision・origin type・ownerを別々に突合する。これらの値はowner/schema/APIを定義せず、fixture入力に明示したownerと選択receiptの対応を確認するだけである。external例にはprovider release observationを結び、internal HELIX artifact/findingが与えられていない限りHELIX defectとはしない。いずれの例も未観測のdelta dimensionはunknownのまま保ち、Requirement/Design/Release/Assignment/mergeへの直接変更数は0とする。fixtureで既存ownerが明示されていることはsource qualificationを実施・実証したことを意味しない。
- **source境界の反例**：external releaseの観測だけをHELIX defect確定として扱う入力を拒否し、finding/candidateを未確定のまま保持する。internal sourceをexternal/TERへ割当てるmutationと、external sourceをinternal/UILだけへ割当てるmutationをそれぞれ拒否する。必要なowner/source relationが不明ならunknown/incompleteとする。正しいownerへの付替えを新routeの生成や資格判定とみなさない。
- **unknownの反例**：同一delta candidateについてunknown値を`0`、`neutral`、`unchanged`、`observed`へ個別に変異させた4例をすべて拒否し、元のunknownを保つ。4結果を単一の「default」反例に集約しない。
- **直接変更の反例**：delta candidateからRequirement、Design、Release、Assignment、mergeの各対象を直接変更する5例を個別に拒否する。候補提示は許すが、既存source qualificationやowner判断を経た別経路の有効性はこのoracleで判定しない。
- **未見例**：選択source receiptのowner、origin type、revisionまたはqualification evidenceが欠ける/不一致のheld-out例を与え、delta candidateを確定せずunknown/incompleteへ戻して選択receiptのsource ownerへ照合する。選択receiptが読めない、revision/qualification照合に失敗する、またはowner identityを確認できない例では、別のavailable receipt・未選択source・reference-only資料へ暗黙fallbackせず、選択sourceの失敗とunknown/incompleteを保つ。fixtureに明示された既存owner identityとの照合成功例と、owner identityが欠落/矛盾するこの反例を区別する。未選択sourceやreference-only資料をqualified sourceへ昇格しない。実runtimeや旧UIL/TERは実行しない。
- **失敗時の戻し先と限界**：source identity/qualificationの不明は該当する既存source ownerへ、INTELLIGENCEのfinding/delta candidate根拠はINTELLIGENCE ownerへ、OS ticket/assignmentはOS ownerへ、評価はLABO ownerへ返す。正式なFuture Synthesis consumer/ownerが不明な場合はunknownのまま上流scope照合へ戻す。旧R-06/07/09〜12、R-13〜15の処理、実行・適格化・正式後継の受入は含めない。
