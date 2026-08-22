---
plan_id: PLAN-REVERSE-187-ai-decision-proposal-authority-backfill
title: "PLAN-REVERSE-187: AI proposalとcommit authority分離の設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 187
behavior_contract_id: AI-DECISION-PROPOSAL-AUTHORITY-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
entry_signals:
  - "po_directive:Issue #187のmerged implementationをReverse R0から要件・設計へ照合し、#188の依存終端を準備する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    reason: "UWJ-FR-009/010とUWJ-AC-009/010が判断chainとproposal-only authorityを既に定義する。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md
    reason: "validator、authority boundary、commit verifier boundaryの責務分離がmerged implementationと一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/ai-decision-proposal-authority.md
    reason: "strict proposal schema、action allowlist、実行可能性境界が実装分岐と一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
    reason: "validateAiDecisionProposalのpre／post／invariant／failure契約がexportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
    reason: "U-UWPROP-001..005が完全proposal、欠落、authority escalation、stale oracle、参照不整合を反証する。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 authority／schema反証" }
  - { role: tl, slot_label: "TL — R2設計、R3意図、R4再入判断" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-20T22:06:01Z"
    reviewed_at: "2026-08-20T22:08:02Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude:claude-opus-5
    scope: "PR #870 HEAD d2de3c990589eb00edaa1dd6660129756c411d78をClaude Codeがexact-HEADで独立reviewした。5層のpreserve evidence path、UWJ-FR-009/010、proposal-only authority境界、src非変更を照合しblocker 0、approve。Actions run 32422288327はfull regression、Biome、DB rebuild、doctorを含めterminal success。検出したfailure-code oracle gapはIssue #874へ分離し、confirmation前にPR #885で8/8 mutation killedへ是正した。review source: https://github.com/RetryYN/HELIX-HARNESS/pull/870#issuecomment-5362564843"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast --project slow (GitHub Actions harness-check run 32422288327)"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-20T22:06:01Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:0261fad1c69e2accdaadb29111f680043bb10e28267d40e2e94c51f53950493d"
        result: "Actions run 32422288327 terminal success。full regression、Biome、DB rebuild、doctor、Windows smoke、CodeQL green。output_digestはsealed receipt digest。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-187-ai-decision-proposal-authority-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
  requires:
    - docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
  references:
    - docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/design/helix/L4-basic-design/ai-decision-proposal-authority.md
    - docs/design/helix/L5-detail/ai-decision-proposal-authority.md
    - docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
    - docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
    - src/workflow/ai-decision-proposal.ts
    - tests/ai-decision-proposal.test.ts
---

# AI proposalとcommit authority分離の設計backfill

## R0 現状採取

PR #686のimplementation HEAD `7f1c38192c504bb9ae9435aa7ab35862e4f0c8c3`とmerge commit
`fc4dc6500aec5078fb9741255b2dbcef5ab85645`を基準に、`validateAiDecisionProposal`、
U-UWPROP-001..005、L3〜L6およびL8のtraceを採取した。実装はpure Zod validatorであり、
DB、Git、GitHub、shell、networkへのwrite authorityを持たない。

## R1 観測テスト設計

- 完全な判断chainとproposal-only actionだけを受理する。
- 必須field、fallback、reassessment、measurement oracleの欠落を個別に拒否する。
- 要求freeze、権限付与、高影響操作、gate通過、DB／Git／GitHubへのcommit、
  unknown write actionをallowlist外として拒否する。
- policy failure、blocking unresolved、stale／incomplete oracle、commit verifier迂回を成功へ縮退しない。
- candidate参照不整合とunknown fieldをfail-closeする。

## R2 As-Is設計

L3のUWJ-FR-009/010、L4のcomponent境界、L5のstrict schemaとaction allowlist、L6のpure validator契約は、
`src/workflow/ai-decision-proposal.ts`の実装分岐と一致する。switching、routing、allocation、commit writerを
本contractへ混載しておらず、後続#188の責務を先取りしていない。従って全backprop scopeを
`reuse-as-is`で照合し、新しいproduct requirementやauthority拡張を追加しない。

## R3 意図照合

Issue #187の目的は、AI判断を根拠付きproposalへ限定し、freeze、permission、high-impact action、gate、
DB／Git／GitHub commit authorityから分離することである。merged diff、U-UWPROP-001..005、Claudeの
current-HEAD独立reviewはこの境界と一致する。実装landed後もIssueをopenに維持した理由は、
`PLAN-L7-558`の`backfill_state: pending_reverse`を正規Reverseで閉じるためである。

## R4 Forward再入

R0〜R3で新しい設計gapは見つからず、全backprop scopeを`preserve`とする。このPRではReverse観測記録だけを
draftで追加し、親Forward PLANやIssueを同時に完了扱いへしない。current-HEAD CIと独立review後のconfirmation
sliceで、本PLANのconfirmed遷移、`PLAN-L7-558`との双方向link、`backfill_state: complete`、
`completion_claim_allowed: true`、outstanding projection、Issue #187 terminal closeを原子的に行う。

## 終端read-after接着

PR #870のmain read-after、Issue #874のoracle gap分離、PR #885による8 failure codeの8/8 mutation killを
確認した。本PLANの`references`へ`PLAN-L7-558-ai-decision-proposal-authority`を追加し、Forward側の
`requires`と双方向接着した。同一transactionでpreserve対象とForward生成物を根拠別にconfirmedへ遷移し、
新しい要求やproduction semanticsを追加せずForwardのbackfill／completion claimを終端する。
