---
plan_id: PLAN-RECOVERY-40-github-cross-review-admission
title: "PLAN-RECOVERY-40 (recovery): merge前same-HEAD cross-review receiptのrequired admission"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-09 merge後にクロスレビューがない状態を監査し、再発をrequired admissionで修復する"
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
contract_postconditions: "Draft PRではreview admissionをdeferして同一HEAD full CIを先行できる。Claudeまたはadmitted Kimiのcanonical receiptをPR commentへsealし、Ready化で再実行するharness-checkがrepository/PR/current HEAD/runtime独立性/approve/blocker 0/canonical DB receipt/required workflow identity/CI run PR+HEAD+completed timestampをexact照合する。KimiはS4 admissionを承認したClaude receiptと実GitHub comment、fallback failure、lease、review packet、output/findings、current HEAD logical DB receiptの全provenanceを封入する。Ready gateはlogical DB receiptをrepository-owned doctorから再生成し、exact schemaと収束式を再検証する。Claude v2経路はreceipt／projection／replay projection／checkpoint／replay checkpointの5 digestをreceipt fieldへexact束縛し、Kimi v4経路はsealed DB receiptとのcanonical JSON完全一致とreview→comment→admission時系列を検証する。receipt後push、欠落、自己申告、重複、stale、事後発行をfail-closeする。明示merge後はcandidate API SHA、reviewed HEAD parent、candidate/merge tree同一性をfull receiptへsealし、verified／merged_unverified双方をGit共通runtimeへimmutable保存する"
contract_invariants: "required check名はharness-check一本のまま、新workflow/service/DB tableを作らない。PR workflowはmerge refではなくpull_request.head.shaをcheckoutし、review・DB・testの基準HEADを統一する。review前に定量CI greenを要求する。DraftはGitHub上merge不能であるためdeferを許可するが、Ready PRはreceiptなしでgreenにならない。既存pr-merge-reviewedとreceipt schema validatorを再利用し、merge後tree不一致を成功扱いにしない"
contract_failures: "current_head_review_receipt_missing、review_receipt_invalid_or_stale、review_receipt_conflict、pr_not_open、merge_not_observed、observed_at_invalid、candidate_commit_read_after_failed、candidate_commit_mismatch、merge_commit_mismatch、reviewed_head_not_merge_parent、reviewed_tree_not_merged_tree、merge_read_after_receipt_persist_failedをstable reasonとして返す。GitHub API/page/JSON/command failureはstep非0でfail-closeし、merge実行後はmerged_unverified receiptを残す"
tdd_red_required: false
red_at: null
green_at: null
mutation_oracle_evidence: "監査findingからpure evaluatorとoracleを同一作業単位で起こしたためclassic Red-firstを主張しない。代わりにU-GCRA-001／001c／001d／002〜004とU-GCRA-WF-002がClaude current DB receipt欠落・別canonical digest、S4 admission digest、Claude verifier comment created/updated/admission時系列、failure、lease、Kimi output/findings、review packet、logical DB exact field、workspace dirty、population false、checkpoint/schema mismatch、excluded step、unstable column、required workflow名/path/event/PR/completed timestamp、pagination、receipt marker、Draft境界、candidate checkout、HEAD、comment URL、future review、重複、MERGED stateの各改変を個別にRedへ戻す"
complexity_effect: justified_positive
complexity_justification: "既存receipt validator、harness-check、Ready transition reuseを再利用し、pure evaluator一個とCLI薄adapterだけを追加する。独立workflow/check/service/tableは追加しない"
removal_trigger: "GitHub Rulesetsがrepository-owned cryptographic AI runtime identity receiptをnative required reviewとして検証でき、同じnegative oracleを満たす場合"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-001, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-WF-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — merge済みPRのcross-review evidence gap監査と正本境界" }
  - { role: se, slot_label: "SE — receipt pure evaluator、CLI、harness-check統合" }
  - { role: qa, slot_label: "QA — stale/duplicate/post-merge/fail-open mutation oracle" }
  - { role: tl, slot_label: "TL — Draft CI→review→Ready required admissionの循環回避" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/review-fallback.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/plans/PLAN-RECOVERY-12-independent-review-fallback.md
review_evidence:
  - reviewer: "Codex independent review subagent"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T08:44:25Z"
    tests_green_at: "2026-08-09T08:42:18Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-sol
    scope: "authoring laneと分離したread-only subagentがmaterial HEAD ea44dac7d23792d53723852be4224a7c79974a36 / tree 8f92d489c29e0dbdc380762cff574db419614590をexact reviewした。#492追随分と本PR固有14 pathを分離し、candidate HEAD checkout、current DB exact join、verifier comment updated_at、required workflow identity／PR／HEAD／completed timestamp、Actions pagination、Kimi admission v2／provider-neutral receipt v4、lane closure digestのproducer／consumer整合にCritical／High／Medium 0を確認した。Claude cross-runtime review https://github.com/RetryYN/HELIX-HARNESS/pull/494#issuecomment-5230620071 で返却されたPLAN status、design-language、digest inventoryの3件はbehavior変更を伴わないclosure metadataとして同scope内で是正し、digest inventory追加は同commentをscope expansion approval pointerとして束縛した"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/github-cross-review-admission.test.ts tests/harness-check-workflow.test.ts tests/independent-review-fallback.test.ts tests/kimi-review-admission-bench.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T08:42:18Z", evidence_path: tests/github-cross-review-admission.test.ts, output_digest: "sha256:4d002ebf05556286af86040cddcfe4e83c562814f0ce9b80eeb432f3c889f8d4", result: "4 files / 110 tests green、skip 0。Claude cross-runtime reviewでも独立再実測済み" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T08:42:18Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0（出力なし）" }
