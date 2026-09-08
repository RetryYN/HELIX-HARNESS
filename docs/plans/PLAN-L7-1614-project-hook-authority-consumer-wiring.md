---
plan_id: PLAN-L7-1614-project-hook-authority-consumer-wiring
title: "PLAN-L7-1614: project-hook authority consumer wiringをcanonical L6↔L7へ接続する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
irreversible_impact: none
created: 2026-09-07
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1614
behavior_contract_id: PROJECT-HOOK-AUTHORITY-CONSUMER-WIRING-1614
responsibility_owner: project-hook-authority-consumer-wiring
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: port
backprop_decision: not_required
backprop_decision_reason: "Issue #1614は、既存#895のresolver・physical adapter・assignment provider・surface projectorを実consumerへ接続するsliceであり、新しい上位要求や旧#1620のL7↔L8 pairを作らない。"
complexity_effect: net_negative
complexity_justification: "4 consumer surfaceのauthority resolution・capture・serializationを一つのwiringへ収束し、個別推測経路を増やさない。"
removal_trigger: "Control Plane native transportが全4 surfaceへadmitted receiptを直接共有し、CLI consumer adapterが不要になった時。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1614 project-hook authority consumer wiring"
contract_preconditions: "Control Plane transport envelopeがexpected authorityを供給し、hostがexecution root・loader root・session project root・current authority root・HEAD・source materialを独立採取できる。"
contract_postconditions: "SessionStart・doctor・statusが一つのconsumer wiringから同一receipt/failure bytesを消費する。native dispatchは明示envelopeが与えられた場合だけadmissionを強制し、不正envelopeではproviderを起動しない。producer未接続の既存dispatchは本sliceで停止しない。"
contract_invariants: "request値をobservedへコピーしない。cwd・env・remote・default fileへfallbackしない。surface別のresolver・capture・serializationを再実行しない。standaloneの観測surfaceはread-only unavailableとし、既存coordination SessionStartとproducer接続前のdispatch availabilityを維持する。包括的なrequired activationはproducer E2E後の後続sliceだけが行う。"
contract_failures: "明示された不正・stale・foreign envelopeは固定schema/failure bytesへ閉じ、dispatch・git・DB・GitHub side effectを0にする。envelope欠落はpre-activationとして既存dispatchを維持し、required activation済みとは主張しない。session event・memory recall・feedback DBを停止しない。"
tdd_red_required: true
red_test: "U-CNHOOKWIRE-007cはloop surfaceから共通admission helperを除去したmutationを、期待5件／実測4件としてRedにする。U-CNHOOKWIRE-001..002はresolution/projectorの一回性とfailure dispatch拒否を継続検証する。"
red_at: "2026-09-08T22:45:39+09:00"
green_at: "2026-09-08T22:45:59+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/project-hook-authority-envelope.test.ts の U-CNHOOKWIRE-007c に対し、src/cli.ts の loop surfaceからadmitExplicitProjectHookAuthority呼出しを一時除去する単一mutationを2026-09-08T22:45:39+09:00に投入し、expected length 5 / received 4で1 failed・21 skipped・exit 1を実測した。apply_patchで呼出しを復元後、2026-09-08T22:45:59+09:00に同oracleが1 passed・21 skipped・exit 0へ戻り、git diffでsrc/cli.ts差分0を確認した。"
mutation_oracle: "resolver/projectorのsurface別再実行、expected→observedコピー、failure時admitted receipt付与、明示不正envelopeでのdispatch、producer接続前の未指定dispatch停止、cwd/env/default fallbackを個別にkillする。"
parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md
pair_artifact: docs/test-design/helix/L7-project-hook-authority-consumer-wiring-unit-test-design.md
dependencies:
  parent: issue:1614
  requires:
    - docs/plans/PLAN-L7-667-project-hook-authority-input-provider.md
    - docs/plans/PLAN-L7-668-project-hook-authority-surface-projector.md
    - docs/plans/PLAN-L7-669-project-hook-assignment-provider.md
  references:
    - issue:895
    - issue:1614
    - issue:1620
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-001, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-002, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003b, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003c, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003d, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003e, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-003f, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-004, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-005, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-005b, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-006, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNWHOOKENV-007, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-001, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-002, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-003, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-004, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-005, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-006, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-007, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-007b, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-007c, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-008, test_path: tests/project-hook-authority-envelope.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-009, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, oracle_id: U-CNHOOKWIRE-010, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: .helix/evidence/review-1672/vitest-targeted.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-consumer-wiring.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-project-hook-authority-consumer-wiring-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/project-hook-authority-envelope.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/project-hook-authority-consumer.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-authority-envelope.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/runtime/project-hook-authority.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/project-hook-physical-adapter.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/session-log.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-descent.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-descent.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/session-start-budget.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/plan-descent-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / Opus 5"
    review_kind: cross_agent
    reviewed_at: "2026-09-08T21:47:37Z"
    tests_green_at: "2026-09-08T22:08:56Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: 77375ef5-9b74-425a-91ee-45ebc9fea1d9
    reviewed_head_sha: 473f4b00752032828a005b9dee69f83a7b58128a
    scope: "HEAD ffa843491への25 oracle全数照合・190/191 green・U-CNHOOKWIRE-007b実配線kill検証を、content-neutralなJIT main同期後HEAD 473f4b007へ継承できると独立reviewerが確認した。Phase 1ではformal receipt未封印のためreceipt_urlとci_evidence_generationを記録せず、Draft CI成功後のPhase 2で束縛する。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/project-hook-authority-envelope.test.ts tests/cli-surface.test.ts tests/plan-descent.test.ts tests/session-start-budget.test.ts tests/l3-g3-freeze-packet-v2.test.ts --reporter=json --outputFile=.helix/evidence/review-1672/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-08T22:08:56Z"
        evidence_path: .helix/evidence/review-1672/vitest-targeted.json
        output_digest: "sha256:72b2d514447ffbb35c63083abfacab60526c43db822221d9a27d1bbd050d55ce"
