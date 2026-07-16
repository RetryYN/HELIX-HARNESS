---
title: "Universal Workflow Requirements anchor ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
schema: universal-workflow-anchor-ledger.v1
source: docs/governance/universal-workflow-source-manifest.md
question_ledger: docs/governance/universal-workflow-question-ledger.md
---

# Universal Workflow Requirements anchor台帳

## §0 分母と非主張

14 entryを精読し、primary mechanical anchorを質問76、normative prose 218、schema object contract 21、
fixture case 13、合計328件へ固定する。328は重複を含む構造anchor数であり、behavior atom数ではない。
全primary anchorをbehavior/alias/container/fixture/conflictへexact dispositionするまでfreezeへ算入しない。evidence/supportは
primary routeではなくrelationであり、328外のparagraph、title、support fixture、code fenceも別のspan inventoryでterminal ownershipを持つ。

## §1 entry別primary anchor

| entry | source | primary anchor | count | supporting / gap |
|---|---|---|---:|---|
| E001 | `README.md` | transition chain、derived surface、processing step、runtime dimension | 26 | directory list 6はevidence-only |
| E002 | `SKILL.md` | objective、mandatory rule、derived output、completeness、output order、runtime/switch/route/allocation contract | 63 | Phase-A question 8、trigger 15、vocabulary 15はsupport/alias候補 |
| E003 | `schemas/workflow-model.schema.json` | object contract cluster | 18 | root/actor/state/transition/trigger/timeout/exception/loop/terminal/data/switch/routing/resource/task |
| E004 | `schemas/derived-requirements.schema.json` | root contract cluster | 1 | prose/surface mappingとの整合pending |
| E005 | `catalogs/conditional-question-catalog.yaml` | conditional question | 27 | detect term 30、derived occurrence 22/17 unique |
| E006 | `catalogs/base-question-catalog.md` | base question | 24 | — |
| E007 | `catalogs/runtime-orchestration-question-catalog.md` | runtime question | 25 | — |
| E008 | `examples/approval-workflow.example.json` | transition/loop/terminal fixture case | 5 | support fixture 14、terminal到達transition欠落 |
| E009 | `examples/runtime-orchestration.example.json` | switch/candidate/route/destination/pool/policy fixture case | 8 | — |
| E010 | `contracts/workflow-to-requirement-contract.md` | generation、ID、field、GWT、loop、terminal、data、completeness | 47 | schemaとのfield/required差異 |
| E011 | `contracts/requirement-contract.schema.json` | root/state_change contract cluster | 2 | E010と型・required差異 |
| E012 | `contracts/derived-mapping.md` | mapping table row contract | 12 | E001/E002/E004とのalias候補 |
| E013 | `contracts/runtime-orchestration-contract.md` | execution、switch、route、allocation、input、reallocation、degradation、completeness | 54 | example chain 6はsupport fixture |
| E014 | `prompts/workflow-extraction-prompt.md` | processing step、prohibition、output contract | 16 | 非互換schema同時準拠finding |
| **合計** | **14 entries** | **primary mechanical anchor** | **328** | behavior atom数ではない |

## §2 canonical question ID（76/76）

- conditional 27: `UWR-Q-C-<FAMILY>-<NN>`。pointerはRFC6901 `/<family>/questions/<index>`。
  - `approval=5`、`money=4`、`deadline=4`、`external_integration=5`、`personal_data=4`、`ai_decision=5`
- base 24: `UWR-Q-B-001..024`。pointerはentry blob digest＋heading slug＋ordered-item ordinal＋value digest。
- runtime 25: `UWR-Q-R-001..025`。同じMarkdown AST pointer契約を使う。

空白・末尾句読点を正規化しても76件はuniqueで、exact duplicate 0である。SKILL Phase-A質問8件は
`UWR-Q-SKILL-A-01..08`のalias/composite候補とし、canonical質問分母へ即加算しない。

## §3 最小behavior family下限

