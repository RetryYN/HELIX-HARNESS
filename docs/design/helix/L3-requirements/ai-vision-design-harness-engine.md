---
title: "AI Vision Design HARNESSエンジン要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-19
updated: 2026-07-19
owner: PO / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md
---

# AI Vision Design HARNESSエンジン要件

## 1. 入力正本の結合と裁定

- canonical source: `docs/migration/source-packages/hybrid-core-requirements-rebaseline-v0.5.1.zip`
- SHA-256: `1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd`
- inventory: 211 physical files。Design HARNESS主要sourceは`17-design-harness-integration.md`、`design-harness/` 11件、schema 6件、template 6件、skill、example、53件の変換元snapshot。
- intake差異: workspace添付同名ZIP `04e9c88a9214e77654787b9e1301eb35bc69a2f264d179d14211e849c58aca61`（208 entries）は再監査前の中間物であり、正本へ昇格しない。
- content照合: 添付版と正本版の`17-design-harness-integration.md`、Design HARNESS主要7契約、requirements catalog、acceptance catalogの10対象は全てbyte digest一致。
- harness memory: `[helix-not-ut-harness]`、`[adr-010-runtime-authority-ruling]`、`[v051-completion-claim-correction]`、`[v051-final-reverification]`を確認し、名称、runtime authority、finding分母、正本digestを裁定した。

| source atom | disposition | HELIX裁定 |
|---|---|---|
| Experience／UI／Frontend三契約 | adopt | Visionから実装・検証までの意味spine |
| semantic ID、prototype agreement、screen ledger、UI profile、frontend binding、UX evidence、delta | adopt-with-hardening | version、source、authority、HEAD、digest、V-pairを追加 |
| G2/G4/G5/G6/G7/G10 sub-check | adapt | 新gateを作らず現行layer gateへ配置 |
| `implemented`／`ux_verified`分離 | adopt | code完成と体験完成の誤同一化を防止 |
| L0〜L14、旧L6 mission、旧L7 implementation | remap | L1〜L12と正規6 pairへexact mapping |
| Hybrid Python意味コア | adopt-with-boundary | ADR-010により恒久意味正本。Nodeへの意味複製は禁止 |
| 既存Python path維持 | adapt | 実装候補は再利用できるがpath名をauthorityにしない |
| UT CLI/state/DB/PLAN/role、Bun | reject | migration sourceに限定 |

## 2. 機能要件

