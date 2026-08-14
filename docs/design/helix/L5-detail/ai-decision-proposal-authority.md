---
title: "AI判断proposal／commit authority分離 詳細設計"
layer: L5
kind: add-design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/test-design/helix/L8-ai-decision-proposal-authority-detail-test-design.md
related_l4: docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md
---

# AI判断proposal／commit authority分離 詳細設計

## §1 proposal契約

schema versionは`helix-ai-decision-proposal.v1`とする。facts、candidates、policy constraints、
採点済み提案、確信度、反証、未解決、次状態案、fallback、再評価、measurement oracle、
authorityをstrict objectとして要求する。score/confidenceは0〜1、
candidate参照はenabled集合へ閉じる。

## §2 authority契約

authorityは`actor=ai`、`mode=proposal_only`だけを許す。`requirements_freeze`、
`permission_grant`、`high_impact_action`、`gate_pass`、`db_commit`、`git_commit`、
`github_commit`をstable finding `authority_escalation_forbidden`で拒否する。

## §3 実行可能性境界

全policy pass、blocking unresolved 0、measurement oracle current、L10〜L12の9 metric完備、
`proposed_next_state=awaiting_commit_verifier`のときだけproposalをvalidとする。validはcommit許可ではない。
旧HELIXのdeterministic auto-fix分類はbehavior atomとして採取するが、Python writerや対話applyは移植しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "ai-decision-proposal-validator",
      "classification": "existing_runtime",
      "artifact_path": "src/workflow/ai-decision-proposal.ts",
      "resource_kind": "typescript_export",
      "resource_name": "validateAiDecisionProposal",
      "source_digest": "sha256:7d053294bb710b428c7fbe692e4aecc96e248d69c4c0200b0afc33a6d2d3a2c0",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
