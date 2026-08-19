---
title: "orchestration event projection と checkpoint replay 機能設計"
canonical_layer_scheme: L1-L12
layer: L6
paired_layer: L5
status: draft
plan: docs/plans/PLAN-L7-636-event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
related_l5: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay 機能設計

## 1. 責務

`PLAN-L7-636-event-projection-checkpoint-replay` は、L5/L8 pairで固定された
orchestration event契約を、I/Oを持たないpure judgementへ降ろす後続実装スライスである。
本設計は実装済み能力を主張せず、実装入口と責務境界だけを固定する。

GitHub admissionでは、Issue #215、PR本文、PLANの`workflow_identity`を同一の
`workflow_model:ADD_FEATURE` identityへ束ねる。identity markerの欠落やIssue／PR間の不一致は、
実装の有無にかかわらずfail-closeし、後続のpure実装PRへ引き渡さない。

対象は次の8関数とする。

| export | L5対応 | 境界 |
|---|---|---|
| `admitEventEnvelope` | §2.1 | canonical schemaと11 fieldのexact admission |
| `evaluateCausalOrder` | §2.2 | causation、correlation、時刻順序 |
| `evaluateIdempotentIngest` | §2.3 | duplicate digestとappend-only判定 |
| `evaluateLifecycleTransition` | §2.4 | lifecycle遷移とseal後拒否 |
| `evaluateProjectionDrift` | §2.5 | identity／state／laneのread-back差分 |
| `selectCheckpointScope` | §2.6 | laneとevent境界のscope選択 |
| `evaluateCheckpointReplay` | §2.7 | HEAD、scope、projection／checkpoint digest |
| `routeRecovery` | §2.8 | bounded retryまたはrecoveryへの振り分け |

## 2. 入出力と非対象

判定に必要な`observedAt`、`currentHeadSha`、known lane集合、log snapshotは呼び出し側から
typed inputとして受け取る。時刻取得、filesystem、DB、network、GitHub API、CLI writeは持たない。
判定結果はsuccessまたは`EVENT_*` failureを返し、入力を変更しない。

新規実装で次を再定義しない。

- lease／fenceは#213のwork-graph receipt authorityへ委譲する。
- worker terminalは#213のlifecycle receipt authorityへ委譲する。
- slot会計は#214のscheduler authorityへ委譲する。
- transaction、projection table、checkpoint persistenceは#499の後続I/Oスライスで扱う。

## 3. 正規化とfailure reachability

digestは既存の`src/runtime/digest.ts`の`canonicalJson`／`sha256Digest`を再利用し、第二の
canonicalization規則を作らない。scope未指定時にrepo全体へフォールバックしない。

L5の判定順序とL8のU-EPR-001..102を1対1で参照する。unknown field、片肺、duplicate、causal
inversion、projection drift、orphan、stale HEAD、scope境界、non-idempotent replay、unbounded
retryの各negative oracleを、複数条件の相殺なしに実装できることを受入条件とする。

## 4. 工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | typed input／failure resultと8関数の実装契約を確定 | 直列 | L5/L8とのidentity一致 |
| 2 | pure moduleとU-EPR oracleを実装 | 直列 | U-EPR-001..102 green |
| 3 | source mutationでfailure分岐を反証 | 直列 | survived 0、pattern missing 0 |
| 4 | #213/#214資産との境界、typecheck、Biome、DB非接続を確認 | 直列 | 依存authorityの再実装0 |
| 5 | Claude exact-HEAD review後に#499のtransactional I/Oへ引き渡す | review | blocker 0、receiptがcurrent HEADへ束縛 |

実装PRでは、同一HEADのsource、test、mutation runner、PLAN evidenceをまとめて検収し、
このdraft設計を実装完了の証拠として先取りしない。
