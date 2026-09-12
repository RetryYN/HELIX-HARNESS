---
title: "三社レーン動的capacity profile受入候補"
status: draft_candidate
authority_status: pending_canonical_promotion
version: "0.5.0-candidate"
candidate_layer: L10
owner_issue: 1358
plan_id: PLAN-L3-1358-three-lane-capacity-profile-v05
parent_design: docs/governance/candidates/three-lane-capacity-profile-requirements.md
pair_artifact: docs/governance/candidates/three-lane-capacity-profile-requirements.md
---

# 三社レーン動的capacity profile受入候補

| AC | Requirement | 合格条件 | Negative oracle |
|---|---|---|---|
| `3L-AC-028` | 3L-R-26 | pool登録上限、active WIP、review在庫、merge在庫、8-slot能力上限を別fieldで再生できる | 合算lane数、登録数による稼働claim、8-slot常時起動を拒否 |
| `3L-AC-029` | 3L-R-27 | Codex／Cursor定常3・burst 5、Claude定常2のprofileとCodex control reserveを保持する | control reserve枯渇、同一PRへの既定二重review、provider間のcapacity代用を拒否 |
| `3L-AC-030` | 3L-R-28 | downstream capacityからactive WIPとbackpressure理由を決定的に導出する | queue過多、CI／merge詰まり、budget不足時の上限までの盲目的dispatchを拒否 |
| `3L-AC-031` | 3L-R-29 | Cursor 1→2→3とburst 4→5の各遷移に実案件・費用・品質・回復証拠があり、Claude第3枠はtyped threshold時だけ起動する | 一件成功から5へ飛ぶ、未測定burst、review以外がボトルネックの第3reviewer起動を拒否 |
| `3L-AC-032` | 3L-R-30 | generationごとにreview leaseが1件だけ成立し、差戻し後もassignment lineageを追跡できる | 同一generation二重lease、差戻し時の別assignment化、owner不明reworkを拒否 |
| `3L-AC-033` | 3L-R-31 | JIT同期後の変更HEADを再reviewし、競合解消のownerと結果を追跡できる | stale receipt、reviewerによるworker branch修正、同値性未証明carry-forwardを拒否 |

6 oracleは別failure classとして保持し、単一happy pathや総throughputで相殺しない。
