---
title: "HELIX L5 詳細設計 — intake contract normalization"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-01
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hat:
  - HAT-HIL-01
related_hst:
  - HST-HIL-001
pair_artifact: docs/test-design/helix/L5-intake-contract-normalization-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-01
  - HAC-HIL-01a
  - HAC-HIL-01b
  - HAC-HIL-01c
  - HIL-BR-12
  - HIL-FR-02
  - HIL-FR-03
  - HIL-NFR-01
  - HIL-NFR-05
source_capabilities:
  - HU-CAP-002
---

# HELIX L5 詳細設計 — intake contract normalization

## §0 適用境界

本書はuser/chat、GitHub、product、ZIP/sourceの4 ingressを互いに異なるuntrusted envelopeとして受け、
source、cause、operation ID、payload digest、source schema revision、authority、route、custodyを持つ同一のversioned
Issue contractへNode authorityで正規化する。外部本文はopaque evidenceであり、command、prompt、task、tool argument、shell、pathへ
補間しない。受信custodyはvalidationより先に独立durable化する。Admission成功はそのcurrent custody receiptを参照した
contract revision、route、causality、handoff、idempotency receiptのtransactional commitで観測する。

HAT-HIL-01はHST-HIL-001 familyを参照するが、case ownershipはprimary L1要求で分割する。本sliceが所有するのは
`HST-CASE-001-01`、`HST-CASE-001-02`、`HST-CASE-001-03`、`HST-CASE-001-05`、`HST-CASE-001-07`、
`HST-CASE-001-08`、`HST-CASE-001-10`の7件である。`HST-CASE-001-04`、`HST-CASE-001-06`、`HST-CASE-001-09`は
HDS-HIL-02が所有する。本sliceはtyped cause root、initial admission transition、budget metadataを渡すが、
全loop causality closure、全state順序、budget checkpointを再実装・再採点しない。

## §0.1 HU-CAP-002 pinned source結線

旧UTはruntimeとしてimportせず、次のimmutable sourceだけをmigration evidenceとして参照する。

| 項目 | pinned値／disposition |
|---|---|
| source root | `https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git` |
| ref／commit／tree | `origin/main`／`e506a67e9c243cc9781ff4a6d8d1870b072fd37b`／`2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720` |
| entry | `src/state-db/feedback-projections.ts`、blob `5f5dd5e73a905cc42494d6c2ff0228db43ad5479`、SHA-256 `769893aa287e5b6d95b581ade4d2883f5f399b98d1b18aca9e1c93b2cb4d5414` |
| exact spans | `projectIssueQueue` L687-L738、`projectIssueApprovalGuardrails` L740-L765 |
| final disposition | redesign（再設計）。source event参照とstable queue IDは採取し、dry-run prose body、manual-only approval、user/GitHub限定projectionを4-ingress typed contractへ置換 |

当該spanはfeedback eventからqueue candidateを作る実績であり、payload trust、operation/payload conflict、contract revision、
4-ingress coverageを実装済みとは示さない。span外の同file、current worktree、別commitをHU-CAP-002採取済みへ算入しない。

## §1 ingress envelopeと信頼境界

全envelopeは共通headerを持つが、source固有metadataをunionで分離する。

| ingress | 固有metadata | custody source locator | 禁止 |
|---|---|---|---|
| `user_chat` | provider、conversation/thread、native event、actor、message revision | transcript/event locator＋content digest | 本文をsystem/developer instruction、task、shellとして実行 |
| `github` | delivery ID、repository ID、event/action、Issue/PR、head SHA、sender class | provider delivery＋payload digest | PR/Issue本文、comment、workflow fieldを命令として実行 |
| `product` | connector/version、snapshot/entity、cursor/watermark、schema/freshness/classification | product snapshot/entity version | raw PII/secret保存、source authorityをPO authorityへ昇格 |
| `zip_source` | source family、ref/tree、entry/span、manifest/extractor version | immutable artifact＋entry/span | archive path traversal、macro/script実行、source proseを規範化 |

