---
title: "HELIX L3 受入テスト設計 — Infinity Loop"
layer: L10
executed_at_layer: L10
artifact_type: test_design
status: draft
created: 2026-07-15
updated: 2026-07-16
owner: QA / TL / PO承認必須
plan: PLAN-L1-07-infinity-loop-platform-requirements
pair_artifact: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
next_pair_freeze: L3
---

# HELIX L3 受入テスト設計 — Infinity Loop

## §0 共通合否契約

各HATは対応する3 ACと配下HIA assertionを全て実行し、正常系だけでなくnegative mutationが期待failure codeで
拒否された場合だけpassする。command、exit code、stdout/stderr digest、artifact/DB query digest、HEAD、runtime、
config、snapshot、実行時刻、worker/verifier分離を必須とする。HST greenやdoctor greenだけでL10総合検証合格としない。

## §1 受入scenario

| HAT | L3/AC | supporting HST | 受入scenario | observable / 必須evidence | negative / boundary |
|---|---|---|---|---|---|
| HAT-HIL-01 | HR-FR-HIL-01 / HAC-HIL-01a, HAC-HIL-01b, HAC-HIL-01c | HST-HIL-001 | 各source入力をIssue契約へ取り込む | intake/contract revision/idempotency/trust receipt | duplicate、異payload、injection |
| HAT-HIL-02 | HR-FR-HIL-02 / HAC-HIL-02a, HAC-HIL-02b, HAC-HIL-02c | HST-HIL-001 | state machineをcausality付きで一周する | transition、closure query、checkpoint digest | illegal transition、orphan、budget境界 |
| HAT-HIL-03 | HR-FR-HIL-03 / HAC-HIL-03a, HAC-HIL-03b, HAC-HIL-03c | HST-HIL-004, HST-HIL-005 | PR監査からfinding promotionまで実行 | delivery/head、audit job、promotion lineage | duplicate/stale、partial promotion |
| HAT-HIL-04 | HR-FR-HIL-04 / HAC-HIL-04a, HAC-HIL-04b, HAC-HIL-04c | HST-HIL-002, HST-HIL-018 | ReverseとRedesign re-entryを実行 | R0–R4、coverage、stale/re-freeze | hollow/skip、誤layer、bypass |
| HAT-HIL-05 | HR-FR-HIL-05 / HAC-HIL-05a, HAC-HIL-05b, HAC-HIL-05c | HST-HIL-019, HST-HIL-021, HST-HIL-023 | directive custody、Scope、Closureを判定 | custody、authority graph、approval/closure receipt | AI終端、cycle、不要拡張、欠落receipt |
| HAT-HIL-06 | HR-FR-HIL-06 / HAC-HIL-06a, HAC-HIL-06b, HAC-HIL-06c | HST-HIL-003, HST-HIL-022 | 三段CIとquarantineを実行 | SHA/tree lineage、check/log、expiry | stage bypass、別SHA、overbroad quarantine |
| HAT-HIL-07 | HR-FR-HIL-07 / HAC-HIL-07a, HAC-HIL-07b, HAC-HIL-07c | HST-HIL-015, HST-HIL-016 | memory compactionとlearning promotionを実行 | input/output digest、shadow metric、review/rollback | raw/secret、self-promotion、regression |
| HAT-HIL-08 | HR-FR-HIL-08 / HAC-HIL-08a, HAC-HIL-08b, HAC-HIL-08c | HST-HIL-006 | registryからbounded teamを生成し全lifecycle、timeout/retry、compaction、custodyを完走 | registry/team/authority/spawn-limit digest、parent-child causality、lease/fence/checkpoint/verify/compaction/custody/dead-letter receipt | manual drift、self-verify、depth/fan-out/active超過、recursive spawn、越権tool、late write、retry exhaustion、未圧縮release、custody切断 |
| HAT-HIL-09 | HR-FR-HIL-09 / HAC-HIL-09a, HAC-HIL-09b, HAC-HIL-09c | HST-HIL-011, HST-HIL-020 | 三sourceをsnapshot/atom/coverageへ処理 | manifests、atom spans、decision/edge/stale receipt | branch/child欠落、aggregate-only、pending |
| HAT-HIL-10 | HR-FR-HIL-10 / HAC-HIL-10a, HAC-HIL-10b, HAC-HIL-10c | HST-HIL-008, HST-HIL-009 | engine/detectorを同一snapshotへ再実行 | version/config/input/output、artifact/finding、rerun digest | unknown、混同、nondeterminism、partial |
| HAT-HIL-11 | HR-FR-HIL-11 / HAC-HIL-11a, HAC-HIL-11b, HAC-HIL-11c | HST-HIL-010 | product dataをfull/incremental投影 | connector、lineage、watermark、redaction/query | drift、cursor逆行、PII、stale current |
| HAT-HIL-12 | HR-FR-HIL-12 / HAC-HIL-12a, HAC-HIL-12b, HAC-HIL-12c | HST-HIL-007 | NodeからPython workerを実行 | protocol/version/sequence/terminal/transaction | invalid/oversize/timeout/crash/late/direct write |
| HAT-HIL-13 | HR-FR-HIL-13 / HAC-HIL-13a, HAC-HIL-13b, HAC-HIL-13c | HST-HIL-013 | Bun-less Linuxでinstallからdistributionまで完走 | environment、Node lock、CLI/build/test/package、zero finding | Bun API/command/lock/CI残存、部分claim |
| HAT-HIL-14 | HR-FR-HIL-14 / HAC-HIL-14a, HAC-HIL-14b, HAC-HIL-14c | HST-HIL-014, HST-HIL-017 | 3 OS contractとsupply chainを検証 | OS matrix、offline digest、SBOM/secret/license | adapter leak、process/lock、unlock/policy違反 |
| HAT-HIL-15 | HR-FR-HIL-15 / HAC-HIL-15a, HAC-HIL-15b, HAC-HIL-15c | HST-HIL-012, HST-HIL-024 | no-UIまたはprototype routeを完了 | applicability、artifact/state、walkthrough/delta/agreement | implicit skip、static-only、stale receipt |
| HAT-HIL-16 | HR-FR-HIL-16 / HAC-HIL-16a, HAC-HIL-16b, HAC-HIL-16c | HST-HIL-025, HST-HIL-026 | design refactorとdomain namingをrouting | semantic signature、consumer/oracle、role/name、rollback | lexical-only、根拠なし抽象化、誤route |
| HAT-HIL-17 | HR-FR-HIL-17 / HAC-HIL-17a, HAC-HIL-17b, HAC-HIL-17c | HST-HIL-027, HST-HIL-028, HST-HIL-029 | requirement翻訳、template義務、revisionをactive化 | source/authority/oracle、template/obligation/change/review | aggregate/TBD/N/A、self-promotion、stale |
| HAT-HIL-18 | HR-FR-HIL-18 / HAC-HIL-18a, HAC-HIL-18b, HAC-HIL-18c | HST-HIL-030, HST-HIL-031, HST-HIL-032, HST-HIL-033 | L1–L12 ledgerの上下/正規6左右pairとrefactorを検証 | registry、snapshot、addition/pair/oracle/refactor receipt | 片edge、stale、未実行oracle、pair破壊 |
| HAT-HIL-19 | HR-FR-HIL-19 / HAC-HIL-19a, HAC-HIL-19b, HAC-HIL-19c | HST-HIL-034 | production Scrum slice内の圧縮VとTDD順序を検証 | L2 agreement/skip、AC/test-design/Red/Green/closure、6 pair receipt | Scrum=PoC代用、prototype未決、Red後置、旧authority |
| HAT-HIL-20 | HR-FR-HIL-20 / HAC-HIL-20a, HAC-HIL-20b, HAC-HIL-20c | HST-HIL-035 | Universal package、interview、workflow normalizationを検証 | 14 entry disposition、question denominator、typed model、rerun digest | raw activation、schema矛盾、unknown ref、推測確定 |
| HAT-HIL-21 | HR-FR-HIL-21 / HAC-HIL-21a, HAC-HIL-21b, HAC-HIL-21c | HST-HIL-036 | workflow completenessと要求/AC/test導出を検証 | transition denominator、8 surface、exact source edge | branch/loop/terminal/exception/data/permission欠落 |
| HAT-HIL-22 | HR-FR-HIL-22 / HAC-HIL-22a, HAC-HIL-22b, HAC-HIL-22c | HST-HIL-037 | routing/schedule/resource/fallback planを検証 | allocation、checkpoint、retry/fallback/dead-letter receipt | task/evidence drop、resource理由の省略、route不在 |
| HAT-HIL-23 | HR-FR-HIL-23 / HAC-HIL-23a, HAC-HIL-23b, HAC-HIL-23c | HST-HIL-038 | standing authorization profileとcanonical intentを検証 | exact scope/profile/expiry/revocation match receipt | broad prefix、自由文包括許可、未登録target、stale profile |
| HAT-HIL-24 | HR-FR-HIL-24 / HAC-HIL-24a, HAC-HIL-24b, HAC-HIL-24c | HST-HIL-039 | platform brokerとbounded executionを検証 | authorize/deny/execution/platform receipt、exactly-once evidence | identity drift、project外、高影響gate bypass、timeout |
| HAT-HIL-25 | HR-FR-HIL-25 / HAC-HIL-25a, HAC-HIL-25b, HAC-HIL-25c | HST-HIL-040 | 162要件のsemantic freeze gateを検証 | source/authority/oracle/template/obligation/pair/review denominator | pointer-only、missing/stale/TBD、自己review |
| HAT-HIL-26 | HR-FR-HIL-26 / HAC-HIL-26a, HAC-HIL-26b, HAC-HIL-26c | HST-HIL-041 | UT全ref atomの採否とanti-corruption変換を検証 | sealed ref、CI/PLAN status、atom、translation/adoption receipt | branch omission、red WIP完成扱い、旧authority直輸入 |
| HAT-HIL-27 | HR-FR-HIL-27 / HAC-HIL-27a, HAC-HIL-27b, HAC-HIL-27c | VIS-L11-N01/F02 | current Prototype Agreementをhuman actor/revision/digestへbind | `prototype_agreement_receipt` | agreement不完全、revision不一致 |
| HAT-HIL-28 | HR-FR-HIL-28 / HAC-HIL-28a, HAC-HIL-28b, HAC-HIL-28c | nonvisual support | framework/symbol/credential無しで要求意味を再現 | `prototype_neutrality_receipt` | implementation binding混入 |
| HAT-HIL-29 | HR-FR-HIL-29 / HAC-HIL-29a, HAC-HIL-29b, HAC-HIL-29c | nonvisual support | design/implementation二軸を独立eventからrebuild | `screen_dual_lifecycle_receipt` | lifecycle軸の推測導出 |
| HAT-HIL-30 | HR-FR-HIL-30 / HAC-HIL-30a, HAC-HIL-30b, HAC-HIL-30c | nonvisual support | semantic IDの全layer exact continuity | `semantic_id_continuity_receipt` | orphan ID |
| HAT-HIL-31 | HR-FR-HIL-31 / HAC-HIL-31a, HAC-HIL-31b, HAC-HIL-31c | nonvisual support | Experience/UI/Frontend三契約を責務混在なくjoin | `three_contract_join_receipt` | contract責務混在 |
| HAT-HIL-32 | HR-FR-HIL-32 / HAC-HIL-32a, HAC-HIL-32b, HAC-HIL-32c | VIS-L9-N01/F01 | required/forbidden/responsive/motion制約内で全画面compose | `l9_pattern_contract_receipt` | forbidden pattern |
| HAT-HIL-33 | HR-FR-HIL-33 / HAC-HIL-33a, HAC-HIL-33b, HAC-HIL-33c | VIS-L9-F01/B01 | shared Rule Packからeffective Product UI Profileを再現 | `l9_product_profile_receipt` | profile逆書き・汚染 |
| HAT-HIL-34 | HR-FR-HIL-34 / HAC-HIL-34a, HAC-HIL-34b, HAC-HIL-34c | VIS-L8-N01/F03 | 全Region/Slot×9状態×negative bindingをL5へexact join | `l8_binding_state_render_receipt` | binding edge欠落 |
| HAT-HIL-35 | HR-FR-HIL-35 / HAC-HIL-35a, HAC-HIL-35b, HAC-HIL-35c | VIS-L8 mission closure | UI-M0..M7のRed先行closure bundleをatomic visual contractへ照合 | `l8_ui_mission_closure_receipt` | mission順序・coverage不正 |
| HAT-HIL-36 | HR-FR-HIL-36 / HAC-HIL-36a, HAC-HIL-36b, HAC-HIL-36c | VIS-L8-N01/B01 | current mission receiptだけからimplementedを再導出 | `l8_implementation_projection_receipt` | self-asserted completion |
| HAT-HIL-37 | HR-FR-HIL-37 / HAC-HIL-37a, HAC-HIL-37b, HAC-HIL-37c | VIS-L8 false fixture | count/placeholder/generic/static-only fixtureを全拒否 | `l8_false_completion_finding_receipt` | false completion受理 |
| HAT-HIL-38 | HR-FR-HIL-38 / HAC-HIL-38a, HAC-HIL-38b, HAC-HIL-38c | VIS-L9-N01/F02 | responsive/token/geometry/focus matrixを全画面実render | `l9_responsive_continuity_receipt` | breakpoint不連続 |
| HAT-HIL-39 | HR-FR-HIL-39 / HAC-HIL-39a, HAC-HIL-39b, HAC-HIL-39c | VIS-L9-F04/F05 | motion/reduced-motion/layout-shiftとbaseline lifecycleを検証 | `l9_motion_baseline_receipt` | motion drift・baseline laundering |
| HAT-HIL-40 | HR-FR-HIL-40 / HAC-HIL-40a, HAC-HIL-40b, HAC-HIL-40c | VIS-L9 surface closure | class/budget/pattern/token/asset/overlayを全画面で閉じる | `l9_surface_expression_receipt` | expression budget逸脱 |
| HAT-HIL-41 | HR-FR-HIL-41 / HAC-HIL-41a, HAC-HIL-41b, HAC-HIL-41c | VIS-L10-N01/F06 | visual-a11y runtime chainをsemantic owner receiptへexact join | `l10_visual_a11y_closure_receipt` | owner・measurement欠落 |
| HAT-HIL-42 | HR-FR-HIL-42 / HAC-HIL-42a, HAC-HIL-42b, HAC-HIL-42c | VIS-L10-N01/F01..F06 | Screen AC×browser/OS/viewport/preference/product-data全matrixを検証 | `l10_browser_data_matrix_receipt` | matrix不完全・stale |
| HAT-HIL-43 | HR-FR-HIL-43 / HAC-HIL-43a, HAC-HIL-43b, HAC-HIL-43c | nonvisual support | UI gapをtyped delta・authority・affected pairへroute | `ui_change_delta_route_receipt` | unauthorized route |
| HAT-HIL-44 | HR-FR-HIL-44 / HAC-HIL-44a, HAC-HIL-44b, HAC-HIL-44c | nonvisual support | capsuleの5 context digestをcheckpointで再照合 | `design_capsule_freshness_receipt` | stale context |
| HAT-HIL-45 | HR-FR-HIL-45 / HAC-HIL-45a, HAC-HIL-45b, HAC-HIL-45c | VIS-L11-N01/F01..F05 | L8–L10 greenと同revision L2 intentをhuman verdictへbind | `l11_human_visual_judgment_receipt` | AI self-approval・stale judgment |
| HAT-HIL-46 | HR-FR-HIL-46 / HAC-HIL-46a, HAC-HIL-46b, HAC-HIL-46c | HST-HIL-060 | pushed commit、remote annotated tag、harness.db checkpoint、全digestを一体化しrestore dry-run | `repository_savepoint_receipt`、remote tag query、projection rebuild digest | dirty/unpushed/lightweight/local-only/moved/reused tag、checkpoint不一致 |
| HAT-HIL-47 | HR-FR-HIL-47 / HAC-HIL-47a, HAC-HIL-47b, HAC-HIL-47c | HST-HIL-061 | L1–L12 tag chain、V-pair、工程表projection、redesign supersessionを検証 | remote tag set、merge-base ancestor、layer/pair receipt、progress query | layer skip、非祖先、片肺、旧SHA、tag移動、Sprint/release混同 |
| HAT-HIL-48 | HR-FR-HIL-25 / HAC-HIL-25a, HAC-HIL-25b, HAC-HIL-25c | HST-HIL-062 | 7 decision receiptからDesign Freezeと最初のL01 local candidateへ遷移 | canonical bundle、critical/review/audit exact digest＋open=0、HEAD/tree、denominator、freeze/terminal receipt、event chain | 未回答、critical open、digest/HEAD/CAS drift、partial write、同key異payload、commit後drift/revoke |

