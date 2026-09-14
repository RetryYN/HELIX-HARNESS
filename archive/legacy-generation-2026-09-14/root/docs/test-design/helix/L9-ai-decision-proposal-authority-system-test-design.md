---
title: "AI判断proposal authority L9systemテスト設計"
layer: L9
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md
---

# AI判断proposal authority L9systemテスト設計

| IT-ID | system境界 | 合格条件 | negative oracle | test citation |
|---|---|---|---|---|
| IT-UWPROP-001 | proposal validator | 判断chainと測定契約を同一proposalへbind | copied candidate、stale oracle | `tests/ai-decision-proposal.test.ts` |
| IT-UWPROP-002 | authority boundary | AI outputからDB／Git／GitHub write 0 | direct write、gate pass、freeze自己承認 | `tests/ai-decision-proposal.test.ts` |
| IT-UWPROP-003 | commit verifier join | valid proposalもverifier待機で停止 | committed自己申告、verifier迂回 | `tests/ai-decision-proposal.test.ts` |
