---
plan_id: PLAN-RECOVERY-42-claude-headless-adapter-completion
title: "PLAN-RECOVERY-42 (recovery): Claude headless adapterをfinal response後にbounded完了させる"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-10 Issue #125 F-CLAUDE-HEADLESS-COMPLETION-001を次回headless dispatch前にP1 Recoveryする"
created: 2026-08-10
updated: 2026-08-10
owner: Codex / TL
github_issue_id: 125
engineering_discipline_required: true
behavior_contract_id: CLAUDE-HEADLESS-ADAPTER-COMPLETION-001
responsibility_owner: runtime-adapter-session-lifecycle
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "helix claude --executeはClaude --printを同期起動するが、project/localの対話session向けStop asyncRewakeを継承し、review receiptとsession_end成立後もwake watcher最大7200秒／commit watcher最大5400秒wrapperを保持する。provider spawnSyncにはsealed worker contextのbudget.time_ms由来deadlineが無い"
contract_postconditions: "Claude executeだけが--setting-sources user,projectとHELIX_CLAUDE_HEADLESS_EXECUTION=1をchildへ持つ。marker付きclaude-memory-wakeはstdin／generation／claim／manifest増分0で即時exit 0となる。direct CLI、pair-agent phase、loop worker／verifierの全Claude headless spawn sinkでadmitted worker contextのbudget.time_msをprovider timeoutへexact束縛し、deadlineはSIGKILLで回収されETIMEDOUTをprovider_timeoutへ型付けする"
contract_invariants: "通常VS Code Claude sessionのasyncRewake、Codex adapter、Claude dry-run、prompt stdin、worker context admission、session_start/tool_use/session_end記録を変更しない。新service、workflow、DB table、daemonを追加しない"
contract_failures: "Claude executeがlocal settingsを読む、headless markerが無い、marker付きwakeがstate/claimを作る、direct／pair／loopのいずれかでClaude timeoutがworker budgetと異なる、Codexへtimeoutを広げる、soft killへ弱化する、ETIMEDOUTをgeneric provider_errorへ潰す場合はU-ADAPTER-012/013またはmutationでRedになる"
tdd_red_required: true
red_at: "2026-08-09T15:18:23Z"
green_at: "2026-08-09T15:20:17Z"
mutation_oracle_evidence: "npx --no-install tsx tests/tools/claude-headless-completion-mutation/run-mutation.tsでsetting sources除去、marker除去、wake suppression除去、SIGKILL→SIGTERM、direct／pair／loop timeout接続破壊、Codex timeout隔離反転、provider_timeout→provider_errorの9 mutationを実生成し9/9 killed、survived 0、pattern_missing 0"
complexity_effect: justified_positive
complexity_justification: "既存adapter policy、spawnSync、worker context budget、claude-memory-wake entrypointを再利用する。追加は定数2個、timeout pure mapper、hook先頭のmarker分岐、failure class 1値と既存3 spawn sinkへの同mapper接続だけで、別watcherやledgerを作らない"
removal_trigger: "Claude CLIがheadless --printでinteractive Stop hooksをnative分離し、sealed external deadlineとtyped timeoutを同等以上に提供した時"
parent_design: docs/design/harness/L6-function-design/session-log.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/session-log.md, oracle_id: U-ADAPTER-012, test_path: tests/runtime-hook-entrypoints.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/session-log.md, oracle_id: U-ADAPTER-013, test_path: tests/runtime-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pillar-function-design.md, oracle_id: U-ADAPTER-013, test_path: tests/pair-agent.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-ADAPTER-013, test_path: tests/orchestration/loop-bridge.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — PR #494 recurrence evidenceと既存runtime owner境界の照合" }
  - { role: se, slot_label: "SE — headless argv/env、wake marker、budget timeoutの最小実装" }
  - { role: qa, slot_label: "QA — post-final wake無副作用、typed timeout、negative mutation oracle" }
  - { role: tl, slot_label: "TL — 通常VS Code wakeとheadless completionの境界review" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-42-claude-headless-adapter-completion.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/session-log.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/orchestration-memory.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/orchestration-memory.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: src/runtime/adapter-policy.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/loop-bridge.ts, artifact_type: source_module }
  - { artifact_path: tests/runtime-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
  - { artifact_path: tests/pair-agent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/orchestration/loop-bridge.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/claude-headless-completion-mutation/run-mutation.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
  requires:
    - docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
    - docs/plans/PLAN-L7-469-claude-memory-async-wake.md
review_evidence:
  - reviewer: "Codex independent review subagent (Tera)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T18:38:11Z"
    tests_green_at: "2026-08-09T18:37:55Z"
    verdict: approve_after_fixes
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    scope: "独立read-only reviewerがmaterial HEAD 7cb3c2ccc19cb76a9661f043a925bd2559776e47 / tree 6b2ef727890c7bdaba0d1a1e748e9a8602b6c814とorigin/mainからの25 pathを照合した。round 1 Highはdocs/test-design/helix/orchestration-memory.md更新後のreviewed-safe digest staleで、source pin更新と専用回帰oracle追加により解消した。direct／pair／loopのClaude-only worker budget→SIGKILL deadline、Codex非適用、provider_timeout型付け、通常VS Code wake非回帰を確認。targeted 90/90、mutation 9/9 killed、typecheck、PLAN governance、Biome、L12 recognition 20/20がgreenで、Critical／High／Medium 0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/runtime-adapter.test.ts tests/runtime-hook-entrypoints.test.ts tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts tests/l12-hybrid-recognition.test.ts --reporter=json", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T18:36:16Z", evidence_path: tests/runtime-adapter.test.ts, output_digest: "sha256:bd1a2b0318a357fe3d55760147ae50278d606481fbc06d96055887d137efb960" }
      - { kind: smoke, command: "npx --no-install tsx tests/tools/claude-headless-completion-mutation/run-mutation.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T18:37:11Z", evidence_path: tests/tools/claude-headless-completion-mutation/run-mutation.ts, output_digest: "sha256:f605cb4ad71f17db582d72aaee3debf40195d854d8f2f567b9de7a8310e70665" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T18:37:55Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint --gate governance", runner: node, scope: gate, exit_code: 0, completed_at: "2026-08-09T18:37:47Z", evidence_path: docs/plans/PLAN-RECOVERY-42-claude-headless-adapter-completion.md, output_digest: "sha256:2f829988285557a220b753cfe99135b5835b07219d18ab72a3079dd574c1605b" }
      - { kind: lint, command: "npx --no-install biome check src/cli.ts src/orchestration/loop-bridge.ts src/runtime/adapter-policy.ts src/runtime/adapter.ts src/lint/l12-hybrid-reviewed-safe-v2.ts tests/runtime-adapter.test.ts tests/runtime-hook-entrypoints.test.ts tests/pair-agent.test.ts tests/orchestration/loop-bridge.test.ts tests/l12-hybrid-recognition.test.ts tests/tools/claude-headless-completion-mutation/run-mutation.ts", runner: node, scope: changed-files, exit_code: 0, completed_at: "2026-08-09T18:37:45Z", evidence_path: biome.json, output_digest: "sha256:6441fb90c904d1fa349a19eb410cde515bec7990a6064fb0f20d4ea413bcea9d" }
---

# PLAN-RECOVERY-42：Claude headless adapterの完了境界

## 1. 根本原因

`helix claude --execute`はproviderのfinal response後も、対話session用Stop hookの`asyncRewake`を
headless child内で起動していた。PR #494ではcanonical receiptと`session_end`が成立した後にmodel/tool activityが
0件であるにもかかわらず、wrapper processだけが残った。これはproviderの思考時間ではなくadapter lifecycleと
interactive wake lifecycleの境界欠落である。

## 2. 原子修復

1. Claude execute argvを`--setting-sources user,project`へ限定し、machine-local project hookを除外する。
2. child-only markerでrepo-owned `claude-memory-wake`をStop境界の先頭で無副作用終了させる。
3. direct CLI、pair-agent phase、loop worker／verifierの全Claude headless childで、sealed worker contextの
   `budget.time_ms`を各`spawnSync`のhard deadlineへ写像する。
4. deadlineをprovider非依存の`provider_timeout`としてJSONとstderrへsurfaceする。

## 3. 有限検証

- Red: U-ADAPTER-012/013追加時に5件が失敗し、wake state作成、設定/marker欠落、generic timeoutを実測した。
- Green: runtime adapter／hook／pair／loop／digest／feedback／wrapper designの7 file / 86 tests、
  PLAN／V-pair／設計言語／DDD-TDDの4 file / 137 tests、Design Reality Binding 24 testsとtypecheckがgreen。
- Reviewed-safe: `orchestration-memory.md`の既存legacy signal集合が不変であることを再照合し、
  L12 recognition 20 testsで`false_positive` dispositionと本文digestを再束縛する。
- Process E2E: Ubuntuで無限holdするfake Claudeを250ms budgetで`SIGKILL`し、direct CLI、pair-agent、loopの
  各wrapperが有限復帰し、未到達completion sentinelを残すことを確認する。direct CLIは`provider_timeout`と
  `session_end`も確認し、正常fake Claudeはcompletion sentinel後にexit 0。
- Mutation: pure mapperだけでなくdirect／pair／loop spawn接続を含む主要防御9点を個別破壊し9/9 killed。

## 4. 非対象

- Issue #125のcold-idle VS Code receiver switch全体の再設計
- Claude/Kimiのfallback scheduler、GitHub review admissionおよびCI workflowの変更
- 通常VS Code sessionの`asyncRewake` timeout、consumer template
- PR #513のclosure文書

## 5. merge前残作業

material HEADを独立AI-Bがreviewし、定量検証後の時系列でreview evidenceを束縛したためconfirmedへ遷移した。
PR candidateは最新mainへの同期後にfull CI、DB convergence、別runtimeのexact-HEAD reviewを改めて取得する。
