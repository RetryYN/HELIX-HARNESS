---
plan_id: PLAN-RECOVERY-40-github-cross-review-admission
title: "PLAN-RECOVERY-40 (recovery): merge前same-HEAD cross-review receiptのrequired admission"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "github_issue:489"
  - "post_merge_audit:2026-08-09 recent 40 merged PRs had zero pre-merge canonical review comments"
created: 2026-08-09
updated: 2026-08-09
owner: Codex / TL
github_issue_id: 489
engineering_discipline_required: true
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "harness-checkは唯一のrequired checkだが、PLAN内review_evidenceだけでmerge可能であり、pr-merge-reviewedをdirect gh mergeで迂回できる。#471/#483のcanonical comment receiptはmerge後に発行されadmissionとして機能しなかった"
contract_postconditions: "Draft PRではreview admissionをdeferして同一HEAD full CIを先行できる。Claudeまたはadmitted Kimiのcanonical receiptをPR commentへsealし、Ready化で再実行するharness-checkがrepository/PR/current HEAD/runtime独立性/approve/blocker 0/DB convergence/CI run HEAD+success/comment timestampをexact照合する。receipt後push、欠落、自己申告、重複、stale、事後発行をfail-closeする"
contract_invariants: "required check名はharness-check一本のまま、新workflow/service/DB tableを作らない。review前に定量CI greenを要求する。DraftはGitHub上merge不能であるためdeferを許可するが、Ready PRはreceiptなしでgreenにならない。既存pr-merge-reviewedとreceipt schema validatorを再利用する"
contract_failures: "current_head_review_receipt_missing、review_receipt_invalid_or_stale、review_receipt_conflict、pr_not_openをstable reasonとして返す。GitHub API/page/JSON/command failureはstep非0でfail-closeする"
tdd_red_required: false
red_at: null
green_at: null
mutation_oracle_evidence: "監査findingからpure evaluatorとoracleを同一作業単位で起こしたためclassic Red-firstを主張しない。代わりにU-GCRA-002〜004とU-GCRA-WF-002がreceipt marker欠落、draft境界除去、merge SHA query、pagination欠落、fail-open、stale HEAD、別HEAD CI、comment URL差替え、future review、重複、MERGED stateを個別にRedへ戻す"
complexity_effect: justified_positive
complexity_justification: "既存receipt validator、harness-check、Ready transition reuseを再利用し、pure evaluator一個とCLI薄adapterだけを追加する。独立workflow/check/service/tableは追加しない"
removal_trigger: "GitHub Rulesetsがrepository-owned cryptographic AI runtime identity receiptをnative required reviewとして検証でき、同じnegative oracleを満たす場合"
parent_design: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, oracle_id: U-GCRA-001, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, oracle_id: U-GCRA-WF-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — merge済みPRのcross-review evidence gap監査と正本境界" }
  - { role: se, slot_label: "SE — receipt pure evaluator、CLI、harness-check統合" }
  - { role: qa, slot_label: "QA — stale/duplicate/post-merge/fail-open mutation oracle" }
  - { role: tl, slot_label: "TL — Draft CI→review→Ready required admissionの循環回避" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/review-fallback.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
review_evidence: []
---

# PLAN-RECOVERY-40: GitHub cross-review admission

## §1 有限収束順序

1. Draft HEADで`harness-check`を全完走する。Draftはmerge不能なのでreceipt gateだけdeferする。
2. authoring runtimeと異なるAI-Bが、そのexact HEAD、CI run、DB receiptをレビューする。
3. AI-B receiptをimmutable JSONとしてPR commentへsealする。
4. Ready化で同じ`harness-check`を再実行し、prior full receiptをHEAD/base一致時だけ再利用する。
5. `evaluateGitHubCrossReviewAdmission`がcommentとCIを照合し、唯一のvalid receiptだけをadmitする。
6. receipt後pushは新HEAD runでreceipt不一致となり、再reviewまでredへ戻る。

## §2 実装境界

pure coreはGitHub APIを呼ばずsnapshotだけを判定する。workflowがread-only APIでcomment pagesとcurrent HEADの
Actions runsを取得し、CLIはJSONをpure coreへ渡すだけとする。Claude v2とKimi v3は既存validatorを通し、
PLAN prose、旧markerだけのcomment、digest未検証JSONをcanonical receiptへ昇格しない。

branch protectionのlive設定変更は本PRの非対象である。既存required名`harness-check`内部の強化なので通常は設定差分を
生じないが、live API read-after-writeが必要な変更を発見した場合はaction-binding approval付き別transactionへ分離する。

## §3 完了条件

- U-GCRA-001〜004、U-GCRA-WF-001〜002、CLI surface、既存Claude/Kimi receipt regressionがgreen。
- typecheck、Biome、PLAN governance、doctor、full CI、Windows、DB convergenceが同一HEADでgreen。
- 独立AI-Bがexact HEADをreviewしblocker 0。receiptをsealした後にReady化し、本gate自身をdogfoodする。
