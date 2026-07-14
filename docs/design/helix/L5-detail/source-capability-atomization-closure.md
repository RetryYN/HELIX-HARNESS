---
title: "HELIX L5 詳細設計 — source capability atomization closure"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-09B
related_hst:
  - HST-HIL-020
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
depends_on: docs/design/helix/L5-detail/source-capability-capture.md
pair_artifact: docs/test-design/helix/L5-source-capability-atomization-closure-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-09
  - HAC-HIL-09a
  - HAC-HIL-09b
  - HAC-HIL-09c
---

# HELIX L5 詳細設計 — source capability atomization closure

## §0 責務境界

本sliceはverifiedかつcurrentなsource capture bundleをread-only入力とし、entryからatomic behavior候補を抽出して
採否とcoverage chainを閉じる。ZIP/Git/current HEADの取得、4,470 entry分母、entry分類、capture artifact activation、
capture DB projectionは再実装しない。capture成功だけではatomization、採否、traceのいずれも成功にしない。

```text
active source capture bundle
  -> extractor proposal
  -> Node ingestion validation
  -> atomic split / semantic signature
  -> atom kind / fixture lineage
  -> decision revision
  -> HIL or authoritative non-goal
  -> L4/L5/L6 design
  -> executable assertion
  -> gate
  -> coverage receipt
```

## §1 moduleとauthority

| module | 責務 | authority | fail-close条件 |
|---|---|---|---|
| `ExtractorPluginRegistry` | plugin ID/version/runtime/input class/schema/digest/limitsをallowlist | Node registryだけ | 未登録、曖昧選択、digest不一致 |
| `AtomizationCoordinator` | entry→plugin→proposal→validation→sealを順序制御 | run eventのみ | capture stale、entry欠落、partial run |
| `PythonExtractorAdapter` | 共通`PythonWorkerBroker`へread-only requestを渡す | proposal受領だけ | protocol、timeout、late、write企図 |
| `AtomProposalIngestionPort` | source/plugin/run/span/schema/digestをNodeで検証 | validated proposalだけ | sequence、payload、span、terminal不一致 |
| `AtomicSplitValidator` | 独立採否境界へ分割しgap/overlapを検査 | split findingだけ | 複合behavior、過分割、未所有span |
| `SemanticSignatureBuilder` | trigger/I/O/effect/failure/stateから意味signatureを生成 | canonical IRだけ | lexical依存、collision、非決定値 |
| `FixtureLineageResolver` | fixture/evidence/aliasをbehavior分母から分離 | lineage edgeだけ | producer/assertion不明、weight誤算入 |
| `CapabilityDecisionLedger` | 6 decisionのappend-only revisionを正本化 | review済みdecisionだけ | current 0/複数、根拠不足、self-decision |
| `CoverageEdgeResolver` | decision→HIL→design→assertion→gateをtarget digest付き解決 | canonical edgeだけ | target不在、stale、自由relation |
| `CapabilityCoverageGate` | closure率と全failureを別分母で判定 | coverage receiptだけ | 平均で欠落を隠す、reverse片側 |

Python pluginはproposal生成だけを行い、stable atom ID、semantic signature、decision、coverage edge、DB、repo、
artifact current pointerへwriteしない。Nodeが全proposalを検証してからimmutable manifestをsealし、DBはartifactから
再構築できるprojectionとする。

## §2 extractor plugin／worker契約

plugin manifestは次を必須にする。

```ts
interface ExtractorCapabilityDescriptor {
  schema_version: "helix-extractor-capability.v1";
  plugin_id: string;
  plugin_version: string;
  runtime: "node" | "python";
  artifact_digest: string;
  input_classes: string[];
  mime_types: string[];
  proposal_schema: "helix-source-atom-proposal.v1";
  determinism_config_digest: string;
  limits: { max_entries: number; max_bytes: number; deadline_ms: number };
}
```

entryごとexactly-one primary pluginまたはterminal non-behavior routeを要求する。0件は
`HIL_SOURCE_EXTRACTOR_PLUGIN_UNREGISTERED`、複数件は`HIL_SOURCE_EXTRACTOR_PLUGIN_AMBIGUOUS`で止める。
任意pluginのdirectory探索やLLMによる即席plugin選択を禁止する。

