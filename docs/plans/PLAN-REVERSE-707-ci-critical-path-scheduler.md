---
plan_id: PLAN-REVERSE-707-ci-critical-path-scheduler
title: "PLAN-REVERSE-707: CI critical-path schedulerのReverse fullback vehicle"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
pair_artifact: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1270
behavior_contract_id: CI-CRITICAL-PATH-SCHEDULER-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
forward_routing: L5
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1270で#1207 schedulerのReverse vehicleを先行定義"
contract_preconditions: "PLAN-L7-707、L6／L8 pair、PR #1241 exact-HEAD review、canonical merge、post-main CIが存在する"
contract_postconditions: "required obligation保存、resource safety、artifact identity、conservative fallbackをL3／L6／L8へ再接着し、実workflow E2Eを#1208へ渡す"
contract_invariants: "Verification Planのobligation選定、deferred回収、workflow配線を本Reverseへ混載せず、Reverse merge／read-after前にcompletion claimを許可しない"
contract_failures: "Forward双方向reference欠落、wrong HEAD、stale review、obligation縮退、wrong artifact、resource fence欠落、未実測効果の完了主張をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "実装を持たないReverse vehicleの先行定義であり、Forward oracleを捏造して再実行しない"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-08-31T13:56Zに実測kill。M1: src/runtime/ci-critical-path-scheduler.tsのtopoSort結果を.slice(0,-1)へ改変しobligationを1件脱落させると、npx vitest run tests/ci-critical-path-scheduler.test.ts がU-CISCHED-001を含む10/14 failedでmutationをkillする。M2: Forward PLAN-L7-707のreferencesからPLAN-REVERSE-707を削除すると、npx vitest run tests/backfill-pairing.test.ts がreverse_plan_id欠落を検出し1件failedでkillする。両mutationとも復元後は再びgreen。"
complexity_effect: net_neutral
complexity_justification: "exactly-one PLANを保ったままForwardとReverseの責務を分離する"
removal_trigger: "CI System Synthesis全体Reverseが本証拠を統合し、個別vehicle参照が不要になった時"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-30T23:02:17Z"
    tests_green_at: "2026-08-30T23:00:31Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "a02813c9-9bc1-41f4-9c86-0f943ece4270"
    reviewed_head_sha: cc278ba36a279fc755dc0dc14c48004f22318258
    scope: "PR #1241 exact HEADのobligation保存、quota／resource、artifact identity、bounded cancel、Reverse back-reference、BiomeをClaude Codeが独立reviewし、BLOCKER 0を確認した。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1241#issuecomment-5471803374"
    green_commands:
      - kind: smoke
        command: "gh run view 33339684343 --json status,conclusion,headSha,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-30T23:00:31Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:f3f6086f760b4f7341dd5af1dab450af48d08f029d10a4c7c3d57c858874a7bf"
        result: "exact HEAD cc278ba36a279fc755dc0dc14c48004f22318258のCI run 33339684343がterminal success。"
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "required obligation保存、critical path、resource safety、conservative fallbackはCIS-R-10以降の意味と一致し、新規要求を追加しない。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/ci-critical-path-scheduler.md
    reason: "schedulerがobligationを変更せず、placement、resource、artifact reuse、fallbackだけを所有する境界がruntimeと一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-ci-critical-path-scheduler-unit-test-design.md
    reason: "U-CISCHED-001〜014がobligation削除、wrong identity、resource競合、stale telemetry、bounded cancelの反例を個別に検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "runner、GitHub Actions、artifact storeの外部境界を変更せず、実workflow接続は#1208に残す。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "typed execution DAGとresource／artifact判定の詳細はForward L6実装に閉じ、追加責務はない。"
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
  references:
    - issue:1270
    - issue:1207
    - issue:1208
    - docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md
  blocks: []
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-707-ci-critical-path-scheduler.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/ci-critical-path-scheduler-terminal-fullback-evidence.md, artifact_type: markdown_doc }
agent_slots:
  - { role: qa, slot_label: "QA — obligation保存とfallbackのR0〜R4再検証" }
  - { role: tl, slot_label: "TL — Forward双方向linkと#1208再接着" }
---

# CI critical-path schedulerのReverse vehicle

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | vehicleを先行定義 | 直列 | draft／pending_reverse、completion claimなし |
| 2 | Forward PLANから双方向reference | 直列 | backfill pairing green |
| 3 | Forward merge後にR0〜R4採取 | 直列 | exact HEAD、review、CI、main read-after |

本PLANはReverseの作業車両としてmainへ先行定義された。Forward実装・review・mergeの成立後も、本Reverse candidate自身の
canonical mergeとpost-main read-afterまで`completion_claim_allowed:false`、`backfill_state:pending_reverse`を維持する。

## R0 現状採取

Forward candidateはPR #1241のHEAD `cc278ba36a279fc755dc0dc14c48004f22318258`で収束した。Claude Code
exact-HEAD reviewはBLOCKER 0、receipt digest `sha256:d5c6c2fd2cca253471d8d5252102e23a20cb491f308ebd313fdfb4f3a69b2d29`、
draft CI `33339684343`とReady CI `33340806736`はterminal successである。canonical merge
`3ab64eb5aabb8e8b1163de73bfc29bad8719421f`とread-after receipt
`sha256:723ee1b654ff9a2ca2b211e091f3e0534e4a12e8420c041edeb2b9a24e25d51b`、post-main harness-check
`33341128585` successをR0の事実基準とする。

## R1 観測契約

- Verification Planのrequired obligation exact setがexecution DAGへ保存されることを実装とU-CISCHED-001〜014から採取した。
- wrong HEAD／platform／lockfile／toolchain／digest artifact、lease／fence欠落、resource quota超過が個別にfail-closeする。
- stale／unknown telemetryはrequired setを削らず保守DAGへfallbackし、先行phase失敗は未開始heavy nodeだけをbounded cancel対象とする。

## R2 As-Is照合

CIS scheduler要求、L6設計、L8 U-CISCHED-001〜014、runtimeは、「schedulerは証明義務を変更せず配置だけを決定する」
責務境界で一致する。GitHub workflowへの接続、deferred回収、fault-injection E2Eは#1208の責務として混載しない。

## R3 意図照合

要求意味の変更は不要である。Forward runtimeは安全なexecution planを生成する計算コアであり、wall-clock改善の実workflow実測は
#1208で行う。よってrequirements／L4／L5／L6／L8は`not_impacted`、Forward再入先をL5に維持する。

## R4 候補終端条件

Forward／Reverse PLANの双方向reference、targeted mutation oracle、PLAN gates、current-HEAD CI、Claude exact-HEAD reviewを揃える。
本Reverse candidateのcanonical mergeとpost-main read-afterが成立するまでcompletionを主張せず、#1207受入の実GitHub Actions比較は
#1208 E2Eへの未完義務として明示的に引き渡す。
