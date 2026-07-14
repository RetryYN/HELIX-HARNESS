---
title: "HELIX L5 詳細設計 — screen applicability prototype"
layer: L5
kind: add-design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-15
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-012
  - HST-HIL-024
pair_artifact: docs/test-design/helix/L5-screen-applicability-prototype-integration-test-design.md
next_pair_freeze: L8
requirements:
  - HR-FR-HIL-15
  - HAC-HIL-15a
  - HAC-HIL-15b
  - HAC-HIL-15c
source_capabilities:
  - HZ-CAP-001
  - HZ-CAP-002
  - HZ-CAP-003
  - HZ-CAP-004
  - HZ-CAP-005
  - HZ-CAP-006
  - HZ-CAP-007
  - HU-CAP-004
---

# HELIX L5 詳細設計 — screen applicability prototype

## §0 適用境界と工程順

全PLANはL2で`prototype_required`または`not_applicable`へ明示分類する。UI対象は
`画面要求作成 -> executable prototype -> user walkthrough -> requirement delta/no_delta -> 人レビュー/agreement -> L1要件freeze -> L3開始`
の順を飛ばさない。HARNESS control/data planeのようなno-UI scopeは、理由、actor、scope/input digest、検出provenance、
再entry triggerを持つ構造receiptでだけskipする。scopeへGUI/dashboard/interactive surfaceが加われば旧receiptをstale化しL2へ戻る。

判定はPLAN全体を一件へ潰さずsnapshot内の全capabilityを単位にする。全decisionが`current`かつ
`prototype_required | not_applicable`へ決着するまでPLAN routeとfreezeを確定しない。一件でも`prototype_required`なら
PLAN routeは必ず`prototype_required`、全件`not_applicable`の場合だけ`not_applicable`とする。`deferred/undecided/stale`が
一件でもあればpassed gateは0件である。snapshot、decision aggregate、gate receiptは同じcanonical capability set digestへbindする。

HZ-CAP-001/003/004とHU-CAP-004の画面先行意味をhardenし、HZ-CAP-005の作成工程欠落を補う。HZ-CAP-006のLow-Fi wireframeは
screen要求候補には使えるが操作可能prototypeの代替にしない。HZ-CAP-007はcapability単位applicabilityへ再設計する。

## §1 componentとauthority

| component | 責務 | write authority | fail-close |
|---|---|---|---|
| `ScreenScopeNormalizer` | L0、PLAN、capability、public surfaceをscope snapshotへ固定 | snapshot eventだけ | scope/capability/phase/digest欠落 |
| `ScreenApplicabilityEvaluator` | UI capabilityをrule/version付きで判定 | proposalだけ | AI自由文、document有無だけ、deferred閉鎖 |
| `NoUiReceiptWriter` | 構造skipをNode transactionでcommit | receipt/event/projection | reason/actor/evidence/reentry欠落 |
| `PrototypeDiscoveryPlanner` | 画面要求、screen/interaction/state/仮data義務をtask化 | task eventだけ | applicability receiptなし |
| `ExecutablePrototypeRegistry` | artifact manifest、起動手順、trace、digestをversion管理 | artifact receiptだけ | 静的画像、起動不能、9状態欠落 |
| `WalkthroughLedger` | user観測、delta/no_delta、反映先、再作成判断をappend | walkthrough eventだけ | user actor、prototype版、delta判定欠落 |
| `ScreenFreezeGate` | agreementまたはcurrent skipだけをL1/L3へ通す | gate receiptだけ | stale、deferred、暗黙skip、backprop欠落 |

Nodeだけがauthoritative stateをwriteする。prototype toolingはartifact proposal、user/POはreview decisionを返す。LLMはskip/agreementを確定しない。

## §2 永続schema

| table | PK | unique／FK | 必須field | state |
|---|---|---|---|---|
| `screen_scope_snapshots` | `screen_scope_snapshot_id` | `plan_id,scope_version,content_digest` unique | L0/PLAN/capability/public-surface digest、rule version、created_at | 状態 `current,stale,superseded` |
| `screen_applicability_decisions` | `screen_applicability_decision_id + decision_revision` | snapshot FK、current partial unique `snapshot,capability,phase` | verdict、reason code、evidence、actor、detector provenance、reentry、decision digest | append-only revision。状態 `undecided,prototype_required,not_applicable,deferred,stale` |
| `screen_no_ui_receipts` | `screen_no_ui_receipt_id` | decision FK unique、supersedes self-FK | scope/input/rule/evidence digest、actor、rationale、reentry、expiry | 状態 `current,stale,revoked,superseded` |
| `prototype_discovery_tasks` | `prototype_task_id` | decision FK、`decision,prototype_revision` unique | screen requirement set、interaction/state/data obligation digest、owner | 状態 `planned,building,ready,failed,cancelled,stale` |
| `prototype_artifact_versions` | `prototype_artifact_version_id` | task FK、`task,revision` unique | executable locator、manifest/content/build digest、startup receipt、screen/interaction/state/data trace | 状態 `staged,ready,rejected,stale,superseded` |
| `prototype_state_fixtures` | `prototype_state_fixture_id` | artifact FK、`artifact,screen,state_kind` unique | state kind、input/output/visual/a11y digest | 状態 `registered,verified,rejected,stale` |
| `prototype_walkthrough_iterations` | `walkthrough_iteration_id` | artifact FK、`artifact,iteration` unique | user actor、observation、delta verdict、requirement target、rebuild decision、evidence digest | 状態 `walking,complete,rework_required,rejected,stale` |
| `prototype_agreement_receipts` | `prototype_agreement_receipt_id` | walkthrough FK unique | prototype/observation/delta/backprop digest、reviewer、agreement、scope snapshot | 状態 `current,rejected,stale,superseded` |
| `screen_gate_receipts` | `screen_gate_receipt_id` | snapshot FK、`snapshot,gate_kind` unique | route、capability set/decision aggregate/agreement/skip digest、L1 revision、operation receipt、verdict、failure | 状態 `passed,failed,stale` |
| `screen_process_events` | `screen_process_event_id` | snapshot FK、`snapshot,event_sequence`とoperation ID unique | from/to、subject、previous/event digest、actor、failure、occurred_at | append-only |

