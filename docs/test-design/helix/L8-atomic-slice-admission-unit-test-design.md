---
title: "Atomic Slice Admission L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-02
updated: 2026-08-02
owner: QA
plan: docs/plans/PLAN-L5-85-atomic-slice-admission.md
pair_artifact: docs/design/helix/L5-detail/atomic-slice-admission.md
related_l9: docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
queue_id: L3Q-PC-037
---

# Atomic Slice Admission L8単体テスト設計

| oracle | 正例 | 反例／mutation | L9 trace |
|---|---|---|---|
| U-ATOMIC-001 | contract／owner／model ownerが各1件 | 空、重複、複数、未知ownerを拒否 | ST-ATOMIC-001〜003 |
| U-ATOMIC-002 | pathをrepository-relative POSIX・UTF-8 bytewise順へ正規化 | absolute、`..`、NUL、root family、重複を拒否 | ST-ATOMIC-005 |
| U-ATOMIC-003 | expectedとactual pathが双方向exact一致 | 欠落、余剰、片方向subset比較mutationを拒否 | ST-ATOMIC-005 |
| U-ATOMIC-004 | requiredとactual companionが同contractでexact一致 | PLAN／design／testを各1件欠落、別contractで相殺するmutationを拒否 | ST-ATOMIC-004／007 |
| U-ATOMIC-005 | 独立runtime・同一HEAD・同一manifest・exact deltaのexpansion receipt | 自己承認、別HEAD、旧manifest、理由なし、delta欠落／余剰を拒否 | ST-ATOMIC-006 |
| U-ATOMIC-006 | 複数behavior／responsibilityを`split_required`にする | 有効expansion receiptで混載を`admitted`へ変えるmutationを拒否 | ST-ATOMIC-002 |
| U-ATOMIC-007 | invalid／stale／binding failureをprecedenceどおり`recovery_required`にする | 低位successで高位failureを相殺、最初のfailureだけ返すmutationを拒否 | ST-ATOMIC-003／010 |
| U-ATOMIC-008 | snapshot全集合とschema versionから決定的digestを生成 | 入力順、locale、時刻でdigestが変わるmutationを拒否 | ST-ATOMIC-010 |
| U-ATOMIC-009 | no-code decisionが`no_change/delete/configure/reuse/modify`を先行評価 | 根拠なし`add_code`、選択肢skipを拒否 | ST-ATOMIC-008 |
| U-ATOMIC-010 | security／data loss／correctness／authority driftをcurrent blockerにする | successor improvementへ送るmutationを拒否 | ST-ATOMIC-009 |
| U-ATOMIC-011 | A/Bが同一oracle 100%、p95非悪化で、Aのcomponent/state/persistence/LOCがB以下 | oracle削除、timeout延長、test除外、測定欠落でAを採用するmutationを拒否 | ST-ATOMIC-011 |
| U-ATOMIC-012 | lifecycle=0かつinvariant=0のfixtureで`pure_function/none`を受理 | behavior差0のaggregate／class追加を受理するmutationを拒否 | ST-ATOMIC-012 |
| U-ATOMIC-013 | Issue／PLAN／body／HEAD／path／catalog不変のreceiptだけ再利用 | 各入力を1件ずつ変更して旧decisionを再利用するmutationを拒否 | ST-ATOMIC-010 |

L9 trace exact setは`ST-ATOMIC-001`、`ST-ATOMIC-002`、`ST-ATOMIC-003`、`ST-ATOMIC-004`、
`ST-ATOMIC-005`、`ST-ATOMIC-006`、`ST-ATOMIC-007`、`ST-ATOMIC-008`、`ST-ATOMIC-009`、
`ST-ATOMIC-010`、`ST-ATOMIC-011`、`ST-ATOMIC-012`であり、欠落・重複を許さない。

## 実行単位

- 純粋単体検証: canonicalizer、exact set comparator、companion resolver、scope expansion validator、decision evaluator。
- fixture: 新規実装の受理、既存改修の受理、複数behavior、未知owner、companion欠落、stale HEAD、no-code、pure function。
- GitHub API、workflow、DB永続化、実guard dual-greenは`L3Q-IT-023`のL6/L7で扱う。

## Mutation閉鎖

集合比較を片方向へ変える、重複除去で不正を隠す、failure precedenceを逆転する、reviewer runtime一致を許可する、
別HEAD receiptを許可する、設計比較の観測量を1件落とす、形式aggregateを無条件要求する各mutationが最低1 oracleをredにする。
