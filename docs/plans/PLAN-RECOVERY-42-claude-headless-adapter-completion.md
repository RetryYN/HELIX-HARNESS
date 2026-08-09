---
plan_id: PLAN-RECOVERY-42-claude-headless-adapter-completion
title: "PLAN-RECOVERY-42 (recovery): Claude headless adapterをfinal response後にbounded完了させる"
kind: recovery
layer: cross
drive: agent
status: draft
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
contract_postconditions: "Claude executeだけが--setting-sources user,projectとHELIX_CLAUDE_HEADLESS_EXECUTION=1をchildへ持つ。marker付きclaude-memory-wakeはstdin／generation／claim／manifest増分0で即時exit 0となる。Claude childだけでadmitted worker contextのbudget.time_msをprovider timeoutへexact束縛し、deadlineはSIGKILLで回収されETIMEDOUTをprovider_timeoutへ型付けする"
contract_invariants: "通常VS Code Claude sessionのasyncRewake、Codex adapter、Claude dry-run、prompt stdin、worker context admission、session_start/tool_use/session_end記録を変更しない。新service、workflow、DB table、daemonを追加しない"
contract_failures: "Claude executeがlocal settingsを読む、headless markerが無い、marker付きwakeがstate/claimを作る、Claude timeoutがworker budgetと異なる、Codexへtimeoutを広げる、soft killへ弱化する、ETIMEDOUTをgeneric provider_errorへ潰す場合はU-ADAPTER-012/013またはmutationでRedになる"
tdd_red_required: true
red_at: "2026-08-09T15:18:23Z"
green_at: "2026-08-09T15:20:17Z"
mutation_oracle_evidence: "npx --no-install tsx tests/tools/claude-headless-completion-mutation/run-mutation.tsでsetting sources除去、marker除去、wake suppression除去、SIGKILL→SIGTERM、CLI timeout接続破壊、Codex timeout隔離反転、provider_timeout→provider_errorの7 mutationを実生成し7/7 killed、survived 0、pattern_missing 0"
complexity_effect: justified_positive
complexity_justification: "既存adapter policy、spawnSync、worker context budget、claude-memory-wake entrypointを再利用する。追加は定数2個、timeout pure mapper、hook先頭のmarker分岐、failure class 1値だけで、別watcherやledgerを作らない"
removal_trigger: "Claude CLIがheadless --printでinteractive Stop hooksをnative分離し、sealed external deadlineとtyped timeoutを同等以上に提供した時"
parent_design: docs/design/harness/L6-function-design/session-log.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/session-log.md, oracle_id: U-ADAPTER-012, test_path: tests/runtime-hook-entrypoints.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/session-log.md, oracle_id: U-ADAPTER-013, test_path: tests/runtime-adapter.test.ts }
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
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: src/runtime/adapter-policy.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/adapter.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/runtime-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: tests/runtime-hook-entrypoints.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/claude-headless-completion-mutation/run-mutation.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
  requires:
    - docs/plans/PLAN-L7-21-runtime-adapter-session-lifecycle.md
    - docs/plans/PLAN-L7-469-claude-memory-async-wake.md
review_evidence: []
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
3. Claude childだけでsealed worker contextの`budget.time_ms`を`spawnSync`のhard deadlineへ写像する。
4. deadlineをprovider非依存の`provider_timeout`としてJSONとstderrへsurfaceする。

## 3. 有限検証

- Red: U-ADAPTER-012/013追加時に5件が失敗し、wake state作成、設定/marker欠落、generic timeoutを実測した。
- Green: runtime adapter＋hook entrypoint 2 file / 36 testsとtypecheckがgreen。
- Process E2E: Ubuntuで無限holdするfake Claudeを250ms budgetで`SIGKILL`し、10秒未満のwrapper復帰、
  `provider_timeout`、未到達completion sentinel、`session_end`を確認する。正常fake Claudeはcompletion sentinel後にexit 0。
- Mutation: pure mapperだけでなくCLI spawn接続を含む主要防御7点を個別破壊し7/7 killed。

## 4. 非対象

- Issue #125のcold-idle VS Code receiver switch全体の再設計
- Claude/Kimiのfallback scheduler、GitHub review admissionおよびCI workflowの変更
- 通常VS Code sessionの`asyncRewake` timeout、consumer template
- PR #513のclosure文書

## 5. merge前残作業

PLANは独立AI-B exact-HEAD reviewとfull CI前のためdraftで保持する。review evidenceを同一HEADへ束縛し、
governance gateを通した時だけconfirmedへ遷移する。
