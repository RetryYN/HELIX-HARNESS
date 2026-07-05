---
plan_id: PLAN-L7-225-approval-snapshot-binding
title: "PLAN-L7-225 (add-impl): approval snapshot binding"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - approval snapshot binding"
  - role: qa
    slot_label: "QA - stale approval material regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/lint/action-binding-approval-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/semantic-frontier-binding.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/action-binding-approval-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/process/forward/L00-L06-design-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/discovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/scrum.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
  requires:
    - docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T02:06:00+09:00"
    tests_green_at: "2026-07-02T02:06:00+09:00"
    verdict: approve
    scope: "Decision packet は plan kind / prose marker だけでなく live L3 meaning frontier に連結された。S4 packet は frontier_pending_decision の `semanticFeatureFrontierRecord`、version-up activation packet は parked_future_version、rename/cutover packet は featureId=name_cutover approval_gated_cutover を持ち、action-binding packet は sibling `semanticFeatureFrontierRecords[]` を公開する。record 欠落、classification / feature の不一致、L3 source path からの分離は readiness gate で fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:74c3e6f375f25f53d23383fe9cf7081d92da378e285995c00046c541604432ba"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:06:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:fd4bd4a551d3d9985bc18b3d9afe668d19489d0421908e7e584a000095ea5ab1"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: src/lint/semantic-frontier-binding.ts
        output_digest: "sha256:e82be61f36fc597e7f807c1b9847ca904d5dca922b55e61a517a11ba47d9d50d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:a564f23ed548028e0a92eda61d43a17285cc9c7acd89a206af3af8d2ae31be9c"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: docs/process/forward/L08-L14-verification-phase.md
        output_digest: "sha256:42af11edc5b7c2a378376c165741bd6d85e4160ad7f6f565780d3504079c5469"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:44:49+09:00"
    tests_green_at: "2026-07-01T14:44:49+09:00"
    verdict: approve
    scope: "Cutover approval snapshot binding は approval record の snapshot id と current rename plan の cutoverSnapshot.snapshotId を比較する。concrete でも stale な cutover_snapshot_id / reviewed_snapshot_binding は approvalMaterialReady=false のままとし、non-applying packet が ready_for_cutover_packet へ進む前に current snapshot id との一致を必須にする。plan-only packet の applyAuthorized は false のまま維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:47c7c0e52546a9badf5989b0617777a315678ce8aeeba65f7ad0233d75b6a820"
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:0d8a9fc88a92dbf25405b0723cd342174b1b45fb49d3fb9a994dbd648845e4c3"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:c2d6c04935c47ae79c724b42b86039d227c2cf20971e0e56d4eed2ba60eebf39"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: src/lint/cutover-readiness.ts
        output_digest: "sha256:7e50738b4417b7c9cede44a0b3e06482efcf72c513dca1d0768b896f3a832e36"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
        output_digest: "sha256:ffde01c6c7e939880f684c1f3b8fcdc1c33f2e8a97e13a4020b4a269a4f9f4b6"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:47c7c0e52546a9badf5989b0617777a315678ce8aeeba65f7ad0233d75b6a820"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:06:12+09:00"
    tests_green_at: "2026-07-01T14:06:12+09:00"
    verdict: approve
    scope: "要求修正後に meaning-level workflow alignment を再確認した。Outstanding status handling は readiness gate 全体で同じ terminal set を使い、packet generation と record validation を明示的に分離する。terminal な high-impact approval / cutover PLAN でも structured record 欠落は隠せず、archived は closed / historical のまま扱い、merged / rejected / superseded など schema-invalid status は fail-close のままにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:b8a386148e488e080ae19a39115df8846ba4afe466783b549124a0354560c464"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:40b30521a5100588754498dc404ecc771938e1f913c321f5647532f50c4017bb"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:e48134b48bb4819f274be99d9bcbf6f72b29c50d84d1a4eca0cdbd66cbb90324"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: src/lint/shared.ts
        output_digest: "sha256:38bb990f1f920f33ae63db4189a819262b6c1a196a14f3bd7aad36ebfd0fb959"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:eb99cbfabed61c39b298b79939b022e4037a81457ba98a190b4f23faf8e6b8b2"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:008007b4210e26b3540f5aae459c0defd93023a0c511cbaf163df3de92e36192"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:af1774585533a80238c8895cd1a7671fe09f548fdb07ad7c9f6132510a57371d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T13:49:34+09:00"
    tests_green_at: "2026-07-01T13:49:34+09:00"
    verdict: approve
    scope: "Meaning-level alignment を L3 requirements から L4/L5/L6 design と test-design、implementation/tests まで再確認した。Snapshot-bound approval は reviewed_snapshot_binding が current sha256 snapshot id を含むまで pending のままとし、PLAN-M-02 rename cutover は outcome と actor/tool/target だけでは approvalMaterialReady を立てられない。plan-only packet の applyAuthorized は false のまま維持する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:c7df34650611cb419049e43e5e00ba3b6fc00fa05b30a1ba487a647d769ddad2"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:bd29a7a4a9b534b335fb0da467e1a92118c7fee252cd2dc28f47758697fb45d7"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:7975a17c7475d667a6e015ddd72047e9f4b90c1d917546c51f8f9d56d82ce40a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:c14138ebd4e8b5520dc1b6bdc0e152e07a051b206678f90a6e3e0e50b70d22b1"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:dbf42c275bf6c2c277977a11fdb85000871f1bb552a53cc4b5d737f8c2e3bd9e"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: docs/plans/PLAN-L7-225-approval-snapshot-binding.md
        output_digest: "sha256:65865a33ca83b85778412f3fe17fac4590571deb4902c5359c0165a61f268d98"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T11:42:19+09:00"
    tests_green_at: "2026-07-01T11:42:19+09:00"
    verdict: approve
    scope: "Version-up activation と L14 rename/cutover packet は stale approval material 検出用の snapshot binding ID を公開する。Setup route evidence は ut-tdd setup project を使い、helix/.helix は PLAN-M-02 cutover target として保持する。README は gate、evidence、completion surface ではない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:fcc5119a55d4c7be6b5df582ca3ea7ccc1c541b2209fd881f1319810e1ec9bbd"
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:2b688c6463155b830dec8520e54bc8a1db3288a00b63d3fa7c285d603d4bedd1"
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:bb5fd7cb6167cb77bc478973d29269aac2d8000553f90d432813605a26daf40d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:15649f77a49b299c00204994189d16d28aacab7200e1377b46e0cad3748929fd"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:f6531489dd82d03dd5a6a696c1537310f4aac66512bf417fd134c39aef3176a9"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:6c90be507f082b023458cca6e24f0506fb25cc5ed2784a98cad9ec3ce6f37936"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:ee838131a9d6c805abd1efe3fcf3c458818b467f913ce9e59c58f8498e6fb907"
---

