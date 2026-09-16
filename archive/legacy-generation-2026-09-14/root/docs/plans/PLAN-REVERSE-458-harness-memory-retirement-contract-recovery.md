---
plan_id: PLAN-REVERSE-458-harness-memory-retirement-contract-recovery
title: "PLAN-REVERSE-458: harness memory退役実績からauthority契約をForward合流前に復元"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: L5
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
created: 2026-07-19
updated: 2026-07-19
owner: Codex / TL
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive: memoryを要件へ追突した後だけ消し、AIが機械的に落とせない強制機構にする"
backprop_scope:
  - layer: requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "HR-FR-HYB-005／HR-AC-HYB-005が追突前退役拒否とbody-free receiptを既に要求する。"
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "memory lifecycleの上位意味は変更せず、新規worker runtime要求5件は別Forward frontierへ分離する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/harness-memory-structure.md
    reason: "実退役で観測したconsumer／layer／全ID／正本target／digest／fenceをauthority契約として復元する。"
  - layer: verification-design
    decision: updated
    evidence_path: docs/test-design/harness/L8-unit-test-design.md
    reason: "authority不在、target drift、repo外symlink、部分失敗、terminal再表示を負oracleへ固定する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R1の既存memory・reader・lock・receipt挙動復元"
  - role: qa
    slot_label: "QA — R2/R3の失敗経路と全件照合oracle復元"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-458-harness-memory-retirement-contract-recovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/harness-memory-structure.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/generated/harness-memory-retirement-authority.json
    artifact_type: config
  - artifact_path: docs/governance/infinity-loop-source-capability-ledger.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-458-harness-memory-canonical-retirement.md
    - docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
    - docs/governance/generated/harness-memory-retirement-authority.json
    - src/memory/memory-v2.ts
    - src/memory/memory-store.ts
---

# PLAN-REVERSE-458: harness memory退役契約のForward合流前復元

## R0 現状採取

Forward実装中に採取済みだったrootと安全作業ツリーのharness memory観測を、合流前のReverse証跡として復元した。
active ID和集合39件、legacy reader、v2 resolver、layer lock、
compaction、後着memoryを観測した。退役前の本文は監査台帳へexact分類し、正本targetが無い指示は退役対象に
しない境界を置いた。

`has_existing_tests=true`。観測対象は`tests/memory/memory-v2.test.ts`、`tests/memory/memory-store.test.ts`、
`tests/harness-memory-reconciliation-binding.test.ts`であり、authority導入前後の挙動差を同じfixtureで比較した。

## R2 As-Is設計・観測テスト設計

- terminal receiptは本文を保持せず、元IDを`supersedes`で指す。
- legacy readerとv2 resolverの双方がterminal receiptをactiveとして再表示しない。
- 複数IDの途中失敗は永続化済み結果と未処理結果を区別する。
- compactionとretireは同一layer lock／fenceの内側でauthorityを再検証する。

L6にはtracked authority manifest、canonical payload digest、正本target content digest、repo realpath境界を復元した。
L8にはauthority無し拒否、改ざん拒否、repo外symlink拒否、lost update、部分失敗、冪等再実行、legacy再表示防止を
負oracleとして接続した。as-is-test-design locatorは`docs/test-design/harness/L8-unit-test-design.md`の
`U-MEMV2-005c..005g`であり、`missing_pair_artifacts=[]`である。design typeのためR1は規則どおりskipした。

## R3 意図照合

PO意図は「memoryを消すこと」単独ではなく「全内容を追突し、証拠なしにAIが落とせないこと」である。
したがってtakeover consumeと長期harness/project retireを分離し、長期退役には正本authorityを必須とした。
PO検証locatorは`docs/governance/infinity-loop-source-capability-ledger.md` §0.2の原文引用であり、Reverseを
Forward合流前の先タスクとする裁定、および処理量を省かず証拠を強制する裁定へ一致する。

## R4 Forward再入

本ReverseをForward合流の先タスクとしてL6契約とL8 oracleをfreezeし、`PLAN-L7-458`はこの双方向linkを
要求してから合流する。実装着手前のReverse起票は欠落していたため、その事実を「先行実施」と偽らない。
新規worker runtime要求5件はL3/L12でconfirmedに留め、L4以降へ実装済みとして
偽降下させず`PLAN-DISCOVERY-12`以降へ送る。
