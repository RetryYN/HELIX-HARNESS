---
title: "Effective Agent Startup consumer投影 L6機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1378-startup-consumer-projection.md
parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md
pair_artifact: docs/test-design/helix/L7-effective-startup-consumer-projection-unit-test-design.md
---

# Effective Agent Startup consumer投影

## 責務

Issue #1378の第一sliceとして、setupが生成する実効startup packetをsource-owned bytesからconsumerへ決定的に投影する。#895／#1672が所有するproject-hook resolver、physical identity、4-surface consumer wiringは再実装しない。本機能はそれらの入口を含むread order、hook surface、agent roster、capability guidanceをclean consumerへ運ぶsetup ownerである。

## 正規経路

```text
CONSUMER_STARTUP_AUTHORITY_TEMPLATE（source bytes）
  ↓ exact bytes
docs/templates/project/.helix/startup/effective-agent-startup.json（repository template）
  ↓ existing setup renderer
.helix/startup/effective-agent-startup.json（generated consumer）
  ↓
consumer artifact readiness / clean consumer smoke
```

三層は個別にSHA-256を採取し、完全一致しない場合は`source_template_generated_digest_mismatch`としてreadinessをfail-closeする。期待digestを固定値へ緩和して差分を相殺しない。

## Packet契約

- read orderは`requirements-ir/manifest.json`を先頭とし、その後にconsumer投影済み`AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md`を読む。
- hook surfaceは`.codex/hooks.json`と`.claude/settings.json`のexact setとする。hook実体のauthority判定は既存project-hook consumer wiringへ委譲する。
- rosterはsetupが実際に生成するClaude agent template setと順序を一致させる。
- capability stateは`active`、`degraded`、`blocked`のいずれかとする。
- `active`だけが非空guidanceを持ち、`active_guidance`から参照される。`degraded`／`blocked`は記録を消さず、guidance空集合かつactive参照なしとする。

## consumer実地検査

`planHelixProjectSetup`→`emitSetup`の実rendererでclean in-memory consumerを生成し、source／template／generated digest、read order、hook surface、roster、capability guidanceを同じproduction verifierで検査する。`buildConsumerArtifactReadinessPlan`も同verifierのreceiptを使い、packet欠落やdriftを`projected-consumer-artifacts`成立前に拒否する。

## 非対象

project-hook authority kernel、provider dispatch、assignment producer、legacy team engineの物理削除、Claude memory wake本体の修復、release/tag/cutoverは本sliceへ混載しない。`legacy_team_run`と`claude_memory_wake`は既知のblocked/degraded capabilityとしてpacketへ残すが、active guidanceへ昇格させない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "source_template_generated_digest_mismatch",
    "startup_read_order_invalid",
    "startup_hook_surfaces_invalid",
    "startup_roster_invalid",
    "blocked_or_degraded_capability_is_active_guidance"
  ],
  "assets": [
    "src/setup/index.ts",
    "src/setup/templates.ts",
    "src/doctor/index.ts",
    "docs/templates/project/.helix/startup/effective-agent-startup.json",
    "tests/setup.test.ts",
    "tests/doctor.test.ts"
  ],
  "failure_reachability": [
    { "failure_code": "source_template_generated_digest_mismatch", "oracle_id": "U-STARTUP-CONSUMER-003", "test_path": "tests/setup.test.ts" },
    { "failure_code": "startup_read_order_invalid", "oracle_id": "U-STARTUP-CONSUMER-003", "test_path": "tests/setup.test.ts" },
    { "failure_code": "startup_hook_surfaces_invalid", "oracle_id": "U-STARTUP-CONSUMER-003", "test_path": "tests/setup.test.ts" },
    { "failure_code": "startup_roster_invalid", "oracle_id": "U-STARTUP-CONSUMER-003", "test_path": "tests/setup.test.ts" },
    { "failure_code": "blocked_or_degraded_capability_is_active_guidance", "oracle_id": "U-STARTUP-CONSUMER-002", "test_path": "tests/setup.test.ts" }
  ]
}
```
