---
plan_id: PLAN-L7-252-completion-human-review-bundle
title: "PLAN-L7-252: completion decision packet の human review bundle"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "残 frontier の承認判断そのものは行わず、completion decision packet に人間レビュー用 bundle を追加する限定強化。L1/L3 の要求意味は変えない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-251-setup-idempotent-import-report.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - completion human review bundle"
generates:
  - artifact_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-251-setup-idempotent-import-report.md
  requires:
    - src/lint/outstanding.ts
    - src/lint/completion-decision-packet.ts
    - src/cli.ts
    - tests/completion-decision-packet.test.ts
    - tests/cli-surface.test.ts
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T12:53:01+09:00"
    tests_green_at: "2026-07-03T12:53:01+09:00"
    verdict: approve
    scope: "completion decision packet に humanReviewBundle を追加し、残 4 frontier の scoped packet / runnable scoped packet / supporting packet / required record / review route を一括で確認できるようにした。bundle 欠落や decision item との drift は invalid_human_review_bundle として fail-close し、承認・不可逆 cutover 自体は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe"
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:0b7ad7003b9e95c2fe9f640978f4a530ec1bec91f79e4a7658ef0f294c2fe8b2"
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:8952aea665ace8faf2645786b2b4f5b77bbb5536c49a4291f8128c2db424cb20"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:439d8fa3ee727a5bae416fab2cc0d132f1e14d170a49472ed5935e2f4361416d"
      - kind: smoke
        command: "bun run src/cli.ts completion decision-packet --json; bun run src/cli.ts completion decision-packet | rg \"human-review-(bundle|item)\""
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:afaa6cda43c8416acf199d2b09d27ce42e52446d19c919e8b220250669b1e1bf"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T12:50:43+09:00"
        evidence_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
        output_digest: "sha256:c31541548a310106e71e4c31e898d3087d3d74f948d751f5f2b92f720664c805"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T12:51:39+09:00"
        evidence_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
        output_digest: "sha256:36ba37e8416820656d23a59bcfa1191a4187fe932c78ea3ee1cf8bfd225ea0d9"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:53:01+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:1d83b7bbb83238047a73534989ac249752f117cea802e2f3fd15e27acf8a52f5"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T12:53:01+09:00"
        evidence_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
        output_digest: "sha256:e3e8f44c5f94f3ad855f04a1882a673e38c30d06a6bb99599d32d8f3a422aeaf"
---

# PLAN-L7-252: completion decision packet の human review bundle

## 目的

active objective は 90% まで進んでいるが、残 frontier は PO/S4 判断、version-up activation、
action-binding approval、PLAN-M-02 cutover signoff によって意図的に止まっている。
既存の `workflowNextActions[]` と dedicated packet は十分に構造化されている一方、承認者が
`completion decision-packet` だけを見たときに、4 frontier の scoped packet / runnable scoped packet /
必須 record / review route を一覧で確認する bundle は無かった。

この PLAN では、承認や不可逆 migration を実行せず、completion packet に判断材料の束ねを追加して、
PO が対象 PLAN や packet command を推測する workflow 穴を塞ぐ。

## 変更

- `CompletionDecisionPacket` に `humanReviewBundle` を追加する。
- bundle は schema、status、sourceCommand、generatedAt、decisionCount、nextAuthority、
  completionClaimAllowed、各 decision の order / planId / decisionKind / scoped primary packet /
  runnable scoped packet / supporting scoped packet / 必須 record / review route を持つ。
- `analyzeCompletionDecisionPacket` は bundle 欠落、top-level metadata drift、各 decision との command /
  record / route drift を `invalid_human_review_bundle` として fail-close する。
- `helix completion decision-packet` text output は `human-review-bundle:` と `human-review-item:` を出す。
- L6/L7 docs と unit/CLI test に bundle 契約を追加する。

## 採用判断

- 採用: 既存 `completion decision-packet` に追加 field と text 行を足す。
- 採用: bundle は derived view として生成し、decision item と drift したら lint で落とす。
- 不採用: 新しい承認 apply command を作る。承認・不可逆 cutover は PLAN-M-02 / action-binding の人間判断待ちであり、今回も実行しない。
- 不採用: 各 dedicated packet を completion packet 内へ丸ごと埋め込む。循環依存と巨大 JSON 化を避け、scoped command と review field への導線に留める。

## 完了条件

- `helix completion decision-packet --json` が `humanReviewBundle.schemaVersion=completion-decision-human-review-bundle.v1` を返す。
- bundle が decision item と異なる scoped command / required record / review route を持つと lint violation になる。
- text mode が `human-review-bundle:` / `human-review-item:` を返す。
- targeted unit / CLI surface / typecheck / design-language / plan lint / db rebuild / doctor が green。
