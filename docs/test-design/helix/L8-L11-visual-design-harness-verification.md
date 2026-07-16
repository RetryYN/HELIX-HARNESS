---
title: "HELIX Visual Design HARNESS L8-L11 verification design"
status: draft
authority_mode: pending_target_authoring
authority_model: HELIX-L12-V-TARGET-v1
authority_receipt: VMAUTH-2026-07-16-01
created: 2026-07-16
updated: 2026-07-16
owner: QA / UIUX / TL
scope: visual-design-only
requirements:
  - HIL-FR-64
  - HIL-FR-66
  - HIL-FR-67
  - HIL-FR-68
  - HIL-FR-69
  - HIL-FR-70
  - HIL-FR-71
  - HIL-FR-72
  - HIL-FR-73
  - HIL-FR-74
  - HIL-FR-75
  - HIL-FR-76
  - HIL-FR-79
---

# Visual Design HARNESS L8–L11検証設計

> 本書はL1–L12 target authoring candidateの検証設計であり、authority receiptはpendingである。現行runtime互換の
> L0–L14/L2↔L10/G10をactive実行authorityとして置換せず、本書のdesigned caseをactive greenへ算入しない。

## §0 scopeとV-pair

Design HARNESSはvisual/UI design専用である。一般integration/system/UXを一括所有せず、次の4 pairを検証する。

| pair | design side | verification side | （日本語の機械契約記述）
|---|---|---|
| L5↔L8 | Detailed Visual Contract、Frontend Binding、state/region/slot oracle | atomic visual/binding verification | （日本語の機械契約記述）
| L4↔L9 | Pattern Contract、Product UI Profile、visual system policy | cross-screen visual integration | （日本語の機械契約記述）
| L3↔L10 | Screen FR/AC/NFR、role/data/workflow outcome | browser/data visual system verification | （日本語の機械契約記述）
| L2↔L11 | Prototype Agreement、visual intent、expression/preference criteria | human visual acceptance | （日本語の機械契約記述）

L7はL6実装とのVisual TDD closureで、L8以降へcurrent mission evidenceを渡す。L8–L10はmachine-verifiable、L11の
subjective visual/experience/preference verdictだけをhuman authorityとする。

## §1 common evidence contract （日本語の契約見出し）

全caseは次を固定する。

- source commit/tree/build digest、Design contract/profile/binding/prototype revision （日本語の機械契約記述）
- OS、browser engine/version、font set、DPR、viewport、locale、timezone、theme、text scale、motion/contrast preference （日本語の機械契約記述）
- fixtureまたはredacted product snapshot digest、tool/version/config digest
- oracle ID、expected/actual、producer/verifier、artifact digest、started/completed timestamp （日本語の機械契約記述）
- screen/state/region/slot/action/binding ID、matrix cell ID、failure code、applicability receipt （日本語の機械契約記述）

silent skipは禁止する。N/Aはauthority、reason、scope digest、re-entry triggerを持つ。quarantine/deferred/flaky retryはgreenへ
算入しない。artifactはCASに置き、DBはprojectionとしauthoring sourceへ逆書きしない。

## §2 L8 Visual Detail / Binding Verification （日本語の契約見出し）

分母は`screen/component/region/slot × required state × theme × viewport × binding negative path`である。required stateは最低
`loading/empty/error/stale/partial/long-text/large-set/unauthorized/offline`を持つ。

| case ID | kind | fixture / stimulus | oracle | expected / failure code | （日本語の機械契約記述）
|---|---|---|---|---|
| VIS-L8-N01 | positive | 全Region/Slot、9状態、current L5 bindingをrender | semantic selector、DOM/a11y tree、computed token/style、geometry、focus | 全obligation/binding exact join |
| VIS-L8-F01 | negative | required 9状態のうちunauthorizedまたはofflineを1件欠落 | state denominator | `HIL_VIS_L8_STATE_COVERAGE_INCOMPLETE` |
| VIS-L8-F02 | negative | raw color/spacing、token provenance欠落 | computed style→token trace | `HIL_VIS_L8_TOKEN_PROVENANCE_MISSING` |
| VIS-L8-F03 | negative | route/query/data/view-state/action/permission/log/error edgeを各1件欠落 | six-dimension/network/event/state trace | `HIL_VIS_L8_BINDING_EDGE_MISSING` |
| VIS-L8-F04 | negative | 同入力でfont/render digestを揺らす | deterministic rerun | `HIL_VIS_L8_RENDER_NONDETERMINISTIC` |
| VIS-L8-B01 | boundary | CAS artifactのbytes/digest不一致、project外path、未redact PII/secret、期限切れretentionを各1件投入 | CAS identity、project-root、redaction/scan/retention receipt | `HIL_VIS_ARTIFACT_SECURITY_INVALID` |

