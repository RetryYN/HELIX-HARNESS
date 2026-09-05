---
canonical_vmodel: L1-L12
candidate_layer: L10
canonical_pair: L3
title: "三社固定レーン・Cursor Cloud資源分散・GitHub監査受入設計"
layer: L10
kind: redesign
status: draft_candidate
created: 2026-09-02
updated: 2026-09-05
owner: QA / Codex TL
plan: PLAN-L3-78-three-lane-cloud-governance-authority
parent_design: docs/governance/candidates/three-lane-cloud-governance-requirements.md
pair_artifact: docs/governance/candidates/three-lane-cloud-governance-requirements.md
---

# 三社固定レーン・Cursor Cloud資源分散・GitHub監査受入設計

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `3L-AC-001` | 3L-R-01 | 第一級laneがexact 3件 | Grok／Kimi／Composer／任意provider laneを拒否 |
| `3L-AC-002` | 3L-R-02 | requested／effective modelをlaneから分離 | model名をlane identityへ昇格したら拒否 |
| `3L-AC-003` | 3L-R-03 | Cursor停止がDEGRADED | optional扱いで不可視化しない |
| `3L-AC-004` | 3L-R-04 | Codexだけがcontrol authorityを発行 | Cursor／Claude発行を拒否 |
| `3L-AC-005` | 3L-R-05 | exactly-one scope＋HELIXによるprovider起動前のbranch事前発行＋budget | 未発行のまま起動、providerの事後発行、main／別branch／scope外writeを個別に拒否 |
| `3L-AC-006` | 3L-R-06 | blind exact-HEAD reviewと同branch返却 | worker会話／旧HEAD receiptを拒否 |
| `3L-AC-007` | 3L-R-07 | 2 poolとbilling cycleを別field保持 | pool統合／週次換算を拒否 |
| `3L-AC-008` | 3L-R-07 | committed、reserve、burn、forecast、runwayを算出 | active run費用を無視しない |
| `3L-AC-009` | 3L-R-08 | usage不明はUNKNOWN | 0円／無制限へ推測しない |
| `3L-AC-010` | 3L-R-09 | 三資源を別軸投影 | 単一scoreへ畳み込まない |
| `3L-AC-011` | 3L-R-10 | deterministic dispatch理由をreceipt化 | LLMがbudget／branch authorityを変更しない |
| `3L-AC-012` | 3L-R-11 | WIP=2、条件付き3 | review在庫過多／未実測burstを拒否 |
| `3L-AC-013` | 3L-R-12 | policy bundle exact digest | scope／branch／budget欠落を拒否 |
| `3L-AC-014` | 3L-R-13 | cloud hook／environmentで規則強制 | promptだけの遵守claimを拒否 |
| `3L-AC-015` | 3L-R-14 | 起動後・成果回収時のowner／assignment／candidate HEADを外部再取得し、当該assignmentの正当なHEAD進行を受理 | owner交代、別branch、帰属不能HEAD、worker自己HEAD／自己costを個別に拒否。前段検査成功で相殺しない |
| `3L-AC-016` | 3L-R-15 | deterministic gateをモデルが上書き不能 | AI PASSによるP0相殺を拒否 |
| `3L-AC-017` | 3L-R-16 | semantic findingがowner／route候補を持つ | auditorによるbranch直接修正を拒否 |
| `3L-AC-018` | 3L-R-17 | P0／P1／P2作用範囲を分離 | P2で無関係PRを止めない |
| `3L-AC-019` | 3L-R-18 | 7 GitHub task classを独立採点 | Critical missの平均相殺を拒否 |
| `3L-AC-020` | 3L-R-19 | qualification状態遷移を順守 | UNBENCHMARKEDからPASS権限へ飛ばさない |
| `3L-AC-021` | 3L-R-20 | 称号／資格／権限／roleを分離 | 称号だけでGitHub writeを許可しない |
| `3L-AC-022` | 3L-R-20 | model revision変更で再bench | 旧score／資格／称号を継承しない |
| `3L-AC-023` | 3L-R-21 | 7日で実task 5件以上 | 未使用でcycle survival成功にしない |
| `3L-AC-024` | 3L-R-22 | billing cycle末のread-after | run数だけで成功判定しない |

| `3L-AC-025` | 3L-R-23 | 同時dispatchの競合試験で同一branchのwriterが1件だけ成立し、異なるbranchの正当な並列実行は許可 | 同一branchの2件目、期限切れ後の遅延write、所有返却前の再配車を個別に拒否。v0.3 RLO-AC-004の検出能力を維持 |
| `3L-AC-026` | 3L-R-24 | 起動直前の外部owner／assignment／base HEAD照合が一致した場合だけproviderを起動 | owner不明・owner不一致・stale HEADの各反例でprovider起動0回。後段成功による相殺を拒否 |
| `3L-AC-027` | 3L-R-25 | Phase Aの旧assignment終端と遅延write不能を確認し、Phase Bのlease／fence対応を検証してからdispatch再開 | 未終端worker残存、旧token再利用、A/B二重writer、移行証拠欠落を個別に拒否 |

27 oracleを独立failure classとして保持し、単一happy pathで相殺しない。候補文書の対応確認と、実runtimeの競合・遅延write試験成功は別の証拠として扱う。
