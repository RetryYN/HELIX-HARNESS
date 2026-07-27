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
- `merge_targets`
- `exit_conditions`
- `next_routes`
- `document`

Forward／Scrum／Hybridだけでなく、Discovery、Reverse、Add-feature A/B、Refactor、Retrofit、
Recovery、Incident、Research、version-up、OperationVerificationをexact setとして保持する。

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

## 4. 承認境界

`approval_policy`は「model名」ではなく具体actionへ束縛する。

- `none`: 通常のAI作成・テスト・PR・review・mergeに人間signoffを要求しない。
- `layer_gate`: Forwardの既定layer gateに従う。
- `po_decision`: S4やdelivery routeなど意味判断をPOが行う。
- `po_intent`: Reverse R3で復元した意図をPOが確認する。
- `action_bound`: production、権限、secret、不可逆migration等の具体actionだけを承認対象にする。

Recoveryの診断、branch修正、PR作成を一律に人間待ちへしない。

## 5. 収束規則

- drive modelは必ず`merge_targets`へ接着し、mode内だけで完成を主張しない。
- `next_routes`にない遷移を暗黙実行しない。
- Add-feature Route BはL6/L7先行buildを許すが、Reverse fullbackとG7 traceまで
  `completion_claim_allowed=false`を維持する。
- 改善findingは現在契約blockerでなければ後続Issueへ送り、現在PRを循環させない。
- OperationVerificationのfailureは環境に応じてRecoveryまたはIncidentへ戻す。
