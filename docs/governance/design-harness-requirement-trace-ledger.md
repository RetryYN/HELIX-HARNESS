---
title: "Design HARNESS requirement exact trace ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
source: HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.4.0.zip
source_digest: sha256:c0d839bd65a221bd9614b9820cd08d3f5c21cad057bbde03bb9b2e532d05a812
schema: design-harness-requirement-trace.v1
authority_mode: source_snapshot_to_pending_target
---

# Design HARNESS要求 exact trace台帳

## §0 判定

packageの名称をそのままownershipへ昇格しない。Visual Design HARNESSが所有するvisual obligation、支援するnonvisual
platform gate、source-only legacy aliasへ分離したうえで、29要求をrange集約せず個別にrouteする。source spanはZIP内
`requirements/requirements-catalog.yaml`の行番号で、archive digestと組にして固定する。`NEW-DH-*`は現行HILの近接する
generic requirementだけでは原子的に被覆できないため、新規L1 requirement化が必要なcandidateである。

requirements 29件は現行atomic-equivalent 10/29、新規atomic requirement必要19/29である。これは後述するAC 27件の
FULL/PARTIAL/GAP分類とは別分母である。全行の現行HIL ID、L4 design ID、verification case、gate receiptが
materializeされるまでexact coverageは0/29である。

この台帳の既存`DH-L10-*`文字列はpackage source側のlegacy candidate aliasであり、canonical layer配置を意味しない。
Visual primary evidenceはL8/L9/L10/L11へ層別化し、nonvisual supportはvisual完成率から除外する。active test IDへの
昇格時は`VIS-L8-*`、`VIS-L9-*`、`VIS-L10-*`、`VIS-L11-*`またはnonvisual gate IDへremapし、`DH-L10-*`を
実行authorityとして残さない。

## §1 exact route（29/29）

