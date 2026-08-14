---
title: "AI判断proposal／commit authority分離 基本設計"
layer: L4
kind: add-design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
pair_artifact: docs/test-design/helix/L9-ai-decision-proposal-authority-system-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# AI判断proposal／commit authority分離 基本設計

## §1 component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `AiDecisionProposalValidator` | 判断chain、fallback、reassessment、measurement oracleをstrict検証する | read-only proposal | 欠落、stale oracle、参照不整合 |
| `AiAuthorityBoundary` | AI actionをproposal-onlyへ制限する | authority 0 | 自己承認、権限昇格、high-impact、direct write |
| `CommitVerifierBoundary` | proposalをcommit前の待機stateで止める | 後続Node verifierだけがcommit可能 | verifier迂回、committed自己申告 |

本sliceはUWJ-FR-009/010、UWJ-AC-009/010だけを所有する。switching、routing、allocationの
実行選択は後続Issueへ渡し、DB／Git／GitHub writerを追加しない。

## §2 system不変条件

- factsからproposed next stateまでの判断chainを任意に省略できない。
- scored proposalとfallbackはenabled candidateを参照する。
- policy failure、blocking unresolved、stale/incomplete measurement oracleを実行可能にしない。
- AIは要求freeze、permission、high-impact action、gate pass、DB／Git／GitHub commitを要求できない。

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
