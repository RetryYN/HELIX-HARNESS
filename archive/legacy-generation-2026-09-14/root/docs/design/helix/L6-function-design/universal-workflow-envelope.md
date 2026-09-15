---
title: "Universal Workflow envelope 機能設計"
layer: L6
sub_doc: function-spec
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
plan: docs/plans/PLAN-L6-83-universal-workflow-envelope.md
pair_artifact: docs/test-design/helix/L8-universal-workflow-envelope-unit-test-design.md
---

# Universal Workflow envelope 機能設計

`validateUniversalWorkflowEnvelope(input: unknown) => UniversalWorkflowEnvelopeValidation`

| DbC | 契約 |
|---|---|
| pre | inputはuntrusted unknownであり、caller側検証済みを仮定しない |
| post | valid時だけtyped envelopeを返し、invalid時は`envelope=null` |
| invariant | schema補正、推測、write、dispatch、fallback実行を行わない |
| failure | schema、参照、coverage、digest、unresolved、runtime composition不備をfindingへ変換する |
| oracle | `U-UWENV-001`〜`U-UWENV-005`でcomplete/negative compositionを反証する |

`activation_allowed`はschema valid、semantic finding 0、blocking unresolved 0、coverage欠落0、
source/workflow/runtime digest一致の論理積である。