## §3 L9 Cross-screen Visual Integration （日本語の契約見出し）

分母はcritical screen/flowの`screen × state × viewport × theme × locale × text scale × motion preference`をfull matrix、
非critical cellをversioned pairwise algorithmで選定する。

| case ID | kind | fixture / stimulus | oracle | expected / failure code | （日本語の機械契約記述）
|---|---|---|---|---|
| VIS-L9-N01 | positive | 全critical screen/flowとpairwise選定済みnoncritical cell（fixture最小3画面）でshared pattern/profileを全breakpoint render | token、typography、spacing、density、hierarchy、asset、navigation continuity | critical full matrix diff 0、selected noncriticalはapproved threshold内 |
| VIS-L9-F01 | negative | 1画面だけspacing/token/icon variantをdrift | cross-screen computed style/diff | `HIL_VIS_L9_PATTERN_DRIFT` |
| VIS-L9-F02 | negative | breakpointでlayout jump/overflow/clipping | geometry/flow continuity | `HIL_VIS_L9_BREAKPOINT_DISCONTINUITY` |
| VIS-L9-F03 | negative | modal/nav/toastのz-index・focus collision | overlay/focus oracle | `HIL_VIS_L9_OVERLAY_COLLISION` |
| VIS-L9-F04 | negative | motion duration/repeat/layout shift/reduced-motion drift | runtime motion trace | `HIL_VIS_L9_MOTION_CONTRACT_DRIFT` | （日本語の機械契約記述）
| VIS-L9-F05 | negative | failure後に同producerがbaselineを更新してPASS | baseline lifecycle/role separation | `HIL_VIS_L9_BASELINE_LAUNDERING` |
| VIS-L9-B01 | boundary | font/theme/localeの一つをmatrixへ追加 | matrix denominator stale判定 | `HIL_VIS_L9_MATRIX_STALE` |

## §4 L10 Browser/Data Visual System Verification （日本語の契約見出し）

分母は`Screen AC × role × critical journey × browser engine × OS profile × viewport/DPR × theme/preferences × data scenario`。
Linux deterministic render labをauthoritative、macOSをfirst-class portable、Windowsをcompatibilityとする。

| case ID | kind | fixture / stimulus | oracle | expected / failure code | （日本語の機械契約記述）
|---|---|---|---|---|
| VIS-L10-N01 | positive | pinned sanitized product snapshotでempty/nominal/long/error/slow/offline/multi-role journey | task到達、情報優先順位、recovery、next action、NFR、visual-a11y | 全AC/matrix cell current |
| VIS-L10-F01 | negative | synthetic fixtureだけでreal-data familyをPASS | product snapshot lineage | `HIL_VIS_L10_DATA_SCENARIO_SYNTHETIC_ONLY` |
| VIS-L10-F02 | negative | stale product snapshotをcurrent扱い | freshness/lineage | `HIL_VIS_L10_PRODUCT_SNAPSHOT_STALE` |
| VIS-L10-F03 | negative | WebKit/font fallback、200% zoom、long localeでclip/reflow失敗 | browser/font/geometry matrix | `HIL_VIS_L10_ENVIRONMENT_ROBUSTNESS_FAILED` |
| VIS-L10-F04 | negative | reduced-motion/high-contrast preference違反 | preference runtime oracle | `HIL_VIS_L10_PREFERENCE_CONTRACT_FAILED` |
| VIS-L10-F05 | negative | aggregate screenshot 1枚を複数AC/cellへ割当 | evidence cardinality/provenance | `HIL_VIS_L10_EVIDENCE_REUSED_ACROSS_CELLS` |
| VIS-L10-F06 | negative | marker/test/docだけでRENDER/A11Yをpassed | actual browser/artifact substance | `HIL_VISUAL_CONTRACT_ONLY_FALSE_PASS` |
| VIS-L10-B01 | boundary | browser/OS/viewport/data revisionを一つ更新 | matrix/receipt stale propagation | `HIL_VIS_L10_MATRIX_STALE` |

