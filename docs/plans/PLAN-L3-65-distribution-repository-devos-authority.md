---
plan_id: PLAN-L3-65-distribution-repository-devos-authority
title: "PLAN-L3-65 (add-design): distribution repositoryをDevOSへ収束する"
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
  target_id: VERSION_UP
entry_signals:
  - "po_directive:2026-08-22 正式配布先をRetryYN/HELIX-HARNESS-DevOSへrenameした"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 938
behavior_contract_id: DISTRIBUTION-DEVOS-AUTHORITY-001
responsibility_owner: distribution-repository-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "#659のconsumer distribution authorityとRetryYN/HELIX-HARNESS-DevOS repositoryが存在する"
contract_postconditions: "requirements v1.3.13、DIST-LITE revision 2、L3/L10 pairがDevOS identityと旧identity input-only境界を返す"
contract_invariants: "HELIX-HARNESSを唯一のsource authorityとし、tag／publish／releaseを本sliceで実行しない"
contract_failures: "旧identityのcurrent再出力、別target推測、historical evidence改変、未承認remote writeをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはrequirements authority transactionと、それに不可分なtyped profile schema／current process projection／L10 oracleの再束縛を所有する。広いruntime／CLI／setup／doctor移行は後続L6/L7へ分離する"
complexity_effect: net_negative
complexity_justification: "配布先identityの複製を後続typed authorityへ収束できる単一要件へ更新する"
removal_trigger: "DevOS identityがversioned baseline requirementへ吸収され、旧identity consumerが0になった時"
parent_design: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
pair_artifact: docs/test-design/helix/distribution-package-release-system-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — distribution repository authorityと互換境界" }
  - { role: qa, slot_label: "QA — 旧identity再出力／別target mutation oracle" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewer_session_id: "792345fd-722c-4696-85eb-02494ab28d30"
    reviewed_at: "2026-08-22T15:38:39Z"
    tests_green_at: "2026-08-22T15:38:39Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewed_head_sha: bc43d938710742a6345d978edc32a7d9f07730cd
    scope: "PR #940 exact HEAD bc43d938710742a6345d978edc32a7d9f07730cdをClaude Code Opusが独立reviewし、repository rename実在、registry digest、requirements／profile／Requirement IR三面のDevOS identity、旧identity mutationのredを確認した。blocker 0、非blocker 2はruntime／instruction surface移行として後続Issueへ分離する。canonical review comment: https://github.com/RetryYN/HELIX-HARNESS/pull/940#issuecomment-5381207247"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast tests/distribution-lite-requirements.test.ts tests/workflow-classification-registry.test.ts tests/l12-hybrid-recognition.test.ts tests/distribution-profile.test.ts tests/doc-consistency.test.ts tests/identifier-rename.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-22T15:38:39Z"
        evidence_path: tests/distribution-lite-requirements.test.ts
        output_digest: "sha256:fde57d3e8f8e88ee0b9b2c70310b6088fd22e715866569c4430704499c079651"
        result: "canonical review comment本文のdigest。対象6 suite／83 tests green、DevOSから旧OSへの2 mutationは各oracleをredにした。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-22T15:38:39Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-22T15:38:39Z"
    evidence_digest: "sha256:76e5537a1b0a03ad6a4eb27011a577896aa1a35ea1252d9e22ac21843d9e0252"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/distribution-package-release-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/distribution-package-release-system-test-design.md, artifact_type: test_design }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/distribution-lite-requirements.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L3-54-distribution-package-release.md
  blocks:
    - issue:938-runtime-cli-migration
    - issue:659-distribution-release
---

# 配布repository DevOS authority移行

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | current requirementsと全配布surfaceを棚卸し | current／compatibility／historicalが分類される |
| 2 | requirements v1.3.13とL3/L10 pairを更新 | DevOS exact identityと旧identity再出力拒否が反証可能になる |
| 3 | Requirement IRをrevision-up | source／semantic／manifest digestが一致する |
| 4 | targeted、PLAN lint、authority gate | 全oracle green |
| 5 | Claude exact-HEAD独立review後にmerge | blocker 0、main read-after成立 |

typed profile schemaとcurrent process projectionはauthority transactionへ含める。広いruntime、CLI、setup、doctor、generated consumer surfaceの移行は、本authority merge後のL6/L7原子的sliceへ分離する。
remote repositoryへのtag、publish、release、file writeは本PLANの非対象である。

PLAN-L3-54の`generates`とreview evidenceはrevision 2までのhistorical provenanceであり、revision 3 artifactの
current ownerにしない。次のpartial ownership transferだけをcurrent authorityとする。

<!-- HELIX:distribution-repository-ownership-transfer:v1 -->
```json
{
  "schema_version": "helix-distribution-repository-ownership-transfer.v1",
  "from_plan": "PLAN-L3-54-distribution-package-release",
  "to_plan": "PLAN-L3-65-distribution-repository-devos-authority",
  "scope": "revision_3_repository_identity_only",
  "owner_issue": 938,
  "remote_writes_allowed": false
}
```
