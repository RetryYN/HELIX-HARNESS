---
plan_id: PLAN-REVERSE-573-github-workflow-identity-ingest-terminal-backfill
title: "PLAN-REVERSE-573: GitHub typed workflow identity ingestのterminal backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: REVERSE
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 905
behavior_contract_id: GITHUB-WORKFLOW-IDENTITY-INGEST-TERMINAL-001
responsibility_owner: github-workflow-identity-contract
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
completion_claim_allowed: true
entry_signals:
  - "po_directive:Issue #905でIssue #731 terminal stateとPLAN-L7-573 completion stateの不一致をReverse収束する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    reason: "GH-FR-020とGH-AC-018がrequirements-owned typed identityのIssue／PR exact bindingを既に要求する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/github-workflow-identity-contract.md
    reason: "strict marker JSON、catalog exact照合、12 failure reason、Issue／PR tuple一致がmerged implementationと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
    reason: "U-GWID-001..006がlegacy field、stale digest、unknown identity、Issue／PR mismatchをfail-closeする。"
agent_slots:
  - { role: se, slot_label: "SE — R0 canonical implementation／consumer採取" }
  - { role: qa, slot_label: "QA — R1/R2 legacy／drift／mismatch反証" }
  - { role: tl, slot_label: "TL — R3 requirements意図とR4 terminal判断" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-573-github-workflow-identity-ingest-terminal-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
  requires:
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
  references:
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    - docs/design/helix/L6-function-design/github-workflow-identity-contract.md
    - docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
    - src/schema/github-workflow-identity-contract.ts
    - tests/github-workflow-identity-contract.test.ts
---

# GitHub typed workflow identity ingestのterminal backfill

## R0 現状採取

PR #732の実装HEAD `0d21f851840822648e985c708e193ef6340e93fc`、マージcommit
`3f67346ea38e297687c52514769e809b6f424493`、Claude receipt、CI run 31909668570を採取した。
後続admission consumerはPR #734 merge commit `ebffd9c0e419208e87444ed5514f38d875bbbea4`でmainへ入り、
Issue #731／#733は2026-08-16にcompletedでcloseされた。current-main read-after run 31930292602もsuccessである。

## R1 観測テスト設計

- marker付きJSON以外のprose、label、legacy `mode`／`model`／`catalog_route_id`からcurrent identityを推測しない。
- registry version／digest／axis／IDの欠落、unknown、drift、duplicateを別reasonで拒否する。
- IssueとPRのtuple不一致、typed signalとの矛盾、decision待ち、ambiguityをsuccessへ丸めない。
- consumerがstrict ingestを迂回してlegacy greenでcanonical failureを相殺しない。

## R2 As-Is設計

L3 requirements、L6 strict value object、L8 U-GWID-001..006は、merged schemaとadmission consumerの責務に一致する。
identity authorityはrequirements registryであり、GitHub proseや旧15-route catalogを意味正本へ戻さない。
新しいruntime、schema、DB fieldを追加せず、既存実装を`reuse-as-is`として照合する。

## R3 意図照合

Issue #731の目的はIssue／PR markerからversioned typed tupleをexact ingestすることであり、PR #732が実装した。
Issue #733はそのvalue objectをmerge admissionへ接続し、PR #734で完了した。両Issueのterminal commentとmain read-afterは
実装・consumer・運用証拠が揃ったことを示す。PLAN-L7-573だけがcompletion falseに残った状態は新しい未実装ではなく、
authority projectionのterminal leakageである。

## R4 Forward再入判断

意味差分や未実装gapは検出しなかったため、Forward再入はPLAN-L7-573のterminal metadataと双方向linkに限定する。
PLAN-L7-574以降およびIssue #205全体のcompletionは本Reverseから主張しない。current PRのCI、Claude Opus exact-HEAD review、
canonical merge、main read-afterを追加terminal acceptanceとし、失敗時は本PLANのcompletionを根拠にmergeしない。
