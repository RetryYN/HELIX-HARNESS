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
completion_claim_allowed: true
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
r4_live_evidence:
  observed_at: "2026-08-20T11:47:41Z"
  source: "src/adapters/github-workflow-classification-terminal-fullback.ts"
  schema_version: "helix-workflow-classification-terminal-fullback.v1"
  current_main:
    head_sha: "9f4d6e9cd527c4a4d66e009e281d99b4fbc74fc8"
    observed_head_sha: "9f4d6e9cd527c4a4d66e009e281d99b4fbc74fc8"
    requirements_version: "1.3.12"
    registry_version: "1.1.4"
    registry_source_digest: "sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f"
    harness_check: "run 32363146637 / success / head 9f4d6e9cd527c4a4d66e009e281d99b4fbc74fc8"
    codeql: "run 32363146784 / success / head 9f4d6e9cd527c4a4d66e009e281d99b4fbc74fc8"
    database_receipt_digest: "sha256:c81571948aa364f05ed4512407b2480452c98ab9abb3f8057ae25401deb5305e"
    projection_digest: "sha256:5d8f64d763d8229ecf74b6ee84ca1f44a998b7a91403ac42c8ec24e7673f9f58"
    replay_projection_digest: "sha256:5d8f64d763d8229ecf74b6ee84ca1f44a998b7a91403ac42c8ec24e7673f9f58"
    checkpoint_digest: "sha256:7ebce946cc99deb3eb87b68ddb08f3c03534c5f87a1cd9721daf03dbe56e4ca7"
    replay_checkpoint_digest: "sha256:7ebce946cc99deb3eb87b68ddb08f3c03534c5f87a1cd9721daf03dbe56e4ca7"
    measurement_digest: "sha256:4c15dc717e30254c6ead0f21d0ae205679981dd6cc2b2f21c030519465b09b1d"
    database_converged: true
    legacy_identity_emitted: false
  forward_slices:
    - { slice_id: PLAN-L7-561-workflow-classification-generated-catalog, pr: 701, head: d3f6b05f4f42c0afd5d93dc091d2658ce496549e, ci_run: 31857810006, review_ci_run: 31857810006, review_receipt_digest: sha256:5e85c8ac8f1011647650cc99c97ba823b436904540342cb3b909c7a6e66a6fce, db_projection_digest: sha256:bdd6a799902fa229420fd5263cc389924ddfa72c24a7704644fe74443589d2bb, db_replay_projection_digest: sha256:bdd6a799902fa229420fd5263cc389924ddfa72c24a7704644fe74443589d2bb, checkpoint_digest: sha256:660145b24a08e1ea4d491ef915e93850a22ad40b91231fb3a08d478bd2fef13a, replay_checkpoint_digest: sha256:660145b24a08e1ea4d491ef915e93850a22ad40b91231fb3a08d478bd2fef13a, db_converged: true }
    - { slice_id: PLAN-L7-562-workflow-classification-typed-routing, pr: 708, head: c8438943cbc2128b77595564125d19d0d9a1d36d, ci_run: 31859304488, review_ci_run: 31859304488, review_receipt_digest: sha256:a83107f0cd3a75fed793c13c1c231a80298e40766804d1384872031b39ecd04c, db_projection_digest: sha256:73458298cabb833c6f4603464cd5a349bb94476d7701eff6695141c567edfd3e, db_replay_projection_digest: sha256:73458298cabb833c6f4603464cd5a349bb94476d7701eff6695141c567edfd3e, checkpoint_digest: sha256:e05a0772396772a6255a7faf8804f65d5878002bd58a3061d91809a348d6a543, replay_checkpoint_digest: sha256:e05a0772396772a6255a7faf8804f65d5878002bd58a3061d91809a348d6a543, db_converged: true }
    - { slice_id: PLAN-L7-568-workflow-classification-legacy-adapter, pr: 720, head: 2bef701176fe6fef60a676b24e97ad01f5b3e461, ci_run: 31899623191, review_ci_run: 31899623191, review_receipt_digest: sha256:dcd68acec722fdf06ed07fbbf39a758b41ab252f86d1198baa0b897ad342e644, db_projection_digest: sha256:b623d2b35a95f96c0a050316f42c784d91d7de9bcf5d5acc0f667abe147e0f62, db_replay_projection_digest: sha256:b623d2b35a95f96c0a050316f42c784d91d7de9bcf5d5acc0f667abe147e0f62, checkpoint_digest: sha256:f2c6dea11efdfc4f8ea97c56ff053d56168572b622b5e533d584fd3aeb4c6f80, replay_checkpoint_digest: sha256:f2c6dea11efdfc4f8ea97c56ff053d56168572b622b5e533d584fd3aeb4c6f80, db_converged: true }
    - { slice_id: PLAN-L7-570-design-elicitation-typed-classification, pr: 723, head: b9a47a8f793f6d264d9b10c44419331eb1ea2a56, ci_run: 31903989296, review_ci_run: 31903989296, review_receipt_digest: sha256:75f9cb7725287364c790ab213477a597d2d574a829138eb439aadcdd5c1f72cf, db_projection_digest: sha256:cd0321930f0252960e97901b298ab0f46724efc630aebbcb247fac7082333042, db_replay_projection_digest: sha256:cd0321930f0252960e97901b298ab0f46724efc630aebbcb247fac7082333042, checkpoint_digest: sha256:3e7f650d39c473ea8f08860b4d86d6b77548a19a70d24f5c5fc4b68e29c0e29e, replay_checkpoint_digest: sha256:3e7f650d39c473ea8f08860b4d86d6b77548a19a70d24f5c5fc4b68e29c0e29e, db_converged: true }
    - { slice_id: PLAN-L7-583-workflow-classification-drive-run-projection, pr: 780, head: fa21633ea63c50339f1f7dab383dae9c88a5630c, ci_run: 32071575313, review_ci_run: 32071575313, review_receipt_digest: sha256:b6e4465e72b0d1315f238e057f364b4f6bec33ac3ef478c430191e036ded84f5, db_projection_digest: sha256:fef9814fc1c0d3f692a8cf8486011a17ec0ed52c474c76a7f5ab12160bb018d3, db_replay_projection_digest: sha256:fef9814fc1c0d3f692a8cf8486011a17ec0ed52c474c76a7f5ab12160bb018d3, checkpoint_digest: sha256:774498d5691d9f837add195d94c4d56db45cf3b34ab4575266265563ec18cbd3, replay_checkpoint_digest: sha256:774498d5691d9f837add195d94c4d56db45cf3b34ab4575266265563ec18cbd3, db_converged: true }
    - { slice_id: PLAN-L7-580-workflow-classification-catalog-doctor, pr: 750, head: dc408b3bb16e7d2797a3e126c13481540b8e82ff, ci_run: 31950409687, review_ci_run: 31950409687, review_receipt_digest: sha256:12fa0f38974d03e6e968464195a7707bce38bfed9674ce10b1174bd3ee924669, db_projection_digest: sha256:482a978ec79a0816c0408624ea89b4875ef7f12226421351c143f38d214a0cae, db_replay_projection_digest: sha256:482a978ec79a0816c0408624ea89b4875ef7f12226421351c143f38d214a0cae, checkpoint_digest: sha256:c10bd70934f4291886c1b4258d33ab11543a9efaf5f8318c1b9f3b4db15718c2, replay_checkpoint_digest: sha256:c10bd70934f4291886c1b4258d33ab11543a9efaf5f8318c1b9f3b4db15718c2, db_converged: true }
  dependency_issues:
    - { number: 204, state: open }
    - { number: 635, state: open }
    - { number: 188, state: open }
  audit_report:
    ok: true
    completion_claim_allowed: true
    forward_slice_count: 6
    findings: []
    evidence_digest: "sha256:63b000b3f0ea140975eccabafd32cdcf5427bb7f9d58fd5f240c19f24ae4c747"
