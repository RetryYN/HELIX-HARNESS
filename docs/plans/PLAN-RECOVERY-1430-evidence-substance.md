---
plan_id: PLAN-RECOVERY-1430-evidence-substance
title: "Gate証跡の実bytesと意味正本への接合を修復する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1430
behavior_contract_id: GATE-EVIDENCE-SUBSTANCE-1430
responsibility_owner: gate-evidence-substance
supersedes:
  - PLAN-L7-169-g8-integration-evidence-manifest
  - PLAN-L7-171-g8-adapter-asset-evidence
  - PLAN-L7-312-d-contract-dsl
  - PLAN-L7-313-g9-g10-workflow-gate
  - PLAN-REVERSE-169-g8-integration-evidence-manifest
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 証跡の意味と実測の境界" }
  - { role: tl, slot_label: "TL — 共通readerと既存gateの接合" }
  - { role: qa, slot_label: "QA — 偽digestと欠落の反例" }
parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md
pair_artifact: docs/test-design/helix/L8-gate-evidence-substance.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-016, test_path: tests/legacy-orchestration-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-015, test_path: tests/g10-browser-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-014, test_path: tests/goal-evidence-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-013, test_path: tests/goal-evidence-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-012, test_path: tests/s4-decision-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-011, test_path: tests/g8-integration-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-009, test_path: tests/g9-system-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-010, test_path: tests/g10-ux-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-008, test_path: tests/g8-integration-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-007, test_path: tests/evidence-file-substance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-006, test_path: tests/g8-integration-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-001, test_path: tests/evidence-file-substance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-002, test_path: tests/evidence-file-substance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-003, test_path: tests/evidence-file-substance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-004, test_path: tests/evidence-file-substance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md, oracle_id: U-GES-005, test_path: tests/evidence-file-substance.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1430", "issue:145", "issue:1425", "issue:883"]
generates:
  - { artifact_path: .helix/evidence/g8-integration/20260906-adapter-asset-evidence.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g8-integration/20260906-adapter-asset-evidence.vitest.log, artifact_type: other }
  - { artifact_path: .helix/evidence/g8-integration/20260906-module-state-evidence.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g8-integration/20260906-module-state-evidence.vitest.log, artifact_type: other }
  - { artifact_path: .helix/evidence/g8-integration/20260906-g8-pure-analyzer-evidence.vitest.log, artifact_type: other }
  - { artifact_path: .helix/evidence/g9-system/20260906-selected-system-evidence.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g9-system/20260906-selected-system-evidence.vitest.log, artifact_type: other }
  - { artifact_path: .helix/evidence/g10-ux/20260906-selected-ux-evidence.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g10-ux/20260906-browser-evidence.vitest.log, artifact_type: other }
  - { artifact_path: .helix/evidence/g10-ux/20260906-app-shell.png, artifact_type: other }
  - { artifact_path: docs/archive/gate-evidence-manifests/20260626-it-adapter-asset-expansion.json, artifact_type: json_config }
  - { artifact_path: docs/archive/gate-evidence-manifests/20260626-it-module-state-minimum.json, artifact_type: json_config }
  - { artifact_path: docs/archive/gate-evidence-manifests/20260705-selected-system-evidence.json, artifact_type: json_config }
  - { artifact_path: docs/archive/gate-evidence-manifests/20260705-selected-ux-evidence.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1430-evidence-substance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/gate-evidence-substance.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-gate-evidence-substance.md, artifact_type: test_design }
  - { artifact_path: src/lint/evidence-file-substance.ts, artifact_type: source_module }
  - { artifact_path: config/objective-evidence-substance-binding.v1.json, artifact_type: json_config }
  - { artifact_path: tests/evidence-file-substance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/g10-browser-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/review-1600/npm-ci.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/tsc.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/biome.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/plan-lint.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/doctor.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1600/head.txt, artifact_type: other }
