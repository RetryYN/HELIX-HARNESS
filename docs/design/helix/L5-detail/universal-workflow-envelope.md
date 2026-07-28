---
title: "Universal Workflow envelope 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
plan: docs/plans/PLAN-L5-80-universal-workflow-envelope.md
pair_artifact: docs/test-design/helix/L5-universal-workflow-envelope-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/universal-workflow-envelope.md
---

# Universal Workflow envelope 詳細設計

## §1 version付きschema

- workflow: `helix-universal-workflow.v1`
- envelope: `helix-universal-workflow-envelope.v1`
- runtime composition: `helix-runtime-orchestration.v1`
- digest: `sha256:`＋lowercase 64 hex。source、workflow、runtimeでexact一致。
- unknown field/versionはstrict reject。

atomはtarget、actor、state、trigger、condition、action、transition、loop、terminal、exception、permission、
timeout、notification、audit、dataの15種。transitionと各補助atomの参照はstable IDで実在atomへ解決する。

## §2 不変条件

- atom IDは同一workflow revision内で一意。
- core atom `target/actor/state/transition/terminal`は必須。
- `covered_atom_kinds`は実atom kind exact set、`missing_atom_kinds=[]`だけがactivation候補。
- loopはreturn/continue/stop/max/on_limit、terminalはkind/state/post-update/notification/audit/restartableを持つ。
- dataはtype/required/validation/nullable/SSoT/mutable/sensitive/retentionを全て持つ。
- blocking unresolvedが1件でもあればactivationを拒否する。

## §3 失敗transaction

validatorはpure resultを返し、invalid入力を補正・推測・永続化しない。Node writerは`ok=true`かつ
`activation_allowed=true`を再検証するまでauthoritative writeを開始しない。