| source ID | span | semantic obligation | HIL route | L4 component | verification / gate candidate | disposition / canonical remap |
|---|---:|---|---|---|---|---|
| HBR-DH-001 | 1369-1380 | Design capabilityはPython Core nativeでoverlayでない | HIL-FR-15/25、HIL-TR-02/03 | `DesignCapabilityRegistry` | DH-L10-001 topology | harden/adopt。Python data planeへ |
| HBR-DH-002 | 1381-1392 | 53 raw assetはimmutable transformation source | HIL-FR-21/22、HIL-NFR-12 | `DesignSourcePinRegistry` | DH-L10-002 custody | harden。53はsnapshot fact、分母はreceipt由来 |
| HBR-DH-003 | 1393-1403 | UT/PR65はdonor、parity/UT IDを完成oracleにしない | HIL-FR-16/21/22 | `DonorBoundaryValidator` | DH-L10-003 namespace | adopt-with-hardening |
| HBR-DH-004 | 1404-1414 | L2 Prototype Agreement typed fields | HIL-FR-61 | `PrototypeAgreementService` | DH-L10-004 schema/agreement | adopt。canonical L2↔L11 |
| HBR-DH-005 | 1415-1425 | prototypeはimplementation-neutral | HIL-FR-62 | `PrototypeNeutralityValidator` | DH-L10-005 forbidden binding | adopt。canonical L2 |
| HBR-DH-006 | 1426-1436 | screen designとimplementation lifecycleは直交 | HIL-FR-63 | `ScreenLedgerLifecycleService` | DH-L10-006 cross-axis transition | adopt。design L2/L4、code L6、pair L11/L9/L7 |
| HBR-DH-007 | 1437-1447 | screen/region/slot/action/state/binding ID continuity | HIL-FR-64 | `SemanticIdContinuityGraph` | DH-L10-007 ID closure | redesign。旧L1–L10→canonical L1–L12 pairs |
| HBR-DH-008 | 1448-1458 | Experience/UI/Frontend contractを分離しIDでjoin | HIL-FR-65 | `ThreeContractRegistry` | DH-L10-008 separation/join | adopt。Experience L1/L2、UI L4、FE L5/L6 |
| HBR-DH-009 | 1459-1469 | Pattern required/forbidden/responsive/motion内だけcompose | HIL-FR-66 | `PatternContractResolver` | DH-L10-009 constraint | adopt。policy L4、detail L5、code L6 |
| HBR-DH-010 | 1470-1480 | product UI profileをshared rule packから隔離 | HIL-FR-67 | `ProductUiProfileResolver` | DH-L10-010 contamination | adopt。L4/L5 |
| HBR-DH-011 | 1481-1491 | Region/Slotをdata/state/event/permission/log/errorへbind | HIL-FR-68 | `FrontendBindingService` | DH-L10-011 six-dimension | adopt。L5↔L8 |
| HBR-DH-012 | 1492-1502 | UI-M0..M7 missionがfoundationからevidenceを被覆 | HIL-FR-69 | `UiMissionPlanner` | DH-L10-012 mission closure | redesign。design L5、code L6、Red/closure L7 |
| HBR-DH-013 | 1503-1513 | implementedは全mission独立receiptからのみ導出 | HIL-FR-70 | `UiImplementationProjection` | DH-L10-013 independent receipt | harden。authored status禁止、L6↔L7 |
| HBR-DH-014 | 1514-1524 | route/screen数、placeholder、generic tableは完成証拠でない | HIL-FR-71 | `FalseFrontendCompletionDetector` | DH-L10-014 adversarial fixture | adopt。L7/L10 evidence |
| HBR-DH-015 | 1525-1535 | screenはadaptiveまたはdesktop-only-safe | HIL-FR-72 | `ResponsiveContractEvaluator` | DH-L10-015 viewport | adopt。L4→L5→L6→L10 |
| HBR-DH-016 | 1536-1546 | operational UIはmotion budget＋reduced-motion | HIL-FR-73 | `MotionBudgetEvaluator` | DH-L10-016 runtime measure | adopt。L4→L5→L6→L10 |
| HBR-DH-017 | 1547-1557 | surface classでexpression budgetを制御 | HIL-FR-74 | `SurfaceClassificationPolicy` | DH-L10-017 class/budget | adopt。L4→L5/L6→L10 |
| HBR-DH-018 | 1558-1568 | accessibilityをpolicy/oracle/runtime measureで閉じる | HIL-FR-75 | `AccessibilityClosureService` | DH-L10-018 closure | redesign。test-first L5/L7→L6→L10 |
| HBR-DH-019 | 1569-1579 | real render/data/responsive/motion/a11y/continuity evidence | HIL-FR-76 | `RealUxEvidenceCollector` | DH-L10-019 six-family evidence | redesign。旧G10→canonical L10 exit gate |
| HBR-DH-020 | 1580-1590 | late UI gapをtyped deltaで正しいdriveへroute | HIL-FR-77 | `UiChangeDeltaRouter` | DH-L10-020 authority/route | harden。Redesign/DesignRefactor/additiveへ分岐 |
| HBR-DH-021 | 1591-1604 | 既存Pythonへactivation/schema/spec/trace等を部分修正 | HIL-FR-15/25、HIL-TR-03 | `PythonDesignCapabilityAdapter` | DH-L10-021 parity | harden。229 callable exact route必須 |
| HBR-DH-022 | 1605-1616 | browser/Git/provider/promotion/DB transactionはNode effect plane | HIL-FR-27、HIL-TR-02/03/08/09 | `NodeDesignSideEffectAdapter` | DH-L10-022 ownership | harden。Node control/gate/schema再検証も保持 |
| HBR-DH-023 | 1617-1627 | DBはrebuildable projection、authored contractへ逆書きしない | HIL-TR-07/09/10 | `DesignProjectionRepository` | DH-L10-023 rebuild/deny | adopt。Node single writer |
| HBR-DH-024 | 1628-1639 | Screen Gate、L1/L2収束、L3承認、主観UXは人authority | HIL-FR-79 | `DesignJudgmentAuthorityPolicy` | DH-L10-024 self-approval deny | redesign。G2→L2/L3 Screen Gate |
| HBR-DH-025 | 1640-1650 | screen state/action/transitionをworkflow IRへjoin | HIL-FR-53/55 | `DesignWorkflowBridge` | DH-L10-025 bidirectional join | adopt。L2→L3→L5 |
| HBR-DH-026 | 1651-1661 | Design capsuleがprototype/profile/binding/mission/oracleを保持 | HIL-FR-78 | `DesignCapsuleAssembler` | DH-L10-026 context/freshness | harden。evidence-backed N/Aのみ |
| HBR-DH-027 | 1662-1672 | active artifactからUT CLI/state/DB/PLAN/role/Bunを排除 | HIL-FR-16/21、HIL-TR-01/11 | `DesignNamespaceSanitizer` | DH-L10-027 six-class scan | harden。source bytesは保持、active projectionだけremap |
| HBR-DH-028 | 1673-1685 | typed contractを既存catalogへbindしparallel taxonomy禁止 | HIL-FR-25/42/46 | `HybridCatalogBindingRegistry` | DH-L10-028 exact slot | harden。122固定値でなくcurrent digest分母 |
| HBR-DH-029 | 1686-1698 | Design contractをPython functionへbindしNode意味複製禁止 | HIL-FR-15/25/27、HIL-TR-03 | `PythonFunctionBindingRegistry` | DH-L10-029 229-anchor parity | harden。21 binding→29 module/229 callableへ展開 |