entry_signals:
  - "po_directive:Issue #694のForward各sliceをrequirements正本へ再接着し、current-main read-afterで終端監査する"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
created: 2026-08-20
updated: 2026-08-20
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-TERMINAL-FULLBACK-001
responsibility_owner: workflow-classification-terminal-fullback
live_evidence_adapter: src/adapters/github-workflow-classification-terminal-fullback.ts
live_evidence_policy: read_only_github_normalization
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Issue #694のrequirements registry、generated catalog、typed runtime、legacy adapter、DB projection、doctor、process surfaceのForward sliceがmainへ個別にmerge済みだが、Reverse fullbackとIssue終端の証拠が一つに束縛されていない"
contract_postconditions: "各Forward sliceのHEAD／CI／Claude review／DB convergenceをcurrent-mainへ再照合し、requirements→registry→projection→consumerの意味一致と#204への終端接続可否を一つのfullback証拠へ束縛する"
contract_invariants: "Reverse監査は旧15-routeや旧modeをcurrent authorityへ戻さず、requirements-owned registryのversion／digest／typed axis／IDを唯一の意味基準とする。未成立の証拠はcompletion claimへ昇格しない"
contract_failures: "requirements-owned Forward slice／consumer集合からの欠落、Forward receipt欠落、HEAD／CI／review／DB digest不一致、current-mainの未測定またはdigest不一致、legacy identityのcurrent再出力、#204／#635／#188の依存状態不一致をfail-closeする"
tdd_red_required: true
red_at: "2026-08-20T06:30:05+09:00"
green_at: "2026-08-20T06:31:12+09:00"
mutation_oracle_evidence: "tests/workflow-classification-terminal-fullback.test.ts::U-WFTERM-002 の実測。auditCurrentMain の mainHeadSha／observedHeadSha 不一致拒否条件を一時的に !== から === へ反転すると、7件中2件失敗（exit 1）となり、current-main head mismatch の変異をkillした。実装を復元後、同suiteは7 passedへ復帰した。#829でU-WFTERM-007..019の13 failure code／emission siteに対する単一field negative oracleを追加し、全20 testがgreenであることを確認した。#832でU-WFTERM-020..022を追加し、ciConclusion success判定、checkpoint/replay digest一致判定、registry sourceDigest形式判定の節削除変異を各1回実測する。3 mutationとも対応suiteがred（exit 1）となり、復元後は全23 testがgreenであることを記録する。#837でU-WFTERM-027..036を追加し、#842でU-WFTERM-037..041のrequirements-owned集合、GitHub main read-after、current-main measurement digest oracleを追加した。`npx --no-install tsx tests/tools/github-workflow-classification-terminal-fullback-mutation/run-mutation.ts`を実行し、全12変異がKILLED、survived=0、pattern_missing=0（total=12 killed=12）となった。なお、adapter内部のdigest形式・dbConverged・ciConclusion pendingの3判定はschema側が入力を生成できず到達不能（等価変異）であるため、上流lint／schema guardの変異で代替測定した。"
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
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-007, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-008, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-009, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-010, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-011, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-012, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-013, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-014, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-015, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-016, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-017, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-018, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-019, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-020, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-021, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-022, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-023, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-024, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-025, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-026, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-027, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-028, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-029, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-030, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-031, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-032, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-033, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-034, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-035, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-036, test_path: tests/github-workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-037, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-038, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-039, test_path: tests/workflow-classification-terminal-fullback.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-040, test_path: tests/workflow-classification-terminal-fullback-authority.test.ts }
  - { parent_design: docs/test-design/helix/L8-workflow-classification-terminal-fullback-unit-test-design.md, oracle_id: U-WFTERM-041, test_path: tests/workflow-classification-terminal-fullback-authority.test.ts }
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
  - artifact_path: src/adapters/github-workflow-classification-terminal-fullback.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-classification-terminal-fullback.test.ts
    artifact_type: test_code
  - artifact_path: tests/github-workflow-classification-terminal-fullback.test.ts
    artifact_type: test_code
  - artifact_path: tests/tools/github-workflow-classification-terminal-fullback-mutation/run-mutation.ts
    artifact_type: script
  - artifact_path: docs/design/helix/L3-requirements/workflow-classification-terminal-fullback-authority.v1.json
    artifact_type: design_doc
  - artifact_path: src/schema/workflow-classification-terminal-fullback-authority.ts
    artifact_type: source_module
  - artifact_path: tests/workflow-classification-terminal-fullback-authority.test.ts
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
projection／replay digest、main read-afterをGitHubとmain treeから再取得する。新設したread-only adapterは
GitHub APIからPR／CI／comments／依存Issueの実体を取得し、同一HEADへ正規化する。current-main authority、
DB read-afterとdoctor legacy観測は呼出側の実測payloadを必須とし、adapterが推測で補完しない。Forward slice集合と
consumer一覧はrequirements-owned authorityとPLAN `dependencies.requires`から導出し、GitHub main HEADはadapterが
read-after取得する。proseや古いPLANのgreen記録だけを完了証拠として採用しない。receiptが存在しないsliceは未完了として扱う。

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

