---
canonical_vmodel: L1-L12
canonical_layer: L8
canonical_pair: L5
title: "Claude native memory隔離の単体テスト設計"
layer: L8
status: confirmed
created: 2026-08-29
updated: 2026-08-29
owner: QA / TL
parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md
pair_artifact: docs/design/helix/L6-function-design/claude-native-memory-isolation.md
plan: PLAN-RECOVERY-67-claude-native-memory-isolation
---

# Claude native memory隔離の単体oracle

| Oracle | 対応要求 | 入力 | 期待結果 |
|---|---|---|---|
| U-PNCM-001 | HR-FR-P7-01 / HAC-P7-01b | `autoMemoryEnabled`欠落またはtrue | `native_memory_not_disabled`で拒否する |
| U-PNCM-002 | HR-FR-P7-01 / HAC-P7-01b | agent frontmatterの`memory: project/user/local` | `native_agent_memory_enabled`で拒否する |
| U-PNCM-003 | HR-FR-P7-01 / HAC-P7-01b | prose内だけの`memory: project`文字列 | active宣言と誤認せず通過する |
| U-PNCM-004 | HR-FR-P7-01 / HAC-P7-01b | consumer Claude settings template | `autoMemoryEnabled:false`を投影する |

設定fileの存在だけでgreenにせず、明示値とagent frontmatterを独立failure classとして検査する。
