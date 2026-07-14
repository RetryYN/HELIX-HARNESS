---
title: "HELIX L5 詳細設計 — memory learning promotion"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-07
related_hst:
  - HST-HIL-015
  - HST-HIL-016
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
depends_on:
  - docs/design/harness/L6-function-design/harness-memory-structure.md
  - docs/design/harness/L6-function-design/harness-memory-compaction.md
  - docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
pair_artifact: docs/test-design/helix/L5-memory-learning-promotion-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-07
  - HAC-HIL-07a
  - HAC-HIL-07b
  - HAC-HIL-07c
  - HIL-BR-03
  - HIL-BR-11
  - HIL-FR-10
  - HIL-FR-14
  - HIL-NFR-02
system_tests:
  - HST-HIL-015
  - HST-HIL-016
---

# HELIX L5 詳細設計 — memory learning promotion

## §0 適用境界、現行資産、source provenance

本sliceは、verified completionから永続知識だけを抽出するknowledge compactionと、反復findingを
`pattern -> recipe -> shadow -> skill/detector -> gate`へ段階昇格するlearning promotionを扱う。
物理JSONL整理である既存`compactMemory`、session終了時の書込み忘れを警告する既存`memoryPromotionNudge`、
短期の進行状態を保持するcontinuationは再利用候補だが、本sliceのknowledge promoterやlearning ledgerの実装済み証拠ではない。

現行memory v2は`.helix/memory/{harness,project,takeover}.jsonl`をdata SSoTとし、harness.dbの機械状態と矛盾した場合は
DBを優先する。continuationはharness.dbのevent/projectionを正本とし、memoryへ進捗、next action、lease、current stateを
複製しない。この既存境界を維持し、knowledge compactionの出力だけをshared memoryへappendする。

source採取は次へ固定する。

| source ID | pinned evidence | 本sliceでの扱い |
|---|---|---|
| `HC-CHAT-016` | `docs/governance/infinity-loop-source-capability-ledger.md` | finding履歴からskill/detector/gateへ改善する要求。coverage deltaのL5降下を本書§7で具体化 |
| `HC-CHAT-020` | 同ledger | Codex完了時のknowledge compactionをClaude側へ分離する要求 |
| `HU-CAP-003` | `docs/governance/infinity-loop-source-snapshot-manifest.md` の `UT-ALL-REMOTE`、source root `git+https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`、`origin/main@e506a67e9c243cc9781ff4a6d8d1870b072fd37b`、tree `2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720`、entry set `sha256:0d4504197ae0213e35d712817f9f4dd4e4b8c9c6409cf49cf38e2b8cf690b188` | 下表の4 atomだけを最終処分へ固定する。aggregate自体のcovered weightは0のままとし、未採取symbolを採用済みと主張しない |

`HU-CAP-003`のうち精読済みatomは次へ固定する。lineは上記pinned commitのblob内1始まりであり、
Git blob IDにより同名fileの差替えを拒否する。

| atom | exact pinned source span | 観測したbehavior | 最終disposition | 現行吸収先 |
|---|---|---|---|---|
| `HU-CAP-003-A01` | `docs/design/harness/L6-function-design/memory.md` blob `b1f0baa6b59d0ce31c558400804a868b46db87a8` L23-L32、および `src/runtime/memory-promotion.ts` blob `ea3026672f6153ebaefe70ba09d8fae603a1f099` L1-L32 | sanitize済eventだけでcommit/plan switch後のmemory write欠落をnudgeする | harden。本文非読取は採用し、warningのpromotion authority化はreject | §1 `VerifiedCompletionReader`の本文非読取と、既存`memoryPromotionNudge`をauthority外とする§0境界 |
| `HU-CAP-003-A02` | `docs/design/harness/L6-function-design/memory.md` blob `b1f0baa6b59d0ce31c558400804a868b46db87a8` L34-L57 | secret-like payloadはauthoringでfail-close、runtime surface/nudgeはfail-open | harden。secret拒否を維持し、knowledge promotion gateはfail-closeへ強化 | §1 `MemoryPromotionGate`、§2 content scanner、§8 `HIL_MEMORY_SECRET_FORBIDDEN` |
| `HU-CAP-003-A03` | `docs/plans/PLAN-L7-53-learning-engine.md` blob `9e804d19725e93489fbe63a40d233b42ca2fed98` L73-L107 | skill adoption/success、model/PoC成功率をprojectionし、原資のないcostを捏造しない | harden。確認済みmetricだけをshadow入力とし、既存評価row単独の昇格authority化はreject | §5 shadow効果検証とL6 `measurePromotionEffect` |
| `HU-CAP-003-A04` | `docs/plans/PLAN-L7-392-memory-promotion-handover-digest.md` blob `fb57cc62ab810d3a0acac114c8da5e66a7e607e2` L151-L156 | memoryは永続知識だけとし、進捗とnext actionを保存しない | harden | §3 continuation分離とL6 `partitionCompletionKnowledge` |

