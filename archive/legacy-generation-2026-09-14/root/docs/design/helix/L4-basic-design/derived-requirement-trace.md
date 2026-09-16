---
title: "Derived requirement trace 基本設計"
layer: L4
kind: add-design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-559-derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L9-derived-requirement-trace-system-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
---

# Derived requirement trace 基本設計

## §1 component境界

| component | 責務 | authority | failure |
|---|---|---|---|
| `DerivedRequirementCompiler` | admitted transitionからFR/AC/testと8派生系統を決定的に起草する | candidate proposalのみ | transition欠落、source envelope不適合 |
| `BidirectionalTraceValidator` | forward artifactとtransition単位reverse indexをexact照合する | pure validation | orphan、片方向edge、cardinality差 |
| `CanonicalPairProjector` | obligationをL1〜L12と正規6 pairへexactly-once配置する | current revision/snapshotのみ | 重複、欠落、別revision/oracle |
| layer gate | 各派生候補を個別設計でconfirmed/rejectedへ遷移させる | 対応layer authority | compilerによる先行confirmed |

compilerはDB/Git/GitHub write、要求freeze、派生候補のconfirmed化を行わない。business flow、screen flow、
API、data、permission、notification、audit、test scenarioの8種を同一transitionから生成する。

## §2 L4/L9境界

L4では派生componentと外部境界をcandidateとして構成し、L9は全componentが同一
`source_transition_id`、revision、snapshotへ戻ることをsystem oracleで検証する。画面/API/dataだけを
先にconfirmedへ上げる入力はfail-closeする。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "derived-requirement-trace-compiler",
      "classification": "existing_runtime",
      "artifact_path": "src/workflow/derived-requirement-trace.ts",
      "resource_kind": "typescript_export",
      "resource_name": "compileDerivedRequirementTrace",
      "source_digest": "sha256:fc5b8eddb4afb0c372d874db4d3a3f949b762aa1881d892f3bfa1d85203132f7",
      "current_authority": true
    },
    {
      "asset_id": "derived-requirement-trace-validator",
      "classification": "existing_runtime",
      "artifact_path": "src/workflow/derived-requirement-trace.ts",
      "resource_kind": "typescript_export",
      "resource_name": "validateDerivedRequirementTrace",
      "source_digest": "sha256:fc5b8eddb4afb0c372d874db4d3a3f949b762aa1881d892f3bfa1d85203132f7",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
