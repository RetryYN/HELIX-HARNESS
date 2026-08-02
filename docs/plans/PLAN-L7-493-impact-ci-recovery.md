---
plan_id: PLAN-L7-493-impact-ci-recovery
title: "PLAN-L7-493 (add-impl): Impact CI Recovery"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-01 Issue #93 L3Q-IT-024 implementation"
created: 2026-08-01
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-92がpure selectorとprofile dispatchをpair freezeする"
contract_postconditions: "Draft selected／candidate full／post-merge fullが同じinventory contractで実行される"
contract_invariants: "unknown/high-risk full、exact partition、required gate非縮退、receipt exact HEAD"
contract_failures: "selector／inventory／partition／receipt／workflow driftをfail-closeする"
tdd_red_required: true
red_at: "2026-08-01T13:52:41Z"
green_at: "2026-08-01T13:53:58Z"
mutation_oracle_evidence: "tests/impact-ci.test.tsとtests/harness-check-workflow.test.tsでduplicate inventory、workflow／unknown pathのknown-low化、result欠落、terminal二重登録、soft-pass、empty selection、snapshot re-read欠落のseeded mutationを注入すると各oracleがredとなり、欠陥をkilledする"
complexity_effect: net_neutral
complexity_justification: "単一pure moduleと既存CLI/workflow接続だけを追加しrunnerを増やさない"
removal_trigger: "恒久profile契約のためなし。unconditional PR full stepはdual-green後に削除する"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-001, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-012, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure selector／CLI／workflow実装" }
  - { role: qa, slot_label: "QA — impact selection／receipt／workflow mutation oracle" }
  - { role: tl, slot_label: "TL — full admission非縮退とscope監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-493-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/impact-ci.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/impact-ci.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-92-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
    - docs/plans/PLAN-L5-84-impact-ci-recovery.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-01T15:30:43Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-01T15:30:43Z"
    evidence_digest: "sha256:a563cf3259a5378c25fc10f4d3451902e2d0101322c6e7f7590fdc77d4eae344"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T15:30:43Z"
    tests_green_at: "2026-08-01T15:18:40Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #333 HEAD 380cdd81bb0be1c82ab184d40f9107bc6746f4dfを独立read-only content review。blocker_count 0、Critical／High／Medium 0、verdict approve_after_fixes。L6/L7 confirmed遷移後にfull CIとDBを取るbootstrapを明示承認した。green_commandsはClaude実行ではなくCodex author runtimeの実行証拠を同entryへ添付する規約であり、reviewerの実行主張ではない。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/333#issuecomment-5152090348"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/impact-ci.test.ts tests/harness-check-workflow.test.ts tests/impact-ci-recovery-detail-design.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: tests/impact-ci.test.ts, output_digest: "sha256:30629190c3b30152642b10b613ee6d3672d1dbbf08e034433e2bb45d3b5e7525", result: "Codex author runtime: 3 files / 44 tests pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: src/runtime/impact-ci.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "Codex author runtime: exit 0; command stdout is empty" }
---

# PLAN-L7-493: Impact CI Recovery実装

1. Red: U-IMPACTCI-001〜012とU-IMPACTCI-003B、workflow profile反例を固定する。
2. Green: pure selector、CLI JSON projection、既存workflow dispatchを最小実装する。
3. Refactor: canonical化とfailure codeを一箇所へ集約し、full suite commandを複製しない。

## Issue #343 極小リファクタリング証跡

- production code、public CLI contract、assertion意味は変更しない。
- `tests/cli-surface.test.ts`の子processは、`npx`解決層を通さずrepository-pinned Node/tsx artifactを直接起動する。
- current-location／drive／recovery／roadmap／artifact-remap／vmodel-fitのfixture変更前read-only surfaceは、
  full payloadのdefault rebuild後に一度構築したpersistent DBを`--from-db`で共有する。
- DB未生成時は`source_clock: null`、current `unknown`、zero countを明示し、完成状態へ誤分類しない。
- 重いcaseの再現commandは`npx --no-install vitest run tests/cli-surface.test.ts -t 'exposes Project view current-location and drive recommendation'`、file全体は`npx --no-install vitest run tests/cli-surface.test.ts`とする。
- 同一環境の重いcaseは約75秒から65.51秒へ短縮した。file全体のbaselineは292.07秒で、final candidateの再計測値はfull file commandとrequired Node 24 CIの両方で確定する。
- fixture変更前の18 read-only surfaceは、18回の個別rebuildからdefault rebuild 4回＋persistent rebuild 1回へ縮約した。production追加0、helper追加0のためcomplexity effectは`net_negative`とする。