common headerは`ingress_kind`、`source_event_id`、`source_schema_revision`、`operation_id`、`payload_digest`、
`cause_id`、`received_at`、`actor_id`、`authority_class`、`payload_artifact_ref`、`transport_metadata_digest`を持つ。
payloadはread-only quarantine storeへ保存し、normalizerへは検証済みmetadataとdigestだけを渡す。schema unknown、digest不一致、
source/cause/authority/custody locator欠落はcontract proposalを0件にする。ただしtransportが受信した事実はvalidation結果と独立に
custodyへ残す。declared `authority_class`はtransportが検証したactor identityとcurrent authority policy receiptから再導出し、自己申告、
別actor、失効policy、別source kindへのreceipt再利用を拒否する。

## §2 componentとauthority

| component | 責務 | authority | fail-close条件 |
|---|---|---|---|
| `IngressTrustClassifier` | 4 ingressをuntrustedとして分類しallowlist parserを選択 | trust receiptだけ | trusted自己申告、unknown source、本文実行企図 |
| `IngressEnvelopeValidator` | common/source固有schema、digest、revision、locatorを検査 | validated envelopeだけ | field欠落、schema drift、payload/digest不一致 |
| `DirectiveCustodyWriter` | 分類前にsource/cause/actor/time/digest/artifact refをappend | custody receiptだけ | classify先行、UPDATE/DELETE、raw secret/PII複製 |
| `IntakeIdempotencyGate` | operation ID＋payload digestを予約しduplicate/conflictを分離 | reservation/conflict receipt | 同key異digest更新、duplicate副作用 |
| `IssueContractNormalizer` | envelopeから同一Issue contract schemaへ決定論変換 | proposalだけ | source別contract fork、外部本文のobjective化 |
| `IssueRouteResolver` | primary mode、drive、Reverse、Forward targetをauthority付き決定 | route receiptだけ | route欠落、unknownのForward fallback、自己正当化 |
| `AdmissionMinimalityGate` | acceptanceに必要なcontract surfaceだけを許可 | minimality receiptだけ | 不要CLI/API/schema/dependency/config追加 |
| `IssueAdmissionWriter` | 先行custody receiptを検証し、idempotency/contract/route/causality/handoffを一transactionでcommit。custodyは再appendしない | Node append/CASだけ | partial commit、stale custody/revision、AI direct write |

adapter、Python worker、Claude、Codex、GitHub/product connectorはproposalを返せるが、custody、operation reservation、contract revision、
route、authorityを直接writeしない。Node writerだけがschema/digest/current revisionを再検証してauthoritative eventをappendする。

## §3 versioned Issue契約

```ts
interface IssueContractV1 {
  schema_version: "helix-issue-contract.v1";
  issue_id: string;
  revision: number;
  supersedes_revision: number | null;
  ingress_kind: "user_chat" | "github" | "product" | "zip_source";
  source_event_id: string;
  source_locator_digest: string;
  source_schema_revision: string;
  cause_id: string;
  operation_id: string;
  payload_digest: string;
  payload_artifact_ref: string;
  authority_class: "po" | "human" | "external" | "product" | "source";
  custody_receipt_digest: string;
  objective: string;
  acceptance_oracle_ids: string[];
  primary_mode: string;
  drive: string;
  affected_layers: string[];
  reverse_contract_ref: string;
  forward_target: string;
  route_receipt_digest: string;
  risk_class: string;
  scope_budget_digest: string;
  contract_digest: string;
}
```

contract digestはschema versionと全fieldのcanonical byte列から計算する。revisionは意味変更時だけ単調増加し、同operation/digest再送で
増やさない。外部本文は`payload_artifact_ref`で参照するだけでobjectiveへ自動転記しない。objective/oracle/routeはcustodied sourceから
抽出されたcandidateをtrusted authorityが確定する。必須field、空ID、unknown enum、重複oracle、自己causeを拒否する。

## §4 admission／idempotency／conflict処理

