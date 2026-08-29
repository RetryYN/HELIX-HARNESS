---
title: "Claude native memory隔離機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: SE / TL
plan: docs/plans/PLAN-RECOVERY-67-claude-native-memory-isolation.md
pair_artifact: docs/test-design/helix/L8-claude-native-memory-isolation-unit-test-design.md
---

# Claude native memory隔離機能設計

## §1 DbC

| 関数 | 事前条件 | 事後条件 | 失敗 | oracle |
|---|---|---|---|---|
| `loadProjectHookDocs` | project Claude settingsが読める | project settings document集合 | settings欠落／read failure | U-PNCM-001 |
| `loadClaudeAgentDocs` | `.claude/agents`がrepository内にある | agent definition exact set | directory／file read failure | U-PNCM-002 |
| `analyzeProjectHooks` | settingsとagent docs | native memory authorityが隔離されたlint result | auto memory未無効化、active agent memory宣言 | U-PNCM-001..003 |
| consumer settings projection | setup template生成 | `autoMemoryEnabled:false` | template drift | U-PNCM-004 |

## §2 invariant

- `autoMemoryEnabled === false`と、agent frontmatterに`memory: project|user|local`が無いことを独立検査する。
- prose中の非activeな`memory: project`例をfrontmatter宣言と誤認しない。
- native hooksはHELIX policy adapterとして保持し、memory隔離を理由にhook防御層を撤去しない。
- provider全体のeffective configuration attestationは#1172へ委譲し、本Recoveryで別Coreを作らない。

## §3 失敗証拠

設定欠落とagent宣言は別failure classとして返す。consumer template、doctor、current repositoryのいずれかだけがgreenでも、
他surfaceのfailureを相殺しない。
