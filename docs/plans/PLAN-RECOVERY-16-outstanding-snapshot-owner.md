---
plan_id: PLAN-RECOVERY-16-outstanding-snapshot-owner
title: "PLAN-RECOVERY-16 (recovery): outstanding snapshot単一owner集約"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 #93完了後のDesign HARNESS未ブロックタスクとして#319（draft PLAN追加時に3か所のoutstanding snapshotを手修正する構造の是正）を進める"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
github_issue_id: 319
engineering_discipline_required: true
behavior_contract_id: OUTSTANDING-SNAPSHOT-OWNER-001
responsibility_owner: objective-outstanding-snapshot-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retired
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "draft PLAN追加・confirmed遷移でoutstanding分母が正当に変化する。従来はaudit doc行内marker・goal-evidenceテスト定数・cli-surface件数の3+ surfaceを手同期していた"
contract_postconditions: "outstanding exact set（decision_count・plan_ids・blockers・required_actions）の committed 正本は docs/governance/generated/outstanding-snapshot.json ただ1つで、helix db rebuild が再生成し、audit doc・goal-evidenceテスト・cli-surfaceテスト・doctorは同snapshotから導出する"
contract_invariants: "exact set検査は弱めない。doctorのobjective-evidence-auditはgit HEAD版snapshotとlive outstandingをfail-close照合し、stale・欠落・重複・非outstanding混入・blockers/required_actions乖離を全て違反にする。G-10行はsnapshot pathの引用を必須とし、行内に分母を再埋め込みしない"
contract_failures: "snapshot欠落、JSON不正、decision_count乖離、live plan欠落、重複plan、非outstanding plan混入、blockers/required_actions乖離、G-10行のsnapshot引用欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-08-06T06:52:00Z"
green_at: "2026-08-06T07:10:00Z"
mutation_oracle_evidence: "tests/goal-evidence-audit.test.ts::U-OBJAUD-001/001bでstale decision_count、snapshot欠落（null）、live plan欠落、重複plan、非outstanding plan混入、G-10行のsnapshot引用除去の各mutationが対応するG-10違反となりRedへ戻る"
complexity_effect: justified_positive
complexity_justification: "生成snapshot 1ファイルとverify関数を追加する代わりに、draft PLAN追加のたびに3+ surfaceを手修正して8件redを起こす構造を除去し、分母変化を単一fileのcommitへ集約する"
removal_trigger: "outstanding projectionがharness.dbの機械読み出しだけで全consumer（audit doc・テスト・doctor）を賄い、committed snapshot fileが不要と同一oracleで証明された時"
parent_design: docs/governance/helix-objective-evidence-audit.md
pair_artifact: tests/goal-evidence-audit.test.ts
verification_bindings:
  - { parent_design: docs/governance/helix-objective-evidence-audit.md, oracle_id: U-OBJAUD-001, test_path: tests/goal-evidence-audit.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 3+ surface手同期の実測（#318/#93 friction）と単一owner導出" }
  - { role: se, slot_label: "SE — snapshot build/write/verifyとdb rebuild接続" }
  - { role: qa, slot_label: "QA — stale/欠落/重複/混入mutationと導出consumer整合" }
  - { role: tl, slot_label: "TL — HEAD照合によるfail-close境界とfixtureフォールバック" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-16-outstanding-snapshot-owner.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/outstanding-snapshot.ts, artifact_type: source_module }
  - { artifact_path: src/lint/objective-evidence-audit.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L7-280-objective-progress-trust-surface.md
  requires:
    - docs/plans/PLAN-L7-280-objective-progress-trust-surface.md
review_evidence: []
---

# PLAN-RECOVERY-16: outstanding snapshot 単一 owner 集約

## 根本原因

Issue #319（PR #318観測）と本セッションのPLAN-RECOVERY-14/15でも再現したとおり、draft PLANを
1件追加するだけで、`docs/governance/helix-objective-evidence-audit.md` G-10行のdecisionCount
markerとexact PLAN list、`tests/goal-evidence-audit.test.ts`の定数、`tests/cli-surface.test.ts`の
件数の3+ surfaceを手修正しなければfull CIが多重redになる。confirmed遷移で分母が戻るとさらに
逆方向の手修正が要る。

## 修復

outstanding exact setのcommitted正本を`docs/governance/generated/outstanding-snapshot.json`
ただ1つへ集約する。schemaは`outstanding-snapshot.v1`で、決定分母`decision_count`、PLAN一覧
`plan_ids`、blocker一覧`blockers`、必要対応`required_actions`をcanonical sortで持つ。

- 再生成は`helix db rebuild`（deterministic projectionと同経路）。分母変化のPRはこの1ファイル
  のcommitだけを伴う。
- doctorの`objective-evidence-audit`はgit HEAD版snapshot（fixture等の非git rootはworking tree
  へフォールバック）とlive outstandingを照合し、stale・欠落・重複・非outstanding混入・
  blockers/required_actions乖離をfail-closeする。CIのpost-test再生成はHEAD照合を隠蔽できない。
- audit doc G-10行は行内へ分母を埋め込まず、snapshot pathの引用を機械必須とする。
- goal-evidenceテストはsnapshotとlive導出の完全一致を検査し、cli-surfaceのstatus表面は
  snapshotから期待分母を導出する。exact set検査は弱めない。

## 検証

- `tests/goal-evidence-audit.test.ts::U-OBJAUD-001/001b`がstale count・snapshot欠落・plan欠落・
  重複・非outstanding混入・引用除去の各mutationをRedにする。
- `U-ICLOSE-004`がcommitted snapshotとlive導出の完全一致（toEqual）を検査する。
- 受入条件（#319）: 新規draft PLAN追加で変化するのは本snapshot 1ファイルのみ。

## 非対象

- outstanding判定基準（isTerminalPlanStatus等）自体の変更
- `tests/slow/doctor.test.ts`のfixture期待（snapshot欠落violationはmissing-root期待と整合）
- completion-decision-packet / review-bundleの導出変更
