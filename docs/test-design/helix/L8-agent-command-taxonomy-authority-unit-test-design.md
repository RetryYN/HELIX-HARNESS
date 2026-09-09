---
title: "agent/command taxonomy authority単体テスト設計"
layer: L8
artifact_type: test-design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: QA
plan: PLAN-RECOVERY-1374-agent-command-taxonomy-slice1
pair_artifact: docs/design/helix/L6-function-design/agent-command-taxonomy-authority.md
---

# agent/command taxonomy authority単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-ACTA-001 | 対象6文書のcurrent layer guidance | L0-L14、G4/G6、L12 deployの再導入を検出して失敗する | `tests/layer-authority-drift.test.ts` |
| U-ACTA-002 | `/ship`のreview authority | independent review、release、deployment、runtime admissionのいずれかを欠落させると失敗する | `tests/layer-authority-drift.test.ts` |
| U-ACTA-003 | QA・security・deploymentの閾値authority | typed policy参照または`unknown`保持を欠落させると失敗する | `tests/layer-authority-drift.test.ts` |