agent_slots:
  - { role: aim, slot_label: "AIM — project-hook authority不一致のRecovery分類" }
  - { role: se, slot_label: "SE — Control Plane envelope／consumer wiring" }
  - { role: qa, slot_label: "QA — stale・fallback・surface byte同一性の反例" }
  - { role: tl, slot_label: "TL — canonical L6↔L7境界とdispatch admission" }
---

# PLAN-L7-1614: project-hook authority consumer接続

## 目的

Issue #1614の限定実装として、既存#895のproject-hook authority kernelを、Control Plane transport envelopeから実際のconsumerへ接続する。旧#1620のL7↔L8成果物を複製せず、canonical L6設計とL7検証設計のpairで管理する。

## 正規経路

```text
Control Plane transport envelope（expectedのみ）
  ↓
host physical observation（execution／loader／session／current authority root・HEAD・source）
  ↓
既存 resolver（1回）
  ↓
surface projector（1回）
  ↓
SessionStart / doctor / status / native dispatch
```

各surfaceは同じcanonical receiptまたはfailure bytesを読むだけとする。surface側でresolver、physical capture、serializationを再実行しない。failure時はadmitted receiptを生成せず、provider processを起動しない。

## Consumer接続

- `helix session start` はhook input内のtransport envelopeだけを受ける。
- `helix status` と `helix doctor` は明示されたenvelope fileだけを読む。単独実行時はread-only unavailableを表示し、authorityを推測しない。
- `helix codex --execute`、`helix claude --execute`、および既存native dispatch系は、明示envelopeが与えられた場合にadmitted receiptがなければfail-closeする。envelope producerとoperator投影が未接続の間は、未指定を理由に既存dispatchを停止しない。
- cwd、環境変数、remote、default file、primary shared treeからauthorityを補完しない。

## 完了境界

本sliceはconsumer wiringのpre-activationとtargeted testまでを扱う。required activationはControl Plane producer、operator projection、実consumer E2Eが揃う後続sliceへ分離する。commit、push、PR、GitHub write、旧#1620 worktree操作、provider API変更、旧engine退役は含めない。
