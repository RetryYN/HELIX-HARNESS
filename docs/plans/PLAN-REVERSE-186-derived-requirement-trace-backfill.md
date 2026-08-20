---
plan_id: PLAN-REVERSE-186-derived-requirement-trace-backfill
title: "PLAN-REVERSE-186: Derived requirement trace compilerの設計backfill"
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
github_issue_id: 186
behavior_contract_id: DERIVED-REQUIREMENT-TRACE-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
entry_signals:
  - "po_directive:Issue #186のmerged implementationをReverse R0から要件・設計へ照合し、#188の依存終端を準備する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    reason: "UWJ-FR-005/008/016とUWJ-AC-005/008/016がderived artifact、双方向trace、L1〜L12配置を既に定義する。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/derived-requirement-trace.md
    reason: "compiler、trace validator、canonical pair projector、layer gateの責務境界がmerged implementationと一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/derived-requirement-trace.md
    reason: "stable ID、revision／snapshot、exact reverse set、12 placement、正規6 pairが実装graphと一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/derived-requirement-trace.md
    reason: "compile／validateのpre、post、invariant、stable finding契約がexportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
    reason: "U-DTRACE-001..004が派生cardinality、双方向edge、revision、placement、pairの反例を固定する。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 graph／pair反証" }
  - { role: tl, slot_label: "TL — R2設計、R3意図、R4再入判断" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-20T23:08:03Z"
    reviewed_at: "2026-08-20T23:18:23Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude:claude-opus-5
    scope: "PR #871 HEAD 8e88cc6aadac18b20b730ad2c4f3a374531f466eをClaude Codeがexact-HEADで独立reviewした。5層のpreserve evidence pathとUWJ-FR-005/008/016、L1〜L12／正規6 pair、false_positive分類、src非変更のReverse観測境界を照合しblocker 0、approve。Actions run 32425689834はfull regression、Biome、DB rebuild、doctorを含めterminal success。compile入口2 failure codeの既存oracle欠落は本PRが弱めたものではないため非blockerとしてIssue #877へ分離した。review source: https://github.com/RetryYN/HELIX-HARNESS/pull/871#issuecomment-5363234210"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run --project fast --project slow (GitHub Actions harness-check run 32425689834)"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-20T23:08:03Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:89c07f7616f212d6412e8b44626e3f11d003906ac957991bfff0e9e26fefc6ea"
        result: "Actions run 32425689834 terminal success。full regression、Biome、DB rebuild、doctor、Windows smoke、CodeQL green。output_digestはClaude review comment本文のdigest。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-186-derived-requirement-trace-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-559-derived-requirement-trace.md
  requires:
    - docs/plans/PLAN-L7-559-derived-requirement-trace.md
  references:
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/design/helix/L4-basic-design/derived-requirement-trace.md
    - docs/design/helix/L5-detail/derived-requirement-trace.md
    - docs/design/helix/L6-function-design/derived-requirement-trace.md
    - docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
    - src/workflow/derived-requirement-trace.ts
    - tests/derived-requirement-trace.test.ts
---

# Derived requirement trace compilerの設計backfill

## R0 現状採取

PR #685のimplementation HEAD `2dc7fbd20963f21bd511998ef3d3e2f33039901d`とmerge commit
`754007f05ccca801e5067d0e240afae83a65731d`を基準に、`compileDerivedRequirementTrace`、
`validateDerivedRequirementTrace`、U-DTRACE-001..004、L3〜L6およびL8のtraceを採取した。
実装はpure compiler／validatorであり、DB、Git、GitHub writeやlayer status昇格を行わない。

## R1 観測テスト設計

- 各transitionからFR、AC、test scenarioを最低1件生成し、reverse exact setへ束縛する。
- business、screen、API、data、permission、notification、audit、testの8派生系統をcandidateで生成する。
- orphan、片方向edge、別revision／snapshot、派生candidateの先行confirmedを拒否する。
- L1〜L12 placementと正規6 pairの欠落、重複、revision driftをfail-closeする。

## R2 As-Is設計

L3のUWJ-FR-005/008/016、L4のcomponent境界、L5のgraph exactness、L6のcompile／validate契約は、
`src/workflow/derived-requirement-trace.ts`の実装と一致する。派生artifactはcandidateに限定され、個別layer gateを
迂回してconfirmedへ昇格しない。旧L0〜L14や旧modeをcurrent identityへ再導入せず、L1〜L12と正規6 pairだけを
生成する。従って全backprop scopeを`reuse-as-is`で照合し、新しいproduct requirementを追加しない。

## R3 意図照合

Issue #186の目的は、transitionからFR／AC／testと8派生系統を生成し、stable source identityで双方向traceする
ことである。merged diff、U-DTRACE-001..004、Claudeのcurrent-HEAD独立reviewはこの境界と一致する。
実装landed後もIssueをopenに維持した理由は、`PLAN-L7-559`の`backfill_state: pending_reverse`を
正規Reverseで閉じるためである。

## R4 Forward再入

R0〜R3で新しい設計gapは見つからず、全backprop scopeを`preserve`とする。このPRではReverse観測記録だけを
draftで追加し、親Forward PLANやIssueを同時に完了扱いへしない。current-HEAD CIと独立review後のconfirmation
sliceで、本PLANのconfirmed遷移、`PLAN-L7-559`との双方向link、`backfill_state: complete`、
`completion_claim_allowed: true`、outstanding projection、Issue #186 terminal closeを原子的に行う。
