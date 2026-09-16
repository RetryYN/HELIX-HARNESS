---
title: "AI判断proposal authority L8単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-14
updated: 2026-08-21
owner: QA / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
---

# AI判断proposal authority L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-UWPROP-001 | 完全proposal | strict contractをproposal-onlyとして受理 | `tests/ai-decision-proposal.test.ts` |
| U-UWPROP-002 | 必須chain | 各field、fallback、reassessment、oracle欠落を個別拒否 | `tests/ai-decision-proposal.test.ts` |
| U-UWPROP-003 | authority | 自己承認、権限昇格、high-impact、direct writeを拒否 | `tests/ai-decision-proposal.test.ts` |
| U-UWPROP-004 | executable boundary | policy／unresolved／oracle／commit verifier違反を拒否 | `tests/ai-decision-proposal.test.ts` |
| U-UWPROP-005 | identity/schema | unknown candidateとunknown fieldを拒否 | `tests/ai-decision-proposal.test.ts` |
| U-UWPROP-006 | failure code分離 | 8 failure branchを単独fixtureで発火させ、余分なfindingなしのexact codeを固定 | `tests/ai-decision-proposal.test.ts` |