| ID | 要件 | 受入ID |
|---|---|---|
| VDH-FR-001 | source filename、digest、211-file inventory、添付中間物との差異、atom dispositionをintake receiptへ固定する | VDH-AC-001 |
| VDH-FR-002 | product visionをExperience、UI、Frontendの三契約へ分解し同一revisionで連鎖させる | VDH-AC-002 |
| VDH-FR-003 | `screen/region/slot/action/state/binding` semantic IDを意味主キーとし、class名やfile pathを主キーにしない | VDH-AC-003 |
| VDH-FR-004 | UI対象はL2 prototype agreementとscreen ledgerを必須化し、purpose、persona、frequency、criticality、region、state、responsive、motion、trace、evidenceを保持する。framework、component class、API、props、state ownerはL2で固定しない。非UIは証拠付きN/Aを必須化する | VDH-AC-004 |
| VDH-FR-005 | AIは白紙生成せず、required/forbiddenを持つPattern Contract内で構成する。UI profileは情報優先順位、pattern/token、responsive、motion budget、reduced-motion、accessibility、brand制約、operational/expressive/mixed分類を持ち、product固有値を共通Rule Packへ混入しない | VDH-AC-005 |
| VDH-FR-006 | frontend bindingはdata、state owner、event、permission、logging、validation、loading/empty/errorをscreen action/stateへbindする | VDH-AC-006 |
| VDH-FR-007 | workflow state/trigger/condition/action/next/loop/terminalをvisual state、UI event、visibility、transition、retry、終了UXへ写像する | VDH-AC-007 |
| VDH-FR-008 | requirement→screen→binding→source/test→evidenceを双方向traceし、orphanを0にする | VDH-AC-008 |
| VDH-FR-009 | G2/G4/G5/G6/G7/G10相当を既存L2/L4/L5/L6-L7/L10-L12 gateのsub-checkとして実行し、新layerを作らない | VDH-AC-009 |
| VDH-FR-010 | foundation、route、composition、data、states、interaction、responsive/a11y/motion、tests/evidenceをUI-M0..M7相当のmission/oracleとしてL5で凍結し、`implemented`をL6↔L7の全mission独立receipt、`ux_verified`をreal-data UX evidenceと人間評価から独立導出する | VDH-AC-010 |
| VDH-FR-011 | UX evidenceはreal data、responsive、motion、accessibility、performance、continuity、主要stateとdevice/view条件を含む | VDH-AC-011 |
| VDH-FR-012 | UI変更deltaをcandidate/observing/approved/expiredとして管理し、影響requirement、screen、binding、test、evidenceを算出してRedesign/Design Refactor/Performance Refactor/Retrofitのexactly-oneへrouteし、無断の機能拡張をblockする | VDH-AC-012 |
| VDH-FR-013 | AIはartifactと改善候補をproposalできるがvision、brand、prototype agreement、要求freeze、受入、改善採否を自己承認しない | VDH-AC-013 |
| VDH-FR-014 | Full Vは全UI workstream、Production Scrumはslice deltaとSR0〜SR4 system backfillの両方を保持する | VDH-AC-014 |
| VDH-FR-015 | 三契約とevidenceをL1〜L12および正規6 V-pairへexactly-one配置する | VDH-AC-015 |
| VDH-FR-016 | typed contractは既存hybrid document slotのsidecarとして保持し、独立文書体系・独立engine・別authoring DBを作らない。`harness.db`はauthoring sourceを逆書きしない再構築可能なread-model projectionとする | VDH-AC-016 |
| VDH-FR-017 | Pythonはactivation/schema/spec/trace/impact/schedule/review/build/validationを含むDesign HARNESS意味コアの恒久正本とする。Nodeはbrowser、Playwright/axe/Lighthouse/VRT、provider、schema・authority・policy・HEAD・digest再検証、Git/GitHub、atomic promotion、DB transactionを担い、互いのauthorityを複製しない | VDH-AC-017 |
| VDH-FR-018 | delegated UI capsuleはprototype/profile/ledger/binding/mission/oracle/evidence digestとworker-verifier分離を持つ | VDH-AC-018 |
| VDH-FR-019 | Discovery PoCはS0〜S4内でvision/prototype仮説を探索できるが、S4人間判断前に`implemented`、`ux_verified`、production-readyを主張せず、採用時はFull VまたはProduction Scrumへ昇格する | VDH-AC-019 |

## 3. 入力要件の全数対応表

