---
title: "Workflow interview／unresolved 機能設計"
layer: L6
sub_doc: function-spec
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
---

# Workflow interview／unresolved 機能設計

`evaluateWorkflowInterview(input: unknown) => WorkflowInterviewEvaluation`

| DbC | 契約 |
|---|---|
| pre | inputはuntrusted unknown。source／signal／answerの事前検証を仮定しない |
| post | exact question set、admitted answer、unresolved、finding、freeze可否を返す |
| invariant | source digest／revision／question version／authorityを再検証し、write／推測を行わない |
| failure | schema、stale、非該当回答、contradiction、authority、branch gapをstable codeへ変換する |
| oracle | `U-UWINT-001`〜`U-UWINT-005`で常時core、conditional exactness、unresolved、stale、空sourceを反証する |

`freeze_allowed = schema_valid ∧ findings=0 ∧ unresolved_items=0 ∧ every_selected_question_has_current_authoritative_answer`
