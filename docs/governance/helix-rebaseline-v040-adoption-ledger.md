---
title: "HELIX Hybrid Core Rebaseline v0.4.0 adoption ledger"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: PO / TL
source_family: ZIP-HELIX-REBASELINE-V040
source_digest: sha256:c0d839bd65a221bd9614b9820cd08d3f5c21cad057bbde03bb9b2e532d05a812
authority: candidate-transformation-source
---

# HELIX Hybrid Core Rebaseline v0.4.0 採否台帳

## §0 非主張

本台帳はPO提示の仮決めDesign HARNESS追加版を現行HELIX要件へ統合するためのcandidate dispositionである。
packageは`proposed_rebaseline`かつ`approval_required=true`であり、現行L1/L3/ADR、chat台帳、UT exact-ref証拠を
自動supersedeしない。package self-consistencyとHELIX採用coverageを分離する。

| denominator | package内部 | 現行HELIXへのexact join |
|---|---:|---:|
| archive entry | 184/184 inventoried | 0/184 |
| requirement | 163、11 area | 0/163 |
| acceptance criterion | 111 | 0/111 |
| package trace edge | 286（verified_by 163＋refined_into 123）、invalid target 0 | 0/286 |
| chat requirement | 20/20 package内 | 現行57 semantic requirementの代替不可 |
| Design HARNESS requirement / AC | 29 / 27 | 0/29 exact disposition、0/27 current L10 join |
| Python binding | 21 | 0/21 verified runtime binding |
| Hybrid document binding | 9 | 0/9 verified current catalog binding |

zero-edge 51件のcandidate exact routeは
`docs/governance/generated/helix-rebaseline-v040-zero-edge-routes-51-v1.json`
（SHA-256 `c67f7000d22e28dbd5b0b8e847c2df3b544162ce60628894a799f062a02cf731`）を機械正本とする。
51/51を個別化したが、adopt 12／harden 3／redesign 4／defer 32はいずれもcandidateであり、verified source edge 0、
coverage credit 0、residual 51を変更しない。

独立semantic review正本は
`docs/governance/generated/helix-rebaseline-v040-route51-design-ac18-review-v1.json`
（SHA-256 `cd2d5ac5fedf932a371c3fff8b9d047c973e332f0f5aef0d3a9c7a71e8f0bae2`）である。source archive、
catalog、traceability、現行L1/L3/L4/HAT/Visual責務を再照合し、51分類の誤分類0、Design AC closure 18件の
orphan 0を確認した。監査中に`AC-DH-20`の`HIL-TR-03`がL3/HATへ片肺だったため、既存owner
`HR-FR-HIL-10`、`HAC-HIL-10a/10b`、`HAT-HIL-10`へ接続して是正した。このreviewはcandidate分類と
designed edgeの整合だけを示し、immutable source edge、実行、verified、freeze、coverageを加点しない。

## §1 package evidenceの強度

| evidence | verdict | 理由 |
|---|---|---|
| archive custody/safety | PASS | digest固定、184 regular files、traversal/symlink/encryption/duplicate path 0 |
| JSON/YAML parse | PASS | JSON 33/33、YAML 44/44 |
| SQLite create smoke | PASS（限定） | fresh-memoryで20 table create。state/authority/append-onlyは未証明 |
| requirement/AC/trace internal join | PASS（package内） | 163/111/286、unknown/orphan 0 |
| source→requirement closure | FAIL | refined source edgeのunique target 112/163、欠落51。Design HARNESSは19/29欠落 |
| package validation `ok=true` | REJECT as completion evidence | executable test sourceなし、再実行不能artifact参照、ResourceWarning矛盾 |
| full chat custody | FAIL | 20件だけで現行57件を覆わずraw span/digestなし |
| full UT ref custody | FAIL | 選択refだけ。現行exact 69-ref観測を上位証拠にする |
| Python behavior coverage | FAIL | file/scope分類であり229 callable exact routeではない |

