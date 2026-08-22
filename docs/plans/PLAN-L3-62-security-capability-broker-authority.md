---
plan_id: PLAN-L3-62-security-capability-broker-authority
title: "PLAN-L3-62 (add-design): 安全capability brokerの要件authorityを定義する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:2026-08-18 #679 safety gapの実測をrequirements-firstで正本候補へ分解する"
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 679
behavior_contract_id: SECURITY-CAPABILITY-BROKER-AUTHORITY-001
responsibility_owner: security-capability-broker-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "requirements v1.3.12、既存#553 guard、#679の実測gap、security関連design、PO承認記録（Issue comment 5330350117）が確認済み"
contract_postconditions: "SEC-FR-CAP-001..007とSEC-AC-CAP-001..010がcurrent requirements v1.3.12へ束縛され、後続5 atomic sliceがtyped axisとfail-close条件へ束縛される"
contract_invariants: "requirements authorityのversionとdigestを一致させる。旧guard greenで未実装のphysical identity/provenance/sink/runtime coverageを相殺しない。実装・外部apply・credential操作を混載しない"
contract_failures: "要件候補のaxis混同、path identity欠落、間接実行のhost fallback、credential/PII egress、approval drift、sandbox unavailable、証跡への値混入をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 design-onlyであり、runtime implementationを行わない。受入oracleは文書のauthority、pair、候補ID、mutation条件を検証する"
complexity_effect: net_neutral
complexity_justification: "既存guardを複製せず、未定義だった安全境界の分類軸と後続sliceの入口だけを追加する"
removal_trigger: "上位の安全admission authorityが同じ候補要件・受入条件・後続sliceを吸収し、旧設計への参照が0になった時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/security-capability-broker-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — L3要件候補、capability軸、authority境界のレビュー" }
  - { role: qa, slot_label: "QA — physical identity/provenance/data-sink/coverageのnegative oracle" }
  - { role: se, slot_label: "SE — #553既存実装との責務境界と後続atomic sliceの棚卸し" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-62-security-capability-broker-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/security-capability-broker-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/security-capability-broker-acceptance.md, artifact_type: test_design }
  - { artifact_path: tests/security-capability-broker-authority-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L7-553-machine-delete-secret-egress-guard.md
    - docs/plans/PLAN-L7-370-security-credential-egress-guard.md
    - docs/plans/PLAN-L7-443-destructive-command-guard-transaction.md
  references:
    - docs/design/helix/L3-requirements/github-security-admission-requirements.md
    - docs/design/harness/L6-function-design/destructive-command-guard.md
    - docs/test-design/harness/L8-destructive-command-guard.md
  blocks:
    - issue:679-implementation-slice-1
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-18T13:43:24Z"
    tests_green_at: "2026-08-18T13:37:15.365Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PR #777 の安全capability broker authority候補をread-onlyで検収した。generated artifact 8件、双方向pair、SEC-FR-CAP-007／SEC-AC-CAP-010、catalog digest、runtime／current requirements authority非変更を確認した。これはL3人間確認、requirements version up、runtime実装、Claude exact-HEAD review、completion claimを代替しない。completion_claim_allowed=falseを維持する。"
    green_commands:
      - kind: lint
        command: "node /home/tenni/HELIX-HARNESS/node_modules/@biomejs/biome/bin/biome check tests/security-capability-broker-authority-design.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T13:36:12.972Z"
        evidence_path: tests/security-capability-broker-authority-design.test.ts
        output_digest: "sha256:cf4640fb31c3b7b33c42a180ad9b7a3ee58c52b14b0d88378ab0f9cc6078e883"
        result: "Biome checked 2 files; no fixes applied"
      - kind: unit_test
        command: "node /home/tenni/HELIX-HARNESS/node_modules/vitest/vitest.mjs run --config /home/tenni/HELIX-HARNESS/vitest.config.ts --project fast tests/security-capability-broker-authority-design.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T13:37:03.645Z"
        evidence_path: tests/security-capability-broker-authority-design.test.ts
        output_digest: "sha256:bd19916ec706ee85afeb65e381e7ecae2acc5a275d7c0271a379a021bca38219"
        result: "2 files / 31 tests passed"
      - kind: typecheck
        command: "node /home/tenni/HELIX-HARNESS/node_modules/typescript/bin/tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T13:37:13.155Z"
        evidence_path: docs/plans/PLAN-L3-62-security-capability-broker-authority.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "node --import /home/tenni/HELIX-HARNESS/node_modules/tsx/dist/loader.mjs src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T13:37:15.365Z"
        evidence_path: docs/plans/PLAN-L3-62-security-capability-broker-authority.md
        output_digest: "sha256:8c15ab5b2fa026a74a064a1b01cd327292a05e8d4afabc6a57be1400f209b47f"
        result: "plan-governance - OK (frontmatter/cross-record checked=982)"
---

# PLAN-L3-62: 安全capability broker authority

## §0 位置づけ

Issue #679で実測されたhost破壊、外部副作用、任意egress、physical path identity、間接実行、
runtime coverageのgapを、既存の限定guardへ便乗させずrequirements-firstで分解する。現行の
requirements v1.3.12への昇格はPO承認後の独立authority sliceで行う。本PLANのauthority昇格PRは
runtime実装を含まず、physical identityを含む後続実装はcurrent requirementsへ再束縛して開始する。

## §工程表

| Step | 作業 | 順序 | 完了条件 |
|---|---|---|---|
| 1 | 既存requirements、#553、security admission、guard、test oracle、旧HELIX behavior atomを棚卸し | 直列 | 採用・非採用・未定義gapが区別される |
| 2 | operation/target/provenance/data/sink/impact/approvalのtyped authorityを設計 | 直列 | 軸混同、unknown推測、legacy相殺が禁止される |
| 3 | L10 acceptanceとmutation条件を設計 | 並列 | `SEC-AC-CAP-001..010`が各要件候補へ束縛される |
| 4 | L3 review packetを作成し、POへrequirements version upを依頼 | 直列 | Issue #679のPO承認記録（comment 5330350117）へ接続する |
| 5 | PO確認後、requirements version upを別PRで行う | 直列・後続 | `requirements v1.3.12`へ昇格し、FR/ACとauthority digestが一致する |
| 6 | #679実装を5 atomic PRへ分割 | 直列・後続 | 物理identity→provenance→sink→external adapter→coverageの順になる |

## §受入条件

- L3候補文書とL10 test designが双方向`pair_artifact`を持つ。
- `SEC-FR-CAP-001..007`と`SEC-AC-CAP-001..007`が一対一で対応する。
- lexical/physical identity（字面/実体同一性）、target set（対象集合）、TOCTOU、provenance（来歴）、data/sink（データ/送信先）、approval（承認）、postcondition（事後条件）、
  rollback、expiry、runtime coverageが別fieldとして定義される。
- current guardのgreen、legacy guardのgreen、別scannerのgreenがcanonical safety failureを相殺しない。
- #553の実装、#679のauthority候補、後続5実装sliceの責務が混載されない。
- requirements v1.3.12、PO承認、current registry/digestへの束縛を確認し、runtime、doctor、DB、GitHub settings、credential、sandboxの変更は後続atomic PRへ分離する。
- targeted test、PLAN lint、design-language、L1-L12 authority driftを確認し、completion claimはfalseのままにする。

## §後続実装境界

後続PRは同一PRへ混載せず、各PRでcurrent-mainへ再束縛する。各PRには対応するL4/L5設計、L8/L9/L10
oracle、mutation、doctor、DB/receipt projection、Claude exact-HEAD独立reviewを要求する。
