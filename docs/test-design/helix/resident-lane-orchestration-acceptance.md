---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "常駐マルチランタイム・レーン オーケストレーション受入設計"
layer: L10
kind: add-design
status: draft
created: 2026-09-01
updated: 2026-09-01
owner: QA / Codex TL
plan: PLAN-L3-75-resident-lane-orchestration-authority
parent_design: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
pair_artifact: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
---

# 常駐マルチランタイム・レーン オーケストレーション受入設計

## 受入authority

Issue #819、#826、#859の決定をL3の`RLO-INV-001..009`、`RLO-FR-001..040`、
`RLO-NFR-001..008`から検証する。Issue本文、provider session、通知本文を要件正本として使わない。

## Exact acceptance set

| Acceptance | 主な対象 | Oracle |
|---|---|---|
| `RLO-AC-001`〜`RLO-AC-006` | scope authority／branch／lease | Issue/PLAN欠落・併記、branch欠落、二重writer、二active branchを個別拒否 |
| `RLO-AC-007`〜`RLO-AC-010` | worker scope | foreign branch、main push、scope外path、subagent direct PRを拒否 |
| `RLO-AC-011`〜`RLO-AC-015` | independent review | exact HEAD、blind review、元worker返却、stale receipt、wrong CI generationを検証 |
| `RLO-AC-016`〜`RLO-AC-020` | recovery | lease expiry、new fence、restart replay、optional provider、lane-local failureを検証 |
| `RLO-AC-021`〜`RLO-AC-023` | WIP/backpressure | worker=2、review inventory=2のbounded制御を検証 |
| `RLO-AC-024`〜`RLO-AC-026` | multi-HEAD | lane別HEAD/checkpointとmain/candidate authority分離を検証 |
| `RLO-AC-027`〜`RLO-AC-030` | runtime/model policy | resident/native/CLI混同、Luna権限昇格、Terra silent fallback、Cursor model/effort receipt欠落を拒否 |

## Requirement IR acceptance projection

| AC ID | 対応 Requirement | 入力／操作 | 合格条件 | Negative mutation |
|---|---|---|---|---|
| `RLO-AC-027` | `RLO-FR-037` | 同一runへresident lane、native subagent、CLI workerのidentity候補を与える | exactly oneのexecution identityと親lane参照を保持する | 同一runを複数execution identityへ同時分類したら拒否する |
| `RLO-AC-028` | `RLO-FR-038` | Sol親からLunaへbounded taskを委譲しTerra fallback候補を混入する | Lunaは親scope／branch／budgetだけを継承しterminal／review／merge authorityを持たない | Lunaの権限昇格、Solのnative worker化、Terra silent fallbackを拒否する |
| `RLO-AC-029` | `RLO-FR-039` | Cursor Cloud runへtask classとmodel tierを指定する | requested/effective model、availability、response、HEAD、usage、charged costを別fieldでread-afterする | wrong tier、model field同一化、HEAD／usage／cost欠落を拒否する |
| `RLO-AC-030` | `RLO-FR-040` | HELIX-Bench evidenceが無いtask classのeffortを解決する | `provider_default_unbenchmarked`を記録しauthorityを変更しない | effortを推測しscore単独でscope／branch／assignment／merge authorityを変更したら拒否する |

## Negative oracle

- IssueとPLANの二重正本を許可するmutation。
- branchなし、同一branch二重writer、stale fence、foreign candidate HEADを許可するmutation。
- native subagentをresident laneとして数え、独立PRまたはmerge authorityを与えるmutation。
- Cursorのrequested modelとeffective modelを同一fieldへ潰すmutation。
- unbenchmarked effortを`xhigh`等へ推測し、provider fallbackを無記録にするmutation。
- Claudeのchanges requestedを元worker・同branch以外へ返すmutation。
- provider sessionまたはnotification本文をassignment authorityへ昇格するmutation。

## Freeze条件

本書とL3要件をconfirmedへ昇格するには、人間POのL3 approval record、exact-HEAD独立レビュー、
CI、doctor、DB convergenceが必要である。runtime、schema、DB current outputはfreeze後のchild PRで追加する。