READMEは不存在`19-v0.4.0-errata.md`を参照し、実fileは`19-v0.3.2-errata.md`である。
`AC-PY-02`のResourceWarning 0に対し`hybrid-selftest.log`へunclosed-file warningがある。

## §2 package全体の採否境界

| disposition | source capability | hardening / replacement |
|---|---|---|
| adopt-with-hardening | Design typed contracts、semantic ID continuity、Capsule、Linux full gate、projection/rebuild、Infinity三重loop | L1–L12、authority、schema、failure codeへbind |
| redesign | package L0–L14 layer/gate、L1→L10 Design continuity | L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7へsemantic remap |
| redesign | Scrum/TDD、no-UI applicability | Production Scrum overlay、L5 test design→L7 Red→L6 Green、typed no-UI receipt |
| redesign | candidate 20-table DDL | append-only trigger、state machine、JSON check、authority separation、Issue/Reverse/pair/ledger chainを追加 |
| harden | Python meaning / Node effect split | Pythonはproposal、Node schema再検証・唯一DB commit。DB path/external writeを渡さない |
| retain as evidence | package UT audit | donor authorityにはしないが全ref検査義務を維持 |
| reject | UT namespace/DB/PLAN/roleのactive carryover | HELIX-native IDへ再設計 |
| reject | 独立Design engine、Python/Nodeの意味判定二重実装 | Hybrid Python Core capability＋単一contractへ統合 |
| reject | Python canonical DB/external write、将来writer容認 | Node single-writerを維持 |

Node 22/Python 3.12–3.14などpackageのversion値はcandidateであり、ADR-009のNode `>=24.15 <25`を無断で変更しない。

## §3 Design HARNESS 29 requirement candidate

| IDs | candidate disposition | 現行設計への統合義務 |
|---|---|---|
| HBR-DH-001..003 | adopt-with-hardening | native capability、transformation source pin、UT donor境界 |
| HBR-DH-004..007 | adopt-with-hardening | Prototype Agreement、Screen Ledger dual lifecycle、semantic ID continuityをL2/L11 pairへbind |
| HBR-DH-008..011 | adopt-with-hardening | Experience/UI/FE contract、Pattern、Product UI Profile、Frontend BindingをL4/L5へbind |
| HBR-DH-012..014 | redesign＋adopt | UI-M0..M7とverified receiptをcanonical L6/L7へremapしfalse completion detectorへ接続 |
| HBR-DH-015..020 | adopt-with-hardening | responsive、motion、surface、a11y、real-data UX、UI deltaをL10/L11 oracleへ接続 |
| HBR-DH-021..023 | harden | Python Core保全、Node side-effect boundary、projection-only DB。proposal-onlyを弱めない |
| HBR-DH-024..027 | adopt-with-hardening | human authority、workflow alignment、capsule context、UT namespace exclusion |
| HBR-DH-028 | harden | 9 bindingを現行catalog digestへ再joinしparallel catalogを禁止 |
| HBR-DH-029 | harden | 21 bindingを29 module/229 callable anchorへ展開しdynamic evidenceを要求 |

29件をrange集約した本表は説明用であり、freezeには`HBR-DH-001..029`各行のsource span/value digest、HIL requirement、
L4 component、L10 assertion、gate receiptへのexact edgeが必要である。

## §4 freeze blocker

1. 184 entryのsemantic anchor分母とterminal dispositionが未確定。
2. 163 requirement / 111 AC / 286 edgeの現行HIL exact joinが0。
3. Design HARNESS 29 requirementの個別disposition、L1–L12 remap、pair oracleが未生成。27 ACのcurrent L10 joinは0/27。
4. package chat 20と現行chat 57のsource-level reconciliationが未生成。
5. 21 Python bindingは229 callable route・dynamic effect/failure traceへ未接続。
6. 20-table DDLはcreate smokeだけでauthority/append-only/Issue gate/Reverse/pair/ledger chainを満たさない。
7. package validation evidenceを独立再現できず、既知warningとACが矛盾する。
8. package traceの`chat_trace_closure`はchat起点の最低1 edgeだけで、source→全requirement closureを証明しない。

