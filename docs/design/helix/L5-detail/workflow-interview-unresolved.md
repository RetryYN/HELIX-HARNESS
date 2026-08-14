---
title: "Workflow interview／unresolved 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/test-design/helix/L8-workflow-interview-unresolved-detail-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
---

# Workflow interview／unresolved 詳細設計

## §1 質問契約

schema versionは`helix-workflow-interview.v1`、question catalog versionは`uwj-question-catalog.v1`とする。
coreは`core.workflow`を常時選択する。conditional signalは
15種の識別子 `approval/amount/deadline/external_integration/pii/attachment/notification/automation/ai_judgment/
multi_actor/return/retry/delete/publication/billing`のexact 15種で、`true`のsignalだけ対応questionを選択する。

## §2 回答・未解決契約

answerは`question_id`、`value`、`source_digest`、`source_revision`、`question_version`、
`authority`、`source_span`を持つ。authorityは`owner/delegated/unknown`とし、`unknown`は
`authority_missing`へ投影する。同一questionの異なる回答は`contradiction`、未回答・曖昧明示・
stale bindingは`ambiguity`、branch gapは`branch_missing`とする。

## §3 fail-close境界

空source、unknown field/version、非該当questionへの回答、質問履歴欠落をschemaまたはsemantic findingにし、
`freeze_allowed=false`とする。engineは補完、質問追加の推測、永続化、外部dispatchを行わない。

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