上記span外の関数、schema、閾値、`.ut-tdd/memory/*.md`本文は未採取であり、採用・吸収・coverageを主張しない。

旧`.ut-tdd/memory/*.md`、human向けnudge、既存評価rowをそのままHELIXの正本root、強制gate、独立効果receiptへ流用しない。

## §1 componentとauthority

| component | 責務 | authority | 禁止 |
|---|---|---|---|
| `VerifiedCompletionReader` | completion、Issue、PR、CI、audit、oracleのdigestとverification receiptをread | completion observation | raw log本文、未verified completionの昇格 |
| `CompletionKnowledgePartitioner` | durable knowledge、continuation、forbidden content、no-promotionを全件分類 | partition proposal | 進捗のknowledge化、不明分類の黙認 |
| `KnowledgePromoter` | workerとは別role/providerでpromote/supersede/no-promotion proposalを作る | proposalだけ | 自成果の自己昇格、memoryへの直接write |
| `MemoryPromotionGate` | verification、role分離、classification、provenance、supersessionをNodeで再検証 | promotion receipt | secret/PII/raw log、prose-only receipt |
| `MemoryPromotionCommitter` | memory eventとpromotion ledgerを冪等commit | Node memory port＋`HarnessDbPort` | Claude/Codexからの直接DB write、片側commit |
| `LearningPatternAggregator` | finding、repair、Issue、commit、oracleを同一causalityでpattern候補へ集約 | pattern event | raw implementation logの複製、support偽装 |
| `LearningRecipeBuilder` | 再現手順、scope、期待oracle、fixture契約をrecipe化 | recipe event | fixtureなしshadow、自由文だけの手順 |
| `ShadowEvaluationCoordinator` | active workflowを変更せずbefore/afterと退行を測定 | shadow receipt | blocking適用、評価fixture差替え |
| `IndependentPromotionReviewer` | promoterと別role/providerで効果、false positive、coverage、rollbackを判定 | review receipt | self review、worker/promoter claimの追認だけ |
| `LearningPromotionGate` | skill/detector/gateの段階、review、rollback targetを検査 | promotion decision | stage飛越、即時gate化、rollbackなしactive化 |
| `LearningRollbackController` | regression時にactive revisionをrollback/retireし再昇格をfence | rollback/retire event | 証拠消去、同evidenceの無条件再利用 |

worker、knowledge promoter、independent reviewer、final verifierはidentity、role、provider familyの全6組合せで分離する。Claude Codeがknowledge promoterとなる場合も、
Nodeがcontractを検証して正本commitする。skill/detector/gateのauthor自身は最終reviewとactive化を兼ねない。

## §2 verified completionとknowledge compaction

compaction入力はraw transcriptではなく、既に正本化された参照とdigestだけを持つbounded packetとする。

