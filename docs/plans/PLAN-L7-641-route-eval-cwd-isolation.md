---
plan_id: PLAN-L7-641-route-eval-cwd-isolation
title: "PLAN-L7-641 (impl): route eval fail-close oracleを共有/tmpから分離する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #721 route eval fail-close oracle isolation"]
created: 2026-08-21
updated: 2026-08-21
owner: Claude / QA
github_issue_id: 721
behavior_contract_id: WFEXEC-ROUTING-CLI-001
responsibility_owner: workflow-execution-routing-cli
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "U-WFEXCLI-006がchild processのcwdを共有/tmpへ固定しており、開発機の/tmp/node_modulesや/tmp/docsなど外部状態でfail-close判定が変わり得る"
contract_postconditions: "repo外cwdのoracleがtest専用のisolated cwdだけを使い、外部状態の異なる2 cwdで同一のexit／stdout／正規化stderrを示す"
contract_invariants: "repo外cwdからのroute evalはreceiptを生成せずexit 1でfail-closeし、loader解決はrepo-owned absolute URLを使う"
contract_failures: "isolated cwdへregistry実体を置くとfail-close assertionが破れることをmutationで示す"
tdd_red_required: false
tdd_red_waiver_reason: "既存U-WFEXCLI-006はgreenのまま維持し、新規U-WFEXCLI-007はisolation不足を検出する追加oracleとして同一patchで導入するため、未記録Red timestampを捏造しない"
complexity_effect: net_negative
complexity_justification: "共有/tmp固定という暗黙の外部依存を除き、cwd生成と後始末をtest内の明示境界へ閉じる"
removal_trigger: "route eval CLIがcwd相対のauthority読込をやめ、repo root解決へ移行した時点でrepo外cwd oracle自体を置換する"
parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REFACTOR
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-006, test_path: tests/route-action-approval-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-007, test_path: tests/route-action-approval-cli.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — isolated cwd fixtureと外部状態非依存の反例" }
  - { role: tl, slot_label: "TL — repo外cwd fail-close契約の維持" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-20T17:54:11Z"
  review_binding:
    reviewer: codex-tl
    reviewed_at: "2026-08-20T17:54:11Z"
    evidence_digest: "sha256:8d4aa1db0304e4f5fa65d6cdc358a5bdf643564783282d1dbe0572d4abc9b87b"
  entries: []
review_evidence:
  - reviewer: codex-tl
    review_kind: cross_agent
    reviewed_at: "2026-08-20T17:54:11Z"
    tests_green_at: "2026-08-20T17:54:11Z"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: codex
    scope: "PR #853 HEAD f0a88c4b792af1778daa36ca7141b3d63c5cf684をCodex runtimeが
      exact-HEAD独立reviewした。mkdtempによる専用cwd、作成directoryだけのafterAll削除、外部状態が異なる
      2 fixture、cwd正規化後stderr完全一致、actual registry配置mutation、REFACTOR identity、L6/L8 traceを
      read-only確認しblocker 0。route test 6件、PLAN lint、typecheckを実測した。
      review source: https://github.com/RetryYN/HELIX-HARNESS/pull/853#issuecomment-5359687332"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/route-action-approval-cli.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-20T17:54:11Z"
        evidence_path: tests/route-action-approval-cli.test.ts
        output_digest: "sha256:04849baace44a70a0fcc59698638e44f09a0c5f1b3fefee02fbd334e0eba90bb"
        result: "reviewer reported 6 passed; plan lint OK; npm run typecheck exit 0"
generates:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-641-route-eval-cwd-isolation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/route-action-approval-cli.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  requires:
    - docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  references:
    - docs/plans/PLAN-L7-477-route-action-approval-stage.md
  blocks: []
---

# route eval fail-close oracleのcwd分離

## §背景

Issue #721 の指摘は、`tests/route-action-approval-cli.test.ts` の U-WFEXCLI-006 が
child process の `cwd` を共有 `/tmp` へ固定している点である。loader 解決は既に
repo-owned absolute URL へ修正済みだが、cwd 側は開発機の `/tmp/node_modules` や
`/tmp/docs` などの残置物に晒されたままで、oracle の結果が外部状態で変わり得る。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | `mkdtempSync` によるtest専用cwdと明示削除の`afterAll`へ置換 | [直列] | U-WFEXCLI-006 green |
| 2 | 外部状態の異なる2 cwdで同一結果を示すU-WFEXCLI-007を追加 | [直列] | U-WFEXCLI-007 green |
| 3 | design／test designへU-WFEXCLI-007を登録 | [直列] | oracle-test-trace green |
| 4 | targeted、全回帰、doctor、CI | [直列] | 同一HEAD green |
| 5 | Codex独立review | [review] | blocker 0 |

## §oracleの検出力

U-WFEXCLI-007 が空虚でないことは mutation で示す。`seedDecoyRepoLayout` が
isolated cwd へ `workflow-classification-registry.v1.json` の実体を配置するよう変異させると、
CLI はその registry を読んで別の失敗経路へ進み、`expectRegistryFailClose` が破れる。

つまり本 oracle は「cwd に置かれた内容が判定を変える」ことを検出できる。
これは同時に、current CLI が authority を cwd 相対で読んでいる事実の記録でもある
（本 PLAN は挙動を変えず、oracle の外部依存だけを除く）。

## §境界

CLI 実装は変更しない。cwd 相対の authority 読込を repo root 解決へ移す判断は
本 slice の範囲外であり、`removal_trigger` に後続条件として記録する。

## §代替PRのread-after

旧branch prefixの是正に伴いPR #853/#866はGitHubによって自動closeされ、同一commit履歴はPR #867へ
引き継がれた。Codexはreplacementのcurrent HEAD
`52215b679eaf72c7363255e0e00044d4fd5b67cb`を再取得し、2026-08-20T18:50:46Zにblocker 0で
再承認した。review sourceは
`https://github.com/RetryYN/HELIX-HARNESS/pull/867#issuecomment-5360294545`であり、旧PRのcloseを
変更破棄または未reviewとして扱わない。canonical merge admissionはPR #867のcurrent CI／receiptを正とする。
replacement PR本文はcurrent typed workflow identity markerを持ち、旧PRのevent payloadを再利用せず、
本commitによる新しいpull_request generationでadmissionを再取得する。
GitHub Actionsのrerunは元event payloadを保持するため、本文是正後の新規synchronize eventだけを
current admission evidenceとして採用する。
