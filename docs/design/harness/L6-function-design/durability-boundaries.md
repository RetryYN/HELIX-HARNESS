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
- `classifyLoopRecovery(read: LoopEpochReadResult): LoopRecoveryDecision`
- `authorizeLoopSideEffect(read: LoopEpochReadResult, effect: () => T): SideEffectGateResult<T>`
- `recoverStaleLoopClaim(packet: ClaimRecoveryPacket, port: EpochClaimPort): ClaimRecoveryResult`
- `actionBindingLoopRecoveryAuthority(record: StaleLoopClaimApprovalRecord): StaleLoopClaimRecoveryAuthority`

`StableCauseDigest`は有限`causeKind`、`sha256:<64 lower hex>`、`truncated`だけを持つ。`DoctorFailure`はallowlist
fieldのみでraw causeを持たない。`LoopEpochReadResult`は `missing | committed | uncommitted | corrupt |
concurrent_conflict | ambiguous_side_effect | live_claim | stale_claim | durability_uncertain` を区別する。
digest-valid manifestでも残留claimがあればuncertainで、claim release durable完了後だけcommittedとなる。

## 2. cause digest DbC

pre: causeは任意のJavaScript value。post: helperはthrowせず、boundedな有限kind/digestを返す。invariant: raw
message、stack、path、SQL、secret、PIIをhash入力・返却・永続化しない。同じallowlist分類は同じdigestとなる。
property access、string coercion、serializationがthrowした場合は`inaccessible`へ収束する。
v1の`truncated`は常にfalseであり、raw prefixを切断してhashする用途への転用を禁止する。digest authority自体が
失敗した場合も事前固定した`inaccessible` fallback envelopeへ収束し、causeへ再アクセスしない。

## 3. loop epoch DbC

pre: plan IDはcanonical、epoch IDは直前committed epochより単調増加、previous digestはreader snapshotと一致する。
post: `committed`ならstate/receipt/manifestのdigestが一致し、claim unlinkとそのparent directory durabilityまで完了し、
restart readerが同じepochを返す。それ以前のfailureは新epochをauthoritativeにせずuncertain/blockとする。invariant: corruption、I/O exception、CAS conflict、曖昧な
side effectをmissing/successへ縮退しない。

publish前にplan-scoped exclusive claimをatomic createし、取得後にprevious digestを再検査する。publish順は payload temp write -> file fsync -> payload rename -> directory durability -> manifest temp write -> manifest
fsync -> manifest rename -> directory durability -> claim unlink -> claim parent directory durability -> committed return とする。commit時はprevious digest CASを再検査する。platformがdirectory
fsyncを提供しない場合はcapabilityを明示し、file fsync + same-volume renameより強い保証を表示しない。
Windowsのregular file fsyncはwritable/non-truncating handleで実行し、directory fsync非対応だけを明示した
`file_fsync_same_volume_rename` capabilityへ縮退する。Windows対応claimはactual runnerでinitial/second epoch、
pointer replacement、restart、hard-link mutexを通過した場合だけ許可する。

## 4. recovery decision

`missing`だけがfresh start可能である。`uncommitted`は安全に無視できるが診断を残す。`corrupt`と
`concurrent_conflict`はfail-closeする。`ambiguous_side_effect`は`classifyLoopRecovery`が`block_and_escalate`へ写し、自動retryせず、plan、epoch、safe digestを含む
recovery packetへ送る。readerは破損artifactを変更しない。

`authorizeLoopSideEffect`はdurable intentと全digestを検証後だけeffect callbackを一度呼ぶ。intent commit前、
C5 uncertain、corrupt/conflictではcallback 0でblockする。`recoverStaleLoopClaim`はboot identity、process start token、
monotonic lease、manifest/claim digest、authority/auditを検証し、recovery用exclusive claim取得後だけ処理する。
production loopはiteration、purpose（worker/verifier）、intent/completed、safe verdictをepoch payloadへ保存する。
restartはcompleted workerを再実行せずverifierへ進み、completed verifierは保存済みverdictを再利用してfinal stateだけを
commitする。ambiguous intent、state snapshot mismatch、worker-only finalizationは公開store境界でもfail-closeする。
legacy JSONはsource digest名markerへretireしてepoch0へimportし、done markerをdurable publishする。完了markerまたは
orphan epoch evidenceがある状態をmissing/fresh importへ戻してはならない。
recovery mutexはunique tempをfile fsyncした後にhard-linkでfixed nameへatomic publishする。stale/legacy partial mutexの
quarantineは、mutex actionとexact digestを含むapproval snapshotを検証し、cleanup approval envelopeをdurable化してから
tombstone化する。authority matcherへ渡すrecordはplain object自体を信頼根拠にしてはならず、production compositionは
actor/tool/target/params、expiry、revocation、current snapshot、auditを検証するappend-only trusted SSoT adapterが存在する場合だけ
有効化する。現行の`planOnly=true` / `approvalAllowed=false` packetから実行authorityを構成してはならない。

## 5. DbC trace

| 公開関数                  | pre                              | post                                 | invariant                           | oracle                        |
| ------------------------- | -------------------------------- | ------------------------------------ | ----------------------------------- | ----------------------------- |
| `stableCauseDigest`       | unknown value                    | finite kind + typed SHA-256          | throw/raw leakなし                  | U-DUR-001/002                 |
| `doctorFailure`           | check/reason allowlist           | bounded safe failure                 | raw interpolationなし               | U-DUR-003、IT-DUR-001         |
| `readLoopEpoch`           | canonical plan ID                | 9状態を区別                          | corrupt/claim/uncertain≠missing     | U-DUR-004/005、IT-DUR-002     |
| `commitLoopEpoch`         | snapshot-bound previous digest   | claim release durable後だけcommitted | partial/concurrentをsuccess化しない | U-DUR-006/007、IT-DUR-003/004 |
| `classifyLoopRecovery`    | exact read classification        | retry/start/block                    | ambiguousをretryへ写さない          | U-DUR-005、IT-DUR-005         |
| `authorizeLoopSideEffect` | durable intent + verified digest | gate後だけeffectを呼ぶ               | effect-before-intent禁止            | U-DUR-005、IT-DUR-005         |
| `recoverStaleLoopClaim`   | snapshot-bound packet            | single recovery owner                | wall clock/PID単独で奪取しない      | U-DUR-007、IT-DUR-004         |
| `actionBindingLoopRecoveryAuthority` | trusted approval record | exact scope・expiry一致時だけ許可 | plan-only packetをauthority化しない | U-DUR-007、IT-DUR-004 |
| `durableFileLoopStore` | exact epoch/stage snapshot | stage順にresume/finalize | ambiguous再実行・legacy rollback禁止 | U-DUR-005/007、IT-DUR-003/005 |
