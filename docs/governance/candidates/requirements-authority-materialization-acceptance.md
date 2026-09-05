---
canonical_vmodel: L1-L12
candidate_layer: L10
canonical_pair: L3
title: "要求・要件authority materialization gate受入設計"
layer: L10
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-05
owner: QA / Codex TL
plan: PLAN-L3-79-requirements-authority-materialization-gate
parent_design: docs/governance/candidates/requirements-authority-materialization-requirements.md
pair_artifact: docs/governance/candidates/requirements-authority-materialization-requirements.md
---

# 要求・要件authority materialization gate受入設計

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `RAMG-AC-001` | RAMG-R-01 | authority declarationがexactly one | 0件／複数指定を拒否 |
| `RAMG-AC-002` | RAMG-R-02 | sourceからIRまでの状態を別field保持 | Issue stateだけでmaterialized扱いしない |
| `RAMG-AC-003` | RAMG-R-03 | candidateはnon-authoritative | candidateからcurrent output生成を拒否 |
| `RAMG-AC-004` | RAMG-R-04 | runtime PLANがsource path/revision/digest/approval/main SHAを提示 | いずれか欠落を拒否 |
| `RAMG-AC-005` | RAMG-R-05 | Issue-only behaviorのruntime着手を停止 | commentやunmerged branchで通さない |
| `RAMG-AC-006` | RAMG-R-06 | IRはsource authorityの一方向投影 | Issue proseからsemantic record生成を拒否 |
| `RAMG-AC-007` | RAMG-R-07 | stale sourceとpartial traceを別failure化 | stale digestをcurrentとして再利用しない |
| `RAMG-AC-008` | RAMG-R-08 | #1292が複合Capability自身のauthorityを要求 | 構成要素coverageで相殺しない |
| `RAMG-AC-009` | RAMG-R-09 | #1318の前段進行とRSTDD-07 dependencyを分離 | Issue全体の過剰block／後段依存漏れを拒否 |
| `RAMG-AC-010` | RAMG-R-10 | Issueからruntime consumerまでstable join | owner不明、二重owner、到達不能を拒否 |
| `RAMG-AC-011` | RAMG-R-11 | 全対象がexactly-one disposition | 未分類、複数分類、件数だけの相殺を拒否 |
| `RAMG-AC-012` | RAMG-R-12 | PR高速検査とscheduled全数監査を分離 | PRごとの全件live走査とscheduled省略を拒否 |

| RAMG-AC-013 | RAMG-R-13 | semantic consumerがcanonical Requirement IR JSONだけを読む | confirmed Markdown、DB、generated viewによるdual authorityを拒否 |
| RAMG-AC-014 | RAMG-R-14 | auto-admissionとhuman freezeを別state／receiptで保持 | AI auto_admitだけでfrozen遷移や下流解放を行わない |

14 oracleを独立failure classとして保持し、単一happy pathで相殺しない。