1. core workflow elicitation
2. conditional trigger / drill-down
3. runtime orchestration elicitation
4. workflow normalization / model construction
5. completeness / unresolved handling
6. requirement / AC / test derivation
7. derived surface mapping
8. switching / candidate selection
9. routing / fallback / dead-letter
10. scheduling / resource allocation / reallocation / degradation
11. output protocol / prompt safety / package boundary

11は独立採否可能なfamily下限であり、atomic behavior数ではない。各family内をI/O、effect authority、failure、state、oracleでsplitする。

## §4 conflict・coverage gap

| finding | evidence | freeze obligation |
|---|---|---|
| conditional catalog gap | SKILL trigger 15分類に対しtyped family 6。添付、通知、自動実行、複数担当、差戻し、再実行、削除、公開、課金の9分類が欠落 | 質問追加または明示N/A/reject |
| scheduling schema gap | README/E007/E013に要求があるがE003にschedule entityがない | schema/profile改善Issue |
| schema/prose contract drift | E003/E004/E010/E011でfield、型、required分母が不一致 | canonical contract選定＋migration |
| incompatible output contract | E002/E014が非互換な2 schemaへの同時準拠を要求 | typed output envelopeへ分離 |
| fixture reachability | E008 terminalへ到達するtransitionが不足 | negative fixture化または修正 |
| semantic overlap | README/SKILL/schema/contract/mapping/prompt間で同一規則候補が重なる | alias/composes/specifies edge、二重weight 0 |
| unowned span | paragraph、title/description、support fixture、code fenceがprimary anchor外 | terminal disposition必須 |

## §5 closure

| metric | current | verdict |
|---|---:|---|
| entry inventory | 14/14 | PASS |
| primary anchor inventory | 328/328 | PASS（構造分母） |
| canonical question ID | 76/76 | PASS |
| deterministic individual anchor rows | 328/328 | PASS（全kind materialize、coverage credit 0） |
| semantic duplicate disposition design | 19/19 group | PROPOSED（canonical19/alias17/composes2/specifies2、execution 0） |
| candidate exact route | 328/328 | PASS（primary候補 exactly one、target空0、coverage credit 0） |
| post-resolution target hypothesis | 328/328 | PROPOSED（behavior 204 / alias 90 / container 21 / fixture 13 / conflict 0） |
| verified anchor exact disposition | 0/328 | FAIL |
| behavior atom denominator | unknown | FAIL |
| conflict resolved | 0/5主要群 | FAIL |
| unowned span | unknown | FAIL |
| HIL/design/assertion/gate join | 0 | FAIL |

個票artifactは`docs/governance/generated/universal-workflow-anchors-328-v2.json`、抽出契約は
`docs/governance/universal-workflow-anchor-extraction-contract.yaml`である。構造個票のmaterializeをterminal dispositionへ
読み替えず、全328行のrouteはpending、`coverage_credit=false`である。normalized semantic digestは309 uniqueで、
19 duplicate groupはsource間の実重複として保持する。裁定案は
`docs/governance/generated/universal-workflow-semantic-decisions-v1.json`へ固定し、canonical19、weight-zero alias17、
cross-stage composes2、specifies2とした。全328 routeはpendingであり、裁定案だけをverifiedへ算入しない。
v2 artifactは契約必須fieldを328/328保持し、stable ID/fingerprint再計算、3回byte同一を確認した。

candidate route正本は`docs/governance/generated/universal-workflow-anchor-routes-328-v1.json`
（SHA-256 `d07a9c150b2956fdd4685b67ad923a67ced365a4297d1f104be944af199a9d0c`）である。
328 anchorへprimary候補をexactly oneで割り当て、`adopt=31 / alias=17 / composes=2 / specifies=34 /
defer=244 / reject=0`、target空0、unresolved reason 328、coverage true 0、verified 0とした。
family joinだけで個別semantic adoptionを証明できないとしていた180 normative anchorは、独立semantic reviewで全件を
normalized value×family×target単位に再照合した。その結果、semantic routeの`defer`へauthority pendingを混入していたと判定し、
`adopt`候補へ補正するoverlayを
`docs/governance/generated/universal-workflow-anchor-route-semantic-review-v1.json`
（SHA-256 `b65b8fb6600b4d6bf730e8c56dc2f992f283625c1e0bc94fc3abfd5e72444caf`）へ固定した。
review後候補はadopt 211／alias 17／composes 2／specifies 34／defer 64である。
ただしtarget authority pending 180を保持し、activation verified 0、coverage 0のままとする。
candidate分母328/328が閉じたことを、verified dispositionやpost-resolution behavior atom分母の閉鎖へ読み替えない。

