---
plan_id: PLAN-L7-327-relation-graph-node-scope
title: "PLAN-L7-327 (impl): relation graph node scope 補完"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-321 の completeness pass 欠落から切り出した relation graph loader の node scope 補完であり、新規 product requirement や上位設計の意味変更を追加しない。L6/L7 の関数契約と oracle 追跡は本 PLAN 内で更新済み。"
owner: Codex
parent_design: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - relation graph node scope 補完"
  - role: qa
    slot_label: "QA - loader fixture / real-repo stale-edge fence"
generates:
  - artifact_path: docs/plans/PLAN-L7-327-relation-graph-node-scope.md
    artifact_type: markdown_doc
  - artifact_path: src/graph/loader.ts
    artifact_type: source_module
  - artifact_path: src/lint/relation-graph.ts
    artifact_type: source_module
  - artifact_path: tests/relation-graph-loader.test.ts
    artifact_type: test_code
  - artifact_path: tests/relation-graph.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:44:18+09:00"
    tests_green_at: "2026-07-05T01:44:18+09:00"
    verdict: approve
    scope: "PLAN-L7-321 の residual gap のうち relation graph node 投影補完だけを独立実装した。ADR、document-system-map、docs/skills、Codex hooks を loader と impact scope に追加し、fixture と real-repo fence で missing-projection 回帰を固定した。物理 rename、PLAN-M-02 cutover は行っていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/relation-graph-loader.test.ts tests/relation-graph.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:44:18+09:00"
        evidence_path: tests/relation-graph-loader.test.ts
        output_digest: "sha256:0517e1419846dcb8d71e6eb2b3fe4ef9f2201ce6a6914797c776747fc55aeb51"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:44:18+09:00"
        evidence_path: src/graph/loader.ts
        output_digest: "sha256:59d40726254c5d3e1c2f82345fcb1d436148351da1951ab1d09119c046adedd8"
      - kind: doctor
        command: "./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:44:18+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:eff33be45091a0a9101d7423921f07662e3da3c4f243d6c825a73b8b514df268"
---

# PLAN-L7-327: relation graph node scope 補完

## 目的

上流突合 completeness pass で、ADR、document-system-map、root skill docs、Codex hook config が
relation graph の node scope に入っておらず、変更時に graph impact から漏れる余地が残っていた。

## スコープ

- `src/graph/loader.ts` で `docs/adr/**/*.md`、`docs/governance/document-system-map.md`、
  `docs/skills/**/*.md`、`.codex/hooks.json` を design node として materialize する。
- `src/lint/relation-graph.ts` の tracked path scope を loader と合わせる。
- `tests/relation-graph-loader.test.ts` の fixture と real-repo fence で representative path の
  missing-projection 回帰を固定する。
- `tests/relation-graph.test.ts` の対象外 path oracle を更新し、`docs/skills/**` は graph 対象として扱う。

## 対象外

- `.codex/hooks.json` の内容や hook parity は変更しない。
- `.ut-tdd` / `ut-tdd` の物理 rename、distribution cutover、remote apply は PLAN-M-02 承認まで行わない。

## 受入結果

- 対象追加 path は `design:<path>` node として projection される。
- 対象追加 path の変更は `missing-projection` ではなく changed node として扱われる。
- graph 対象へ昇格した `docs/skills/**` は node 欠落時に fail-close する。
