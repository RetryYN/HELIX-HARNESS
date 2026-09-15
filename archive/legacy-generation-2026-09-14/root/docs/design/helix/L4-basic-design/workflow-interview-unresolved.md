---
title: "Workflow interview／unresolved 基本設計"
layer: L4
kind: add-design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/test-design/helix/L9-workflow-interview-unresolved-system-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# Workflow interview／unresolved 基本設計

## §1 component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `InterviewQuestionSelector` | core questionを常時、15 conditional questionを該当signal時だけ選択する | read-only proposal | 非該当質問の発火、unknown signal |
| `InterviewAnswerAdmission` | answerをsource digest／revision／question version／answer authorityへ束縛する | candidate answerのみ | stale answer、空source、authority不足 |
| `UnresolvedProjector` | ambiguity／contradiction／authority不足／branch欠落をsource spanと履歴付きで投影する | unresolved proposal | 推測確定、履歴・source欠落 |
| `WorkflowFreezeBoundary` | blocking unresolvedが0のときだけfreeze candidateを返す | Node gateが再検証 | AI自己承認、未解決の黙殺 |

本sliceは UWJ-FR-003/004 と UWJ-AC-003/004だけを所有する。derived compiler、AI proposal、
switching／routing／allocationは後続Issueへ渡し、DB/Git/GitHub writeを追加しない。

## §2 system不変条件

- question selectionは入力signalのpure projectionであり、回答内容からsignalを捏造しない。
- answerは同一source digest／revisionとcurrent question versionへ一致しなければ再利用しない。
- contradictionは複数回答を勝手に順位付けせず、全履歴をunresolvedへ残す。
- source span、質問履歴、answer authorityのいずれかを欠く未解決事項はfreezeを通さない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "workflow-interview-evaluator",
      "classification": "existing_runtime",
      "artifact_path": "src/workflow/workflow-interview-unresolved.ts",
      "resource_kind": "typescript_export",
      "resource_name": "evaluateWorkflowInterview",
      "source_digest": "sha256:9d8d674caf4ed7d916bd5affa3d047a2712da5ab5de1fa3927c27a95a7748fef",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
