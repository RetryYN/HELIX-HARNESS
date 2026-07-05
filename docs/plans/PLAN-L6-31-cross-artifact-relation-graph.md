---
plan_id: PLAN-L6-31-cross-artifact-relation-graph
title: "PLAN-L6-31 (add-design): cross-artifact relation graph and verification profile projection"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: codex-intra-runtime-review
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "PLAN-L6-31 close: L6 module-drift relation graph contracts, L7 U-RELGRAPH oracles, PLAN-L7-32/36 implementation spans, and REVERSE-32 back-fill are present; doctor/review-evidence green."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
agent_slots:
  - role: tl
    slot_label: "TL - relation graph / DB projection design"
generates:
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-00-master.md
  requires:
    - docs/plans/PLAN-L6-00-master.md
    - .helix/audit/A-124-cross-artifact-graph-tooling.md
    - .helix/audit/A-125-mcp-external-verification-profile-scope.md
    - docs/plans/PLAN-REVERSE-31-codex-l7-overstep.md
---

# PLAN-L6-31 (add-design): cross-artifact relation graph と verification profile projection

## §0 位置付け

この PLAN は A-124 / A-125 implementation に対応する正規の L6 entry である。function-level design、unit oracle、DB projection contract なしに relation graph source work が始まらないようにする。

## §1 Scope

次の function contract を設計する。

- docs / source / tests / PLAN / audit / evidence から normalized row へ cross-artifact graph projection する。
- changed files から affected FR / PLAN / design / test / DB table / diagram node へ impact expansion する。
- Mermaid first の diagram export contract を定義し、DOT / D2 は optional adapter とする。
- relation graph signal と既存 A-125 profile catalog を使って verification profile recommendation を行う。
- `.helix/evidence/verification-profiles/*.json` を DB projection row へ取り込む evidence collector contract を定義する。

## §2 Inputs

- Requirements §6.8.8 / §6.8.9 / §6.8.10.
- L5 physical-data §9.5 / §9.6.
- ADR-002 A-124 / A-125 addenda.
- IMP-118..125.
- Existing `src/lint/verification-profile.ts` first slice.

## §3 Function contract draft 草案

| function | contract |
|---|---|
| `analyzeRelationImpact` | changed files を graph nodes、dependency edges、impacted nodes、required actions、missing graph evidence findings へ変換する |
| `collectRelationGraphProjection` | repository docs/source/tests/PLAN/audit/evidence を rebuildable projection rows へ変換する |
| `exportRelationDiagram` | graph snapshot -> Mermaid text。optional DOT/D2 adapter は install 済みでなければ disabled とする |
| `collectVerificationEvidenceProjection` | saved verification evidence を `verification_profiles`、`verification_recommendations`、`mcp_server_runs`、`external_tool_findings` rows へ変換する |

## §4 Test design 方針

Unit oracle は次を cover する。

- Source file change が sibling test、L6 design、graph impact row を recommend する。
- DB projection doc change が affected DB table と upstream docs を surface する。
- MCP / verification evidence file は raw secret や provider transcript を保存せず、projection row へ normalize される。
- Diagram export は audit/handover 用の stable Mermaid を emit する。
- graph projection 欠落は silent pass ではなく finding を生成する。

## §5 Workflow guard 方針

この PLAN が次を持つまで、`src/lint/relation-graph.ts`、DB collector、graph CLI implementation は authorize しない。

- L7 unit test design の pair artifact coverage。
- L7 implementation PLAN の TDD Red entry。
- lower-layer discovery に対する Reverse pairing。

## §8 DoD

- [x] L6 function signature を document 済み。
- [x] U-* unit oracle を L7 unit test design へ追加済み。
- [x] DB projection rebuild 用の L8 integration GWT row を追加済み。
- [x] L7 implementation PLAN references this PLAN.
- [x] governance change 向けの Reverse fullback PLAN が存在する。

Status は `confirmed`。design/test-design coverage が存在し、PLAN-L7-32/36 implementation span は confirmed で、review evidence も記録済みである。追加の relation graph expansion は専用の L7/Reverse PLAN 配下に残す。