---

# PLAN-RECOVERY-40：GitHubクロスレビュー必須化

## §1 有限収束順序

1. Draft HEADで`harness-check`を全完走する。Draftはmerge不能なのでreceipt gateだけdeferする。
2. authoring runtimeと異なるAI-Bが、そのexact HEAD、CI run、DB receiptをレビューする。
3. AI-B receiptをimmutable JSONとしてPR commentへsealする。
4. Ready化で同じ`harness-check`を再実行し、prior full receiptをHEAD/base一致時だけ再利用する。
5. `evaluateGitHubCrossReviewAdmission`がcommentとCIを照合し、唯一のvalid receiptだけをadmitする。
6. receipt後pushは新HEAD runでreceipt不一致となり、再reviewまでredへ戻る。
7. 明示merge後にcandidate／merge commitをread-afterし、reviewed HEADがparentかつtree同一の場合だけmerge成功receiptを返す。

## §2 実装境界

pure coreはGitHub APIを呼ばずsnapshotだけを判定する。workflowがread-only APIでcomment pagesとcurrent HEADの
Actions runsを取得し、CLIはJSONをpure coreへ渡すだけとする。Claude v2とprovider-neutral Kimi v4は既存validatorを通し、
PLAN prose、旧markerだけのcomment、digest未検証JSONをcanonical receiptへ昇格しない。

branch protectionのlive設定変更は本PRの非対象である。既存required名`harness-check`内部の強化なので通常は設定差分を
生じないが、live API read-after-writeが必要な変更を発見した場合はaction-binding approval付き別transactionへ分離する。

## §3 完了条件

- U-GCRA-001〜005、U-GCRA-WF-001〜002、CLI surface、既存Claude/Kimi receipt regressionがgreen。
- typecheck、Biome、PLAN governance、doctor、full CI、Windows、DB convergenceが同一HEADでgreen。
- 独立AI-Bがexact HEADをreviewしblocker 0。receiptをsealした後にReady化し、本gate自身をdogfoodする。
