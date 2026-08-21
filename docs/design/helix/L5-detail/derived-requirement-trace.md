---
title: "Derived requirement trace 詳細設計"
layer: L5
kind: add-design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L7-559-derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-detail-unit-test-design.md
---

# Derived requirement trace 詳細設計

## §1 graph契約

graphはworkflow ID、source revision、source snapshotをrootに持つ。各artifactはstable
`artifact_id`、`source_transition_id`、`source_revision`、`source_snapshot`、`oracle_id`を保持する。
transitionごとにFR、AC、test scenarioを各1件以上、8派生系統を各exactly-one生成する。

reverse traceはtransitionごとにforward artifact IDのexact setを持つ。片edge、余分なartifact、orphan、
別revision/snapshotを補正せずfindingへ変換する。派生系統はcompiler出力時に必ず`candidate`である。

## §2 L5/L8とcanonical pair

transition obligationごとにL1〜L12 placementを各1件だけ持つ。canonical edge集合は
`L1↔L12`、`L3↔L10`、`L2↔L11`、`L4↔L9`、`L5↔L8`、`L6↔L7`であり、各edgeを1件だけ持つ。全placementとedgeは
同じrevision、snapshot、oracleへbindする。L8はcardinalityとmutation反例を局所検証する。

## §3 旧HELIX source audit

旧HELIX `RetryYN/ai-dev-kit-vscode` の`add-feature-workflow.md`は、追加要求→設計→実装→テストと
設計⇔テストの双方向traceを要求するが、transition単位FR/AC/test、8派生系統、stable ID、revision、
canonical L1〜L12 pairの機械contractは持たない。工程順と双方向traceの意図だけを採用し、
廃止済みcompatibility物理層やMarkdown運用を実行authorityとしてimportしない。

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
