---
title: "HELIX L8 結合テスト設計 — intake contract normalization"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-01
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hat:
  - HAT-HIL-01
related_hst:
  - HST-HIL-001
pair_artifact: docs/design/helix/L5-detail/intake-contract-normalization.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-01
  - HAC-HIL-01a
  - HAC-HIL-01b
  - HAC-HIL-01c
source_capabilities:
  - HU-CAP-002
---

# HELIX L8 結合テスト設計 — intake contract normalization

## §0 共通oracle

isolated harness.db、固定clock/ID、fake chat/GitHub/product/source adapter、read-only payload artifact storeを使い、
外部API、shell、AI runtime、product write、GitHub writeを起動しない。HU-CAP-002 fixtureはsource root、commit/tree、blob、
L687-L765 span、content SHA-256をL5 §0.1とexact照合する。

4 ingressは同じbody文字列でも別union fixtureとし、source固有metadataを落として共通化しない。各caseでcustody、operation、
contract revision、route、initial cause/transition/budget metadata、admission/conflictのrow/event countとdigestを直接assertする。外部本文へshell、Markdown tool call、
prompt injection、archive traversal、macroを混入し、dispatch/exec/spawn/tool invocation countが0であることをport spyで確認する。全caseは未実装である。

本sliceのoracleは`HST-CASE-001-01`、`-02`、`-03`、`-05`、`-07`、`-08`、`-10`の7件である。
`-04`、`-06`、`-09`はHDS-HIL-02が所有し、本書ではtyped handoffの存在だけを検証して全loop判定を再採点しない。

| ID | 結合scenario | pre_state | expected_state | 期待結果 | HAC | exact HST disposition | test citation |
|---|---|---|---|---|---|---|---|
| `IT-ICN-001` | user/chat、GitHub、product、ZIP/sourceの有効envelopeを各一件admit | `intake` | `admitted` | 各sourceでcustody/contract/route/causality/admission各一件。同じIssueContractV1 shapeとsource固有evidenceを保持 | `HAC-HIL-01a` | `HST-CASE-001-01` → `なし（正常系）` | `tests/intake-contract-normalization.integration.test.ts` |
| `IT-ICN-002` | admitted済み4 ingressへ同operation ID・同payload digestを各再送 | `admitted` | `admitted` | prior receiptを返しIssue/queue/memory/route/event/revision増分0 | `HAC-HIL-01b` | `HST-CASE-001-02` → `HIL_INTAKE_DUPLICATE_EFFECT` | `tests/intake-idempotency.integration.test.ts` |
| `IT-ICN-003` | admitted済みoperationへ異payload digestを送信 | `admitted` | `admitted` | conflict receipt一件、既存contract/route/custody current更新0、worker dispatch 0 | `HAC-HIL-01b` | `HST-CASE-001-03` → `HIL_INTAKE_IDEMPOTENCY_CONFLICT` | `tests/intake-idempotency.integration.test.ts` |
| `IT-ICN-004` | GitHub eventとuser directiveに加えproduct/sourceを同じadmissionへ投入 | `assertion_input_ready` | `assertion_pass` | 全4 ingressがprimary mode/drive/Reverse/Forward target付きcontractへ収束し、source authority差は維持 | `HAC-HIL-01a` | `HST-CASE-001-05` → `HIL_INTAKE_ROUTE_INCOMPLETE` | `tests/intake-route.integration.test.ts` |
| `IT-ICN-005` | IssueContractV1必須fieldを各一件欠落、空/重複/unknownへ変異し、不要CLI/API/schema/dependency候補も付加 | `assertion_input_ready` | `assertion_pass` | 不完全contract admission 0、完全版だけrevision/digest。不要surfaceはminimality findingでchild Issue未承認のまま | `HAC-HIL-01b` | `HST-CASE-001-07` → `HIL_ISSUE_CONTRACT_INCOMPLETE` | `tests/issue-contract-admission.integration.test.ts` |
| `IT-ICN-006` | 同delivery/contract/job/head eventを並行・順序変更して全再送 | `assertion_input_ready` | `assertion_pass` | Issue/admission/実装queue/memory昇格のauthoritative副作用は各一件、loser receiptは同digest | `HAC-HIL-01b` | `HST-CASE-001-08` → `HIL_IDEMPOTENCY_VIOLATION` | `tests/intake-exactly-once.integration.test.ts` |
| `IT-ICN-007` | Issue/PR/chat/ZIP/product本文へshell、tool指示、path traversal、macro、prompt injectionを混入 | `assertion_input_ready` | `assertion_pass` | payloadはuntrusted artifact、metadata/evidenceだけ抽出。exec/spawn/tool/prompt dispatch全0 | `HAC-HIL-01c` | `HST-CASE-001-10` → `HIL_UNTRUSTED_INPUT_EXECUTED` | `tests/intake-trust-boundary.integration.test.ts` |
| `IT-ICN-008` | 4 ingressでschema/digest/locator不正、declared authorityとtransport actor不一致、expired/別source policyを投入 | `received` | `custodied` | invalidもcustody＋validation receipt各一件、reservation/contract/route/admission 0。actor/policy反例はauthority昇格0 | `HAC-HIL-01b`, `HAC-HIL-01c` | supporting custody/authority oracle | `tests/intake-custody-authority.integration.test.ts` |
| `IT-ICN-009` | custody後、reservation後、contract/route/causality/handoff各append後へfaultを注入し同operation同/異digestを再送 | `reserved` | `committed` | receipt-level custodyは保持、transaction writeはpartial 0。同digest reconcileでadmission/handoff一件、異digest conflict一件、反復増分0 | `HAC-HIL-01b` | supporting reservation/reconcile oracle | `tests/intake-admission-reconcile.integration.test.ts` |
| `IT-ICN-010` | admitted IssueをHDS02 handoff loaderで取得し、別revision/snapshot/policyを個別投入 | `admitted` | `handoff_ready` | current Issue/revisionだけcause/transition/budget実体一件。stale tupleはhandoff 0 | `HAC-HIL-01a` | supporting HDS02 handoff oracle | `tests/intake-handoff.integration.test.ts` |

## §1 合否

### 補助API→U→IT exact join

`IT-ICN-008`は`U-ICN-008`と`U-ICN-009`、`IT-ICN-009`は`U-ICN-010`、`IT-ICN-010`は`U-ICN-011`をexact joinする。fault oracleは`CustodyReceiptV1`、`AdmissionReceiptV1`、`ProjectionDigestV1`のoperation/payload/head/digest一致とwrite count 0を検査する。

本slice所有7/7、HAT-HIL-01、HST-HIL-001の所有7/7 exact pre_state/expected_state/failure、4 ingress、HU-CAP-002 pinned fixture、
row/event/write/dispatch count、contract/route/initial cause/transition/budget metadata/idempotency digest、minimality反例をassertする。正常caseだけ
`なし（正常系）`を保持する。外部本文の可読化、Issue row、queue row、LLM summary、追加surfaceの存在で代替しない。
