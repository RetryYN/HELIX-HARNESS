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
  - artifact_path: src/runtime/summary-surface-audit.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/summary-surface-audit.test.ts
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
    - src/runtime/summary-surface-audit.ts
    - tests/completion-decision-packet.test.ts
    - tests/cli-surface.test.ts
    - tests/summary-surface-audit.test.ts
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T21:58:00+09:00"
    tests_green_at: "2026-07-09T21:57:15+09:00"
    verdict: approve
    scope: "Project closure review-bundle summary と transition-plan summary に current / previous / next window command と full_source_command を追加し、343 件の close_ready approval をページ単位で機械遷移できるようにした。承認 record の作成・適用は行わず、read-only summary と Project view summary catalog の command drift を固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T21:54:45+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:4a31005cb47391212444856a19b7f7f7e8334ca9c82986d7df6da7ee2d841126"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/cli-surface.test.ts tests/current-location.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:57:15+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:0b6de2430683ef12c9747e531721b7f3681e504c17c8fd34652403a908bb15e7"
      - kind: smoke
        command: "bun src/cli.ts closure review-bundle --action close_ready --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:54:45+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:34c9b7e8090382aea91c333190bdca5536399290773f34e2d090e7a173a6936e"
      - kind: smoke
        command: "bun src/cli.ts closure transition-plan --action close_ready --decision approve_closure_claim --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:54:45+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:566b303b5db7474c4f5d7d165e08787cdb63a113e458587f917507dbe2c553ab"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:55:20+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:4294cd33365b9fc983898b0f0f57bf4588aa740bbecb610fe03c5e61ab8041a4"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T21:43:01+09:00"
    tests_green_at: "2026-07-09T21:42:44+09:00"
    verdict: approve
    scope: "completion decision-packet summary を Project view summary catalog の機械検出 surface に追加し、review bundle への full JSON 導線を full_review_bundle_command として分類した。summary は承認正本を置き換えず、completion decision packet / review bundle / progress tree-view の導線だけを read-only で可視化する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T21:39:30+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:04e1dd1df3c3fd78fd687ccbd2a2581b341dfd5aba1d59d023df7f330d073baf"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:42:44+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:e3598db81c7d5e4e42dee2f9e3af817ef3f294932cde09c7fddab7b59972c082"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:39:58+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:9637af00b915e0e49d04d45d8d4748b7eccc22228067875cc1ac734034712b9d"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:42:44+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:da13d6d2a2b3e12f97219f5ee6e2d5c0de3112fa0c42d556d0b1ac86f66c10ce"
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T21:32:52+09:00"
    tests_green_at: "2026-07-09T21:32:52+09:00"
    verdict: approve
    scope: "`helix completion decision-packet --summary-json` を追加し、full JSON の承認材料を削らずに、status / completion claim 可否 / semantic frontier count / human decision blocker / scoped packet / required record / review bundle command を軽量に機械検出できるようにした。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T21:30:39+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7f65c03a377b3444fd84fd9e794eb7daa36cd9dd9c117f66b1deb0ea5e4e4807"
      - kind: smoke
        command: "bun src/cli.ts completion decision-packet --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:30:34+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:197366e0bd82d78462d34c47ccd04c7cf5d0c74efe37d78c0a95bc3ea4b12dc7"
      - kind: unit_test
        command: "bun run test:fast -- tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:32:49+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:1dbc970c064e9fc746bb3ccf8ba3f4f0061cfde102318ffcabaa26fd71847ea6"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-252-completion-human-review-bundle.md && bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:30:56+09:00"
        evidence_path: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
        output_digest: "sha256:96720d44cc5e071284f958232582418e400d270c37578e1e77e934ea415abd6c"
      - kind: lint
        command: "bunx biome check src/cli.ts tests/cli-surface.test.ts docs/test-design/harness/L7-unit-test-design.md docs/plans/PLAN-L7-252-completion-human-review-bundle.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:30:56+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:d583fc2c3cbc4a19b6e19ddb05e5057b3539b3df9762bd9f1ad9ea5fa3f32295"
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
- 追補として `helix completion decision-packet --summary-json` を追加し、full JSON を開かずに
  status、completion claim 可否、semantic frontier count、human decision blocker、decision ごとの
  scoped packet / required record / review bundle command を機械検出できるようにする。
  summary は正本承認材料を置き換えず、`full_source_command=helix completion decision-packet --json` を持つ。
- Project view summary catalog は `completion-decision-packet` surface を監査対象に含め、
  `completion review-bundle` への導線は `full_review_bundle_command` として明示的に full JSON 参照へ分類する。
- `closure review-bundle --summary-json` は `current_window_command` / `previous_window_command` /
  `next_window_command` / `transition_window_command` を持ち、close_ready approval のページングを offset
  手計算ではなく機械 command として辿れるようにする。full JSON 導線は `full_source_command` に限定する。

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
