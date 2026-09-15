# 新世代の管理状態と旧Scrum Operation Typed Projectionの対応

確認日: 2026-09-14

## 目的

`scrum-operation-typed-projection-{requirements,acceptance}.md`の旧要件7件、旧受入6件、PLAN固有oracle 2件を、
新世代のHELIX-OS管理状態projectionへ再分類する。旧候補はManagement Scrum、`S0..S4`、Scrum Reverse、
固定7 operation、既存DB rebuild／current-location／roadmap／CIを前提とするため、承認・実装状態を継承しない。

## 再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| SCRUM-OPS-R-01 | 管理backlogを要求・責務・提供対象へ対応づける | HELIXOS-L2-002／003 | `scrum:story-mapping`名、旧Slice、旧L3配置を固定しない | semantic_atom_candidate |
| SCRUM-OPS-R-02／07 | 見積りと実測を分け、管理指標を要求意味から分離する | HELIXOS-L2-005／007 | velocity／burndown、旧L12配置、既存metric collectorを必須化しない | measurement_rederivation_required |
| SCRUM-OPS-R-03 | 着手・完了条件を対象要求と工程契約へ束縛する | HARNESS-L2-003、HELIXOS-L2-002／003 | 旧DoR／DoD gate、旧L3 enumを継承しない | split_reapproval_required |
| SCRUM-OPS-R-04 | 進行・blocker・次行動を実行事実として記録する | HELIXOS-L2-004／007／009 | 旧L7層、event／receipt schema、既存DBを固定しない | operational_rederivation_required |
| SCRUM-OPS-R-05 | 成果を受入条件と照合してfeedbackを返す | HARNESS-L2-003／005、HELIXOS-L2-005／007 | 管理ceremonyをL11利用者受入として扱わず、旧review方式を継承しない | layer_rewrite_required |
| SCRUM-OPS-R-06 | 再発所見を改善候補として上流へ戻す | HELIXOS-L2-005／007 | retrospective開催をL12運用成立や要求変更の証拠にしない | layer_rewrite_required |
| SCRUM-OPS-AC-01..06 | 欠落・重複・誤分類・不収束・未還流を検出する | HELIXOS L11／L10候補 | 固定7件、旧layer、DB rebuild、roadmap、Issue／PLAN、Scrum Reverseをoracleにしない | oracle_rederivation_required |
| U-SCRUMOPS-001／002 | projection declarationのidentity・source・pair欠落を検出する | HELIXOS L10候補 | 既存test、current-location、path、旧CIを新世代oracleにしない | legacy_test_not_inherited |

## 新世代の管理状態projection

1. authorityで定めた要求・責務・作業・判断・証拠のidentityを参照し、管理状態だけを再構築可能なviewへ投影する。
2. candidate、accepted、assigned、running、waiting、failed、verified等の状態名は対象別L2承認後にL3で導出する。
3. Project、Issue、DB、dashboard、roadmapは同じauthority revisionから再生成でき、いずれからも要求意味・承認・完了を逆生成しない。
4. 管理methodはScrumに限定せず、HARNESSで選択した開発styleや管理方式と混同しない。
5. missing、unknown、stale、conflict、projection failureを成功・空集合・完了へ補完しない。

旧7 operationは要求源の例としてarchive provenanceへ残す。新世代のoperation集合、schema、DB、view、検証は
Concept・対象別L1／L2の承認後に再導出する。要求整理中は既存DB rebuild、roadmap生成、test、CIを実行しない。

## 次工程

管理変更入口の採用revisionとHELIX-OS L2が確定した後、必要な管理状態とprojection consumerをL3で定義し、
L10で再構築・欠落・競合を検証する。利用者が管理状態を確認する結果はL11へ分け、運用効果はL12へ置く。
