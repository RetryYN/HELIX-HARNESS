---
plan_id: PLAN-REVERSE-344-session-handover-retirement-backprop
title: "PLAN-REVERSE-344: 廃止済みsession handover契約をDB+memory継続状態へfullback"
kind: reverse
layer: cross
workflow_phase: R2
confirmed_reverse_type: fullback
route_mode: reverse
drive: agent
status: draft
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-11『ハンドオーバーは廃止した』— session/prose handoverを廃止済みの正本判断として固定"
backprop_scope:
  - layer: concept
    decision: update_required
    evidence_path: docs/governance/helix-harness-concept_v3.1.md
    reason: "Handover aggregateをDB+memory continuationへ置換する。"
  - layer: requirements
    decision: update_required
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "HBR/HNFRのprose handover契約をatomic continuation checkpointへ置換する。"
  - layer: requirements
    decision: update_required
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "handover必須、3層原則、CLI/CURRENT.json契約を廃止する。"
  - layer: requirements
    decision: update_required
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "session continuationをstatus/DB/memoryへ置換する。"
  - layer: L4-basic-design
    decision: update_required
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "handover block/flowをcontinuation stateへ置換する。"
  - layer: L5-detailed-design
    decision: update_required
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "handover input/output/failure contractをDB+memoryへ置換する。"
  - layer: L4-basic-design
    decision: update_required
    evidence_path: docs/design/harness/L4-basic-design/
    reason: "Handover aggregate/module/UIをcontinuation read modelへ置換する。"
  - layer: L5-detailed-design
    decision: update_required
    evidence_path: docs/design/harness/L5-detailed-design/
    reason: "CURRENT物理schemaとsrc/handover moduleを廃止する。"
  - layer: verification-design
    decision: update_required
    evidence_path: docs/test-design/
    reason: "L3-L6 pillar pairとharness L9 system/integrationへ正負oracleを追加する。"
agent_slots:
  - role: se
    slot_label: "SE — L0-L5 handover契約inventoryとtyped disposition"
  - role: tl
    slot_label: "TL — PO決定境界、provider/operations evidence非混同、Reverse mergeレビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-344-session-handover-retirement-backprop.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/session-handover-retirement-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/external-if.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/ui-standard.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L9-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L9-integration-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/handover-retirement.ts
    artifact_type: source_module
  - artifact_path: tests/handover-retirement.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-61-handover-retirement.md
  requires: []
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/design/harness/L6-function-design/harness-memory-structure.md
---

# PLAN-REVERSE-344: session handover廃止の上位fullback

## R0 起点

POはsession/prose handoverを廃止済みと再確定した。一方、confirmed L0-L5正本は`helix handover`、
`.helix/handover/CURRENT.json`、DB+log+handoverの3層原則を現役契約として保持している。この意味driftを
L6だけで隠さず、Reverseで上位正本へ戻す。

## R1-R4工程

1. R1: `handover`参照を`session_prose` / `provider_evidence` / `operations_transition` / `legacy_archive`
   にtyped inventoryし、未分類0を検証する。
2. R2: session継続の必要情報をharness.db status、feedback lifecycle、takeover memory、session logへ割当て、
   情報欠落と二重正本を反証する。
3. R3: concept / requirements / L3 / L4 / L5と対向test-designを同じ変更波で更新する。
4. R4: provider/operations証跡を保持したままL6-61へForward mergeし、runtime撤去descentを許可する。

R1のtyped inventory正本は
`docs/governance/session-handover-retirement-disposition.md`とする。R2以降は同文書の分類と
source precedenceを変更波の境界に使い、path/symbolの未分類が1件でもあればfreezeしない。

## R1 判定（2026-07-11）

- `session_prose`: replace。CURRENT、旧CLI、writer/reader、stale判定、aggregate/module/UIを撤去する。
- `provider_evidence`: preserve。runtime invocation/review provenanceでありsession継続の正本にはしない。
- `operations_transition`: preserve。開発から運用への移管成果物として別型化する。
- `legacy_archive`: archive。成立経緯は残すがruntime read sourceから除外する。
- `handover-retirement-inventory`はtracked source 1,456 files / 2,765 referencesを分類し、
  `unclassified=0 / conflicts=0 / preserve_boundary=0`を確認した。
  `U-HRET-001`とdoctor hard gateで新規未分類・異kind重複・preserve型へのsession継続意味混入をfail-closeする。
- R1 inventory境界は完了した。ただし`active_session_prose=527 / compatibility_only=513 /
  retirement-ready=false`であり、L0/L1/L3/L4/L5と対向test-designに現役契約が残るため、R3 freezeは不可。

## R2 判定（進行中）

- machine stateはharness.db、事実trailはappend-only session event、bounded recallはmemory、actionable issueは
  feedback lifecycleへ割当てる。
- provider delegation evidenceとoperations transitionはcontinuation sourceへjoinせず、監査・運用artifactとして保持する。
- 旧CURRENT固有のtakeover noteはprovenance/TTL付きmemoryへ最大1件移管する。DBと競合する値は採用しない。
- confirmed正本と対向Vペアの二重拘束が残るため、情報欠落・二重正本0の反証完了まではR3へ進めない。

## 不変境界

- session/prose handover、CURRENT.json、`helix handover`を復活させない。
- provider delegation evidenceと開発→運用transition成果物は別型として保持する。
- `.helix`識別子renameはPLAN-M-02承認まで行わない。
- takeover deliveryはat-least-onceを偽装せず、stable delivery IDとconsumer dedupeを必須にする。
