---
title: "HELIX L10 受入テスト設計 — Codex native worker routing"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: QA / Codex TL
plan: PLAN-L3-63-codex-native-worker-routing
pair_artifact: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
---

# HELIX L10 受入テスト設計 — Codex native worker routing

## §0 合否境界

Lunaという文字列の存在だけで合格にしない。policy-derived routing、`xhigh`、authority分離、旧identity退役、
Sol handback、Claude独立reviewが同じcandidate HEADとreceiptへ束縛されることを検証する。

## §1 oracle完全一致集合

| AC ID | 対応requirement | 入力／操作 | 合格条件 | negative mutation |
|---|---|---|---|---|
| `CNW-AC-001` | `CNW-R-01` | Sol親からbounded worker taskを投入する | Solはparent/TLのままLunaへ委譲する | Solをnative subagent候補へ追加したら拒否する |
| `CNW-AC-002` | `CNW-R-02` | current Codex worker policyを解決する | effective model=`gpt-5.6-luna`、effort=`xhigh`になる | Luna以外または`high`以下への置換を拒否する |
| `CNW-AC-003` | `CNW-R-02` | Luna receiptへauthorityを投影する | closing／merge／Issue close／independent reviewが全てfalseになる | いずれかをtrueにしたら拒否する |
| `CNW-AC-004` | `CNW-R-03` | policy由来spawnとcaller model指定spawnを比較する | policy由来Lunaだけを許可する | arbitrary direct model overrideを拒否する |
| `CNW-AC-005` | `CNW-R-03` | task、scope、worktree、policy digestを1件ずつ欠落させる | exact field setが揃う場合だけspawnする | unknown fieldや既定値で欠落を相殺しない |
| `CNW-AC-006` | `CNW-R-04` | current dispatch catalogとhistorical receiptを読む | Terra／Sol subagentはcurrent候補0、historical evidenceは保持される | Terra silent fallbackと履歴書換えを拒否する |
| `CNW-AC-007` | `CNW-R-05` | Luna proposalをSolへhandbackする | Solがdiff／test／scopeを再検証してcandidate HEADを確定する | worker completion claimだけのReady化を拒否する |
| `CNW-AC-008` | `CNW-R-05` | candidate HEADをClaude reviewへ渡す | parent／worker／reviewer identityとHEADが分離・一致する | 自己review、stale HEAD、identity混同を拒否する |

## §2 量閉じ

- behavior contract: `CNW-FR-001` exactly 1件。
- supporting requirements: `CNW-R-01`〜`CNW-R-05` exact 5件。
- acceptance: `CNW-AC-001`〜`CNW-AC-008` exact 8件。
