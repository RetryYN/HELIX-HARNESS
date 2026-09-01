---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "三社固定レーン・Cursor Cloud資源分散・GitHub監査受入設計"
layer: L10
kind: redesign
status: draft
created: 2026-09-02
updated: 2026-09-02
owner: QA / Codex TL
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
pair_artifact: docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md
---

# 三社固定レーン・Cursor Cloud資源分散・GitHub監査受入設計

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `3L-AC-001` | 3L-R-01 | 第一級laneがexact 3件 | Grok／Kimi／Composer／任意provider laneを拒否 |
| `3L-AC-002` | 3L-R-02 | requested／effective modelをlaneから分離 | model名をlane identityへ昇格したら拒否 |
| `3L-AC-003` | 3L-R-03 | Cursor停止がDEGRADED | optional扱いで不可視化しない |
| `3L-AC-004` | 3L-R-04 | Codexだけがcontrol authorityを発行 | Cursor／Claude発行を拒否 |
| `3L-AC-005` | 3L-R-05 | exactly-one scope＋専用branch＋budget | main／別branch／scope外writeを拒否 |
| `3L-AC-006` | 3L-R-06 | blind exact-HEAD reviewと同branch返却 | worker会話／旧HEAD receiptを拒否 |
| `3L-AC-007` | 3L-R-07 | 2 poolとbilling cycleを別field保持 | pool統合／週次換算を拒否 |
| `3L-AC-008` | 3L-R-07 | committed、reserve、burn、forecast、runwayを算出 | active run費用を無視しない |
| `3L-AC-009` | 3L-R-08 | usage不明はUNKNOWN | 0円／無制限へ推測しない |
| `3L-AC-010` | 3L-R-09 | 三資源を別軸投影 | 単一scoreへ畳み込まない |
| `3L-AC-011` | 3L-R-10 | deterministic dispatch理由をreceipt化 | LLMがbudget／branch authorityを変更しない |
| `3L-AC-012` | 3L-R-11 | WIP=2、条件付き3 | review在庫過多／未実測burstを拒否 |
| `3L-AC-013` | 3L-R-12 | policy bundle exact digest | scope／branch／budget欠落を拒否 |
| `3L-AC-014` | 3L-R-13 | cloud hook／environmentで規則強制 | promptだけの遵守claimを拒否 |
| `3L-AC-015` | 3L-R-14 | provider／GitHub外部read-after | worker自己HEAD／自己costを正本にしない |
| `3L-AC-016` | 3L-R-15 | deterministic gateをモデルが上書き不能 | AI PASSによるP0相殺を拒否 |
| `3L-AC-017` | 3L-R-16 | semantic findingがowner／route候補を持つ | auditorによるbranch直接修正を拒否 |
| `3L-AC-018` | 3L-R-17 | P0／P1／P2作用範囲を分離 | P2で無関係PRを止めない |
| `3L-AC-019` | 3L-R-18 | 7 GitHub task classを独立採点 | Critical missの平均相殺を拒否 |
| `3L-AC-020` | 3L-R-19 | qualification状態遷移を順守 | UNBENCHMARKEDからPASS権限へ飛ばさない |
| `3L-AC-021` | 3L-R-20 | 称号／資格／権限／roleを分離 | 称号だけでGitHub writeを許可しない |
| `3L-AC-022` | 3L-R-20 | model revision変更で再bench | 旧score／資格／称号を継承しない |
| `3L-AC-023` | 3L-R-21 | 7日で実task 5件以上 | 未使用でcycle survival成功にしない |
| `3L-AC-024` | 3L-R-22 | billing cycle末のread-after | run数だけで成功判定しない |

24 oracleを独立failure classとして保持し、単一happy pathで相殺しない。