```ts
type BoundedFactAuthority =
  | "completion_receipt"
  | "pull_request"
  | "ci_receipt"
  | "audit_finding"
  | "oracle_receipt"
  | "design_decision"
  | "raw_log_evidence";

interface BoundedFactRefV1 {
  schema_version: "helix-bounded-fact-ref.v1";
  authority: BoundedFactAuthority;
  authority_id: string;
  immutable_revision: string;
  content_digest: string;
  media_kind: "durable_fact" | "raw_log_reference";
  resolved_bytes: number;
}

interface VerifiedCompletionPacketV1 {
  schema_version: "helix-verified-completion.v1";
  causality_id: string;
  issue_id: string;
  completion_receipt_digest: string;
  worker_identity_digest: string;
  verification_receipt_digest: string;
  pr_head_digest: string | null;
  ci_receipt_digests: string[];
  audit_finding_digests: string[];
  oracle_receipt_digests: string[];
  candidate_fact_refs: BoundedFactRefV1[];
  continuation_ref: string | null;
  packet_digest: string;
}
```

`candidate_fact_refs`は最大64件、各参照のcanonical JSONは512 bytes以下、解決後は各16 KiB以下かつ合計256 KiB以下とする。
authorityは上記allowlistだけ、`immutable_revision`はauthority側のcurrent receipt/revisionと一致し、`content_digest`は解決結果と一致しなければならない。
stale revision、dangling ID、allowlist外authority、digest mismatch、件数またはbyte上限超過は
`HIL_MEMORY_COMPACTION_INVALID`でpacket全体を拒否する。参照は決定、制約、再利用可能なdiagnostic、安定した設計知識の正本だけを指す。raw command output、
provider transcript、diff全文、自由形式log、進捗率、現在作業、next action、secret、credential、token、PII本文をpacketへ入れない。
入力境界でbodyとmetadataを同じscannerへ通し、secret/PIIは`HIL_MEMORY_SECRET_FORBIDDEN`、raw logは
`HIL_MEMORY_RAW_LOG_FORBIDDEN`、進捗は`HIL_MEMORY_PROGRESS_FORBIDDEN`でmemory write 0とする。

`raw_log_evidence`は`media_kind=raw_log_reference`のopaque provenance参照だけを許し、本文を解決してmemory candidateへ流さない。
この参照はpartitionの`no_value`へ分類し、それ自体はraw本文混入ではない。raw log本文をpacket/body/metadataへ
埋め込む反例だけが`HIL_MEMORY_RAW_LOG_FORBIDDEN`となる。これにより`HST-CASE-015-06`のbounded参照partitionと
`HST-CASE-015-02`の本文混入fail-closeを分離する。

各candidateを`durable_knowledge | continuation | forbidden | duplicate | no_value`へ全件分類する。continuationは
harness.dbの既存event/projectionへ残し、memory eventを生成しない。分類不能はdurableへ推測せず
`HIL_MEMORY_COMPACTION_INVALID`でpacket全体を拒否する。

promotion結果は次のどれか一つである。

- `promote`: 新しいmemory key/revisionをappendする。
- `supersede`: 生存entryを明示参照する新revisionをappendする。
- `no_promotion`: 永続化価値なし、重複、continuation-onlyの理由とinput/output digestをreceiptに残す。

verified completion一件につきterminal receiptはexactly-oneとする。4主体のidentity、role、provider familyが一組でも衝突するなら
`HIL_MEMORY_PROMOTER_NOT_INDEPENDENT`、admission/completion event種別が混在する場合は`HIL_MEMORY_EVENT_MIXED`とする。
既存の物理compactionは意味を要約せず、knowledge promotionの代用にしない。

## §3 memoryとcontinuationの分離

| 情報 | 正本 | memory昇格 |
|---|---|---|
| 現在state、進捗、next action、lease、checkpoint | harness.db continuation event/projection | 禁止 |
| provider delegation transcript/handover | delegation evidence | 禁止 |
| 検証済み決定、長期制約、再利用可能な設計知識 | harness/project memory event | 許可 |
| 一時的なruntime takeover | takeover memory lifecycle | 長期knowledgeへ自動転記禁止 |
| raw log、secret、PII、credential | 原evidenceの保護境界または即時拒否 | 禁止 |

