---
plan_id: PLAN-RECOVERY-1430-evidence-substance
title: "Gate証跡の実bytesと意味正本への接合を修復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1430
behavior_contract_id: GATE-EVIDENCE-SUBSTANCE-1430
responsibility_owner: gate-evidence-substance
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
modifies:
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
  - { artifact_path: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-171-g8-adapter-asset-evidence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-312-d-contract-dsl.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-REVERSE-169-g8-integration-evidence-manifest.md, artifact_type: markdown_doc }
review_evidence: []
---

# 証跡の実体照合Recovery

main548440db8で偽digest・mandatory空集合が違反0件になる反例を実測済み。
共通readerを作り、G8/G9/G10のcommand証跡bytesと成功したVitest JSON reportへ接続した。旧manifestはarchiveへ移し、Node 24の実行logへ束縛したcurrent manifestでlive gateを検査する。G10は実Chromium render・keyboard・a11y smokeとscreenshotを採取し、否定文だけのadvisor evidenceをmandatory passへ昇格させない。終了要約のcoverage再計算、S4 locatorのpath↔digest一対一照合、objective G1〜G9の代表artifact bytes bindingも追加した。
正本mandatory ID集合とstale deferの鮮度schemaは未修復であり、#1430の全受入を満たさない。
実測記録・CI・独立review・main read-afterなしに完了扱いしない。
