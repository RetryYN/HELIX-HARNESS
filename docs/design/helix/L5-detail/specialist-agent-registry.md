---
title: "専門agent registry詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: SE
plan: docs/plans/PLAN-L5-81-specialist-agent-registry.md
pair_artifact: docs/test-design/helix/L5-specialist-agent-registry-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/specialist-agent-registry.md
---

# 専門agent registry詳細設計

## §1 entryのschema

entryは`agent_id`、runtime、launch ID、role、worker/verifier authority、drive、capability、
model class、verification axis、definition source/digest、allowlist sourceを持つ。
unknown field、重複ID、空集合、runtimeとallowlist sourceの不一致を拒否する。
5つのspecialist driveは、それぞれ少なくとも1件のworker entryを持たなければならない。

## §2 sourceのbinding

definition digestはrepository fileのraw byte SHA-256へ束縛する。Claude launch IDは
`SUBAGENT_ALLOWLIST`、Codex launch IDは`CODEX_AGENT_TYPE_ALLOWLIST`へexact照合する。
model classはruntime別の`MODEL_IDS` keyへexact照合する。
definition pathはPOSIX repository-relative形式だけを受理し、絶対path、空segment、`.`、`..`、
backslash、NULを読込前に拒否する。frontmatterやallowlistから存在しないcapabilityを推測しない。

## §3 selection

workerはdrive一致かつrequired capability全件を持つentryからstable `agent_id`順で選ぶ。
各verification axisは同driveのverifierから選び、workerとruntime familyが異なることを必須にする。
一つのverifierが複数axisを持つ場合は重複召集しない。

## §4 failure

registry不正、definition drift、launch不許可、worker欠落、verifier欠落、独立性欠落は全て
`ok=false`とし、部分teamを起動可能として返さない。
