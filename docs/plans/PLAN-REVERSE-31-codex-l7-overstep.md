---
plan_id: PLAN-REVERSE-31-codex-l7-overstep
title: "PLAN-REVERSE-31 (reverse): Codex L7 overstep recovery fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "unapproved L7 source work を Recovery + Reverse fullback へ戻す規律を requirements §6.8.8 へ記録した。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "この Reverse は process/governance gap の補正であり、L4 runtime / module / external interface は変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "source implementation は撤去済みで、L5 物理データ・内部処理 schema は変更しない。"
  - layer: process
    decision: updated
    evidence_path: docs/process/modes/recovery.md
    reason: "Recovery mode application log に PLAN-RECOVERY-03 の route を戻した。"
  - layer: backlog
    decision: updated
    evidence_path: docs/improvement-backlog.md
    reason: "IMP-125 と関連する再発防止項目を backlog に登録した。"
agent_slots:
  - role: tl
    slot_label: "TL - Recovery fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-31-codex-l7-overstep.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/recovery.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-RECOVERY-03-codex-l7-overstep.md
  requires:
    - docs/plans/PLAN-RECOVERY-03-codex-l7-overstep.md
    - .helix/audit/A-124-cross-artifact-graph-tooling.md
    - .helix/audit/A-125-mcp-external-verification-profile-scope.md
review_evidence:
  - reviewer: PO/directive
    review_kind: human
    tests_green_at: "2026-06-09T00:00:00+09:00"
    reviewed_at: "2026-06-09T00:00:00+09:00"
    verdict: approve
    scope: "User directed Recovery and Reverse fullback for the Codex L7 overstep; this PLAN records the back-propagation route."
---

# PLAN-REVERSE-31 (reverse): Codex L7 overstep recovery fullback（是正 fullback）

## §0 Position

これは PLAN-RECOVERY-03 の Reverse fullback である。観測事実は product feature ではない。Codex が L6/L7 entry なしで relation graph scope の source implementation を開始したため、source file は撤去済みである。残作業は process gap を上位 governance layer へ戻すことである。

## §1 R0 Evidence

| evidence | content |
|---|---|
| User correction | "Recovery 起票" and "リバースでちゃんと戻して" directed the route back to the official workflow. |
| Overstep artifact | `src/lint/relation-graph.ts` は L6/L7 entry なしで追加され、その後撤去された。 |
| Existing intended scope | A-124 / IMP-118..120 は relation graph と diagram tooling を future L6/L7 scope として既に分類している。 |

## §2 R1 Observed Gap（観測 gap）

- 既存 §6.8.8 は lower-layer discoveries の back-propagate を要求していたが、**unapproved L7 source work** を Recovery + Reverse case として明示していなかった。
- そのため agent が active goal を L7 implementation へ踏み込む許可として扱えてしまった。

## §3 R2 Alignment

正しい design alignment は次の通りである。

- Recovery は agent overstep と reopen point を扱う。
- Reverse fullback は process rule を requirements / backlog / recovery workflow に記録する。
- A-124 relation graph は future L6/L7 work のままであり、この Reverse は source implementation を認可しない。

## §4 R3 Intent

Intent は維持される。user は狭い status note ではなく、process gap を official route で戻すことを要求している。したがって、この Reverse は rule を記録し、Recovery が local note のまま残ることを防ぐ。

## §5 R4 Routing

| target | action |
|---|---|
| `docs/governance/helix-harness-requirements_v1.2.md` §6.8.8 | unapproved L7 source-work handling を Recovery + Reverse fullback として追加する。 |
| `docs/improvement-backlog.md` | future doctor / plan-lint guard として IMP-125 を登録する。 |
| `docs/process/modes/recovery.md` | application log に PLAN-RECOVERY-03 を confirmed Recovery として登録する。 |

## §8 DoD

- [x] Recovery record が存在し、correction routing として confirmed になっている。
- [x] Requirements に unapproved L7 handling rule が含まれている。
- [x] Backlog に guard implementation item が含まれている。
- [x] Recovery mode application log が PLAN-RECOVERY-03 を参照している。
- [x] この Reverse は source implementation を導入しない。
