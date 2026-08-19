---
plan_id: PLAN-REVERSE-569-bounded-probe-history-terminal
title: "PLAN-REVERSE-569: bounded probe履歴の実装をterminal closureへ接続する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: true
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 221
behavior_contract_id: BOUNDED-PROBE-HISTORY-001
responsibility_owner: measurement-harness
change_slice: atomic
refactor_step: terminalize_existing_slice
legacy_retirement_state: retained
no_code_decision: preserve
ddd_modeling_decision: aggregate
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: specialist_capability
  target_id: NFR_MEASUREMENT
entry_signals:
  - "po_directive:Issue #221の実装済みbounded probe/historyをReverse fullbackし、PLANとIssueの終端を一致させる"
contract_preconditions: "PR #776の実装HEADがmainへmerge済みであり、bounded probe/historyのL4-L9設計、L7 runtime、SQLite append-only schema、U-PH-001..006が同じcontractへ束縛されている"
contract_postconditions: "実装済みのprobe admission、resource/deadline fail-close、append-only event chain、replay、immutability、同一payload冪等性をPLAN-L7-582のcompletion claimへ正規に接続し、#221のIssue終端に必要な証拠を列挙する"
contract_invariants: "#219のNFR taxonomy／#220のpure evaluatorを再実装しない。任意command、shell、network、credential、raw output、推測HEADを受理する経路を追加しない。完了主張はPR #776のmerge、current-main targeted検証、独立review receiptに限定する"
contract_failures: "PR #776の実装HEAD、current-main targeted evidence、DB convergence、独立review receiptのいずれかが欠ける場合、PLANまたはIssueをterminalと扱わない"
tdd_red_required: false
tdd_red_waiver_reason: "本PLANは既存実装のReverse terminalizationであり、runtime変更や新規oracleを追加しない。既存U-PH-001..006とcurrent-main read-afterを再検証する"
complexity_effect: net_negative
complexity_justification: "実装済みのL4-L9／L7成果を新しいruntimeやDBへ複製せず、Forward PLANのcompletion metadataとReverse証拠へ接続する"
removal_trigger: "PLAN-L7-582の後継versioned measurement historyへ全consumerが移行した時"
parent_design: docs/design/helix/L6-function-design/bounded-probe-history.md
pair_artifact: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
backprop_scope:
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/bounded-probe-history.md
    reason: "実行・保存境界は#219／#220と分離され、probe/historyの責務を維持する"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/bounded-probe-history.md
    reason: "typed plan、receipt、append-only event／headのschema契約を維持する"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/bounded-probe-history.md
    reason: "allowlist port、deadline、failure quality、replayの関数境界に意味差分がない"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
    reason: "U-PH-001..006を既存実装の正負oracleとして再利用する"
  - layer: system-verification
    decision: preserve
    evidence_path: docs/test-design/helix/L9-bounded-probe-history-system-test-design.md
    reason: "current-head、DB rebuild、full admissionの証跡を実装の終端条件へ接続する"
agent_slots:
  - { role: se, slot_label: "SE — 実装HEADとL4-L9 artifactのtrace照合" }
  - { role: qa, slot_label: "QA — U-PH-001..006とcurrent-main read-afterの再検証" }
  - { role: tl, slot_label: "TL — #219／#220境界、#221／#193終端の一致確認" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-569-bounded-probe-history-terminal.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-582-bounded-probe-history.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-582-bounded-probe-history.md
  requires:
    - docs/plans/PLAN-L7-582-bounded-probe-history.md
    - docs/design/helix/L6-function-design/bounded-probe-history.md
    - docs/test-design/helix/L8-bounded-probe-history-unit-test-design.md
  references:
    - docs/design/helix/L4-basic-design/bounded-probe-history.md
    - docs/design/helix/L5-detail/bounded-probe-history.md
    - docs/test-design/helix/L9-bounded-probe-history-system-test-design.md
    - src/measurement/bounded-probe-history.ts
    - tests/bounded-probe-history.test.ts
  blocks:
    - issue:221
---

# bounded probe履歴のReverse terminalization

## R0 現状採取

PR #776で `PLAN-L7-582` のbounded probe admission、allowlist port、AbortSignal付きdeadline、failure
quality、SQLite append-only event／head／replay、immutability trigger、同一payload冪等性が実装され、
merge commit `80a60220` としてmainへ統合済みである。実装は#219のNFR taxonomyと#220のpure evaluatorを
先取りせず、#221が供給するbounded execution／metric historyの境界に留まる。

## R1 skip判定

新しい実装や新しい意味分類を追加しない既存sliceのterminalizationなので、R1の新規design判定は不要である。
Reverseの目的は、実装・設計・oracle・PLAN・Issue終端の不一致を解消することである。

## R2 As-Is照合

`tests/bounded-probe-history.test.ts` のU-PH-001..006は、registry／HEAD／dataset admission、resource／
deadline、failure quality、append／replay chain、immutability、timeout／exception fail-closeをカバーする。
L4/L5/L6設計とL8 unit test設計は同一の `PLAN-L7-582` pairを指し、L7 runtimeとSQLite schemaは任意command、
shell、network、credential、absolute pathを受け取らない。

## R3 意図照合

Issue #221の完了条件は、bounded probeを無制限実行へ拡張せず、結果欠落やfailureをgreenへ丸めず、append-only
metric eventを後続のrequirement／release／regression／improvement episodeへjoin可能にすることである。
PR #776の実装とU-PH-001..006はこの意図を満たし、#220のevaluatorが担うfreshness／threshold verdictと責務を
重複しない。

## R4 Forward再入と終端条件

backpropは全て `preserve` とし、Forwardへ新しいgapを再投入しない。`PLAN-L7-582` は
`completion_claim_allowed: true`、`backfill_state: complete`、本Reverseへの参照を持つ。Issue #221は
PR #776のmerge commit、current-main targeted green、DB convergence、Claude exact-HEAD review receipt、
main read-afterをコメントへ接続した後にのみclosedとする。#193、#223、#231はconsumerとして引き続きopenの
まま扱い、#221の終端で後続Issueを自動closeしない。

## 非対象

bounded probeの新手法追加、#220のevaluator変更、#223のfinding disposition、#231のPerformance Refactor、
distribution、host resource admission、任意command実行、Issue #193の全体完了宣言は本PLANへ便乗させない。
