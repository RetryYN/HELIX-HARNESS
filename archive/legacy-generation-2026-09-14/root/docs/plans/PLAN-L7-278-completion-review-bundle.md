---
plan_id: PLAN-L7-278-completion-review-bundle
title: "PLAN-L7-278: completion review-bundle と判断前レビュー束"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion claim 前のレビュー束を非破壊に追加する L7 実装。D-API/D-DB、実 rename、approval 記録、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: tests/outstanding.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - completion authority boundary review"
  - role: qa
    slot_label: "QA - review bundle contract review"
generates:
  - artifact_path: docs/plans/PLAN-L7-278-completion-review-bundle.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/workflow-decision-packets.ts
    artifact_type: source_module
  - artifact_path: src/lint/doc-consistency.ts
    artifact_type: source_module
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doc-consistency.test.ts
    artifact_type: test_code
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:27:00+09:00"
    tests_green_at: "2026-07-03T19:27:00+09:00"
    verdict: approve
    scope: "Continuation: HELIX project setup の初回稼働契約へ `completion review-bundle` と `semanticBundleDigest` を明示し、L3/L6 設計・doc-consistency gate・setup readiness を同期した。consumer readiness は bare `helix --version` と packageRoot `package.json.scripts.helix` の両方が揃う場合だけ ready に進み、片方だけなら `fix_consumer_readiness` に戻る。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/doc-consistency.test.ts tests/setup.test.ts tests/outstanding.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:27:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:bb85ed8d8676bad46cae90af6519b2e8178aa3e3e5b8b989e5bdfc285b8b5a2d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:30:00+09:00"
    tests_green_at: "2026-07-03T19:30:00+09:00"
    verdict: approve
    scope: "`helix completion review-bundle --json` を非判断・非適用のレビュー束として追加し、completion decision packet、S4、version-up、rename、action-binding の supporting packet を scoped command と digest 付きで束ねる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:30:00+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:3d8fbbd5b7208ab9117ad627dfd4f1c1d9fd2b3f7788d857657c29bca4950b8c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:30:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T18:37:00+09:00"
    tests_green_at: "2026-07-03T18:37:00+09:00"
    verdict: approve
    scope: "Continuation: `bundleDigest` を exact artifact integrity として維持し、`semanticBundleDigest` を追加して generatedAt / freshness 由来の揺れを正規化する。意味が同じ review bundle を再生成比較できるようにしつつ、freshness 検査と exact digest drift fail-close は残す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T18:37:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:0b566a7bc27258a101c526217066aa2566ff051e9b04de66651052457e860a81"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T18:37:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7ade77e1ebf2a9c6b15e1b9f66b38f8f239b539d3c2418d3e7865b826722f811"
      - kind: unit_test
        command: "bun run test -- --reporter=dot"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T18:37:00+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:d1ca83003f322001e3216a90daa1396309eac135aa4f8ebec828d63dcc75a34b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T18:46:00+09:00"
    tests_green_at: "2026-07-03T18:46:00+09:00"
    verdict: approve
    scope: "Continuation: `semanticBundleDigest` を doctor OK message、HELIX project setup verification matrix、consumer adapter prose に伝播し、導入先でも exact digest と semantic digest を両方確認できるようにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts tests/doctor.test.ts tests/completion-decision-packet.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T18:46:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:2c9cba54f41f569cd6563592b0b65cc8de211a6292186874a5ac8b6aa6ca86e7"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T18:46:00+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:7ade77e1ebf2a9c6b15e1b9f66b38f8f239b539d3c2418d3e7865b826722f811"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:11:00+09:00"
    tests_green_at: "2026-07-03T19:11:00+09:00"
    verdict: approve
    scope: "Continuation: version-up activation supporting packet の matrix count を実体 10 phase に固定し、missing / extra / duplicate phase を fail-close する。setup、consumer doctor、distribution acceptance は completion review-bundle の semanticBundleDigest を必須証跡として扱う。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/completion-decision-packet.test.ts tests/outstanding.test.ts tests/setup.test.ts tests/doctor.test.ts tests/cli-surface.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:06:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:b6ee321e62a00baf4d616e5cc5002c478463e3f572b0575d5078c6f5b03c8a55"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:06:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:7fe46027fd2ca1afcd0dff4577391b7ea89e4cd5a8a8558fa9c0881846b671ab"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:06:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7ade77e1ebf2a9c6b15e1b9f66b38f8f239b539d3c2418d3e7865b826722f811"
      - kind: unit_test
        command: "bun run test -- --reporter=dot"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:11:00+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:38e73b08a4643789ec646e972a123dc8badcb0ea0ed938a639c46861d48593c8"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T19:11:00+09:00"
        evidence_path: docs/plans/PLAN-L7-278-completion-review-bundle.md
        output_digest: "sha256:895696698e3696b28b15184b68dab032b93ff868e1c850907e6c98be1fc4f15d"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild --json"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:11:00+09:00"
        evidence_path: src/state-db/index.ts
        output_digest: "sha256:59535b7e9a5976a382fbb7d56579c222700a0b3afe639686901527f163716eca"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:11:00+09:00"
        evidence_path: docs/plans/PLAN-L7-278-completion-review-bundle.md
        output_digest: "sha256:55f27525e40a08e4588ddd0c33a78ba187c877da915359709471003ff3944368"
