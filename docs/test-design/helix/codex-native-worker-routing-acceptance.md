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
plan: PLAN-L3-64-codex-native-worker-project-hook-authority
pair_artifact: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
---

# HELIX L10 受入テスト設計 — Codex native worker routing

## §0 合否境界

Lunaという文字列の存在だけで合格にしない。policy-derived routing、`xhigh`、authority分離、旧identity退役、
Sol handback、Claude独立reviewが同じcandidate HEADとreceiptへ束縛されることを検証する。

本書は#624全体のtarget acceptanceを定義する。PLAN-L3-63のrequirements authority sliceが機械検証するのは、
`CNW-FR-001`、`CNW-R-01..08`、`CNW-AC-001..013`のexact set、Requirement IR source projection、digest、
L3↔L10 pairである。runtime behaviorの成立は下表の後続実装sliceで検証し、requirements本文の文字列一致を
behavioral acceptanceのpassへ読み替えない。

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
| `CNW-AC-009` | `CNW-R-06` | SessionStart／doctor／status／dispatchのhook identityを取得する | project root、HEAD、hooks、guard、policyのdigest exact setが全surfaceで一致する | いずれかの欠落、別root、別digestを拒否する |
| `CNW-AC-010` | `CNW-R-06` | hook実行rootとloader／source解決rootを比較する | physical repository identityまで一致する | lexical pathだけ同じ、symlink先または別worktree loaderを拒否する |
| `CNW-AC-011` | `CNW-R-07` | stale primary rootとcurrent assignment worktreeを同時に与える | assignment rootだけをauthorityとして評価する | primary shared treeへの暗黙fallbackを拒否する |
| `CNW-AC-012` | `CNW-R-07` | root／HEAD／digestを一件ずつstaleまたはforeignへ変異する | `project_hook_source_stale_or_foreign`でfail-closeする | foreign dirty treeの自動更新・reset・checkoutを拒否する |
| `CNW-AC-013` | `CNW-R-08` | terminal review result後にmemory wake hookをtimeoutさせる | typed timeoutを記録しつつresult、session、HEAD、verdictを保持する | result消失、無期限hang、raw bypassでの成功化を拒否する |

## §1.1 現sliceの被覆状態

| acceptance | PLAN-L3-63での被覆 | behavioral owner |
|---|---|---|
| `CNW-AC-001` | requirement／IR projectionのみ | Sol subagent route停止slice |
| `CNW-AC-002` | requirement／IR projectionのみ | `PLAN-L7-638`、`PLAN-L7-639` |
| `CNW-AC-003` | requirement／IR projectionのみ | actor receipt／authority slice |
| `CNW-AC-004` | requirement／IR projectionのみ | `PLAN-L7-640`＋policy provenance receipt slice |
| `CNW-AC-005` | requirement／IR projectionのみ | policy provenance receipt／DB slice |
| `CNW-AC-006` | requirement／IR projectionのみ | `PLAN-L7-639`＋Sol route停止slice |
| `CNW-AC-007` | requirement／IR projectionのみ | Sol handback／candidate HEAD slice |
| `CNW-AC-008` | requirement／IR projectionのみ | actor receipt／Claude exact-HEAD admission slice |
| `CNW-AC-009` | requirement／IR projectionのみ | project hook identity contract／surface projection slice |
| `CNW-AC-010` | requirement／IR projectionのみ | physical root／loader identity slice |
| `CNW-AC-011` | requirement／IR projectionのみ | Assignment＋worktree authority接続slice |
| `CNW-AC-012` | requirement／IR projectionのみ | stale／foreign fail-close、doctor slice |
| `CNW-AC-013` | requirement／IR projectionのみ | bounded hook lifecycle／result preservation slice |

## §2 量閉じ

- behavior contract: `CNW-FR-001` exactly 1件。
- supporting requirements: `CNW-R-01`〜`CNW-R-08` exact 8件。
- acceptance: `CNW-AC-001`〜`CNW-AC-013` exact 13件。