処理順を次に固定する。

```text
receive -> quarantine payload -> append receipt-level custody -> validate envelope/actor/policy
        -> reserve(operation_id, payload_digest, source_event_id)
        -> normalize proposal -> validate contract/minimality -> resolve route
        -> transaction(contract revision + route + causality + admission receipt)
```

invalid envelopeもcustody一件を保持し、validation failure receiptをappendするがreservation/contract/route/admissionは0件とする。
同じ`source_event_id`・operation・payloadの再送は既存custody/admission receiptを返し全table増分0とする。
同operation ID・同payload digestで別transport deliveryだけが再送された場合も新しいauthoritative custodyを作らず、delivery observationは
non-authoritative transport logへ分離する。同operation ID・異payload digestはcandidate custodyとconflict receiptを各一件appendし、
既存contractを変更せずmanual/PO resolutionへ送る。同一conflict再送は既存conflict receiptを返して増分0とする。
異operationで同payloadはsource event/deliveryのdedupe keyも照合し、同一causeへの重複副作用を防ぐ。operation reservationと
contract commitのcrash gapは`reserved -> committing -> committed|conflicted|invalid`のstateとlease expiryで閉じる。crash後は同operation/
payload digest、expected operation head、reservation tokenを使うreconcileだけが再開でき、custody再appendや新Issue生成を行わない。

## §5 HDS-HIL-02へのtyped handoff

admission receiptは`initial_cause_edge_digest`、`initial_transition_digest`、`scope_budget_metadata_digest`を持つ。
initial causeはsource/custody/contract/routeを同じrootへ結び、initial transitionは`intake -> admitted`、budget metadataは
iteration/time/token/costの上限値、policy version、authority、input digestを保持する。HDS-HIL-02はこれらを入力に全loop causality closure、
state sequence、checkpoint/resumeを評価する。本sliceは下流edge、後続state、停止判定、resume tokenを生成せず、
`HIL_CAUSALITY_JOIN_BROKEN`、`HIL_STATE_TRANSITION_INVALID`、`HIL_LOOP_BUDGET_UNBOUNDED`を主oracleとして発行しない。

handoff実体は`InitialOrchestrationHandoffV1`として保存する。主keyは`issue_id + issue_revision`、一意keyは`admission_operation_id`、
値はcause edge、`intake -> admitted` transition、budget metadata、contract/route/snapshot/policy digestを持つ。admission transactionで
contractと同時commitし、HDS-HIL-02は`loadCurrentInitialHandoff(issue_id, issue_revision)`だけから取得する。proseやadmission receiptの
digest文字列だけをhandoff実体として扱わない。

## §6 minimalityと非scope

本sliceに必要なsurfaceは4 envelope schema、Issue contract schema、custody/idempotency/admission event、Node port、read-only connector portである。
新CLI、公開HTTP API、別DB、外部message broker、generic plugin framework、新dependency、source別Issue tableはHAT-HIL-01のoracleに不要であり、
`HIL_UNJUSTIFIED_CAPABILITY`で設計候補から除外する。既存Node module、harness.db event/projection、connector adapterで閉じる案を先に比較する。
必要性が新たに証明されたsurfaceは本Issueへ混載せず、authority rootとacceptance oracleを持つchild Issue＋Reverseへ分離する。

## §7 harness.db射影