## §2 closure

| metric | current | verdict |
|---|---:|---|
| source rows identified | 29/29 | PASS |
| existing atomic-equivalent route | 10/29 | PROPOSED |
| new atomic requirement candidate | 19/29 | OPEN |
| L4 component candidate | 29/29 | PROPOSED |
| verification/gate candidate | 29/29 | PROPOSED |
| materialized HIL exact edge | 0/29 | FAIL |
| materialized L4 design edge | 0/29 | FAIL |
| materialized verification/gate edge | 0/29 | FAIL |

`PROPOSED`をcoverageへ算入しない。19件をL1/L3へ登録し、全29件をmachine edgeとして生成した後に独立reviewする。

## §3 package acceptance criteria独立監査（27/27）

`requirements/acceptance-criteria.yaml::AC-DH-nn`を一行ずつ意味比較した。先行集計の`FULL 8 / PARTIAL 11 / GAP 8`は
算術と分類が一致しないため撤回する。正しい静的接続度は次である。これはexecution greenではない。

| verdict | count | source AC |
|---|---:|---|
| FULL | 9 | AC-DH-08/09/10/13/14/15/16/17/22 |
| PARTIAL | 12 | AC-DH-02/04/05/06/07/11/12/18/20/21/23/24 |
| GAP | 6 | AC-DH-01/03/19/25/26/27 |

PARTIAL/GAPのclosure対象は18件であり、旧19件ではない。target L1–L12 authority modelに対するprimary case候補は
L7=2、L8=3、L9=1、L10=9、L11=2、L12=1とする。
machine-readable正本候補は`docs/governance/design-harness-ac-closure-edges.yaml`で、18/18 unique source ACと
non-empty requirement/HAC/test edgeをparse検証済みである。ただし`coverage_credit=false`を維持する。

| layer | closure case candidates | primary proof |
|---|---|---|
| L7 | DHAC-L07-012/024 | independent mission receipt、capsule spawn前freshness |
| L8 | DHAC-L08-011/019/027 | mission readiness、Python patch/wrap parity、Python/Node ownership |
| L9 | DHAC-L09-023 | UI state/actionとworkflow IRの単一join |
| L10 | DHAC-L10-001/003/006/007/018/020/021/025/026 | topology、donor honesty、dual lifecycle、full trace、delta route、Node visual toolchain、projection、namespace、catalog |
| L11 | DHAC-L11-004/005 | Prototype Agreement全field、implementation neutrality |
| L12 | DHAC-L12-002 | 53-entry source custody、archive digest、transformation lineage |

全caseはpackage/source digest、authority revision、denominator、selected/missing atom、input/output/artifact digest、producer/verifier、
verdict、failure code、commit/tree/build、freshnessを持つ。現状は`designed/not_executed`であり、18/18のfixture、DB query、
実行receiptがmaterializeされるまでFULLへ昇格しない。
