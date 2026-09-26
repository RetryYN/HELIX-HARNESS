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