# PLAN-L7-225: 承認スナップショット拘束

## 目的

承認 gate 付き作業が stale な decision material を再利用しないようにする。
Version-up activation と L14 identifier cutover はすでに plan-only packet を出力しているが、
packet は review 対象である正確な release trigger、approval scope、blast radius、
source ledger、rehearsal、backup、provenance evidence に対する安定した digest binding を公開していなかった。

## 対象範囲

- `version-up-activation-packet.v1` に `activationSnapshot` を追加する。
- `identifier-rename-cutover-plan.v1` に `cutoverSnapshot` を追加する。
- Action-binding approval record と completion decision record を、`reviewed_snapshot_binding`、
  `activation_snapshot_id`、`cutover_snapshot_id` 経由でこれらの snapshot ID に拘束する。
- Approval packet が `activationSnapshot.snapshotId` / `cutoverSnapshot.snapshotId` の
  field-name placeholder を具体的な approval material として扱わないようにする。
  Snapshot-bound approval check が具体化できるのは、現在の `sha256:` snapshot ID が記録された後に限る。
- Rename cutover authorization には、approved params、現在の cutover snapshot binding、
  review evidence、expiry、audit、backup、rollback、monitoring evidence を含む、
  cutover と action-binding approval の完全な evidence set を要求する。
- L3-L6 の requirement / design / test-design wording を揃え、同じ approval meaning が
  V-model の各 layer で見えるようにする。
- Outstanding、action-binding approval readiness、cutover readiness の間で terminal PLAN status handling を共有する。
  Packet generation は terminal work を skip するが、record validation は terminal な高影響 approval/cutover PLAN も
  引き続き検査し、status 変更で不足 decision record を隠せないようにする。未知の status value は fail-closed のままとする。
- 両 surface は plan-only のままにする。apply command、activation permission、cutover execution、
  approval recording は提供しない。
- Process / design / test docs を更新し、snapshot ID を approval substitute ではなく
  approval material binding ID として扱う。
- 補助 docs の setup guidance は gate / evidence / 完了条件に紐づけず、実装済み CLI と
  setup test を正本として `ut-tdd setup project` route と cutover 前 `.ut-tdd` baseline の意味を検証する。

## 対象外

- PLAN-L7-146 は activate しない。
- `.ut-tdd -> .helix` rename/cutover は実施しない。
- Human approval や action-binding approval は記録しない。
- Package/bin alias は変更しない。

## 完了条件

- [x] Version-up activation packet が `activationSnapshot.snapshotId` を公開する。
- [x] Rename plan が `cutoverSnapshot.snapshotId` を公開する。
- [x] Completion decision packet は、version-up と cutover の decision record に
      `activation_snapshot_id` / `cutover_snapshot_id` を要求する。
- [x] Action-binding approval record は `reviewed_snapshot_binding` を要求し、
      stale または不一致の activation/cutover snapshot reference を reject する。
- [x] Cutover blast radius が変わると snapshot digest も変わる。
- [x] Action-binding approval packet は、具体的な現在の `sha256:` snapshot ID が記録されるまで
      snapshot field placeholder を pending のまま扱う。
- [x] Rename cutover は outcome と actor/tool/target だけで `approvalMaterialReady=true` を設定せず、
      完全な approval evidence を要求する。
- [x] `rename plan` は approval material が ready でも plan-only のままとし、
      `applyAuthorized=false`、`applyCommandAvailable=false`、`mustNotApply=true` を維持する。
- [x] L3-L6 requirements/design/test-design の行が、同じ snapshot と full-approval semantics を保持する。
- [x] Readiness gate は terminal status handling を共有し、terminal record validation を有効に保ち、
      unknown status value を terminal として扱わない。
- [x] Setup guidance の正本は `tests/setup.test.ts` と setup CLI surface で検証し、
      README は gate、証跡、完了条件に紐づけない。
- [x] Targeted test が version-up、rename、setup route drift を cover する。
