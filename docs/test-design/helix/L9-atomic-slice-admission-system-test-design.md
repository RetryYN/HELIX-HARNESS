---
title: "Atomic Slice Admission L9 system test設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: QA
plan: docs/plans/PLAN-L4-59-atomic-slice-admission.md
pair_artifact: docs/design/helix/L4-basic-design/atomic-slice-admission.md
related_l3: docs/test-design/helix/github-atomic-development-system-test-design.md
queue_id: L3Q-PC-036
---

# Atomic Slice Admission L9 system test設計

| oracle | scenario | 合格条件 |
|---|---|---|
| ST-ATOMIC-001 | 新規実装と既存改修を同じcontract／owner／aggregateへ束縛して投入 | 変更種別に依存せず`admitted`となり、exactly-one contract／ownerを返す |
| ST-ATOMIC-002 | 2つの独立behavior、複数aggregate、無関係legacy ownerを個別・組合せで投入 | 行数とpath数にかかわらず`split_required`となり、分離対象を列挙する |
| ST-ATOMIC-003 | Issue、PLAN、PR manifestのcontractまたはownerを個別にずらす | `recovery_required`となり、いずれか一面の値で補完しない |
| ST-ATOMIC-004 | source変更からPLAN、design、test companionを1件ずつ欠落・余剰化 | exact set不一致を拒否し、別contractのcompanionで相殺しない |
| ST-ATOMIC-005 | expected pathの欠落、余剰、重複、repository-root familyを投入 | actual pathとの双方向exact不一致または過大familyを拒否する |
| ST-ATOMIC-006 | scope expansionを自己承認、別HEAD receipt、理由なし、exact delta不一致にする | expansionを拒否し、original manifestを改変しない |
| ST-ATOMIC-007 | generated digest、catalog、freeze oracleだけが元変更へ機械追従 | behaviorを増やさないcompanionとして同じsliceへ残し、別責務に数えない |
| ST-ATOMIC-008 | no-code候補へ直接`add_code`を選択 | delete／configure／reuse／modifyの不採用証拠がなければblockする |
| ST-ATOMIC-009 | security、data loss、correctness、authority driftをsuccessor扱いにする | current blockerとして拒否し、非blocker改善だけをIssueへ分離する |
| ST-ATOMIC-010 | admission後にmanifest、Issue、PLAN、base／candidate HEAD、catalogを個別変更 | 既存receiptをstale化し、変更後snapshotで再評価する |
| ST-ATOMIC-011 | 既存guard再利用案と新detector／schema追加案を同じoracle 100%・同じcandidate-admission p95条件で比較 | `new_component_count`、`new_state_count`、`new_persistence_surface_count`、`production_loc_delta`を実測し、全値が以下の再利用案を選ぶ。測定欠落、oracle削除、timeout延長、test除外を拒否する |
| ST-ATOMIC-012 | entity lifecycle／domain invariantを持たないpure functionへaggregateを要求 | 理由付き`pure_function`／`none`を受理し、形式だけのclass／aggregate追加を拒否する |

L9はrepository／GitHub／PLAN／design traceを横断したadmission結果を対象とする。parser関数、例外型、
workflow dispatch、永続化transactionのunit／integration oracleはL5/L8、実装とTDD closureはL6/L7へ降下する。
