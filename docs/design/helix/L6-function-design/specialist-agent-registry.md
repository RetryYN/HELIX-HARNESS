---
title: "専門agent registry機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: SE
plan: docs/plans/PLAN-L6-84-specialist-agent-registry.md
pair_artifact: docs/test-design/helix/L8-specialist-agent-registry-unit-test-design.md
---

# 専門agent registry機能設計

## §1 DbC

| 関数 | 事前条件 | 事後条件 | 失敗 | oracle |
|---|---|---|---|---|
| `loadSpecialistAgentRegistry` | repository root | typed registryまたはfinding | file/schema/digest/allowlist/model class drift | U-SAREG-001 |
| `analyzeSpecialistAgentRegistry` | untrusted registryと実digest | side effectなしのadmission | duplicate、source、launch、model SSoT不整合 | U-SAREG-002、U-SAREG-005 |
| `selectSpecialistTeam` | admitted registryとteam request | worker＋独立verifier exact set | capability/axis/independence欠落 | U-SAREG-003、U-SAREG-004 |

## §2 invariant

- loaderとselectorはprocess起動、write、fallback補正をしない。
- workerとverifierのauthorityを兼任させない。
- provider family独立性をmodel名の文字列類似で推測しない。
- selection orderはstable `agent_id`順とする。

## §3 complexity

既存Zod、agent guard allowlist、repository file digestを再利用する。registry loader、pure analyzer、
pure selector以外のservice／DB／CLIを追加しない。

## §4 検証oracle

| oracle | 契約 |
|---|---|
| `U-SAREG-001` | repository registry、definition digest、allowlistのexact binding |
| `U-SAREG-002` | definition digest driftの起動拒否 |
| `U-SAREG-003` | drive/capabilityからworkerとcross-provider verifierを決定 |
| `U-SAREG-004` | 独立verifier欠落をfail-close |
| `U-SAREG-005` | provider familyの`MODEL_IDS`にないmodel classをfail-close |
