---
title: "Luna native spawn admission機能設計"
layer: L6
artifact_type: function-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
authority: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
plan: docs/plans/PLAN-L7-640-luna-native-spawn-admission.md
pair_artifact: docs/test-design/helix/L8-luna-native-spawn-admission-unit-test-design.md
github_issue_id: 624
behavior_contract_id: CODEX-NATIVE-WORKER-SPAWN-001
responsibility_owner: codex-native-spawn-admission
---

# Luna native spawn admission機能設計

## 責務

Codex native `spawn_agent`の実payloadに合わせ、存在しない`agent_type`を必須にせず、
version／digest検証済みpolicyから`model=gpt-5.6-luna`かつ`reasoning_effort=xhigh`を再導出し、
同じpairと具体的task本文を持つ単体spawnだけを許可する。caller入力は要求値でありpolicy正本ではない。

## fail-close境界

- Sol、Terra、その他model、effort欠落／相違を拒否する。
- policy version相違、digest drift、schema外fieldを拒否する。
- task本文欠落、未知の`agent_type`、bulk spawnを拒否する。
- `agent_type`がsurfaceから省略されても、許可されたmodel／effort pairをnative worker identityとする。
- Claude `Agent`のrole／family／delegation brief契約は変更しない。

## 非対象

spawn後receiptへの実model／effort／policy digest再投影と長期lane schedulingは後続sliceで扱う。
