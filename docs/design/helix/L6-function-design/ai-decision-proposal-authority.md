---
title: "AI判断proposal authority 機能設計"
layer: L6
sub_doc: function-spec
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
---

# AI判断proposal authority 機能設計

`validateAiDecisionProposal(input: unknown) => AiDecisionProposalValidation`

| DbC | 契約 |
|---|---|
| pre | inputはuntrusted unknown。schema、authority、candidate参照の事前検証を仮定しない |
| post | proposalが全判断chainと実行可能性境界を満たす場合だけ`ok=true`を返す |
| invariant | `propose_next_state`だけを許可し、未知actionを含むwrite authorityを発行しない |
| failure | schema、authority、candidate、policy、unresolved、oracle、verifier違反をstable codeへ変換する |
| oracle | `U-UWPROP-001`〜`U-UWPROP-006`で完全proposal、各欠落、権限昇格、stale、参照不整合、failure code分離を反証する |

`proposal_valid = schema_valid ∧ authority_separated ∧ policy_pass ∧ blocking_unresolved=0 ∧ fallback_present ∧ reassessment_present ∧ measurement_oracle_current ∧ commit_verifier_pending`
