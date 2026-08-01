---
title: "Atomic Slice Admission詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-02
updated: 2026-08-02
owner: SE
plan: docs/plans/PLAN-L5-85-atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/atomic-slice-admission.md
queue_id: L3Q-PC-037
---

# Atomic Slice Admission詳細設計

## 1. 実装境界

本pairは既存`github-guards`、`ddd-tdd-rules`、PLAN lint、design catalogが返す検査結果を読み、単一の
admission decisionへ純粋合成する契約を確定する。manifest parser、GitHub API取得、workflow配線、DB receipt永続化、
production codeは`L3Q-IT-023`へ残す。新detector、schema、DB table、workflow jobを作らない。

## 2. canonical型

```ts
type AdmissionDisposition = "admitted" | "split_required" | "recovery_required";
type ModelingDecision = "aggregate" | "domain_service" | "value_object" | "pure_function" | "none";
type FailureCode =
  | "invalid_intent"
  | "binding_mismatch"
  | "unknown_responsibility"
  | "multiple_behaviors"
  | "multiple_responsibilities"
  | "companion_mismatch"
  | "path_set_mismatch"
  | "scope_expansion_unauthorized"
  | "stale_snapshot";

interface AtomicSliceSnapshot {
  issueId: number;
  baseHead: string;
  candidateHead: string;
  manifestDigest: `sha256:${string}`;
  behaviorContractIds: readonly string[];
  responsibilityOwners: readonly string[];
  modelOwnerIds: readonly string[];
  expectedPaths: readonly string[];
  actualPaths: readonly string[];
  requiredCompanionPaths: readonly string[];
  actualCompanionPaths: readonly string[];
  modelingDecision: ModelingDecision;
}

interface ScopeExpansionReceipt {
  originalManifestDigest: `sha256:${string}`;
  candidateHead: string;
  reviewerRuntime: string;
  authorRuntime: string;
  reasonCode: string;
  addedPaths: readonly string[];
  receiptDigest: `sha256:${string}`;
}

interface AtomicSliceDecision {
  disposition: AdmissionDisposition;
  candidateHead: string;
  behaviorContractId: string | null;
  responsibilityOwner: string | null;
  acceptedPaths: readonly string[];
  rejectedPaths: readonly string[];
  failureCodes: readonly FailureCode[];
  decisionDigest: `sha256:${string}`;
}
```

path、contract、owner、failure codeはtrim後に空値を拒否し、重複を拒否してUTF-8 bytewise昇順へ正規化する。
pathはrepository-relative POSIX表記だけを許し、absolute、`..`、NUL、repository-root familyを拒否する。
digestはschema version付きcanonical JSONのSHA-256とする。

## 3. 純粋関数

```ts
canonicalizeAtomicSliceSnapshot(input: AtomicSliceSnapshot): Result<AtomicSliceSnapshot, FailureCode[]>
requiredCompanionSet(snapshot: AtomicSliceSnapshot): ReadonlySet<string>
validateScopeExpansion(snapshot: AtomicSliceSnapshot, receipt: ScopeExpansionReceipt | null): FailureCode[]
evaluateAtomicSlice(snapshot: AtomicSliceSnapshot, receipt: ScopeExpansionReceipt | null): AtomicSliceDecision
```

`evaluateAtomicSlice`は次の順で一度だけ評価する。

1. snapshotをcanonicalizeし、不正入力を`recovery_required`にする。
2. Issue／PLAN／manifest由来のcontract／owner exact一致を確認する。
3. behavior、responsibility、適用時のmodel ownerが各1件か確認し、複数なら`split_required`にする。
4. required／actual companionとexpected／actual pathを双方向exact比較する。
5. actualに追加pathがある場合だけscope expansion receiptを検査する。
6. failure precedenceに従いdispositionを決め、全集合とfailure codeを含むdecision digestを作る。

failure precedenceは`invalid/stale -> recovery`、`binding/unknown/unauthorized -> recovery`、
`multiple behavior/responsibility -> split`、`companion/path mismatch -> recovery`とする。複数failureを隠さず全件返し、
高位failureを低位の`admitted`で相殺しない。

## 4. scope expansion契約

receiptはoriginal manifest digestとcurrent candidate HEADへ束縛し、author runtimeと異なるreviewer runtime、空でない理由、
actual minus expectedとexact一致するadded pathを要求する。自己承認、別HEAD、旧manifest、欠落・余剰・重複pathを拒否する。
receiptが有効でも別behavior／responsibilityを追加できず、その場合は`split_required`を維持する。

## 5. companion契約

source変更では同じbehavior contractのPLAN、design、test companionを要求する。catalog、reviewed digest、freeze oracleなど
元artifactのdigestへ機械追従するpathはsupporting companionとして同じsliceへ含める。別contractの成果物、archive authority、
将来実装をcompanionとして数えない。

## 6. 状態遷移とstale

```text
candidate_discovered -> canonicalized -> bound -> evaluated -> admitted|split_required|recovery_required
```

Issue revision、PLAN digest、PR body digest、base／candidate HEAD、changed path set、design catalog digestのいずれかが変われば
既存decisionとexpansion receiptをstale化し、`candidate_discovered`から再評価する。event payloadでcurrent snapshotを補完しない。

## 7. 設計リファクタリングgate

候補A（既存owner結果の純粋合成）と候補B（新detector／schema／永続化）を同一fixtureとoracleで比較する。
合格条件は両候補がpositive／negative oracleを100%通し、candidate-admission p95を悪化させず、候補Aの
`new_component_count`、`new_state_count`、`new_persistence_surface_count`、`production_loc_delta`が候補B以下であることとする。
同値ならproduction code増分が小さい案を選ぶ。測定不能、oracle縮退、timeout延長、test除外は不採用とする。

`pure_function`／`none`はentity lifecycleとdomain invariantが0であるfixtureで許可する。同fixtureへ形式だけのaggregate／classを
追加する案は、behavior差0かつproduction LOC／component増のため拒否する。

## 8. L6/L7 carry

`L3Q-IT-023`は本型とoracleからproduction module、CLI／workflow結線、既存guardとのdual-greenをRed→Green→Refactorで実装する。
本L5設計とL8 test designをL6/L7 PLANのpair artifactとして再所有してはならない。

