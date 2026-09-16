---
title: "HELIX L8 結合テスト設計 — screen applicability prototype"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: QA / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
design_slice: HDS-HIL-15
related_l3: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l4: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
related_hst:
  - HST-HIL-012
  - HST-HIL-024
pair_artifact: docs/design/helix/L5-detail/screen-applicability-prototype.md
next_pair_freeze: L5
requirements:
  - HR-FR-HIL-15
  - HAC-HIL-15a
  - HAC-HIL-15b
  - HAC-HIL-15c
---

# HELIX L8 結合テスト設計 — screen applicability prototype

## §0 fixtureと共通oracle

isolated harness.db、固定clock/ID、HARNESS no-UI scope、no-UI/UI/deferred混在capability set、GUI追加scope、executable prototype harness、静的wireframe、9状態fixture、
fake user/PO reviewerを使う。外部UI hostingやproduction writeは行わない。各scenarioでevent/projection/receipt/task/artifactの件数、
digest、CAS、stale lineageをassertし、LLM自由文や画像だけをevidenceへ昇格しない。全caseは未実装である。

| ID | scenario／fault | 期待evidence | write-count／citation |
|---|---|---|---|
| `IT-SAP-001` | HARNESS no-UI scopeでdecision/skip evidence transactionをcommitし、current plan route後にstage closureを別operationでcommit。両operationを再送 | skip transaction単独はgate 0。completion/skip authority exact set後の唯一stage closureだけgate 1、再送増分0 | gate 1、task/artifact 0、二段階receipt／`tests/screen-applicability.integration.test.ts` |
| `IT-SAP-002` | decision欠落、deferred、自由文skip、両route欠落、静的wireframeを個別投入 | freeze/L3開始0、case別failure、partial receipt 0 | passed gate 0／`tests/screen-gate.integration.test.ts` |
| `IT-SAP-003` | current no-UI後にGUI capabilityを追加しscope digestを変更 | skip/gate stale、prototype task一件、L2 re-entry event | stale 2、task 1／`tests/screen-reentry.integration.test.ts` |
| `IT-SAP-004` | no-UIとUI raw scopeを`U-SAP-001 canonicalizeScreenScope`で正規化し、同じruleで`U-SAP-002 evaluateScreenApplicability`、UI decisionを`U-SAP-005 planPrototypeDiscovery`へexact composition | scope/capability/phase/public-surface欠落は`HST-CASE-012-08`でdecision/task 0。正常時は前者skip、後者prototype_required＋prototype task exactly-one、route交差0。task欠落/重複は不合格 | decision各1、UI task 1／`tests/screen-applicability.integration.test.ts` |
| `IT-SAP-005` | screen/interaction/transition/仮dataから起動artifactをbuildし静的-only反例も投入 | executable manifest/trace、static-only ready 0 | ready 1、rejected 1／`tests/prototype-build.integration.test.ts` |
| `IT-SAP-006` | 9状態全件と8状態欠落fixtureをbuild | exact setだけready、欠落名をfinding化 | ready 1、欠落版0／`tests/prototype-state.integration.test.ts` |
| `IT-SAP-007` | user walkthroughを観測/delta/no_delta/rebuild付きで反復しreceipt欠落も注入 | version別receipt、agreementはhuman review後一件 | iteration N、agreement 1／`tests/prototype-walkthrough.integration.test.ts` |
| `IT-SAP-008` | delta判定欠落、L1 backprop欠落、transaction各append直後fault | agreement/freeze 0、rollback後authoritative増分0 | partial 0／`tests/prototype-backprop.integration.test.ts` |
| `IT-SAP-009` | `U-SAP-012`の`aggregatePlanScreenRoute` → `commitPlanScreenRoute`をstable順に実行後、`U-SAP-011 commitStageClosureAndGate`を実行する。aggregate exact set、plan bundle/CAS/gate write 0、stage先行、二重gate、no-UI identity/skip authority、UI agreement/backprop authorityを個別swapしstale/supersededも注入 | aggregate/plan commit反例はplan/stage/gate 0。current plan routeとUI/no-UI authority exact set後に唯一storeがstage+gateを一回commit。stale/superseded/swap/順序反例は増分0 | passed 1、partial 0／`tests/screen-capability-aggregate.integration.test.ts` |

## §1 canonical assertion primary表

次表が18 caseのprimary integration採点表である。上表は共有scenarioでありcase分母へ重複加算しない。

| HST正本 | 主IT | supporting主U | pre_state | expected_state | failure正本 |
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

## §2 合否

IT 9/9、canonical 18/18、mixed capability優先判定、9状態、user/human review、scope re-entry、transaction fault、write count、digestを保存する。
HARNESSはcurrent構造skip、UI対象はagreement/backpropまで揃わなければgreenにしない。

`IT-SAP-009`はplan routeのgate write 0を先にassertし、固定分母からUI/no-UI exact setを構成する。completion欠落・余剰・重複、
集合交差、skip authority swap、agreement/backprop authorityのhead/digest/canonical receipt swap・stale・superseded・expiry、
stage先行、二重gate、stage/gate CASと各append faultを注入し、完全なcurrent
plan route＋no-UI/UI completion全件が揃う場合だけ唯一authorityがstage receiptとgate receiptを同時commitする。

`IT-SAP-004`は`U-SAP-001`をscope正規化の先頭supporting oracle、`U-SAP-002`をprimary状態遷移oracle、`U-SAP-005`を
prototype task一件のsupporting evidence oracleとして同一fixtureへcompositionする。`HST-CASE-012-06`のexpected state/evidenceと
`HST-CASE-012-08`のinvalid scope反例を分離したまま、3 APIのU→IT/HST reverse edgeを閉じる。

`IT-SAP-001`はdetector provenance欠落/入替、`IT-SAP-005`/`IT-SAP-006`はcontent/build/startup receiptと4 traceの欠落、`IT-SAP-002`/`IT-SAP-009`はgate receipt内operation/commit/event bindingのswapを注入する。完全binding以外はgate/current/receipt増分0とする。
