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
  registry_version: 1.1.4
  registry_source_digest: sha256:0ff1f90cd2e329b52f784ada54c18d06a79253488664290290327b81bef17f47
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
contract_preconditions: "現行requirements v1.3.11、既存#553 guard、#679の実測gapとsecurity関連designがread-onlyで棚卸し済み"
contract_postconditions: "L3要件候補、L10受入条件、後続5 atomic sliceがtyped axisとfail-close条件へ束縛され、L3確認前のcurrent authority変更がない"
contract_invariants: "現行requirementsを無断改訂しない。旧guard greenで未実装のphysical identity/provenance/sink/runtime coverageを相殺しない。実装・外部apply・credential操作を混載しない"
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
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
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
    reviewed_at: "2026-08-18T12:02:22Z"
    tests_green_at: "2026-08-18T12:05:58Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "PR #777 の安全capability broker authority候補をread-onlyで検収した。generated artifact 9件、双方向pair、SEC-FR-CAP-007／SEC-AC-CAP-010、catalog digest、runtime／current requirements authority非変更を確認した。これはL3人間確認、requirements version up、runtime実装、Claude exact-HEAD review、completion claimを代替しない。completion_claim_allowed=falseを維持する。"
    green_commands:
      - kind: lint
        command: "node /home/tenni/HELIX-HARNESS/node_modules/@biomejs/biome/bin/biome check tests/security-capability-broker-authority-design.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:05:58Z"
        evidence_path: tests/security-capability-broker-authority-design.test.ts
        output_digest: "sha256:9638d00441c3d3a28be62b44c1e156003dc256bcbded8f0662ba4fe20185fe18"
        result: "Biome checked 1 file; no fixes applied"
      - kind: unit_test
        command: "node /home/tenni/HELIX-HARNESS/node_modules/vitest/vitest.mjs run --config /home/tenni/HELIX-HARNESS/vitest.config.ts --project fast tests/security-capability-broker-authority-design.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:05:58Z"
        evidence_path: tests/security-capability-broker-authority-design.test.ts
        output_digest: "sha256:2f3ce117856cab07ca3b827587c9861a4db1977c90a2fdc120550fc34f5b72aa"
        result: "1 file / 3 tests passed"
      - kind: typecheck
        command: "node /home/tenni/HELIX-HARNESS/node_modules/typescript/bin/tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:05:58Z"
        evidence_path: docs/plans/PLAN-L3-62-security-capability-broker-authority.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "node --import /home/tenni/HELIX-HARNESS/node_modules/tsx/dist/loader.mjs src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T12:05:58Z"
        evidence_path: docs/plans/PLAN-L3-62-security-capability-broker-authority.md
        output_digest: "sha256:1ffd3d4996d775397f5c9878325244fe3c8b73cc1f86c2106daa42195aecad5f"
        result: "plan-governance - OK (frontmatter/cross-record checked=981)"
---

# PLAN-L3-62: 安全capability broker authority

## §0 位置づけ

Issue #679で実測されたhost破壊、外部副作用、任意egress、physical path identity、間接実行、
runtime coverageのgapを、既存の限定guardへ便乗させずrequirements-firstで分解する。現行の
requirements v1.3.11はこのPLAN単独では変更しない。L3の人間確認後にrequirements version upを行い、
その後にだけruntime実装を開始する。

## §工程表

| Step | 作業 | 順序 | 完了条件 |
|---|---|---|---|
| 1 | 既存requirements、#553、security admission、guard、test oracle、旧HELIX behavior atomを棚卸し | 直列 | 採用・非採用・未定義gapが区別される |
| 2 | operation/target/provenance/data/sink/impact/approvalのtyped authorityを設計 | 直列 | 軸混同、unknown推測、legacy相殺が禁止される |
| 3 | L10 acceptanceとmutation条件を設計 | 並列 | `SEC-AC-CAP-001..010`が各要件候補へ束縛される |
| 4 | L3 review packetを作成し、POへrequirements version upを依頼 | 直列 | `authority_status=proposed_pending_l3_confirmation`を維持したまま確認待ちになる |
| 5 | L3確認後、requirements version upを別PRで行う | 直列・後続 | current requirementsへ昇格し、生成registryとdigestが更新される |
| 6 | #679実装を5 atomic PRへ分割 | 直列・後続 | 物理identity→provenance→sink→external adapter→coverageの順になる |

## §受入条件

- L3候補文書とL10 test designが双方向`pair_artifact`を持つ。
- `SEC-FR-CAP-001..007`と`SEC-AC-CAP-001..007`が一対一で対応する。
- lexical/physical identity（字面/実体同一性）、target set（対象集合）、TOCTOU、provenance（来歴）、data/sink（データ/送信先）、approval（承認）、postcondition（事後条件）、
  rollback、expiry、runtime coverageが別fieldとして定義される。
- current guardのgreen、legacy guardのgreen、別scannerのgreenがcanonical safety failureを相殺しない。
- #553の実装、#679のauthority候補、後続5実装sliceの責務が混載されない。
- L3の人間確認前にrequirements v1.3.11、runtime、doctor、DB、GitHub settings、credential、sandboxを変更しない。
- targeted test、PLAN lint、design-language、L1-L12 authority driftを確認し、completion claimはfalseのままにする。

## §後続実装境界

後続PRは同一PRへ混載せず、各PRでcurrent-mainへ再束縛する。各PRには対応するL4/L5設計、L8/L9/L10
oracle、mutation、doctor、DB/receipt projection、Claude exact-HEAD独立reviewを要求する。