9状態fixtureは`empty,loading,loaded,partial,error,permission_denied,offline,conflict,completed`をexact setとする。
FKは`ON DELETE RESTRICT`、event/projectionは同transaction、current receiptはscope/capability/phaseごと最大1件のpartial uniqueとする。

## §3 state、transaction、再entry

applicabilityは`undecided -> prototype_required | not_applicable | deferred`、scope変更で`stale`へ進む。
prototypeは`planned -> building -> ready -> walking -> walkthrough_complete -> agreement_ready`とし、deltaで`building`へ戻せる。
`deferred`、`stale`、`walking`、`walkthrough_complete`はfreezeを通さない。

skip commitはdecision、no-UI receipt、event、projectionを一transactionにする。prototype agreement commitはartifact/state-set、walkthrough、
delta/no_delta、L1 backprop revision、human review、agreementを先にCASし、固定分母closure後だけstageとgateをCASする。一件でも欠ければpassed/currentを0件にする。
scope digest変更はdecision、skip、artifact、walkthrough、agreement、gateを同じstale event lineageへ結び、prototype taskを一件生成する。

各transaction bundleは`operation_id`、canonical `operation_digest`、snapshot/capability set digest、全対象の
`expected_revision`、固定`append_order`、exact `write_set`を持つ。skipは
`decision -> no_ui_receipt -> process_event -> projection`、agreementは
`artifact_state_set -> walkthrough -> backprop -> agreement -> process_event -> projection`、re-entryは
`decision_stale -> skip_stale -> artifact_stale -> walkthrough_stale -> agreement_stale -> gate_stale -> process_event -> prototype_task -> projection`
の順とする。commit receiptはoperation/digest、before/after revision、table別insert/update count、event sequence、write-set digestを返す。
同operation同digestは既存receiptと全count 0、異digestまたはrevision不一致は全count 0でrejectし、各append直後faultでもrollbackする。
mixed capabilityの集約はread-only判定で終えない。`commitPlanScreenRoute`は全capability decision集合、PLAN aggregate、優先route、
UI capabilityごとのprototype task、process event、stage projectionだけをCASし、passed gateを書かない。全completion/authority閉鎖後、
`commitStageClosureAndGate`だけがstage receiptとgate receiptを同一CASでcommitする。途中faultではdecision/task/stage/gateを部分currentにせず、
同一operation/digest再送だけを冪等化する。
L6/L7のcanonical ownerは`U-SAP-012`で、exact function setは`aggregatePlanScreenRoute` → `commitPlanScreenRoute`である。
前者の集合・優先route判定と後者のCAS/receipt/zero-gate-writeを別mutation laneで検証し、`IT-SAP-009`が同じPLAN route identityで結合する。

## §4 evidenceと非scope

prototype manifestはscreen ID、interaction ID、transition、9 state、fixture、仮data classification、起動command digest、artifact digest、
source requirement candidate、build provenanceを持つ。静的wireframe、画像、prose、LLM summaryはsupporting evidenceでありready receiptではない。
L10 UX/VRT/a11yの実装後検証、production UI実装、visual polishは本sliceの完了条件ではない。

## §5 canonical assertion primary表

次表が18 caseのprimary採点正本である。主IT/Uを同一行に固定し、supporting scenario表のrange参照をcase分母へ加算しない。