## R4 current-main 実測結果（2026-08-20）

read-only GitHub normalization adapterで、Forward 6 sliceを再取得した。6件すべてについて、PRがmerge済み、required
CIが同一HEADでsuccess、Claude independent reviewが同一HEAD・同一CI generationでapprove、DB projection／replayと
checkpoint／replayが一致していることを確認した。監査結果は `ok=true`、`completion_claim_allowed=true`、findings 0、
`forward_slice_count=6` であり、evidence digestはfront matterの `r4_live_evidence` と一致する。

current-mainはPR #839のmerge commit `45f01e5c3dd893e463a6261e08566927bf6888bf` に固定した。main post-merge
`harness-check` run `32346845080`、CodeQL run `32346844942` はともにsuccessで、ローカルの同一隔離worktreeでも
`db rebuild --json` と `doctor --summary-json` がexit 0となった。requirements `1.3.12`、classification registry
`1.1.4`、registry source digest、legacy identity非再出力も同一証拠へ束縛した。

依存Issue #204、#635、#188は実状態を再取得したうえで全てopenである。これは#694の終端監査を成立させるための
fail-close条件を満たす状態であり、#635／#188の解放や#204のcloseを先取りするものではない。#694のcanonical merge後に
この証拠を#204へ接続し、#635／#188のblocked境界だけを更新する。

## 完了境界

このPLANのReverse fullback claimは、current-main実測、全6 Forward slice、独立review、CI、DB convergenceを同一
evidence digestへ束縛したため許可する。ただしIssue #694のGitHub終端、#204へのread-after接続、#635／#188のblocked
解除は、このPLANを含むcanonical PRのmerge後に別途実行し、先行主張しない。
