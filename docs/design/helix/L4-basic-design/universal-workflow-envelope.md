---
title: "Universal Workflow envelope 基本設計"
layer: L4
kind: add-design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
plan: docs/plans/PLAN-L4-53-universal-workflow-envelope.md
pair_artifact: docs/test-design/helix/L4-universal-workflow-envelope-system-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# Universal Workflow envelope 基本設計

## §1 component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `WorkflowAtomBoundary` | 15種atomとstable IDを受理する | schema-valid proposalのみ | unknown kind、欠落、重複ID |
| `WorkflowEnvelopeAdmission` | workflow、unresolved、derived、coverage、contractの5出力を同一sourceへ束縛する | activation receiptのみ | version/digest/coverage drift |
| `RuntimeCompositionBoundary` | workflow schemaとruntime orchestration schemaを分離してcompositionする | Node admissionのみ | 旧schema単体、fallback/dead-letter欠落 |
| `WorkflowTracePort` | transitionを後続requirement/compilerへ渡す | read-only typed port | orphan/stale revision |

AI、外部worker、adapterはproposalを生成できるが、activation、freeze、DB/Git/GitHub writeを持たない。
本sliceはschema admissionだけを所有し、interview、derived compiler、AI proposal、allocationは#185〜#188へ渡す。

## §2 stateと境界

`received → schema_valid → semantically_bound → activation_allowed`だけを許可する。schema不適合、
source digest不一致、blocking unresolved、required atom欠落、runtime composition不成立は
`rejected`へ遷移し、自動fallbackでgreenにしない。

## §3 設計リファクタリング

既存`src/workflow`のpure contract styleとZodを再利用する。新DB table、service、CLI、worker、dependencyは追加しない。
後続4責務は同じenvelopeをconsumerとし、別schemaを作らない。