| HST正本 | 主IT | 主U | pre_state | expected_state | failure正本 |
|---|---|---|---|---|---|
| `HST-CASE-012-01` | `IT-SAP-001` | `U-SAP-002` | `undecided` | `not_applicable` | `なし（正常系）` |
| `HST-CASE-012-02` | `IT-SAP-002` | `U-SAP-010` | `undecided` | `undecided` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-03` | `IT-SAP-003` | `U-SAP-004` | `not_applicable` | `stale` | `HIL_SCREEN_RECEIPT_STALE` |
| `HST-CASE-012-04` | `IT-SAP-002` | `U-SAP-003` | `undecided` | `undecided` | `HIL_SCREEN_SKIP_EVIDENCE_MISSING` |
| `HST-CASE-012-05` | `IT-SAP-002` | `U-SAP-010` | `deferred` | `deferred` | `HIL_SCREEN_DEFERRED_NOT_CLOSED` |
| `HST-CASE-012-06` | `IT-SAP-004` | `U-SAP-002` | `undecided` | `prototype_required` | `なし（正常系）` |
| `HST-CASE-012-07` | `IT-SAP-002` | `U-SAP-010` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_DECISION_MISSING` |
| `HST-CASE-012-08` | `IT-SAP-004` | `U-SAP-002` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_APPLICABILITY_INVALID` |
| `HST-CASE-012-09` | `IT-SAP-002` | `U-SAP-010` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_GATE_EVIDENCE_MISSING` |
| `HST-CASE-012-10` | `IT-SAP-002` | `U-SAP-010` | `assertion_input_ready` | `assertion_pass` | `HIL_SCREEN_IMPLICIT_SKIP` |
| `HST-CASE-024-01` | `IT-SAP-007` | `U-SAP-008` | `prototype_ready` | `agreement_ready` | `なし（正常系）` |
| `HST-CASE-024-02` | `IT-SAP-005` | `U-SAP-006` | `prototype_required` | `prototype_required` | `HIL_PROTOTYPE_NOT_EXECUTABLE` |
| `HST-CASE-024-03` | `IT-SAP-006` | `U-SAP-006` | `building` | `building` | `HIL_PROTOTYPE_STATE_MISSING` |
| `HST-CASE-024-04` | `IT-SAP-007` | `U-SAP-008` | `prototype_ready` | `prototype_ready` | `HIL_PROTOTYPE_WALKTHROUGH_MISSING` |
| `HST-CASE-024-05` | `IT-SAP-008` | `U-SAP-007` | `walking` | `walking` | `HIL_PROTOTYPE_DELTA_MISSING` |
| `HST-CASE-024-06` | `IT-SAP-008` | `U-SAP-009` | `walkthrough_complete` | `walkthrough_complete` | `HIL_PROTOTYPE_BACKPROP_MISSING` |
| `HST-CASE-024-07` | `IT-SAP-005` | `U-SAP-006` | `assertion_input_ready` | `assertion_pass` | `HIL_PROTOTYPE_ARTIFACT_INCOMPLETE` |
| `HST-CASE-024-08` | `IT-SAP-007` | `U-SAP-007` | `assertion_input_ready` | `assertion_pass` | `HIL_WALKTHROUGH_RECEIPT_MISSING` |

`HST-CASE-012-06`はprimary遷移を`U-SAP-002`で採点し、system正本の期待evidence「prototype task一件」は
`U-SAP-005 planPrototypeDiscovery`をsupporting oracleとして同じ`IT-SAP-004` composition内で採点する。

## §6 freeze条件

L5/L8 pairはIT 9/9、canonical 18/18、HARNESS no-UI receipt fixture、mixed capability優先判定、UI re-entry、実行prototype、9状態、walkthrough、
backprop、人review、write-count、transaction fault、別runtime reviewが揃うまでdraftとする。

mixed routeがprototype_requiredでgate passedとなるには、current plan route receiptに続き、全UI capability exact setのprototype task、
agreement、requirements backpropと全no-UI completion/skip authorityを`commitStageClosureAndGate`へ型付きで含める。
UI completionはagreement/backprop双方のauthority receipt ID/digestとexpected current headを保持し、storeがtrustedNowで再読した
canonical current receipt/headとexact一致する場合だけclosureへ算入する。stale、superseded、別capability/revision swapは0件扱いとする。
plan route以前のgate、plan routeからの直接passed、同一stageへの二重gateは0とする。

## §11 no-UI完了の完全集合

判定分母のcapabilityごとに`NoUiCapabilityCompletionV1`をexactly-one要求する。UI対象集合とno-UI対象集合はdisjointかつ和集合が固定分母と一致し、aggregate skipを禁止する。no-UI completionはcapability revision/digest、applicability rule revision/digest、scope digest、要求・設計・test obligation digest、skip receipt ID/digest、authority receipt ID/digest/current head、expiry、reentry triggerを同一rowへbindする。DB completionのPKは`capability_id + capability_revision + applicability_decision_id + applicability_decision_revision`とする。後二fieldの唯一の正本は`screen_applicability_decisions(screen_applicability_decision_id, decision_revision)`であり、L6の`applicability_decision_revision`と`NoUiReceiptV1.decision_revision`はこの`decision_revision`の名称付きFK projectionであって別revisionを生成しない。decision正本、completion、skip receiptの3者でID/revisionがexact一致しない別decision/revision/capability/rule/scope差替え、余剰・欠落completion、UI/no-UI重複ではstage receiptとgateを0にする。

gate write authorityはstage closure storeの一つだけとする。plan route、skip、agreement transactionはevidence/stage準備専用でgate rowを
書けず、stage closure storeはcurrent plan route receipt、UI/no-UI exact set、skip/agreement/backprop authorityを再読後にだけpassedを作る。