---

# PLAN-L7-278: completion review-bundle と判断前レビュー束

## 目的

`completion decision-packet` は完了可否の判断項目と human review item を出せる。一方で、S4 判断、version-up activation、rename cutover、action-binding approval の各 supporting packet を「人間判断前に再生成して照合する束」として一括提示する surface が不足していた。

この PLAN では、`helix completion review-bundle --json` を追加し、完了主張前に確認すべき非破壊 packet、scoped command、安全 field、matrix field、digest を 1 つの束で提示する。判断、承認、適用、state move は行わない。

## 要件

- `completion-review-bundle.v1` は `planOnly=true`、`mustNotDecide=true`、`mustNotApply=true` を固定する。
- `completion-review-bundle.v1` は `sourceCommand` と `runnableSourceCommand` を両方持ち、repo-local 再生成 command を reviewer が JSON/text から辿れる。
- `completionClaimAllowed`、`humanDecisionRequired`、`nextAuthority`、`blockedUntil` は `outstanding.completionReadiness` と `completion decision-packet` から派生する。
- `reviewPackets` は各 decision の supporting packet を PLAN scoped command と runnable command 付きで列挙する。
- rename plan review packet は `planOnly` / `mustNotApply` / `applyAuthorized` を safety field として保持し、不可逆 cutover 前レビューの安全境界が空にならない。
- S4、version-up、rename plan、rename approval-draft、action-binding approval の matrix / safety field が欠けないことをテストで固定する。
- `status --json` / `handover status --json` は `completionReviewBundle` を additive に返す。
- text surface は `completion-review-bundle: helix completion review-bundle --json` を表示する。
- `completion-review-bundle` は doctor hard gate で `completion decision-packet` と突き合わせ、safety flag、scoped packet、review packet count、digest drift を fail-close する。
- `helix setup project` の初回導入 contract、VS Code task、consumer CI、escalation workflow、consumer doctor first-run matrix は `completion decision-packet` の直後に `completion review-bundle` を必須証跡として含める。
- `.helix/state/project-setup.json` の `objectiveBoundary` は `completionReviewBundleCommand=helix completion review-bundle --json` を永続化し、consumer doctor は欠落を fail-close する。
- `bundleDigest` は exact artifact integrity digest として生成時刻・freshness を含む。別に `semanticBundleDigest` を出し、`generatedAt` / `expiresAt` / `stale` と時刻入り nested digest を正規化した意味比較用 digest とする。
- doctor OK message、setup verification matrix、consumer adapter prose は `semanticBundleDigest` も表示・期待し、導入先で exact digest だけを保存して意味比較 digest を落とさない。
- version-up activation supporting packet summary は現行 `activationVerificationCommandMatrix` の 10 phase と一致させ、validator は matrix count、missing phase、extra phase、duplicate phase を fail-close する。
- version-up activation packet text surface は activation snapshot に `versionDryRunDigest` を表示し、dry-run 証跡 digest を人間判断前に照合できるようにする。
- distribution acceptance は clean consumer harness-check workflow 内で `completion review-bundle --json` を実行し、`semanticBundleDigest` を検証する。
- 実 cutover、approval 記録、activation、外部実行は行わない。

## 外部確認

- GitHub Actions secure use reference: least privilege と高リスク処理の権限分離を、action-binding review の根拠にする。
- GitHub artifact attestations provenance docs: digest / provenance をレビュー束に含める設計根拠にする。
- OWASP Web Security Testing Guide: セキュリティ検証を判断前レビュー証跡として扱い、実適用とは分離する。

## 受入条件

- `outstanding` tests が review bundle の digest、safety flag、supporting packet の完全性を検証する。
- `cli-surface` tests が JSON/text/status/handover の surface を検証する。
- `completion-decision-packet` tests が review bundle analyzer の OK / safety drift / review packet 欠落 / digest drift を検証する。
- `doctor` tests が review bundle hard gate の実行と missing root fail-close を検証する。
- `setup` tests が新規 VSCode project の初回 verification matrix、CI workflow、task template、consumer doctor profile に review-bundle が伝播することを検証する。
- `doctor` / `setup` / `cli-surface` tests が setup state objective boundary に review-bundle command が永続化されることを検証する。
- `completion-decision-packet` tests が、freshness 再生成で `bundleDigest` は変わるが `semanticBundleDigest` は同一意味なら変わらないことを検証する。
- `doctor` / `setup` / `cli-surface` tests が、doctor OK message と consumer first-run matrix に `semanticBundleDigest` が露出することを検証する。
- `version-up-readiness` tests が、activation verification matrix の 10 phase 完全一致、phase 欠落の fail-close、activation text の `versionDryRunDigest` 表示を検証する。
- `distribution-acceptance` tests が、consumer harness-check workflow で completion review-bundle を実行し `semanticBundleDigest` を検証する。
- `typecheck`、`lint`、`plan lint`、`doctor` が成功する。