memory receiptはcontinuation refを参照できるが、continuation本文や現在stateを複製しない。DB優先はcontinuationとprocess projectionの
stateに限り、knowledge payload、key、revision、supersessionのdata authorityは常にmemory JSONLとする。DB projectionがJSONLと矛盾する場合は
DB rowをstaleとして再投影し、JSONL entryをDB値で上書きしない。completion closureはmemoryまたはno-promotion receiptのdigestだけをjoinする。

## §4 learning ledgerと段階遷移

findingは本文を複製せず、finding/Issue/commit/oracle digestとcause IDを`raw_event_ref`として登録する。許可遷移は次とする。

```text
raw_event_ref -> pattern -> recipe -> shadow -> shadow_verified
shadow_verified -> skill_candidate -> skill_active
shadow_verified -> detector_candidate -> detector_active
skill_active | detector_active -> gate_candidate -> gate_active
shadow | shadow_verified | *_candidate | *_active -> rolled_back -> retired
```

patternはsupport countと独立causality数、recipeは再現fixture、expected oracle、scope、non-goal、ownerを必須とする。
fixtureなしshadowは`HIL_PROMOTION_FIXTURE_MISSING`、recipeからgateへの直行は
`HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN`、その他のstage飛越は`HIL_PROMOTION_STAGE_BYPASS`で拒否する。

skill/detectorはshadow verified後の別branchであり、片方を他方の証拠として偽装しない。blocking gateはactive skillまたはdetector、
独立review、rollback target、限定scopeを要求する。反復logの多さだけでrecipe/gateへ昇格する場合は
`HIL_LEARNING_PROMOTION_PREMATURE`とする。

## §5 fixture、shadow、独立効果検証

shadowはactive workflowのdecisionを変更せず、同じversioned fixture setをbaseline/candidateへ実行する。receiptは最低限、
source snapshot、recipe/candidate version、fixture set、oracle set、before/after result、sample/support count、成功率、
false-positive/negative率、設計document coverage delta、runtime/cost delta、scope、reviewer identity、rollback targetのdigestを持つ。

before metricまたは独立review receiptが無い場合は`HIL_PROMOTION_EFFECT_MISSING`とする。coverage deltaは
requirement/design/test/oracleの未接続数、説明なしobligation、false coveredを同じ分母でbefore/after比較する。
blocking gate昇格にはcoverage改善が正、既存oracle退行0、false-positive policy内を要求する。skill/detectorは目的metricの改善を
要求し、coverage非改善をgate昇格のshortcutに使わない。

一fixtureでも既存workflow、acceptance、security、authority、portabilityを退行させた場合は
`HIL_PROMOTION_SHADOW_REGRESSION`でactive化0、rollbackを実行する。promoterとreviewerが同一、またはworker claimだけのreviewは
独立効果検証として受理しない。

## §6 rollback、retire、再昇格fence

active化前に直前active revision、artifact/config digest、disable手順、影響scopeをrollback targetとしてsealする。
rollback targetが無いdetector/skill/gate promotionは`HIL_PROMOTION_ROLLBACK_MISSING`で停止する。

regression時はcandidateを`rolled_back`、生成artifactをinactive、関連gateをnon-blockingへ戻し、rollback receiptをappendする。
rollback済みrevisionは再active化せず`retired`へ進める。同じfixture/evidence digestだけでの再昇格を拒否し、修正revision、
新shadow receipt、別reviewer receiptを要求する。過去receiptやfindingは削除しない。

## §7 harness.db projection候補

