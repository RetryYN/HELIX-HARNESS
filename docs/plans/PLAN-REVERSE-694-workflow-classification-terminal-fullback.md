---
plan_id: PLAN-REVERSE-694-workflow-classification-terminal-fullback
title: "PLAN-REVERSE-694: workflow分類是正をcurrent-mainへ再接着する終端fullback監査"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L3
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: claude-convergence
    review_kind: cross_agent
    reviewed_at: "2026-08-19T23:00:35Z"
    tests_green_at: "2026-08-19T22:54:41Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    scope: "PR #828のcurrent HEAD 7cc4d4fadf9c031edf290df7f96a60cc55cbfbafを独立検収した。workflow-classification-terminal-fullback oracle、U-WFTERM-001..006、doctor wiring、requirements-owned registry identity、legacy output禁止を確認し、blocker 0でapproveした。CI run 32309050073はsuccess、DB projection/replayとcheckpoint/replayは一致しconverged=trueである。live GitHub evidenceは別途R1入力として残り、#694のcompletion claim、#204解放、#635/#188再開は本entryでは主張しない。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/828#issuecomment-5349028609"
    green_commands:
      - kind: smoke
        command: "gh run view 32309050073 --repo RetryYN/HELIX-HARNESS --json databaseId,status,conclusion,headSha,event"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-19T22:54:41Z"
        evidence_path: src/lint/workflow-classification-terminal-fullback.ts
        output_digest: "sha256:e71e4c4f499e4b0763d0d753c59ed8974d2e4cea76a56341d04048ef1333fce1"
        result: "completed / success / HEAD 7cc4d4fadf9c031edf290df7f96a60cc55cbfbaf"
entry_signals:
  - "po_directive:Issue #694のForward各sliceをrequirements正本へ再接着し、current-main read-afterで終端監査する"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: REVERSE
created: 2026-08-20
updated: 2026-08-20
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-TERMINAL-FULLBACK-001
responsibility_owner: workflow-classification-terminal-fullback
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Issue #694のrequirements registry、generated catalog、typed runtime、legacy adapter、DB projection、doctor、process surfaceのForward sliceがmainへ個別にmerge済みだが、Reverse fullbackとIssue終端の証拠が一つに束縛されていない"
contract_postconditions: "各Forward sliceのHEAD／CI／Claude review／DB convergenceをcurrent-mainへ再照合し、requirements→registry→projection→consumerの意味一致と#204への終端接続可否を一つのfullback証拠へ束縛する"
contract_invariants: "Reverse監査は旧15-routeや旧modeをcurrent authorityへ戻さず、requirements-owned registryのversion／digest／typed axis／IDを唯一の意味基準とする。未成立の証拠はcompletion claimへ昇格しない"
contract_failures: "Forward sliceのreceipt欠落、HEAD／CI／review／DB digestの不一致、current-main read-after欠落、legacy identityのcurrent再出力、#204／#635／#188の依存状態不一致をfail-closeする"
tdd_red_required: true
red_at: "2026-08-20T06:30:05+09:00"
green_at: "2026-08-20T06:31:12+09:00"
mutation_oracle_evidence: "tests/workflow-classification-terminal-fullback.test.ts::U-WFTERM-002 の実測。auditCurrentMain の mainHeadSha／observedHeadSha 不一致拒否条件を一時的に !== から === へ反転すると、7件中2件失敗（exit 1）となり、current-main head mismatch の変異をkillした。実装を復元後、同suiteは7 passedへ復帰した。"
complexity_effect: justified_positive
complexity_justification: "既存実装を再実装せず、分散しているForward evidenceをReverse R0-R4の単一終端契約へ束ねる"
removal_trigger: "#694の全surfaceがrequirements registryから生成・検証され、completion receiptと#204 read-afterがcurrent-mainへ固定された時点"
pair_artifact: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md
verification_bindings:
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-001, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-002, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-003, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-004, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-005, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-006, test_path: tests/workflow-classification-terminal-fullback.test.ts }
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "Forward sliceでversion up済みのrequirements semanticsをReverse監査の意味基準として参照するが、監査自体ではrequirementsの意味を変更せず新しい分類も推測しない。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "終端監査は既存のtyped classification designを変更せず、current-mainの証拠束縛だけを検査する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "終端監査は既存consumerの詳細設計を変更せず、registry digestと各projectionの一致だけを照合する。"
agent_slots:
  - role: qa
    slot_label: "QA — Forward receipt、current-main read-after、legacy再出力の終端反例"
  - role: tl
    slot_label: "TL — #694から#204／#635／#188への依存解放境界"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-694-workflow-classification-terminal-fullback.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/generated/outstanding-snapshot.json
    artifact_type: json_config
  - artifact_path: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/workflow-classification-terminal-fullback.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-classification-terminal-fullback.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
    - docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md
    - docs/plans/PLAN-L7-583-workflow-classification-drive-run-projection.md
    - docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md
  references:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - docs/governance/route-classification-surface-inventory-2026-08-15.md
    - docs/plans/PLAN-L7-635-workflow-guide-dynamic-injection.md
