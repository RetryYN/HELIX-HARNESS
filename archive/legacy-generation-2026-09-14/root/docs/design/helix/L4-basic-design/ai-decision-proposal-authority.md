---
title: "AI判断proposal／commit authority分離 基本設計"
layer: L4
kind: add-design
status: confirmed
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
- AI actionは`propose_next_state`だけを許可し、未知actionを含むその他すべてを拒否する。

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
      "source_digest": "sha256:d2a52af5ab2678b7f32f4bf3a4145fccac6194e7f3f288cad3177544f36dcfdf",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