以上が0になるまで本packageをrequirements freeze、implementation preflight、runtime cutoverのgreen evidenceへ使用しない。

## §5 candidate DB 20 table exact disposition

静的実測はtable 20、explicit index 9、trigger 0、view 0である。fresh-memory createと`foreign_key_check`だけはPASSするが、
as-is採用は0件である。

| source table | disposition | hardening / replacement obligation |
|---|---|---|
| `source_snapshots` | harden | project/repository authority、manifest/schema version、sealed/freshness/custody、digestを追加 |
| `source_assets` | harden | relative path、escape/symlink拒否、blob/entry digest、classificationを追加 |
| `asset_dispositions` | redesign | single-row uniqueを廃止しrevision/event/supersedes/authority/applicability/rollbackへ |
| `authored_requirements` | reject | DB authoring source化を禁止しRequirement Definition Ledgerのrebuildable projectionへ置換 |
| `workflow_events` | redesign | model/state/transitionとexecution instance/eventを分離しlegal transitionを強制 |
| `harness_capsule_events` | harden | contract、Issue/task/run、lease/fence、operation ID、hash chainを追加 |
| `harness_capsule_current` | harden | replay/checkpoint digest、last sequence、contract/input digest、event head整合を追加 |
| `detection_findings` | redesign | registry/run/rule/fingerprint/occurrence/baseline/suppressionへ分解 |
| `finding_events` | harden | operation、from/to、hash chain、legal transition、UPDATE/DELETE拒否を追加 |
| `allocation_decisions` | redesign | policy/candidate/resource/schedule/route/dead-letter/receiptを正規化 |
| `infinity_cycles` | redesign | Issue/gate/drive/pair/CI/audit/child Issue edgeとcurrent/eventへ分割 |
| `infinity_cycle_events` | redesign | audit↔gate↔autorun三軸、actor/verifier、gate receipt、hash chainを追加 |
| `improvement_candidates` | redesign | pattern→recipe→fixture→shadow→measurement→skill→detector→gate promotion ledgerへ |
| `evidence_records` | harden | producer自己申告trusted禁止、verifier/subject/artifact/redaction/authorityをFK化 |
| `audit_runs` | harden | scope manifest、provider/model family、assertion/finding join、inconclusive routeを追加 |
| `design_screen_contracts` | redesign | Prototype/Profile/semantic ID/revision/eventとdesign/implementation二重lifecycleへ |
| `design_frontend_bindings` | redesign | screen revision、region、requirement/mission/symbol edgeを持つbinding graphへ |
| `design_mission_receipts` | redesign | UI-M0..M7 obligation/result/evidence/verifierを行単位へ正規化 |
| `design_ux_evidence` | redesign | typed screen revision、evidence family/artifact/assertion/human authorityへ分解 |
| `design_change_deltas` | redesign | delta plan/event/impact/reroute/expiry/stale propagation receiptへ |
| **合計** | **harden 7 / redesign 12 / reject 1 / adopt 0** | source entity intentだけ採取 |

全event tableは`operation_id`、aggregate内unique sequence、previous/event digest、legal transition、UPDATE/DELETE拒否trigger、
event-head projection照合を必須とする。Nodeは`BEGIN IMMEDIATE`でevent、projection、cross-domain edge、checkpointを一commitし、
同一idempotency key＋異payload digestをrejectする。

package DDLにはIssue Gate、Reverse/Forward/Redesign、L1–L12連鎖台帳、Universal 328/76、agent lifecycle、Node result ingestion、
engine/detector registry/run、Prototype Agreement/no-UI receiptが存在しない。これらは既存L4 schemaを上位とし、20 tableへ
無理に詰め込まない。
