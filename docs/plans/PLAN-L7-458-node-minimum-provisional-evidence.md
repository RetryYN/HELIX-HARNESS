---
plan_id: PLAN-L7-458-node-minimum-provisional-evidence
title: "PLAN-L7-458: Node Minimum provisional evidence"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/design/helix/L5-detail/node-runtime-cutover.md
agent_slots:
  - { role: se, slot_label: "SE — Node実観測と非active receipt" }
  - { role: qa, slot_label: "QA — exact workflow・drift・authority非切替" }
parent_design: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md
pair_artifact: docs/test-design/helix/L8-node-minimum-provisional-evidence.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md, oracle_id: U-NMIN-001, test_path: tests/node-minimum-provisional-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md, oracle_id: U-NMIN-002, test_path: tests/node-minimum-provisional-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md, oracle_id: U-NMIN-003, test_path: tests/node-minimum-provisional-evidence.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md, oracle_id: U-NMIN-004, test_path: tests/node-minimum-provisional-evidence.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/node-minimum-provisional-evidence.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-node-minimum-provisional-evidence.md, artifact_type: test_design }
  - { artifact_path: src/runtime/node-minimum-provisional-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/node-minimum-provisional-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: .helix/evidence/node-minimum/<receipt_digest>.json, artifact_type: other }
---

# Node Minimum provisional evidence

## 完了条件

U-NMIN-001..004とauthority surface差分監査がgreenであること。実Git HEAD/tree、実toolchain、lock/tree bytes、
`node:sqlite`実問い合わせ、artifact bytes、同一authorityへ結合したworkflow artifactをeffect port経由で再観測し、
期待値はGit HEAD内のfrozen expectation artifactから読み、PASS receiptは保存直前のHEAD/tree freshnessを再検証して
`.helix/evidence/node-minimum/<receipt_digest>.json`へcreate-newで保存する。
`terminal:false`をcutover承認へ読み替えない。