| table | 主要key／field | 不変条件 |
|---|---|---|
| `memory_compaction_runs` | completion、worker/promoter/reviewer/final verifier、packet/input/output digest、decision、failure | completionごとterminal最大1、4主体全6 pairのidentity/role/provider分離 |
| `memory_promotion_receipts` | run、layer/key/revision、promote/supersede/no-promotion、entry/event digest | continuation本文0、raw/sensitive本文0 |
| `learning_patterns` | pattern、cause set、support count、source digest、state | source causality重複をsupportへ二重計上しない |
| `learning_recipes` | pattern、version、fixture/oracle/scope/non-goal digest、owner、state | recipeごとactive version最大1 |
| `learning_shadow_runs` | recipe/candidate、fixture、before/after、coverage、FP/FN、review、rollback digest | active workflow変更0、fixture同一 |
| `learning_promotion_reviews` | worker/promoter/reviewer/final verifier、効果、退行、scope、decision digest | 4主体全6 pairのidentity/role/provider分離、自己review 0 |
| `learning_promotion_events` | subject/version、from/to、operation、previous/event digest、failure | append-only、stage順序、operation一意 |
| `learning_active_revisions` | kind、scope、artifact/config、active/rollback revision、receipt | kind/scopeごとactive最大1 |
| `learning_rollback_receipts` | revision、cause、target、effect、disabled artifact、review digest | rollback後の同revision再active 0 |

memory JSONLはknowledge payload、key、revision、supersessionのdata SSoTを維持し、harness.dbはcompaction/promotionのprocess、role、stage、effect、rollbackを投影する。
Nodeはmemory appendとDB eventを一つの偽filesystem/SQLite transactionとは呼ばない。commit stateは
`planned -> memory_appended -> projection_pending -> projected -> terminal`だけを許す。memory append receipt後にDB projectionが失敗した場合は
`projection_pending`を返し、terminal/closureを公開しない。同じoperation ID、JSONL entry digest、expected DB headを使うreconcileだけが再開でき、
JSONL再append 0、DB projection一件、terminal receipt exactly-oneで`terminal`へ進む。異digest retryは`HIL_MEMORY_COMPACTION_INVALID`で停止する。

### §7.1 promotion active化／rollbackの不可分transaction

skill、detector、blocking gateのactive化はplan生成で完了しない。Node `LearningPromotionStore`はsubject revision、
active revision pointer、artifact/configまたはgate policy、promotion event/projection、activation receiptを
`LearningActivationCommitBundleV1`として単一transactionでCAS commitする。bundleはoperation/payload digest、expected event/projection
head、shadow/effect/review/final verifier receipt、authority、freshness、rollback targetを必須とする。

rollbackもcurrent revisionのdisable、rollback targetのrestore/publish、active pointer、event/projection、rollback receiptを同じtransactionで
commitする。role/provider分離、shadow/review freshness、authority、CASのいずれかが不成立ならwrite 0。各append faultで全writeをrollbackし、
同operation・同digestは既存receipt一件、異digestはconflictとする。reconcileはimmutable event/artifact/review evidenceからのみ復元する。

## §8 failure契約

| canonical failure | 条件 | 副作用 |
|---|---|---|
| `HIL_MEMORY_RAW_LOG_FORBIDDEN` | raw log/transcript/diff本文のmemory混入 | memory write 0 |
| `HIL_MEMORY_PROGRESS_FORBIDDEN` | progress/current/next actionのmemory混入 | memory write 0 |
| `HIL_MEMORY_SECRET_FORBIDDEN` | secret/credential/PIIのbodyまたはmetadata混入 | memory write 0 |
| `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` | worker/promoter/reviewer/final verifierのidentity、role、provider familyが一組以上衝突 | receipt 0 |
| `HIL_MEMORY_COMPACTION_INVALID` | verified/provenance/classification/partition不完全 | promotion 0 |
| `HIL_MEMORY_EVENT_MIXED` | admission、completion、continuationのevent種別混在 | promotion 0 |
| `HIL_PROMOTION_FIXTURE_MISSING` | 再現fixtureなしshadow | stage増分0 |
| `HIL_PROMOTION_EFFECT_MISSING` | before/afterまたは独立review欠落 | active化0 |
| `HIL_PROMOTION_SHADOW_REGRESSION` | shadowで一件以上退行 | rollback、active化0 |
| `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN` | recipeからblocking gateへ直行 | gate増分0 |
| `HIL_PROMOTION_ROLLBACK_MISSING` | rollback targetなし昇格 | active化0 |
| `HIL_LEARNING_PROMOTION_PREMATURE` | support/fixture/shadow/review前の強制化 | active化0 |
| `HIL_PROMOTION_STAGE_BYPASS` | 許可graph外遷移またはrollback省略 | stage増分0 |

