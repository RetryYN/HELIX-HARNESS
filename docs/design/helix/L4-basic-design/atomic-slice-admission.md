---
title: "Atomic Slice Admission基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-02
updated: 2026-08-02
owner: SE
plan: docs/plans/PLAN-L4-59-atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
related_l3: docs/design/helix/L3-requirements/github-atomic-development-requirements.md
queue_id: L3Q-PC-036
---

# Atomic Slice Admission基本設計

## 1. 設計目的

新規実装と既存改修を同じadmissionへ通し、1つのPR候補をexactly-one behavior contractと
exactly-one responsibility ownerへ束縛する。行数やファイル数が小さくても、独立behavior、複数aggregate、
無関係legacy ownerを混載する候補は分割する。原子性を満たすために必要な設計・test companionは同じsliceへ含める。
本sliceのbehavior authorityは`GH-AC-035`である。`GH-AC-040`のmanifest exact照合は同じadmissionを偽装させない
supporting invariant／oracleとして再利用し、別behaviorや別responsibility ownerを追加しない。

## 2. component境界

| component | 入力 | 出力 | authority | failure |
|---|---|---|---|---|
| `SliceIntentResolver` | Issue、PLAN、PR manifest、current HEAD | `SliceIntent` | read-only | contract／owner欠落、複数値、HEAD不一致 |
| `ResponsibilityFootprintResolver` | changed path、design catalog、PLAN、trace | `ResponsibilityFootprint` | read-only | owner不明、複数owner、archive authority混入 |
| `CompanionSetResolver` | change kind、changed path、既存PLAN／design／test | required companion exact set | read-only | source変更のdesign／test欠落、余剰別契約companion |
| `AtomicSliceAdmissionPolicy` | intent、footprint、companion set、no-code decision | `AdmissionDecision` | proposal-only | 独立behaviorの受理、行数だけによる受理 |
| `ScopeExpansionAuthority` | original manifest、追加path、独立review receipt | authorized exact delta | read-only | 自己承認、receipt別HEAD、理由なし拡張 |

`src/lint/github-guards.ts`をPR manifestとcompanion検査、`src/lint/ddd-tdd-rules.ts`をPLAN discipline、
既存PLAN lintをcontract／owner bindingの実行ownerとして再利用する。本pairは同じ規則を検査する新detectorを追加しない。
admission専用の永続化componentは作らず、decision digestとHEADを既存のcurrent-HEAD review receiptへ束縛する。

## 3. 型付きprojection

```ts
type AdmissionDisposition = "admitted" | "split_required" | "recovery_required";

interface SliceIntent {
  issueId: number;
  behaviorContractId: string;
  responsibilityOwner: string;
  baseHead: string;
  candidateHead: string;
  expectedPaths: readonly string[];
  dddModelingDecision: "aggregate" | "domain_service" | "value_object" | "pure_function" | "none";
}

interface ResponsibilityFootprint {
  behaviorContractIds: readonly string[];
  responsibilityOwners: readonly string[];
  modelOwnerIds: readonly string[];
  legacyOwners: readonly string[];
  requiredCompanionPaths: readonly string[];
}

interface AdmissionDecision {
  disposition: AdmissionDisposition;
  candidateHead: string;
  manifestDigest: string;
  behaviorContractId: string | null;
  responsibilityOwner: string | null;
  acceptedPaths: readonly string[];
  rejectedPaths: readonly string[];
  reasonCodes: readonly string[];
}
```

`admitted`ではcontract setとresponsibility owner setが各1件である。DDD modelを選ぶ場合はmodel ownerも1件とする。
`pure_function`または`none`は、domain invariantとentity lifecycleを持たない理由がPLANにある場合に許可し、
形式のためだけにaggregate／classを追加しない。
legacy移行ではlegacy ownerを別responsibilityとして数える。ただし同じbehaviorのcompatibility adapterであり、
characterization／dual-green／consumer移行を同一ownerが担う場合だけ同じsliceへ残せる。

## 4. admission規則

1. `no_change -> delete -> configure -> reuse -> modify -> add_code`のdecisionを先に評価する。
2. Issue、PLAN、PR manifestのcontract／ownerがexact一致しなければ`recovery_required`とする。
3. changed pathから得たbehavior／owner／適用対象のmodel ownerが複数なら`split_required`とする。
4. source変更時は同じcontractのPLAN、design、test companion exact setを要求する。
5. expected pathとactual pathは双方向exact一致させる。追加pathは独立review receiptへ束縛する。
6. generated digest、catalog、freeze oracleの機械追従は、元behaviorを変えない限り同じsliceのcompanionとする。
7. security、data loss、correctness、authority driftを改善Issueへ逃がさずcurrent sliceのblockerとする。
8. 命名、追加抽象化、将来の堅牢化、別性能改善はsuccessor Issueへ分離する。

## 5. 状態遷移

```text
candidate_discovered
  -> intent_bound
  -> footprint_resolved
  -> companions_resolved
  -> admission_evaluated
       -> admitted
       -> split_required
       -> recovery_required
```

manifest、Issue、PLAN、base HEAD、candidate HEAD、design catalogのいずれかが変われば既存decisionをstale化し、
`intent_bound`から再評価する。`split_required`をscope expansionで回避してはならない。

## 6. 設計リファクタリング

既存PR scope guardとDDD/TDD disciplineが既に検査するfieldを新しいschemaへ複製しない。
本sliceで追加する設計責務は、既存ownerの結果を一つのadmission decisionへ合成する境界だけとする。
L5で既存関数の直接合成が可能なら新class／DB table／workflow jobは作らない。機能・性能・negative oracleを
維持したままcomponent数、state数、永続化面を減らせる案をpair freeze前に比較し、採否理由をL8 oracleへ渡す。

## 7. 下流境界

本pairは構成、責務、I/F、主要データフロー、L9 oracleを確定する。関数signature、例外型、具体的な
manifest parser、GitHub Actions結線、DB receipt永続化は`L3Q-PC-037`と`L3Q-IT-023`で閉じる。