Python protocolは共通workerの`hello -> proposal* -> complete|error|cancelled`を使い、各frameへrun/request/type、
monotonic sequence、source/blob/plugin/config digest、payload digestを持たせる。stdoutはprotocol専用、stderrは上限付き診断、
inputはcontent-addressed read-only artifact、outputはproposalだけとする。crash、timeout、cancel、late、partial completeでは
当該runのproposal commitを0件にする。

## §3 atomic splitとsemantic signature

candidateは次のいずれかが独立して採否可能なら分割する。

1. 外部から独立に起動できるtrigger。
2. 別authorityまたは別resourceへ行う副作用。
3. 別々に変更・retry・拒否できるfailure policy。
4. 独立oracleを持つstate transition。

一つのprecondition→postconditionを成立させる不可分な複数input/outputは過分割しない。primary source spanはatomic child間で
重複不可とし、共有import/type/proseは`evidence_only` shared contextへ分離する。意味entryの未所有spanはgapとしてblockする。

semantic IRはtrigger、typed input/output、effect(resource/operation/authority)、failure(condition/code/retry)、
state transition(from/event/to)、determinism、observableをcanonicalizeする。name、path、function名、extractor名、source spanは
semantic signatureから除外する。同義別名は同signature候補、同名でもeffect/failure/stateが違えば別signatureになる。
signature一致だけではabsorbedにせず、ancestry/patch/semantic＋assertion evidenceを別途要求する。

## §4 atom kindとartifact

`behavior_atoms.jsonl`は名称を維持するが、全recordは次のexactly-one `atom_kind`を持つ。

| atom kind | behavior分母weight | 必須lineage |
|---|---:|---|
| `behavior` | 1 | source span、semantic IR、oracle候補 |
| `regression_fixture` | 0 | producer atom＋input/generator digest、またはconsumer assertion |
| `evidence_only` | 0 | retention/non-goal、consumer証拠 |
| `duplicate_alias` | 0 | canonical atom、blob/semantic証拠 |

正規artifactは`behavior_atoms.jsonl`、`entry_atom_edges.jsonl`、`extractor_runs.jsonl`、
`extractor_proposals.jsonl`、`capability_decisions.jsonl`、`coverage_edges.jsonl`、`coverage_receipt.json`である。
capture bundleと同じsnapshot rootへappendせず、atomization revisionのcontent-addressed child bundleとしてsealする。

seal後の`commit -> project -> reconcile -> activate`はNodeだけが行う。commit requestは`operation_id`、
canonical bundle digest、expected artifact head、expected DB projection head、expected active head、idempotency keyを必須とし、
固定write setをartifact seal、event append、projection、active pointer、terminal receiptの順で実行する。artifact seal後に
DB projectionが失敗した場合は`projection_pending`を返し、同じoperation/digest/expected headsを受けるNode reconcileだけが
再開できる。head不一致、同一key別digest、順序違反はfail-closeし、暗黙の再seal、上書き、active化を禁止する。

## §5 decision証拠matrix

| decision | 必須証拠 | covered weight |
|---|---|---:|
| `adopt` | 現contract再利用、全coverage chain、実行oracle | 1 |
| `harden` | 保持invariant、hardening delta、negative oracle、rollback | 1 |
| `redesign` | 目的/authority保持、旧shape非再利用、Redesign設計/rollback | 1 |
| `reject` | authoritative HIL/non-goal、反証assertion、再出現gate | 1（disposition済み） |
| `absorbed` | exactly-one target、identity証拠、targetの完全chain | 0 |
| `pending` | owner、調査理由、期限 | 0、freeze blocker |

behavior atomはexactly-one current decisionを持つ。過去decisionはappend-only revisionで残し、LLM/pluginはdecisionを
自己確定しない。reject理由だけ、path/name一致だけ、branch aggregateだけのabsorbedを拒否する。

## §6 coverage閉鎖

closureは`decision -> HIL/non-goal -> L4/L5/L6 design -> executable assertion -> gate`のcanonical edgeと各target content
digestを要求する。relationは原子化契約の9種allowlistだけを使い、reverse viewは同じedge集合から生成する。
source/capture receipt、extractor/plugin/config、signature schema、decision、target digestの変更で影響receiptをstale化する。

率は平均せず別々に表示する。