## §9 L8 oracleへのexact trace

| L5責務 | HAC | HST exact case | pre_state | expected_state | L8 oracle | canonical failure |
|---|---|---|---|---|---|---|
| verified completion compaction | `HAC-HIL-07a` | `HST-CASE-015-01` | `completion_verified` | `compacted` | `IT-MLP-001` | `なし（正常系）` |
| raw log拒否 | `HAC-HIL-07b` | `HST-CASE-015-02` | `completion_verified` | `rejected` | `IT-MLP-002` | `HIL_MEMORY_RAW_LOG_FORBIDDEN` |
| continuation分離 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-03` | `completion_verified` | `rejected` | `IT-MLP-003` | `HIL_MEMORY_PROGRESS_FORBIDDEN` |
| secret/PII拒否 | `HAC-HIL-07b` | `HST-CASE-015-04` | `completion_verified` | `rejected` | `IT-MLP-004` | `HIL_MEMORY_SECRET_FORBIDDEN` |
| 4主体独立性 | `HAC-HIL-07b` | `HST-CASE-015-05` | `completion_verified` | `completion_verified` | `IT-MLP-005` | `HIL_MEMORY_PROMOTER_NOT_INDEPENDENT` |
| durable knowledge partition | `HAC-HIL-07a` | `HST-CASE-015-06` | `assertion_input_ready` | `assertion_pass` | `IT-MLP-006` | `HIL_MEMORY_COMPACTION_INVALID` |
| event種別分離 | `HAC-HIL-07a`, `HAC-HIL-07b` | `HST-CASE-015-07` | `assertion_input_ready` | `assertion_pass` | `IT-MLP-007` | `HIL_MEMORY_EVENT_MIXED` |
| shadow正常検証 | `HAC-HIL-07c` | `HST-CASE-016-01` | `recipe` | `shadow_verified` | `IT-MLP-008` | `なし（正常系）` |
| fixture必須 | `HAC-HIL-07c` | `HST-CASE-016-02` | `pattern` | `pattern` | `IT-MLP-009` | `HIL_PROMOTION_FIXTURE_MISSING` |
| effect必須 | `HAC-HIL-07c` | `HST-CASE-016-03` | `shadow` | `shadow` | `IT-MLP-010` | `HIL_PROMOTION_EFFECT_MISSING` |
| regression rollback | `HAC-HIL-07c` | `HST-CASE-016-04` | `shadow` | `rolled_back` | `IT-MLP-011` | `HIL_PROMOTION_SHADOW_REGRESSION` |
| 即時gate禁止 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-05` | `recipe` | `recipe` | `IT-MLP-012` | `HIL_PROMOTION_IMMEDIATE_GATE_FORBIDDEN` |
| rollback target必須 | `HAC-HIL-07c` | `HST-CASE-016-06` | `shadow_verified` | `shadow_verified` | `IT-MLP-013` | `HIL_PROMOTION_ROLLBACK_MISSING` |
| premature promotion拒否 | `HAC-HIL-07b`, `HAC-HIL-07c` | `HST-CASE-016-07` | `assertion_input_ready` | `assertion_pass` | `IT-MLP-014` | `HIL_LEARNING_PROMOTION_PREMATURE` |
| stage/rollback順序 | `HAC-HIL-07c` | `HST-CASE-016-08` | `assertion_input_ready` | `assertion_pass` | `IT-MLP-015` | `HIL_PROMOTION_STAGE_BYPASS` |

## §10 freeze条件

L5/L8 pairは15/15 integration、HST-HIL-015の7 case、HST-HIL-016の8 case、全canonical failure、
knowledge/continuation分離、worker/promoter/reviewer分離、secret/PII/raw log 0、同一fixtureのbefore/after、coverage delta、
rollback/retire、別runtime reviewが揃うまでdraftとする。既存memory CLI、物理compaction、promotion nudge、skill評価reportの存在だけで
本sliceの実装、HAC、freezeを主張しない。
