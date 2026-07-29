---
plan_id: PLAN-RECOVERY-08-requirements-compatibility-isolation
title: "PLAN-RECOVERY-08: requirements compatibility文書をcurrent gate入力から隔離"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-29 現行L1〜L12を唯一のauthorityとし旧定義を互換読込専用へ隔離する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: REQ-COMPAT-ISOLATION-FR-001
responsibility_owner: requirements-compatibility-isolation
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "requirements registryがcanonicalとcompatibilityを別fieldで返し、旧文書を物理削除しない"
contract_postconditions: "current lint／doctor／L3 progressionはcanonical requirementsだけを判定入力とし、compatibility本文のmutationで結果が変わらない"
contract_invariants: "現行L1〜L12、3 development style、case-driven model、specialist capability、既存sub-doc集合とsignal集合を変更しない"
contract_failures: "compatibility本文をcurrent schema／routing／progression判定へ使う、current failureをcompatibility greenで相殺する、旧style表現をcurrent requirementsへ残す場合はfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存registryのcanonical fieldへconsumerを付け替え、死んだcompatibility seed走査を削除する。新しいgate、schema、dependencyを増やさない"
removal_trigger: "compatibility文書の全consumerが0となり、migration retention承認後にregistry.compatibility fieldを削除する時点"
irreversible_impact: none
github_issue_id: 267
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — current／compatibility判定境界を原子的に是正"
  - role: tl
    slot_label: "TL — machine contractとauthority chainを照合"
  - role: qa
    slot_label: "QA — compatibility mutationの非干渉を検証"
generates:
  - artifact_path: docs/plans/PLAN-RECOVERY-08-requirements-compatibility-isolation.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-residual.json
    artifact_type: json_config
  - artifact_path: docs/governance/feedback-refactor-disposition.json
    artifact_type: json_config
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/sub-doc-catalog-drift.ts
    artifact_type: source_module
  - artifact_path: src/lint/requirements-doc-registry.ts
    artifact_type: source_module
  - artifact_path: src/lint/propagation.ts
    artifact_type: source_module
  - artifact_path: src/lint/scrum-reverse.ts
    artifact_type: source_module
  - artifact_path: src/lint/l3-progression-authority.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: src/schema/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/requirements-doc-registry.test.ts
    artifact_type: test_code
  - artifact_path: tests/propagation.test.ts
    artifact_type: test_code
  - artifact_path: tests/scrum-reverse.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-progression-authority.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/layer-authority-drift.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-RECOVERY-07-infinity-loop-authority-metadata.md
  requires:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - docs/governance/requirements-doc-registry.json
  references:
    - docs/governance/helix-harness-requirements_v1.2.md
  blocks:
    - issue:30
review_evidence:
  - reviewer: claude-code-cross-runtime
    review_kind: cross_agent
    reviewed_at: "2026-07-30T02:27:14+09:00"
    tests_green_at: "2026-07-30T02:20:52+09:00"
    verdict: approve_after_fixes
    scope: "PR #269 candidate HEAD 87fff5eec7e4a6f334569865129f806173648039 を、authoring runtime (Codex) と異なる Claude runtime が clean detached checkout でread-only検証した。確認範囲 = (1) current consumerがregistry canonical v1.3だけを参照しcompatibility v1.2を判定入力にしないこと、(2) compatibility本文mutationがcurrent gate結果へ干渉しないnegative oracle、(3) L1〜L12 current authorityと3 development style／case-driven／specialistの軸分離、(4) reviewed digestとfreeze evidenceの追随。Critical／High／Mediumのうち残存した1件は本PLANがdraftであることだけであり、このconfirm transactionがその是正である。GitHub Actions run 30473038499のCI runnerがtypecheck、DB rebuild、全回帰3111 tests、Biomeをgreen実行し、Claudeはrun／step結果を照合した（Claude自身がfull commandを実行したというclaimではない）。Claude local fastの配布系2失敗はNode v22.23.1がrequired Node >=24.15 <25を満たさない環境差で、同一HEADのCI Node 24ではgreenと切り分けた。"
    worker_model: codex
    reviewer_model: claude-opus-5
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-30T02:20:52+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:a7955260a7ea20a378e5f8f3a4117cbae0647428d483709f59bc66998ad1bff4"
---

# PLAN-RECOVERY-08: requirements互換読込の隔離

## §工程表

### Step 1: consumer分類 [直列]

- compatibility読込をcurrent decision input、historical fixture、write guardへ分類する。
- current decision inputだけをcanonical requirementsへ移す。

### Step 2: current contract materialization [直列]

- sub-doc catalogとsignal routingの現行machine contractをv1.3へ明示する。
- Production Scrumをsignal起動modeへ戻さず、選択済みdevelopment styleとして扱う。

### Step 3: non-interference oracle [直列]

- compatibility本文だけをmutationしてもcurrent loader結果が不変であることを検証する。
- L3 progression digest対象をv1.2からv1.3へ置換する。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証する。
- Critical／High／Medium 0とfull CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: sub-doc catalogとsignal routingのcurrent gateはregistry canonicalだけを読む。
- AC-2: Scrum Reverse seed検査はcompatibility文書を探索しない。
- AC-3: L3 progression blocker exact setはv1.3を含みv1.2を含まない。
- AC-4: compatibility本文のmutationはcurrent gate結果を変えない。
- AC-5: 3 development styleとcase-driven／specialist軸を維持する。
- AC-6: 新しい機能、gate、schema、dependencyを追加しない。

## §2 検証コマンド

- `npx vitest run --project fast tests/requirements-doc-registry.test.ts tests/sub-doc-catalog-drift.test.ts tests/propagation.test.ts tests/scrum-reverse.test.ts tests/l3-progression-authority.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/l3-g3-freeze-packet-v2.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-RECOVERY-08-requirements-compatibility-isolation.md`
- `npm run typecheck`
