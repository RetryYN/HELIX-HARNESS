---
title: "専門agent registry基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: SE
plan: docs/plans/PLAN-L4-54-specialist-agent-registry.md
pair_artifact: docs/test-design/helix/L4-specialist-agent-registry-system-test-design.md
related_l3: docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
---

# 専門agent registry基本設計

## §1 component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `SpecialistRegistryLoader` | versioned entryとdefinition digestを読込 | read-only | schema、source、digest不一致 |
| `SpecialistAdmission` | runtime allowlistとdefinitionをexact照合 | proposal-only | 未登録launch、重複ID |
| `SpecialistTeamSelector` | drive/capability/verification axisからteamを選択 | proposal-only | worker/verifier欠落、同provider縮退 |
| Claude/Codex adapter | 選択済みteamを既存adapterへ渡す | 各runtime guard | registryを迂回した起動 |

registryは新しいmode、drive、model familyを定義しない。既存の5 drive、agent guard allowlist、
model SSoT、role judgmentを束ねる。

## §2 authority

loaderとselectorはDB、Git、GitHub、agent processを変更しない。起動authorityは既存adapterとguardに残す。
registry不適合時は候補を返さず、外部runtimeへfallbackしない。

## §3 state

`loaded → definition_bound → allowlist_bound → team_proposed`だけを許可する。
definition、allowlist、必要verification axisが変われば既存proposalをstale化し、再選定する。

## §4 設計リファクタリング

既存`resolveRosterCapability`、`agent-model-ssot`、agent guard policyを置換しない。
versioned registryと横断admissionだけを追加し、provider固有runnerや新DB tableを作らない。
