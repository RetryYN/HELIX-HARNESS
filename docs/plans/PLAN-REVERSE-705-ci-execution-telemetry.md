---
plan_id: PLAN-REVERSE-705-ci-execution-telemetry
title: "PLAN-REVERSE-705: CI execution telemetryをCI System Synthesisへ再接着する"
kind: reverse
layer: cross
workflow_phase: R3
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1238
behavior_contract_id: CI-EXECUTION-TELEMETRY-001
responsibility_owner: ci-execution-telemetry
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1204 CI execution telemetryのReverse fullback vehicle"
contract_preconditions: "PLAN-L7-704の原子実装、L6／L8 pair、current HEAD reviewとCI証拠が存在する"
contract_postconditions: "telemetry schemaとprojectionの実測をCI System SynthesisのL3／L6／L8へ再接着し、#1205以降へ正規入力として渡す"
contract_invariants: "CI selection、scheduler、workflow、DB ingestionを本Reverseで推測変更せず、Forward完了前はdraft／pending_reverse／completion_claim_allowed=falseを維持する"
contract_failures: "wrong HEAD、stale review、双方向link欠落、required obligation縮退、runner／artifact／failure履歴の証拠欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装と既存U-TELE oracleを再利用するdocs-only Reverse vehicleであり、新しいRedを捏造しない"
mutation_oracle_evidence: "Forward合流時にbackfill-pairingの双方向link欠落mutationとU-TELE-001〜010を再実行し、本slice単独では完成を主張しない"
complexity_effect: net_neutral
complexity_justification: "telemetryを再実装せず、requirements／design／verification／main evidenceの再接着だけを所有する"
removal_trigger: "CI System Synthesis終端Reverseが本証拠を統合し、個別fullback参照が不要になった時"
parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md
pair_artifact: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "CIS-R-02／03がevent identity、failure履歴、cost nodeを既に正本化しており、本Reverseは新しい要求意味を追加せず実測を再接着する。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/ci-execution-telemetry.md
    reason: "typed event、DAG、critical path、series分離の既存設計を実装と照合し、0ms同値時の決定規則だけを実装済み意味のbackfillとして明文化する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
    reason: "U-TELE-001〜010の意味を変更せず、U-TELE-009へ実装済み0ms DAG反例を明文化してcurrent HEADへ束縛する。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-705-ci-execution-telemetry.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/ci-execution-telemetry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
  references:
    - "issue:1238"
    - "issue:1204"
    - docs/plans/PLAN-L7-704-ci-execution-telemetry.md
    - src/runtime/ci-execution-telemetry.ts
    - tests/ci-execution-telemetry.test.ts
  blocks:
    - "issue:1205"
agent_slots:
  - { role: qa, slot_label: "QA — telemetry／failure history／artifact edgeのmain再照合" }
  - { role: tl, slot_label: "TL — CI System Synthesis接着と#1205解放" }
  - { role: po, slot_label: "PO — R3で要求意味不変とL7 Forward再入境界を確認" }
---

# CI execution telemetryのReverse fullback

## R0 現状採取

Forward実装はPR #1234のHEAD `b43838cd7d09afde6f35bc4bf237d495c2bea2da`で収束し、required CI
`33295591264`、Ready admission `33297003371`、Claude exact-HEAD receipt
`sha256:ba216325fb0844d833615921f674068ef60d176dd9b4a75f2d8d27de2fedae21`が成立した。canonical merge
`0a20b1aebd6fdf2f4a0b267d6d665545047209d8`とread-after receipt
`sha256:74eb705beb1fd051cf035d1ce37b9ec2c01b8c0ddd7cc1baad65255af3447a66`をR0の事実基準とする。

## R1〜R3 再接着

### R1 観測契約

- event identity、HEAD、runner、時刻、結果、artifact edge、依存DAG、failure historyを実装とU-TELE-001〜010から採取した。
- rerun successで過去failureを消さず、failureなしを検出率100%へ縮退させない契約がprojectionへ残ることを確認した。
- Claude独立reviewで、全nodeが0msのDAGでも最長依存鎖を空pathへ縮退させない修正とoracleを実測した。

### R2 As-Is照合

CIS-R-02／03、L6 telemetry contract、L8 U-TELE-001〜010は実装の責務境界と一致する。0ms同値時の
`duration → node数 → bytewise`規則は実装とtestに存在したため、L6／L8へ同じ意味をbackfillした。
CI選定、scheduler、workflow、DB ingestionは後続#1205以降の責務として分離し、本Reverseへ混載しない。

### R3 意図照合

要求正本の意味は変更不要である。telemetryはCIの実行事実をcost nodeと証明責務へ束縛する観測境界であり、
required verificationを自ら縮退・選定しない。したがってrequirementsは`not_impacted`、L6／L8は実装済み意味の
説明精度だけをhardeningし、Forward再入先をL7に維持する。

## R4 終端条件

Forward側のClaude独立review、required CI、canonical merge、DB convergence、post-main read-afterは成立した。
本Reverse candidateではForward／Reverse PLANの双方向link、L6／L8 backfill、targeted／全回帰、Claude exact-HEAD
reviewを揃えた後にcanonical mergeする。merge後のmain read-afterで同じ状態を再取得してからIssue #1204／#1238を
closeし、#1205をcurrent mainへ再接着する。未実施のReverse merge後read-afterやIssue closeは先取りしない。
