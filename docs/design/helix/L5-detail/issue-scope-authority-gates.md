---
title: "HELIX L5 詳細設計 — Issue・scope・authority gate"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-05
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-019
  - HST-HIL-021
  - HST-HIL-023
pair_artifact: docs/test-design/helix/L5-issue-scope-authority-gates-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-05
  - HAC-HIL-05a
  - HAC-HIL-05b
  - HAC-HIL-05c
  - HIL-BR-06
  - HIL-BR-07
  - HIL-BR-08
  - HIL-FR-06
  - HIL-FR-07
  - HIL-FR-36
  - HIL-FR-38
  - HIL-NFR-06
  - HIL-NFR-07
  - HIL-NFR-21
  - HIL-NFR-23
---

# HELIX L5 詳細設計 — Issue・scope・authority gate

## §0 適用境界と正本配線

本書はuser directiveを分類前にappend-only収載し、Issueの`ready/implement/merge/close`遷移を
`custody -> authoritative root -> scope -> minimality -> evidence -> approval`の順で決定論評価する。
AIの「不要」「重複」「誤検知」「ついでに汎用化できる」という判断は原記録やIssueを終端化せず、別disposition eventとして残す。

HR-FR-HIL-05のacceptance正本は`HST-HIL-019`、`HST-HIL-021`、`HST-HIL-023`である。
`HST-HIL-002`、`HST-HIL-003`、`HST-HIL-018`は本gateが消費するReverse、CI、Reverse substance receiptの
上流正本であり、本sliceが再実装・再採点しない。高影響操作のapproval拒否は`HST-CASE-017-08`を境界oracleとして参照する。

## §0.1 pinned source provenance（固定した採取来歴）

旧UT由来behaviorを採取済みと主張する範囲は次へ限定する。span、symbol、pinned ref、delta digestがない候補は確定採取や
coverageへ算入しない。

両capabilityのsource familyは`docs/governance/infinity-loop-source-snapshot-manifest.md`の`UT-ALL-REMOTE`、source root
`git+https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`へ固定する。`HU-CAP-002`の`origin/main` entry setは
`sha256:0d4504197ae0213e35d712817f9f4dd4e4b8c9c6409cf49cf38e2b8cf690b188`、`HU-CAP-007`のbranch entry setは
`sha256:b3c08942f1d5d4091bb835cb0cc00e81b9e736997ab8c77439f0fe3acc49b289`であり、ref名だけの再解釈を許さない。