## §5 L11 Human Visual Acceptance （日本語の契約見出し）

machine prerequisiteはL8–L10 current green、L2 Prototype Agreementとevidence packetのrevision一致である。最終判定は
PO/Experience Owner/UIUX（必要時TL）の独立human actorが行う。

| case ID | kind | fixture / stimulus | oracle | expected / failure code | （日本語の機械契約記述）
|---|---|---|---|---|
| VIS-L11-N01 | positive | current agreementとproducer identityをblind化した完全evidence packetを人へ提示 | 目的、情報階層、affordance、brand/expression、視認性、responsive/motion、反復利用 | criteria別PASS＋revision-bound receipt |
| VIS-L11-F01 | negative | AI/workerがhuman receiptを生成 | actor/authority | `HIL_VIS_L11_SELF_APPROVAL` |
| VIS-L11-F02 | negative | old prototypeまたはstale evidence packet | revision/freshness | `HIL_VIS_L11_PROTOTYPE_REVISION_MISMATCH` |
| VIS-L11-F03 | negative | criterionなしの「好み」だけでaccept | declared preference scope | `HIL_VIS_L11_PREFERENCE_SCOPE_MISSING` |
| VIS-L11-F04 | negative | FAIL/UNCERTAIN/dissentをclose扱い | terminal/routing | `HIL_VIS_L11_DISSENT_UNRESOLVED` |
| VIS-L11-F05 | negative | rejected visual deltaからRedesign Issueを作らない | backprop causality | `HIL_VIS_L11_REJECTION_NOT_ROUTED` |
| VIS-L11-B01 | boundary | agreementまたはbaseline revision更新 | prior receipt stale化 | `HIL_VIS_L11_EVIDENCE_STALE` |

## §6 known negative fixture （日本語の契約見出し）

現行`.helix/evidence/g10-ux/20260705-selected-ux-evidence.json`を`VIS-L10-F06`へ固定する。同artifactは
`UXV-RENDER/A11Y/BLOCKER`をpassedとするが、唯一のcommandがBun unit testでbrowser/screenshot/axe resultは0件である。
期待verdictは`contract_present/designed_not_executed`で、visual PASSではない。

## §6 Layer Freeze eligibility bridge （日本語の契約見出し）

L8=6、L9=7、L10=8のcase ID exact set、case-set revision/digest、matrix denominator、execution receipt、独立review receipt、
visual authority epoch、eligible countを`visual_freeze_eligibility_receipt`へ結合する。各layerは全caseがcurrent execution evidenceを持ち、
failure/quarantine/deferred/reused/staleが0の場合だけlayer tag/V-pair receiptのeligible inputとなる。

未実行Design case、N/A、quarantine、別matrix cellで利用済みのartifact、`pending_pair`、remote tag存在、工程task完了だけを投入する
negative fixtureでは、`layer_progress_projection_query`のfreeze numeratorを必ず0、layer stateを`blocked`とする。live progressは保持しても
`freeze_progress`、`last_frozen_chain`、V-pair PASSへ加算しない。これにより設計済み21件を実行済みvisual evidenceへ読み替えない。

## §7 denominatorと未実装境界

| layer | designed cases | execution | （日本語の機械契約記述）
|---|---:|---:|
| L8 | 6 | 0/6 |
| L9 | 7 | 0/7 |
| L10 | 8 | 0/8 |
| L11 | 7 | 0/7 |
| **total** | **28** | **0/28** |

要件定義中のためruntime execution 0は期待状態である。実装開始前に、全28 caseをrequirement、HAC、L4 gate、DB query、fixture、
failure codeへexact joinし、Design HARNESSのL8–L11検証分母をfreezeする。
