---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-durability-boundaries.md
plan: docs/plans/PLAN-L6-78-durability-boundary-design.md
---

# diagnostic redaction / autonomous-loop durability 機能設計

## 1. 公開contract

- `stableCauseDigest(cause: unknown): StableCauseDigest`
- `doctorFailure(checkId: string, reasonCode: DoctorReasonCode, cause: unknown): DoctorFailure`
- `readLoopEpoch(planId: string): LoopEpochReadResult`
- `commitLoopEpoch(input: LoopEpochCommitInput, port: DurableEpochPort): LoopEpochCommitResult`

`StableCauseDigest`は有限`causeKind`、`sha256:<64 lower hex>`、`truncated`だけを持つ。`DoctorFailure`はallowlist
fieldのみでraw causeを持たない。`LoopEpochReadResult`は `missing | committed | uncommitted | corrupt |
concurrent_conflict | ambiguous_side_effect` を区別する。

## 2. cause digest DbC

pre: causeは任意のJavaScript value。post: helperはthrowせず、boundedな有限kind/digestを返す。invariant: raw
message、stack、path、SQL、secret、PIIを返却・永続化しない。同じcanonical safe inputは同じdigestとなる。
property access、string coercion、serializationがthrowした場合は`inaccessible`へ収束する。

## 3. loop epoch DbC

pre: plan IDはcanonical、epoch IDは直前committed epochより単調増加、previous digestはreader snapshotと一致する。
post: `committed`ならstate/receipt/manifestのdigestが一致し、restart readerが同じepochを返す。commit manifest durable
publish前のfailureは新epochをauthoritativeにしない。invariant: corruption、I/O exception、CAS conflict、曖昧な
side effectをmissing/successへ縮退しない。

publish順は payload temp write -> file fsync -> payload rename -> directory durability -> manifest temp write -> manifest
fsync -> manifest rename -> directory durability とする。commit時はprevious digest CASを再検査する。platformがdirectory
fsyncを提供しない場合はcapabilityを明示し、file fsync + same-volume renameより強い保証を表示しない。

## 4. recovery decision

`missing`だけがfresh start可能である。`uncommitted`は安全に無視できるが診断を残す。`corrupt`と
`concurrent_conflict`はfail-closeする。`ambiguous_side_effect`は自動retryせず、plan、epoch、safe digestを含む
recovery packetへ送る。readerは破損artifactを変更しない。

## 5. DbC trace

| 公開関数            | pre                            | post                        | invariant                           | oracle                        |
| ------------------- | ------------------------------ | --------------------------- | ----------------------------------- | ----------------------------- |
| `stableCauseDigest` | unknown value                  | finite kind + typed SHA-256 | throw/raw leakなし                  | U-DUR-001/002                 |
| `doctorFailure`     | check/reason allowlist         | bounded safe failure        | raw interpolationなし               | U-DUR-003、IT-DUR-001         |
| `readLoopEpoch`     | canonical plan ID              | 6状態を区別                 | corrupt≠missing                     | U-DUR-004/005、IT-DUR-002     |
| `commitLoopEpoch`   | snapshot-bound previous digest | manifest後だけcommitted     | partial/concurrentをsuccess化しない | U-DUR-006/007、IT-DUR-003/004 |