| capability | pinned ref | source file／symbol／span | behavior disposition | HELIXでの扱い |
|---|---|---|---|---|
| `HU-CAP-002` | `origin/main` commit `e506a67e9c243cc9781ff4a6d8d1870b072fd37b`, tree `2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720`, delta `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `src/state-db/feedback-projections.ts` `projectIssueQueue`, L687-L738 | harden（強化） | dry-run queueとsource event参照を採用候補にし、分類前custody・非終端dispositionを追加 |
| `HU-CAP-002` | 同上 | 同file `projectIssueApprovalGuardrails`, L740-L765 | redesign（再設計） | generic human approvalをactor/tool/target/params/snapshot/expiryへaction-bindする |
| `HU-CAP-002` | 同上 | `src/schema/route-filing.ts` `routeFiling`, L124-L157 | reference-only（参照のみ） | 分類語彙の候補だけ参照。durable custody前に分類する旧順序は不採用 |
| `HU-CAP-007` | `origin/work/l7-418-plan-asset-v2` commit `a588981b4d580ad78f1534bc47fc065ddb5cef01`, tree `657af0fcb1e38d98a720d73c286cd9fa6aaf1622`, delta `sha256:9a5c3f1a1ef25fab9377b5d3dd885bccf8ff9f7d7e3d61ead9c6aeefa1b2bd67` | `src/plan-asset/domain/evidence-policy.ts` `EvidencePolicy`, L39-L151 | harden（強化） | typed requirement、producer、freshness、attestationをIssue gate evidenceへ一般化 |
| `HU-CAP-007` | 同上 | 同file `validateSupersession`, L172-L214 | harden（強化） | orphan/fork/cycle拒否をevidence supersessionとauthority graphへ適用 |
| `HU-CAP-007` | 同上 | 上記以外の40-file delta | pending（未採取） | Issue/scope behaviorとしてsymbol採取しておらず、確定採取・coverageへ算入しない |

上位source capability ledgerの`symbol ledger待ち`は本表で自動的にclosedにしない。本表はHDS-HIL-05で使用するbehaviorだけの
slice-local採取判断である。

## §1 componentとauthority

| component | 責務 | authority | fail-close条件 |
|---|---|---|---|
| `DirectiveCustodyLedger` | 原文参照、source span、actor、received_at、digest、supersessionを分類前にappend | custody event | 先行分類、UPDATE/DELETE、source欠落 |
| `DirectiveDispositionGate` | duplicate、false-positive、accepted-risk、cancel、supersedeのauthorityと反証を検査 | disposition receipt | AI終端、生存target/独立review/PO receipt欠落 |
| `ScopeAuthorityResolver` | capability derivationをchat/L0/PO-approved rootまで辿る | authority graph receipt | self cycle、同時追加HIL cycle、root不達 |
| `ScopeMinimalityEvaluator` | oracle寄与、minimum necessary、代替、budget、complexity/public surface/運用負債を評価 | minimality receipt | 無寄与surface、代替未検討、budget超過 |
| `IssueEvidenceGate` | current receiptのproducer、subject、snapshot、digest、expiry、lineageを検証 | evidence receipt | prose PASS、stale/別Issue/別SHA receipt |
| `ActionBindingGate` | high-impact actionとapproval tupleをexact照合 | approval receipt | approval欠落、scope/params/snapshot/expiry不一致 |
| `IssueTransitionGate` | ordered gate chainを評価しIssue state遷移をCAS | transition event | receipt欠落、順序逆転、boolean override |
| `ClosureGate` | PR/CI/audit/oracle/memory/child IssueとPO authorityをjoin | closure receipt | AI close、stale/missing evidence、open child |

LLM、Claude、Codex、workerはproposal/disposition候補を返せるが、custody row、authority root、scope pass、approval、closureを
直接writeできない。Node `HarnessDbPort`だけがeventとprojectionを同一transactionで更新する。

## §2 directive custodyと非終端disposition

directive受信時は分類器を呼ぶ前に次を保存する。

```ts
interface DirectiveCustodyRecordV1 {
  schema_version: "helix-directive-custody.v1";
  directive_id: string;
  revision: number;
  source_kind: "chat" | "issue" | "pr" | "finding" | "product" | "source";
  source_locator: string;
  source_span: string;
  actor_id: string;
  actor_authority: "po" | "human" | "ai" | "external";
  received_at: string;
  raw_reference_digest: string;
  content_digest: string;
  supersedes_directive_id: string | null;
}
```

raw本文を別surfaceへ複製せず、参照とdigestを保存する。custody appendがdurableになる前のclassify、dedupe、Issue rejectは
`HIL_DIRECTIVE_CUSTODY_MISSING`で副作用0とする。同operation/同digestは同receipt、同operation/異digestはconflictとして停止する。
全classifier、dedupe、disposition APIはcurrent custody receiptとdirective revisionを必須入力とし、receiptのdirective/revision/content digestが
current projectionと一致しない限り呼出しを受理しない。単に`directive_id`を知っていることはclassification admissionにならない。

`duplicate`は生存targetとtarget oracleがdirective oracleを包含する証拠、`false_positive`は作成者と別provider/roleの反証、
`accepted_risk`はPO risk receipt、`cancel/supersede`はPO authorityを要求する。AI dispositionは`pending_disposition`を越えず、
原記録の削除、不可視化、close/cancelを行わない。全dispositionはappeal/reopen routeを保持する。
AIがterminal verbを要求した場合、guard APIはcanonical failureを持つ`Err`を返し、terminal eventもnonterminal disposition eventも書かない。
必要な`pending_disposition`提案は、その失敗とは別operationでappendする。単一ResultでOk proposalとErr failureを同時に返さない。

## §3 authority graph（権限根拠graph）

許可rootは、custody済みchat directive、confirmed L0 charter、PO-approved parent scopeの3種だけである。requirement、HIL ID、
Issue、capability、symbol、test oracleのderivation edgeはsource/target revision、edge kind、rationale/evidence digestを持つ。
各root nodeは種類に応じてcurrent custody receipt、confirmed L0 revision receipt、またはPO scope approval receiptを一件持ち、
root snapshot/revision/expiryをcurrent policyと照合する。callerが渡したroot kind文字列だけではroot authorityにならない。

resolverはbyte順でnode/edgeを正規化し、各capabilityからrootへ逆向き探索する。capability自身、同じdiffで追加したHIL、子Issue自身を
rootにできない。cycle、orphan、複数root conflict、revision不一致を全件列挙し、一件でもあればauthority receiptを発行しない。
子Issueはparentのroot、non-goal、budget残量を継承し、追加scopeが必要なら新しいPO-approved scope revisionを要求する。

## §4 scopeとminimum necessary

実diffをfile数だけでなく、capability、public API、CLI、schema、dependency、設定、complexity、運用負債へ正規化する。
各change atomはallowed change、non-goal、requirement→symbol→test trace、acceptance oracle寄与、代替案、budget costを持つ。

判定順は次で固定する。

1. authoritative rootへacyclicに到達する。
2. change atomがapproved scope/non-goalと矛盾しない。
3. acceptance oracleへ必要な最短derivationを持つ。
4. 既存capability再利用、狭い変更、設定不要等の代替を比較する。
5. capability/public surface/dependency/complexity/operations budget内である。

oracleに寄与しないCLI/API/schema/dependency/汎用化は`HIL_UNJUSTIFIED_CAPABILITY`、寄与または最小性欠落は
`HIL_SCOPE_NECESSITY_MISSING`、代替なしは`HIL_SCOPE_ALTERNATIVE_MISSING`、budget超過は`HIL_SCOPE_BUDGET_EXCEEDED`とする。
新たに必要と判明した拡張は同じIssueへ混載せず、同じauthorityを継承するchild Issue＋Reverseへ分離する。

## §5 evidence gateと上流receipt

evidenceはtyped receiptで、receipt ID、kind、producer、Issue/plan、source snapshot、subject revision、input/output/artifact digest、
command/exit、issued/expiry、predecessorを必須とする。文字列`passed`、LLM summary、file existenceだけでは通さない。

| evidence family | 消費する上流正本 | 本gateでの検査 |
|---|---|---|
| Reverse route | `HST-HIL-002` | R0-R4、Redesign/re-entry、pair、claim-ready receiptがcurrent |
| Three-stage CI | `HST-HIL-003` | prejoin→postjoin→externalのSHA/tree/predecessor lineageがcurrent |
| Reverse substance | `HST-HIL-018` | source span、stage固有semantic assertion、coverage、異なるdigestがcurrent |
| Scope/authority | `HST-HIL-021` | root、scope、minimality、alternative、budget receiptが同一scope revision |
| Closure | `HST-HIL-023` | merge、oracle、audit、memory、child Issue状態が同一head/snapshot |

上流failureを別tokenへ丸めない。例えばReverse欠落は`HIL_IMPLEMENTATION_NOT_READY`または
`HIL_ISSUE_GATE_BYPASS`でtransitionを止めつつ、causeに`HIL_REVERSE_PAIR_MISSING`等の原tokenとreceipt IDを保持する。

## §6 action-binding approval（操作束縛承認）

高影響分類はauth/authz、payment、PII、secret、license、schema migration、destructive data、production、external API/infra、
release/cutoverを含む。approvalは次のtupleをexact bindする。

```ts
interface ActionBindingApprovalV1 {
  schema_version: "helix-action-binding-approval.v1";
  decision_id: string;
  actor_id: string;
  tool_contract_id: string;
  target_digest: string;
  params_digest: string;
  reviewed_snapshot_digest: string;
  scope_revision_digest: string;
  evidence_bundle_digest: string;
  approved_at: string;
  expires_at: string;
  approver_authority: "po" | "authorized-human";
}
```

approvalがあってもcustody/root/scope/minimality/evidence不足を上書きしない。action tuple、snapshot、scope revision、evidence、expiryの
一つでも違えば`HIL_ACTION_BINDING_APPROVAL_MISSING`としてapply/claim/mergeを0にする。read-only計画とdry-runは実apply approvalと
分離し、approval receipt自身に実行権限を持たせない。

## §7 transition chainとclosure

Issue transitionごとのreceipt setをversioned policyで固定し、次の順にshort-circuitせず全findingを収集した後、AND判定する。

```text
custody -> root -> scope -> minimality -> evidence -> approval(if required)
        -> ready / implement / merge / close