---

# workflow分類是正の終端Reverse fullback監査

## R0 現状採取

Issue #694では、requirements-owned registry、generated catalog、typed routing、legacy input-only adapter、
design elicitation、DB projection、catalog doctorまでのForward sliceが個別PRとしてmainへ合流している。
一方、各PLANは個別sliceの完了証拠を保持するだけで、#694全体のReverse fullback、#204へのcurrent-main
read-after、#635／#188の解放条件を同一の終端証拠へ束縛していない。本PLANはその欠落を監査対象として固定する。

## R1 観測契約

各対象sliceについて、PRのmerge HEAD、required CIのrun／attempt、Claude exact-HEAD review receipt、DB
projection／replay digest、main read-afterをGitHubとmain treeから再取得する。proseや古いPLANのgreen記録だけを
完了証拠として採用しない。receiptが存在しないsliceは未完了として扱う。

## R2 As-Is照合

意味authorityはrequirementsとversioned registryであり、catalogはgenerated projection、旧15-routeは
compatibility inventoryである。`development_style`、`case_driven_model`、`workflow_model`、`subroute`、
`specialist_drive`、`execution_mode`、specialist workflow／capabilityを同一enum、同一CLI引数、同一DB fieldへ
畳み込まない。Reverse監査はこのauthority境界を変更しない。

## R3 差分判定

次を一つでも満たさない場合は #694 を閉じず、対象sliceまたは後続の#204 surface収束へ戻す。

- requirements version／registry version／source digestがcurrent catalogと一致する。
- Issue／PLAN／PR／CLI／runtime／DB／doctorのprimary identityがtyped axis／IDへ一致する。
- legacy inputはwarning、source token、変換先をreceiptへ残し、current output／DB／generated docsへ再出力しない。
- 各Forward sliceのcurrent HEAD、required CI、Claude review、DB convergenceをread-afterできる。
- #204への依存状態と、#635／#188を解放してよいかの判定がIssue stateと一致する。

## R4 Forward再接着

本PLANのoracleは注入された実測証拠を純粋関数で監査する。GitHubへ書き込まず、R3の全証拠が揃った場合だけ、#694のcompletion receiptを生成し、
`Closes #694`を持つ終端PRへ昇格する。証拠が不足する場合は不足理由を次の原子的Forward／Reverse sliceへ
記録し、#635と#188を開放しない。#819の常駐worker lane設計、配布、closure自走、安全境界実装は本PLANへ
混載しない。

## 完了境界

このPLANをdraftからconfirmedまたはcompletedへ進める判断自体に、current-mainの実測と独立レビューを要求する。
この初期版は監査契約の起票のみであり、Issue #694の完了、#204の解放、#635／#188の再開を主張しない。