HAT-HIL-46/47は、16 granular failure codeの個別case、`pending_pair→current`二段階close、remote-created/DB-pending crash reconcile、roadmap task-set/denominator digest、working-tree exclusion、GitHub visibility/bypass expiry、refreeze progress四分離が全てcurrentの場合だけ受入れる。umbrella codeだけの検査は不可とする。

### §1.1 PO7 activation acceptance

| ID | 対象 | 正例 | 反例 | 期待 |
|---|---|---|---|---|
| HAT-PO7-01 | Universal option receipt | 6 group各exactly-one、packet/source/actor/chat digest current | unknown/0/複数option、packet drift | activation 0または6 group＋22 answer receiptをall-or-nothing commit |
| HAT-PO7-02 | B/C co-authority | option-bound risk/scope/expiry receipt current | group proseだけ、欠落、scope外、expired | `HIL_PO7_CO_AUTHORITY_INVALID`、増分0 |
| HAT-PO7-03 | VMAUTH event | packet/source/decision/actor/previous eventをCAS | stale epoch、同key異payload、CAS loser | single winner、replay同receipt、partial 0 |
| HAT-PO7-04 | lifecycle/custody | answer event/message/normalized digestからactiveを再現 | chat転記だけ、source drift、revoke/supersede欠落 | append-only active/stale/revoked/superseded、drift時freeze blocker reopen |

選択値はfixture placeholderであり実回答を表さない。acceptance設計はruntime activation、freeze credit、coverage creditを与えない。

## §2 量閉じとfreeze条件

- HAT: 48件（HAT-HIL-48はHR-FR-HIL-25のpost-PO transition詳細化）、対応L3 FR: 47/47、対応AC: 141/141。
- L1 coverage trace: 162/162。HST-HIL-034..041と060..061は10/10設計済み、generic atomic assertion caseは72/72、
  Visual Design HARNESS層別caseは28/28設計済み。実行はいずれも0。
- 実行状態: 全件未実装。fixture、command、exit、digest、DB queryが揃うまでacceptしない。
- G3 freezeはPO承認、別runtime review、semantic frontier record、層別pair lint greenを必要とする。