| 指標 | 分子 | 分母 | capture後初期値 |
|---|---|---|---:|
| atomization closure | terminal atomを持つentry | capture entry | 0/4,470 |
| behavior split closure | atomic validation済みbehavior | behavior candidate | 0/unknown |
| fixture closure | lineage完備fixture | fixture atom | 0/unknown |
| disposition closure | current decision済みbehavior | behavior atom | 0/unknown |
| trace closure | full chain済みdisposition | covered decision | 0/unknown |

## §7 L8 integration oracle追跡

| L5境界 | L8 oracle |
|---|---|
| 4,470 entryのexact dispatch | `IT-SATOM-001` |
| Node extractor群のproposal/atom変換 | `IT-SATOM-002` |
| ZIP由来Python extractorとNode ingestion | `IT-SATOM-003` |
| 同snapshot/plugin/configの決定性 | `IT-SATOM-004` |
| composite sourceのatomic split保存則 | `IT-SATOM-005` |
| ZIP build fixtureの個別lineage | `IT-SATOM-006` |
| 6 decision routeとpending block | `IT-SATOM-007` |
| branch overlay absorbedの一意証明 | `IT-SATOM-008` |
| decisionからgateまでの正逆join | `IT-SATOM-009` |
| orphan等negativeのfreeze拒否 | `IT-SATOM-010` |
| source/plugin/target driftのstale伝播 | `IT-SATOM-011` |
| worker/artifact/event/DB faultのpartial防止 | `IT-SATOM-012` |
| Nodeによるcommit／projection／reconcile／activateの一貫処理 | `IT-SATOM-013` |

### §7.1 HST020主系の厳密追跡

| HSTケース | L8対応先 | 事前状態 | 期待状態 | 正規failure |
|---|---|---|---|---|
| `HST-CASE-020-01` | `IT-SATOM-001` | `snapshot_current` | `atoms_current` | `なし（正常系）` |
| `HST-CASE-020-02` | `IT-SATOM-010` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-03` | `IT-SATOM-010` | `atoms_partial` | `failed` | `HIL_SOURCE_AGGREGATE_ONLY` |
| `HST-CASE-020-04` | `IT-SATOM-005` | `staged` | `rejected` | `HIL_SOURCE_ATOM_NOT_ATOMIC` |
| `HST-CASE-020-05` | `IT-SATOM-007` | `atoms_partial` | `failed` | `HIL_SOURCE_ATOM_UNCLASSIFIED` |
| `HST-CASE-020-06` | `IT-SATOM-005` | `staged` | `rejected` | `HIL_SOURCE_ATOM_OVERLAP` |
| `HST-CASE-020-07` | `IT-SATOM-011` | `atoms_current` | `stale` | `HIL_SOURCE_ATOM_EXTRACTOR_STALE` |
| `HST-CASE-020-08` | `IT-SATOM-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SOURCE_ATOMIZATION_INCOMPLETE` |
| `HST-CASE-020-09` | `IT-SATOM-006` | `assertion_input_ready` | `assertion_pass` | `HIL_ATOMIC_COVERAGE_DENOMINATOR_INVALID` |

## §8 freeze条件

13/13 integration oracle、34/34 unit oracle、generated atom/decision/edge manifest、各closure率、negative mutation、
別runtime reviewが揃うまでdraftとする。4,470 entryの全dispatchを省略せず、代表sample greenを完了証拠にしない。

commit bundleはatom、decision revision、coverage edge、event、projection、exact write-setの実payloadを持つ。digest/countだけの
代理commit、payload欠落・余剰、write-set不一致はactive化0とする。

## §9 DB invariant閉鎖

`source_atoms`は`atom_id + revision`をPK、`source_snapshot_id/entry_id`をcapture projectionへのFKとし、`atom_kind=behavior`だけ`coverage_weight=1`、他kindは0に固定する。`capability_decision_revisions`は`atom_id + decision_revision`をPKとしcurrent partial uniqueを一件、`absorbed`だけ`absorbed_into_atom_id`を必須かつ自己参照禁止にする。`capability_coverage_edges`は`edge_id + revision`をPK、source/target digestとallowlisted relationを必須にし、stale edgeをcurrent closureへ算入しない。`atomization_events`はoperation内sequence uniqueのappend-only、`atomization_projection`はevent head、atom/decision/edge root、active bundle digestを保持するevent由来projectionで直接更新を禁止する。commit/reconcileはatom、decision、edge、event、projection、active pointer、receiptの実rowからexact write-setを再導出し、宣言との差分、FK違反、weight不一致、absorbed多重化ではtransaction全体をrollbackする。
