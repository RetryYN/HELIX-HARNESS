---
plan_id: PLAN-L7-212-identifier-rename-audit
title: "PLAN-L7-212 (add-impl): HELIX identifier rename blast-radius audit"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
parent_design: docs/plans/PLAN-M-02-helix-identifier-rename.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:05:00+09:00"
    tests_green_at: "2026-07-01T02:05:00+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PLAN-M-02 Step 1 support: add a non-destructive identifier rename blast-radius audit for ut-tdd, .ut-tdd, and area=harness. The audit reports blocked_pending_cutover_approval until cutover_decision_record and action_binding_approval_record contain concrete approval values; it does not perform the irreversible .ut-tdd -> .helix state move."
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:05:00+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:568451756e51b3f99881210c3a17abedc2b5698e0e5cba17d577f09b68b5a296"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:05:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:09f7eccc760099c1b6a450f78dc9d03c8ce06d35da580e356670c89d22cbd3ca"
agent_slots:
  - role: tl
    slot_label: "TL — rename audit boundary and fail-close approval semantics"
generates:
  - artifact_path: docs/plans/PLAN-L7-212-identifier-rename-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-M-02-helix-identifier-rename
  requires:
    - PLAN-REVERSE-212-identifier-rename-audit
  references:
    - docs/plans/PLAN-M-02-helix-identifier-rename.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/helix/L6-pillar-unit-test-design.md
---

# PLAN-L7-212 (add-impl): HELIX identifier rename blast-radius audit

## §0 役割

`PLAN-M-02` の Step 1（blast-radius 再計測 + 改名表凍結）を機械化する。これは `.ut-tdd` を
`.helix` へ移す cutover apply ではない。state dir migration、CLI/bin rename、hook/adapter marker rename は
`PLAN-M-02` の cutover decision と action-binding approval が揃うまで blocked のまま扱う。

## §1 実装単位

| module | 内容 | oracle |
|--------|------|--------|
| `src/lint/identifier-rename.ts` | repo text files を走査し `ut-tdd` / `.ut-tdd` / `area=harness` の hit 数、file 数、path 一覧を返す。`PLAN-M-02` の approval record が draft placeholder のままなら `blocked_pending_cutover_approval` | identifier-rename tests |
| `src/cli.ts` | `ut-tdd rename audit --json` / text output を追加。apply は行わず、targetCli=`helix` / targetStateDir=`.helix` と requiredRecords を出す | identifier-rename CLI test |

## §2 DoD

- [x] `ut-tdd` / `.ut-tdd` / `area=harness` blast radius を JSON で出せる。
- [x] draft approval placeholder を concrete approval と誤判定しない。
- [x] `.ut-tdd -> .helix` apply は実行しない。
- [x] `tests/identifier-rename.test.ts` / typecheck / lint / doctor 対象。

## §3 carry

- `PLAN-M-02` Step 2 以降の codemod / state dir migration / adapter marker rewrite / docs sweep は未実行。
- cutover approval が入った後、同 audit の hit set を baseline として旧名残渣 0 を検証する。