## §6 canonical authorityとstatic target

同一family内の優先順位を、(1) PO-confirmed HIL L1/L3、(2) HELIX repo-owned normalized contract、
(3) source typed schema/catalog、(4) source contract prose、(5) SKILL/prompt/README prose、(6) fixture/exampleとする。
上位が下位spanを消去することは禁止し、下位spanはalias、conflict、fixtureのいずれかで保持する。

| family | behavior target | canonical authority |
|---|---:|---|
| F01 core workflow elicitation | 24 | E006、E002 Phase-Aはalias/composite |
| F02 conditional drill-down | 27 | E005、未収録9 categoryはgap |
| F03 runtime elicitation | 25 | E007、E013/E002はcontract/support |
| F04 workflow normalization/model | 4 | HELIX normalized schema、E003はsource constraint |
| F05 completeness/unresolved | 12 | normalized schema＋gate contract |
| F06 requirement/AC/test derivation | 41 | HELIX staged output schema＋E010 semantic contract |
| F07 derived surfaces | 12 | E012 mapping contract |
| F08 switching | 8 | normalized runtime schema |
| F09 routing/dead-letter | 8 | normalized runtime schema |
| F10 scheduling/resource/allocation | 38 | redesigned HELIX runtime schema |
| F11 output protocol/prompt safety | 5 | Node adapter policy＋staged output contract |
| **behavior anchor target** | **204** | atom分母ではない |

残る90 anchorはcanonical behaviorへのalias、21 schema object clusterは`specifies` container、13 example caseはfixtureへ送る。
この204/90/21/13/0は5 conflict解決後のsemantic review用仮説である。現在はverified 0/328、major conflict 5であり、
該当anchorはterminal receipt前にconflict-freeとして数えない。source span digestへbindしたmachine routeと独立reviewが終わるまで
`verified`へ昇格しない。

## §7 conflict disposition proposal

| conflict | decision | canonical replacement / negative oracle |
|---|---|---|
| C-UWR-01 raw SKILL/prompt activation | REJECT（直接実行routeのみ） | registered descriptor→Node adapter→proposal-only。直接DB/write/commandは`HIL_UWR_RAW_ACTIVATION` |
| C-UWR-02 incompatible single JSON | REDESIGN | `workflow_model_proposal`→completeness→`derived_requirements_proposal`のversioned staged envelope |
| C-UWR-03 schema/prose drift | HARDEN | family別canonical schema、prose clause→field constraint edge、旧名は期限付きinput alias |
| C-UWR-04 terminal unreachable fixture | FIXTURE-NEGATIVE | 現fixtureはexpected reachability failure。修正版positive fixtureは別digest/ID |
| C-UWR-05 schedule/allocation/candidate drift | REDESIGN＋HARDEN | schedule/task/capacity/deadline/preemption/fairness/degradation/dead-letterを追加しcanonical nameを一つに固定 |

findingをterminal decisionへ送るにはdecision revision、authority digest、replacement design、positive/negative fixture、
assertion、gate receiptが必要である。この表だけでは`conflict resolved`をgreenにしない。

L5相当machine test designは`docs/test-design/helix/universal-workflow-conflict-test-design-v1.json`に固定した。
5 conflict、16 fixture（positive5/negative11）、SELECT-only DB query20、独立verifier5をschema検証済みである。
全fixtureは`designed_not_executed`、current receipt 0、closed 0を維持する。
