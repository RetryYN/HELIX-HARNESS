---
plan_id: PLAN-L6-33-tool-adapter-probes
title: "PLAN-L6-33 (add-design): graph and diagram tool adapter probes"
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
    scope: "PLAN-L6-33 close: tool adapter setup/announce scope, U-TOOLADAPTER oracles, PLAN-L7-34 implementation entry, and REVERSE-34 back-fill are present; doctor/review-evidence green."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
agent_slots:
  - role: tl
    slot_label: "TL - tool adapter probe design"
generates:
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-31-cross-artifact-relation-graph.md
  requires:
    - .helix/audit/A-124-cross-artifact-graph-tooling.md
    - docs/research/cross-artifact-graph-tooling-research-2026-06-09.md
---

# PLAN-L6-33 (add-design): graph / diagram tool adapter probes（tool adapter probe 設計）

## §0 位置づけ

この PLAN は optional dependency / diagram tool adapter probe の L6 entry である。core の TypeScript/Bun relation graph collector を置き換えない。

> **スコープ改訂 (2026-06-10 PO 決定、IMP-131)**: tool adapter (dependency-cruiser / Knip / Madge / Graphviz DOT / Mermaid / D2) は **gate truth でない insight 系** (A-124「raw 出力を gate truth にしない」) のため、**harness core の profile カタログとしてモデル化しない**。代わりに **`helix setup graph-tools [--with ...]` の一括セットアップ + layer-context アナウンス**へ降格する。これにより adapter ごとの probe/normalize/findings/優先順位を core に持たず、保守表面積を削減する。Madge⊂dependency-cruiser の重複や 3 図化レンダラ (Mermaid/DOT/D2) の選択は `--with` のユーザー選択に吸収され、カタログ優先順位を維持する必要が消える。**MCP / verification profile (playwright / testcontainers / github-mcp / msw / mcp-inspector / vitest-browser) は別扱い = マストツール系**として profile + 機械着地を維持する (V-model gate を支える検証であり gate truth になるため、setup+announce へ降格しない)。本 PLAN の §1-§4 は下記のとおり setup/announce 設計へ読み替える。

## §1 スコープ

**改訂後 (IMP-131)**: `helix setup graph-tools` セットアップコマンド (冪等、`--with` で dependency-cruiser/knip/madge/graphviz/mermaid/d2 から選択導入、生成 config は git 秘匿の外 = §6.8.10 安全則踏襲) と、layer-context が関連 V-model 工程で導入手順をアナウンスする設計。adapter 出力の DB 正規化は「project が setup で opt-in した時のみ薄く配線」とし、未導入を前提に gate を組まない。

> 旧スコープ (改訂前、参考): dependency-cruiser / Knip / Madge / Graphviz DOT / Mermaid / D2 を adapter catalog/probe/normalization/stale diagram refresh として profile 設計。→ IMP-131 で setup+announce へ置換。

## §2 Contracts（契約）

function contract は `module-drift.md` の "Tool Adapter Probe Addendum" に記録する:

- `catalogToolAdapters`
- `probeToolAdapter`
- `normalizeToolAdapterRun`
- `planDiagramRefresh`

## §3 Test Design（テスト設計）

L7 pair artifact は U-TOOLADAPTER-001..010 を追加する。

## §5 Guard（ガード）

この PLAN 単体では、package installation、source implementation、external command execution は承認されない。L7 では PLAN-L7-34 TDD Red と PLAN-REVERSE-34 を必須にする。

## §8 DoD

- [x] L6 function contract は、IMP-131 scope revision 後の setup/announce design として記録されている。
- [x] U-TOOLADAPTER unit oracle は L7 unit test design に追加されている。
- [x] L7 implementation PLAN はこの PLAN を参照し、confirmed である。
- [x] implementation back-fill 用の Reverse pairing PLAN が存在する。

status は `confirmed` である。optional adapter execution は引き続き out of scope であり、後続 workflow evidence による明示 enablement が必要である。