modifies:
  - { artifact_path: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-171-g8-adapter-asset-evidence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-312-d-contract-dsl.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-169-g8-integration-evidence-manifest.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: .helix/evidence/g8-integration/20260626-it-adapter-asset-expansion.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g8-integration/20260626-it-module-state-minimum.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g9-system/20260705-selected-system-evidence.json, artifact_type: json_config }
  - { artifact_path: .helix/evidence/g10-ux/20260705-selected-ux-evidence.json, artifact_type: json_config }
  - { artifact_path: src/lint/s4-decision-readiness.ts, artifact_type: source_module }
  - { artifact_path: tests/s4-decision-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/g9-system-workflow.ts, artifact_type: source_module }
  - { artifact_path: src/lint/g10-ux-workflow.ts, artifact_type: source_module }
  - { artifact_path: tests/g8-integration-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/g9-system-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/g10-ux-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/gn-evidence-manifest.ts, artifact_type: source_module }
  - { artifact_path: src/lint/g8-integration-workflow.ts, artifact_type: source_module }
  - { artifact_path: src/lint/objective-evidence-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/goal-evidence-audit.test.ts, artifact_type: test_code }
  - { artifact_path: package.json, artifact_type: json_config }
  - { artifact_path: package-lock.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: tests/relation-graph-loader.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/legacy-orchestration-surface.ts, artifact_type: source_module }
  - { artifact_path: tests/legacy-orchestration-surface.test.ts, artifact_type: test_code }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/gn-evidence-manifest.ts, artifact_type: source_module }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-06T19:46:58Z"
    tests_green_at: "2026-09-06T19:42:51Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: d8a3e0351ce996225728669c92e3daa317fe65e3
    scope: "独立reviewとclean clone実測は https://github.com/RetryYN/HELIX-HARNESS/pull/1600#issuecomment-5561719714 。doctor exit 1は環境起因4件を含むためgreen commandへ昇格しない。Issue #1430全体完了や最終receiptを代替しない。"
    green_commands:
      - kind: install
        command: "npm ci --no-audit --no-fund"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:39:56Z"
        evidence_path: .helix/evidence/review-1600/npm-ci.log
        output_digest: "sha256:7c96a96a08b32140fb63dfd4464638928e8e93fd13ed027c8aa320bde740c10e"
      - kind: test
        command: "npx vitest run tests/evidence-file-substance.test.ts tests/g8-integration-workflow.test.ts tests/g9-system-workflow.test.ts tests/g10-ux-workflow.test.ts tests/goal-evidence-audit.test.ts tests/s4-decision-readiness.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/l12-hybrid-recognition.test.ts tests/review-evidence.test.ts tests/plan-artifact-existence.test.ts tests/green-command-digest.test.ts tests/plan-supersession.test.ts tests/legacy-orchestration-surface.test.ts tests/relation-graph-loader.test.ts tests/digest.test.ts tests/feedback-refactor-disposition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-06T19:42:32Z"
        evidence_path: .helix/evidence/review-1600/vitest-targeted.log
        output_digest: "sha256:5065beeaa4bca505628bbc620fe1bde26901b7b853b0876192edc1c3ec87e0be"
      - kind: typecheck
        command: "npx tsc --noEmit -p ."
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:42:44Z"
        evidence_path: .helix/evidence/review-1600/tsc.log
        output_digest: "sha256:faf04d50223f0ee30d2a3c391e8ee5f03ec217c1ce717205a16196c1a11e030d"
      - kind: lint
        command: "npx biome check src tests"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:42:45Z"
        evidence_path: .helix/evidence/review-1600/biome.log
        output_digest: "sha256:cfc63ce6d6b091cc23a4f5f7180d949ada795a184c1b2a0645fa1d173f1c8611"
      - kind: plan_lint
        command: "npx tsx src/cli.ts plan lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:42:51Z"
        evidence_path: .helix/evidence/review-1600/plan-lint.log
        output_digest: "sha256:7f8a4e5d4e4e51cff3087c6f4e184198c23b77f029926b1f2c5b4792e7bf2b0e"
---

# 証跡の実体照合Recovery

main548440db8で偽digest・mandatory空集合が違反0件になる反例を実測済み。
共通readerを作り、G8/G9/G10のcommand証跡bytesと成功したVitest JSON reportへ接続した。旧manifestはarchiveへ移し、Node 24の実行logへ束縛したcurrent manifestでlive gateを検査する。G10は実Chromium render・keyboard・a11y smokeとscreenshotを採取し、否定文だけのadvisor evidenceをmandatory passへ昇格させない。終了要約のcoverage再計算、S4 locatorのpath↔digest一対一照合、objective G1〜G9の代表artifact bytes bindingも追加した。
正本mandatory ID集合とstale deferの鮮度schemaは未修復であり、#1430の全受入を満たさない。
実測記録・CI・独立review・main read-afterなしに完了扱いしない。
