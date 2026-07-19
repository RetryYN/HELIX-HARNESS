---
plan_id: PLAN-L7-263-version-up-dry-run-fail-on-blocked
title: "PLAN-L7-263: version-up dry-run fail-on-blocked gate"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "version-up dry-run の CLI exit policy を強化する小変更。L3 機能意味と mode 境界は既存 version-up 設計を維持する。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "explorer - version-up dry-run exit policy"
  - role: tl
    slot_label: "TL - CLI/test/doc implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-263-version-up-dry-run-fail-on-blocked.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/version-up.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/cli.ts
    - tests/version-up-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T18:30:00+09:00"
    tests_green_at: "2026-07-03T18:30:00+09:00"
    verdict: approve
    scope: "version-up dry-run の既定 no-write evidence exit と scripted gate 用 fail-on-blocked exit を分離した。承認前 activation matrix の ok=false evidence は壊さない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T18:30:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:f4a27bbebe3767bd51b9780789a30878ee552a5bf01b82b23bf332485a538e5d"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T18:30:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
---

# PLAN-L7-263: version-up dry-run の fail-on-blocked gate

## 目的

`helix version-up dry-run --json` は承認前の no-write evidence surface として、`ok=false` でも JSON を返す。
一方、CI や release gate が process exit だけを見る場合、`ok=false` を成功扱いに読み飛ばす危険がある。

この PLAN は、既定の evidence 収集挙動を壊さず、scripted gate が明示的に `ok=false` を non-zero exit にできる
`--fail-on-blocked` を追加する。

## 変更

- `helix version-up dry-run` に `--fail-on-blocked` を追加する。
- JSON / text のどちらでも、出力後に `plan.ok=false` を exit 1 に昇格する。
- 既定の `--json` は従来どおり exit 0 を保ち、activation verification matrix の no-write evidence を壊さない。
- CLI test で、blocked plan は flag 付きで exit 1、ready plan は flag 付きでも exit 0 になることを固定する。
- version-up mode doc と L7 unit test design に、evidence surface と process-status gate の分離を明記する。

## 境界

- version-up activation / external infra / GitHub release / package tag 更新は実行しない。
- activation verification matrix の既定 command 文字列は変更しない。
- `PLAN-M-02` の rename/cutover、`.helix` から HELIX への実 state move は扱わない。

## 完了条件

- `--fail-on-blocked` 付き dry-run が `ok=false` JSON を出して exit 1 になる。
- `ok=true` の dry-run は同 flag 付きでも exit 0 になる。
- 既定の dry-run は `ok=false` evidence を exit 0 で返し続ける。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