```

`ready`はcustody/admission/screen decision/Reverse/substance/scope authority、`implement`はさらにRedesign/pair/lease、`merge`は
three-stage CI/audit/oracle、`close`はmerge/audit/oracle/memory/child Issueを要求する。receipt欠落時にboolean override、LLM判断、
PO approvalだけでgateを飛び越えない。AI closeは拒否またはreopenし、closure receiptはNodeが一件だけ発行する。

transition requestとclosure requestは次のactor bindingを必須とし、`authority=ai`では`close`、`cancel`、`merged_closed`への遷移と
closure receipt発行を拒否する。

```ts
interface IssueTerminalActorV1 {
  actor_id: string;
  actor_identity_digest: string;
  authority: "po" | "authorized-human" | "ai" | "external";
  role_contract_digest: string;
}

interface IssueClosureEvidenceV1 {
  issue_id: string;
  issue_revision: number;
  current_head_sha: string;
  current_snapshot_digest: string;
  pr_receipt_digest: string;
  merge_receipt_digest: string;
  three_stage_ci_lineage_digest: string;
  audit_receipt_digest: string;
  oracle_receipt_digest: string;
  memory_receipt_digest: string;
  child_issue_state_set_digest: string;
  po_authority_receipt_digest: string;
  evidence_set_digest: string;
}
```

各receiptは同じcurrent head/snapshot/Issue revisionへbindし、child open 0、PR/merge/CI lineage current、PO authority currentを要求する。
一種類でもmissing、stale、別head、別snapshotならclosure evidenceは成立しない。

loop budget到達はcloseではない。current gate state、未完obligation、next action、event digestをdurable checkpointへ保存し、
再開時にscope/evidence/approval freshnessを再検証する。

## §8 harness.db projection（台帳投影）

| table | 主key／必須field | 不変条件 |
|---|---|---|
| `directive_custody_records` | directive/revisionとsource/span/actor/time/content/raw digest、supersedes | append-only、operation/digest unique |
| `directive_disposition_events` | directive/event seq、kind、target、evidence、actor/authority、appeal route | AI terminal event禁止 |
| `scope_authority_nodes` | node/revision、kind、source digest、root class | approved root種別を固定 |
| `scope_authority_edges` | edgeとfrom/to revision、kind、evidence digest | acyclic、orphan 0 |
| `scope_evaluation_receipts` | Issue/scope revision、allowed/non-goal/trace/minimality/alternative/budget digest | current scopeへ最大1件 |
| `issue_gate_evidence` | Issue、kind、producer、snapshot、subject、input/output/artifact/command/exit digest、expiry | prose-only禁止、predecessor連続 |
| `action_binding_approvals` | decision、actor/tool/target/params/snapshot/scope/evidence/time/authority | tuple exact、expired/stale再利用禁止 |
| `issue_transition_events` | Issue/event seqとfrom/to、policy/gate bundle、previous/event digest、actor | append-only、CAS、operation unique |
| `issue_closure_receipts` | Issue、current head/snapshot、PR/merge、三段CI lineage、audit/oracle/memory/child、PO authority digest | 全evidenceが同じcurrent head/snapshotへbindした時だけ一件 |

## §8.1 governance commitの不可分transaction

Node `IssueGovernanceStore`は`disposition`、`authority_graph`、`scope_receipt`、`gate_transition`を
`IssueGovernanceCommitBundleV1`へ正規化し、対応event、current projection、receipt/evidence、authority node/edgeを
一つのDB transactionでcommitする。bundleは`operation_id`、`payload_digest`、対象revision、
`expected_event_head`、`expected_projection_head`を必須とする。head不一致はCAS conflict、同operation・同digest再送は
既存receiptを返すno-op、同operation・異digestはconflictであり、いずれも部分appendを残さない。

AIの`pending_disposition`提案はterminal disposition/transitionとは別operation、別bundleである。提案operationをterminal
operationへ昇格・再利用できず、terminal authority失敗とproposal成功を同じtransactionやResultへ混在させない。
event/projection/receipt/node/edgeの各append位置へfaultを注入した場合は全writeをrollbackする。再送でも確定状態が一件を超えず、
reconcileはimmutable event/evidenceからprojectionとreceiptを再構成するだけで、新しいauthorityやscope判断を捏造しない。

## §9 L8厳密追跡

| HST case識別子 | `pre_state` | `expected_state` | L8主oracle | 正本failure |
|---|---|---|---|---|
| `HST-CASE-019-01` | `received` | `captured` | `IT-ISAG-001` | `なし（正常系）` |
| `HST-CASE-019-02` | `received` | `received` | `IT-ISAG-002` | `HIL_DIRECTIVE_CUSTODY_MISSING` |
| `HST-CASE-019-03` | `pending` | `pending` | `IT-ISAG-003` | `HIL_DIRECTIVE_DUPLICATE_TARGET_MISSING` |
| `HST-CASE-019-04` | `pending` | `pending` | `IT-ISAG-003` | `HIL_DIRECTIVE_FALSE_POSITIVE_UNVERIFIED` |
| `HST-CASE-019-05` | `pending` | `pending` | `IT-ISAG-004` | `HIL_DIRECTIVE_RISK_APPROVAL_MISSING` |
| `HST-CASE-019-06` | `captured` | `captured` | `IT-ISAG-004` | `HIL_DIRECTIVE_CANCEL_UNAUTHORIZED` |
| `HST-CASE-019-07` | `captured` | `captured` | `IT-ISAG-005` | `HIL_DIRECTIVE_APPEND_ONLY_VIOLATION` |
| `HST-CASE-019-08` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-005` | `HIL_DIRECTIVE_CUSTODY_VIOLATION` |
| `HST-CASE-019-09` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-005` | `HIL_DIRECTIVE_TERMINATED_BY_AI` |
| `HST-CASE-021-01` | `pending` | `verified` | `IT-ISAG-006` | `なし（正常系）` |
| `HST-CASE-021-02` | `pending` | `rejected` | `IT-ISAG-007` | `HIL_SCOPE_AUTHORITY_CYCLE` |
| `HST-CASE-021-03` | `pending` | `rejected` | `IT-ISAG-008` | `HIL_SCOPE_MINIMUM_NECESSITY_MISSING` |
| `HST-CASE-021-04` | `pending` | `rejected` | `IT-ISAG-008` | `HIL_SCOPE_ALTERNATIVE_MISSING` |
| `HST-CASE-021-05` | `verified` | `rejected` | `IT-ISAG-009` | `HIL_SCOPE_BUDGET_EXCEEDED` |
| `HST-CASE-021-06` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-009` | `HIL_UNJUSTIFIED_CAPABILITY` |
| `HST-CASE-021-07` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-009` | `HIL_SCOPE_AUTHORITY_INVALID` |
| `HST-CASE-021-08` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-007` | `HIL_SCOPE_AUTHORITY_CYCLE` |
| `HST-CASE-021-09` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-008` | `HIL_SCOPE_NECESSITY_MISSING` |
| `HST-CASE-021-10` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-007` | `HIL_SCOPE_DERIVATION_CYCLE` |
| `HST-CASE-023-01` | `closure_ready` | `merged_closed` | `IT-ISAG-012` | `なし（正常系）` |
| `HST-CASE-023-02` | `closure_ready` | `closure_ready` | `IT-ISAG-013` | `HIL_CLOSURE_AUDIT_MISSING` |
| `HST-CASE-023-03` | `closure_ready` | `closure_ready` | `IT-ISAG-013` | `HIL_CLOSURE_MEMORY_MISSING` |
| `HST-CASE-023-04` | `closure_ready` | `closure_ready` | `IT-ISAG-014` | `HIL_CLOSURE_CHILD_OPEN` |
| `HST-CASE-023-05` | `closure_ready` | `closure_ready` | `IT-ISAG-014` | `HIL_CLOSURE_ORACLE_MISSING` |
| `HST-CASE-023-06` | `running` | `checkpointed` | `IT-ISAG-015` | `なし（正常系）` |
| `HST-CASE-023-07` | `assertion_input_ready` | `assertion_pass` | `IT-ISAG-016` | `HIL_CLOSURE_EVIDENCE_MISSING` |

境界oracleのaction-binding approvalは`IT-ISAG-010`、上流receipt gateは`IT-ISAG-011`で別表扱いとし、primary 26 tupleへ混入させない。

## §10 freeze条件

L5/L8 pairは16 integration oracle、primary 26 HST case、approval境界、上流receipt dependency、全HAC、authority graph mutation、
scope diff mutation、approval tuple mutation、authoritative write/transition/close count、別runtime reviewが揃うまでdraftとする。
Issue row、approval文字列、AIのPASS、CI green一件だけではfreezeしない。