| source requirement | canonical requirement | 裁定 |
|---|---|---|
| HBR-DH-001 | VDH-FR-016,017 | native capabilityとして統合 |
| HBR-DH-002 | VDH-FR-001 | 53資産を変換provenanceとして保持 |
| HBR-DH-003 | VDH-FR-001 | 旧UTは同系譜source、active authorityにはしない |
| HBR-DH-004 | VDH-FR-004 | L2 prototypeの型付き契約 |
| HBR-DH-005 | VDH-FR-004 | L2の実装非依存境界 |
| HBR-DH-006 | VDH-FR-010 | design／implementation／UX verification lifecycleを分離 |
| HBR-DH-007 | VDH-FR-003,008,015 | semantic ID continuityをL12まで延長 |
| HBR-DH-008 | VDH-FR-002,003 | 三契約分離と結合 |
| HBR-DH-009 | VDH-FR-005 | Pattern Contract制約生成 |
| HBR-DH-010 | VDH-FR-005 | common／product profile隔離 |
| HBR-DH-011 | VDH-FR-006 | Frontend Bindingの閉包 |
| HBR-DH-012 | VDH-FR-010 | 旧L6 missionを現行L5先行設計へremap |
| HBR-DH-013 | VDH-FR-010 | receiptからの実装済み判定 |
| HBR-DH-014 | VDH-FR-010,012 | 虚偽完成／placeholder防止 |
| HBR-DH-015 | VDH-FR-005,011 | responsive contractとviewport evidence |
| HBR-DH-016 | VDH-FR-005,011 | motion予算／reduced-motion代替 |
| HBR-DH-017 | VDH-FR-005 | surface分類 |
| HBR-DH-018 | VDH-FR-005,010,011,015 | a11y policy→oracle→実測 |
| HBR-DH-019 | VDH-FR-011 | 実データUX証拠 |
| HBR-DH-020 | VDH-FR-012 | delta lifecycle／駆動モデル振分け |
| HBR-DH-021 | VDH-FR-017 | Python意味コアへ採用、path固定は非authority化 |
| HBR-DH-022 | VDH-FR-017 | Node side-effect／browser tool境界 |
| HBR-DH-023 | VDH-FR-016 | 読取投影専用DB |
| HBR-DH-024 | VDH-FR-013 | 人間の判断authority |
| HBR-DH-025 | VDH-FR-007 | Workflow Requirements Engine接続 |
| HBR-DH-026 | VDH-FR-018 | capsule設計context |
| HBR-DH-027 | VDH-FR-001,017 | UT namespace／Bun排除 |
| HBR-DH-028 | VDH-FR-016 | 既存document catalog binding |
| HBR-DH-029 | VDH-FR-017 | Python function binding coverage、Node意味複製禁止 |

## 4. L1〜L12配置

| 層 | Vision Design義務 | V字の証拠 |
|---|---|---|
| L1 | product vision、actor、価値、体験原則、scope/non-goal | L12価値・運用UX・改善効果 |
| L2 | 要求往復、操作可能prototype、agreement、screen ledgerまたはN/A | L11利用者受入・prototype continuity |
| L3 | screen/UX FR・NFR・AC、優先度、brand/体験制約、oracle | L10system UX・要件充足 |
| L4 | UI profile、IA、pattern/token、responsive/a11y/motion、外部境界 | L9navigation・service・data接続 |
| L5 | frontend binding、全state、mission/unit oracle、test/measurement contract | L8component・局所visual behavior |
| L6 | UI/FE product codeを凍結契約内で実装 | L7TDD closureとmission receipt |
| L7 | component/state/a11y/visual oracleとprobeをtest実装 | L6 implementation trace |
| L8 | component、state、validation、local responsive/a11y検証 | L5 detail contract |
| L9 | service/data/auth/navigation/event統合検証 | L4 basic design |
| L10 | 一気通貫、visual regression、responsive、motion、a11y、performanceの総合検証 | L3 FR/NFR/AC |
| L11 | real user/data、操作性、理解、prototype-to-product continuity | L2 agreement |
| L12 | telemetry、SLO、support/feedback、drift、改善効果 | L1 vision/value |

## 5. ハイブリッド経路

- `FULL_L1_L12_V`: system全体のVision Design workstreamと全right-arm evidenceを閉じる。
- `PRODUCTION_SCRUM_REDUCED_V`: UI sliceごとに反復し、review／release前のSR0〜SR4でsystem visionとL1〜L5へbackfillする。
- `DISCOVERY_POC`: S0〜S4で仮説とprototypeを探索する。S4 human decide前はproduction evidenceへ昇格しない。

## 6. 完了式

`vision_design_complete = three_contracts_closed ∧ semantic_trace_orphan=0 ∧ six_V_pairs_current ∧ implemented_receipt_current ∧ ux_evidence_current ∧ human_authority_pass`

`scrum_ui_slice_ready = slice_delta_current ∧ SR0..SR4_current ∧ system_vision_backfill_closed ∧ prototype_profile_binding_evidence_current`

`source_adoption_closed = mapped(HBR-DH-001..029)=29/29 ∧ unmapped=0 ∧ rejected_without_reason=0`