| table | 必須field | 不変条件 |
|---|---|---|
| `intake_custody_events` | source kind/event/locator、actor/authority、received、payload/artifact digest、operation | append-only、分類前一件、raw bodyなし |
| `intake_operations` | operation、payload digest、source event、status、admission/conflict receipt | operation unique、同digest再送増分0 |
| `issue_contract_revisions` | Issue/revision、schema/source/cause/authority、objective/oracle/mode/drive/Reverse/Forward/risk/budget/digest | Issue＋revision unique、current最大1 |
| `issue_route_receipts` | Issue/revision、mode/drive/Reverse/Forward、authority/evidence digest | admitted contractごと一件 |
| `issue_causality_edges` | cause root、source/custody/contract/route target、initial edge kind、digest | initial admission rootを一件だけ保持。全loop closure／orphan／cycle判定はHDS-HIL-02 |
| `issue_admission_receipts` | operation、contract/custody/route/causality/minimality digest、event digest | all-or-nothing、一operation一件 |
| `intake_conflict_receipts` | operation、prior/candidate payload digest、prior contract、resolution route | contract更新0、append-only |
| `intake_validation_receipts` | custody、schema/actor/policy revision、failure set、operation/payload digest | invalid入力も一件、authoritative proposal 0 |
| `issue_initial_handoffs` | Issue/revision、admission operation、cause/transition/budget、contract/route/snapshot/policy digest | Issue＋revision一意、operation一意、admissionと同一transaction |

`IntakeAdmissionStore`はcustody→validation→reservation→contract/route/causality/handoff→admission receiptのappend順を固定し、
`expected_operation_head`と`expected_issue_revision`をCASする。全append位置のfaultはtransaction全体をrollbackする。ただし受信時に
先行durable化したreceipt-level custodyはinvalid/faultでも保持する。reconcileはそのcustody、reservation、immutable artifact digestから
同じreceiptを復元し、新しいauthority、route、objectiveを推測しない。

## §8 L8 exact state/token対応表

| L5責務 | HAC | exact HST | pre_state | expected_state | L8 oracle | canonical failure |
|---|---|---|---|---|---|---|
| 有効intake admission | `HAC-HIL-01a` | `HST-CASE-001-01` | `intake` | `admitted` | `IT-ICN-001` | `なし（正常系）` |
| duplicate副作用0 | `HAC-HIL-01b` | `HST-CASE-001-02` | `admitted` | `admitted` | `IT-ICN-002` | `HIL_INTAKE_DUPLICATE_EFFECT` |
| operation conflict | `HAC-HIL-01b` | `HST-CASE-001-03` | `admitted` | `admitted` | `IT-ICN-003` | `HIL_INTAKE_IDEMPOTENCY_CONFLICT` |
| ingress route共通化 | `HAC-HIL-01a` | `HST-CASE-001-05` | `assertion_input_ready` | `assertion_pass` | `IT-ICN-004` | `HIL_INTAKE_ROUTE_INCOMPLETE` |
| contract必須field | `HAC-HIL-01b` | `HST-CASE-001-07` | `assertion_input_ready` | `assertion_pass` | `IT-ICN-005` | `HIL_ISSUE_CONTRACT_INCOMPLETE` |
| 横断exactly-once | `HAC-HIL-01b` | `HST-CASE-001-08` | `assertion_input_ready` | `assertion_pass` | `IT-ICN-006` | `HIL_IDEMPOTENCY_VIOLATION` |
| untrusted本文隔離 | `HAC-HIL-01c` | `HST-CASE-001-10` | `assertion_input_ready` | `assertion_pass` | `IT-ICN-007` | `HIL_UNTRUSTED_INPUT_EXECUTED` |

## §9 freeze条件

L6 transaction contractは`CustodyAppendV1`、`CustodyReceiptV1`、`AdmissionReceiptV1`、`IntakeOperationStateV1`、`IntakeAdmissionTxV1`を使う。event replayの共有semantic shapeはL4基本設計 §2.3の`ProjectionDigestV1`を正本とし、unversioned receipt/state名を許可しない。

L5/L8 pairは本slice所有IT 7/7、HST-HIL-001の所有7/7 state/token join、4 ingress fixture、同operation同/異digest、field mutation、
injection dispatch 0、initial cause/transition/budget metadata handoff、minimality反例、HU-CAP-002 pinned binding、別runtime reviewが揃うまでdraftとする。
HDS-HIL-02所有の3 caseは同sliceのL5/L8 pairでfreezeし、本sliceの分母へ重複算入しない。
Issue row、queue row、route prose、AI summary、CLI/API追加を完了証拠にしない。
