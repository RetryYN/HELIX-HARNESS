---
title: "Workflow interview／unresolved 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
---

# Workflow interview／unresolved 詳細設計

## §1 question contract

schema versionは`helix-workflow-interview.v1`、question catalog versionは`uwj-question-catalog.v1`とする。
coreは`core.workflow`を常時選択する。conditional signalは
`approval/amount/deadline/external_integration/pii/attachment/notification/automation/ai_judgment/
multi_actor/return/retry/delete/publication/billing`のexact 15種で、`true`のsignalだけ対応questionを選択する。

## §2 answer／unresolved contract

answerは`question_id`、`value`、`source_digest`、`source_revision`、`question_version`、
`authority`、`source_span`を持つ。authorityは`owner/delegated/unknown`とし、`unknown`は
`authority_missing`へ投影する。同一questionの異なる回答は`contradiction`、未回答・曖昧明示・
stale bindingは`ambiguity`、branch gapは`branch_missing`とする。

## §3 fail-close

空source、unknown field/version、非該当questionへの回答、質問履歴欠落をschemaまたはsemantic findingにし、
`freeze_allowed=false`とする。engineは補完、質問追加の推測、永続化、外部dispatchを行わない。
