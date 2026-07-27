---
title: "駆動モデル経路catalog"
status: confirmed
owner: TL
source: config/drive-route-catalog.json
---

# 駆動モデル経路catalog

## 1. 軸の分離

HELIXの工程選択は次の軸を混同しない。

| 軸 | 答える問い | 例 |
|---|---|---|
| Forward spine | 最終的にどのV工程へ接着するか | L3、L4、L5、L6、L12 |
| delivery route | productionをどの反復単位で届けるか | Full V、Production Scrum、V設計＋Scrum実装Hybrid |
| drive model | どの状況から作業へ入るか | Reverse、Add-feature、Recovery、Research |
| kind | PLANが今回所有する成果物型は何か | `add-design`、`add-impl`、`reverse` |
| drive | どの専門職が担当するか | `be`、`fe`、`fullstack`、`db`、`agent` |
| execution mode | どのruntime構成で実行するか | `standalone`、`hybrid` |
| specialist workflow | Forward内の専門工程か | screen-design、frontend-design |

`Feature`や`Update`は作業対象の分類であり、delivery routeやdrive modelを代替しない。

## 2. 機械正本

`config/drive-route-catalog.json`を経路集合の機械正本とする。各routeは次を必須とする。

- `route_id`
- `model`と`route_class`
- `entry_signals`
- `allowed_kinds`
- `start_layers`と`phases`
- `approval_policy`
- `approval_requirements`（trigger・approvers・approved_actionのexact set）
- `autonomous_actions`（承認なしで止めずに進める範囲）
- `merge_targets`
- `exit_conditions`
- `next_routes`
- `document`

Forward／Scrum／Hybridだけでなく、Discovery、Reverse、Add-feature A/B、Refactor、Retrofit、
Recovery、Incident、Research、version-up、OperationVerification、design-bottomupをexact setとして保持する。

## 3. 優先順位

複数signalが同時に成立した場合は、次の順で選ぶ。

1. production障害はIncident。
2. 開発状態の破損・逸脱はRecovery。
3. 既存事実と正本の不一致はReverse。
4. 不確実性が高ければDiscovery、机上判断で足りればResearch。
5. dependency／基盤移行はRetrofit、挙動不変の構造改善はRefactor。
6. 新しい機能意味はAdd-feature。
7. production delivery単位はFull V／Production Scrum／Hybridから選ぶ。
8. 該当signalが無ければForwardを既定spineとする。

`design-bottomup`はAdd-feature Bと同義ではない。既存backendから未定義のFE要求・screen・interactionを
抽出する設計経路であり、実装先行経路ではない。不確実な体験意味はDiscovery S4へ送り、確定後に
L2/L3/L5/L6と正規pairへ接着する。

## 4. 承認境界

`approval_policy`は「model名」ではなく具体actionへ束縛する。

- `none`: 通常のAI作成・テスト・PR・review・mergeに人間signoffを要求しない。
- `layer_gate`: Forwardの既定layer gateに従う。
- `po_decision`: S4やdelivery routeなど意味判断をPOが行う。
- `po_intent`: Reverse R3で復元した意図をPOが確認する。
- `action_bound`: production、権限、secret、不可逆migration等の具体actionだけを承認対象にする。

承認はmodel全体へ掛けず、`approval_requirements`の具体actionだけへ掛ける。たとえばRecoveryは
診断・証拠収集・packet作成を自律実行し、修復scopeとreopen pointの確定だけをTL/POへ束縛する。
Incidentも検知・証拠収集まで止めず、production restore/hotfixだけを三者確認へ束縛する。
Retrofitはinventory・impact・dry-runを自律実行し、環境へ影響する`config_drift_apply`だけを
TL承認へ束縛する。通常のbranch修正、PR作成、review、CIを承認対象へ拡大しない。

## 5. 収束規則

- drive modelは必ず`merge_targets`へ接着し、mode内だけで完成を主張しない。
- `next_routes`にない遷移を暗黙実行しない。
- Add-feature Route BはL6/L7先行buildを許すが、Reverse fullbackとG7 traceまで
  `completion_claim_allowed=false`を維持する。
- 改善findingは現在契約blockerでなければ後続Issueへ送り、現在PRを循環させない。
- OperationVerificationのfailureは環境に応じてRecoveryまたはIncidentへ戻す。

## 6. 工程専門

screen-designとfrontend-designは独立modeではない。前者はForward L2で画面要求・flow・wireframe・
prototypeまたはno-UI receiptを作りL11とpair化する。後者は実装後のL10でvisual、token、a11y、
VRT、UX reviewを実測しL3とpair化する。catalogは両工程のentry signal、required artifact、
exit conditionをexactに保持し、単なる名称登録で済ませない。
