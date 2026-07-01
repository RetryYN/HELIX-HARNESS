---
plan_id: PLAN-L7-94-outstanding-work-surface
title: "PLAN-L7-94 (impl): outstanding-work surface — 未了の正の集計 (非終端 PLAN 層別 + open defer) を status/handover に additive surface (IMP-139)"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L6-function-design/function-spec.md
status: confirmed
created: 2026-06-22
updated: 2026-07-01
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T08:42:36+09:00"
    tests_green_at: "2026-07-01T08:42:36+09:00"
    verdict: pass
    scope: "Continuation 38: `ut-tdd handover status --json` now treats CURRENT.json as the session pointer while recomputing live `outstanding`, `completionDecisionPacket`, and G-SF `semanticFeatureFrontierRecords` for read-only resume preflight. This closes the semantic gap where an older handover snapshot could hide revised-request / parked / cutover classifications even though `ut-tdd status --json` exposed them."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts tests/outstanding.test.ts tests/handover.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T08:42:36+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T08:42:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T08:42:36+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:4c4a3b43d958ce5f10a7dd8279a533e2900a53a1593e8c9ce6e4a671c99cadba"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T08:33:36+09:00"
    tests_green_at: "2026-07-01T08:33:36+09:00"
    verdict: pass
    scope: "Continuation 37: outstanding now emits G-SF semantic_feature_frontier_record entries so revised-request / parked / cutover semantics are not collapsed into numeric blocker counts. PO/S4 pending plans classify as frontier_pending_decision, version_target parked plans classify as parked_future_version, and irreversible rename/cutover plans classify as approval_gated_cutover. Every record keeps completionClaimAllowed=false, blockers, requiredRoute, and sourcePaths. L6 HELIX function design and L7 unit oracle were synchronized without adding a new HU count."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/vmodel-pair.test.ts tests/l0-l8-design-consistency-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T08:33:36+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T08:33:36+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T08:33:36+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:5834d142811211f6a4bc5622b7e4d6130610b97b688ef31a23850dfec0bba8c6"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:22:48+09:00"
    tests_green_at: "2026-07-01T04:22:48+09:00"
    verdict: pass
    scope: "Continuation 36: specialized S4 / version-up / action-binding / rename packet surfaces now carry relatedDecisionPackets[] so a dedicated packet does not hide sibling blockers on the same PLAN. S4+approval, version-up+external approval, action-binding sibling S4/version-up/rename, and rename+approval routes are tested, and CLI text emits related-packet lines in addition to JSON."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/action-binding-approval-readiness.test.ts tests/identifier-rename.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:22:48+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:fded6d59d59447515e22bf699c525a81d1a53bc6e17cdb92871e4da6bd5143e0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:22:48+09:00"
        evidence_path: src/lint/workflow-decision-packets.ts
        output_digest: "sha256:fe2de28d2d0e3ac2cfb1b5b0e2df352bdfd932359c0ac648cdd4586f6f926e53"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:22:48+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:22:48+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:22:48+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:14:42+09:00"
    tests_green_at: "2026-07-01T04:14:42+09:00"
    verdict: pass
    scope: "Continuation 35: completionDecisionPacket decisions now carry decisionPacketCommand and packetCommands, and completion-decision-packet lint rejects command drift from blockerReason/blockers. Handover resume packets generated from the same snapshot retain the S4 / version-up / rename cutover / action-binding packet routes, so restart surfaces no longer lose the workflow command lane even when workflowNextActions[] is not the primary object being inspected."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/handover.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/handover.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:3b13a33abb624a69f4d744d9dacc1025cd1024ee8ea8deb7de21b281cce5581b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:14:42+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:05:01+09:00"
    tests_green_at: "2026-07-01T04:05:01+09:00"
    verdict: pass
    scope: "Continuation 34: workflowNextActions[] now links each outstanding blocker to the most specific non-destructive packet surface. PO/S4 blockers point to `ut-tdd s4 decision-packet --json`, version-up parked blockers to `ut-tdd version-up activation-packet --json`, irreversible rename/cutover blockers to `ut-tdd rename plan --json`, and secondary approval blockers remain visible through `packetCommands` and status text supporting-decision-packets. This closes the semantic workflow gap where all blockers previously pointed only to the generic completion packet."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:01+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:52:48+09:00"
    tests_green_at: "2026-07-01T03:52:48+09:00"
    verdict: pass
    scope: "Continuation 33: status JSON now exposes workflowNextActions[] as the full ordered blocker queue while preserving workflowNextAction as the top guidance string. Multiple outstanding blockers no longer hide version-up activation, L14 cutover signoff, or action-binding approval behind the first PO/S4 action."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:52:48+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:52:48+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:52:48+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:52:48+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:05:00+09:00"
    tests_green_at: "2026-07-01T04:05:00+09:00"
    verdict: pass
    scope: "Continuation 32: S4 decision packets now expose decisionEvidenceChecklist, outcomeRouteMatrix, and provenanceRequirements. PO/S4 decision support must show verified evidence, stakeholder/proxy review, acceptance gap, unresolved risk, source basis, route impact, and outcome-specific terminal/Forward/Reverse/backlog consequences instead of treating S3 green or review completion as enough to decide."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:05:00+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:00+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T04:05:00+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:34:00+09:00"
    tests_green_at: "2026-07-01T02:32:00+09:00"
    verdict: pass
    scope: "Continuation 31: action-binding approval now exposes a dedicated non-destructive `ut-tdd action-binding approval-packet` surface. The packet reads the PLAN `action_binding_approval_record`, reports approve/deny/scope-reduction routes, and fixes `planOnly=true`, `mustNotApprove=true`, `approvalCommandAvailable=false`, and `approvalAllowed=false` so PO/named-approver decision support cannot record approval, mutate status, or execute high-impact actions."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:31:00+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:fded6d59d59447515e22bf699c525a81d1a53bc6e17cdb92871e4da6bd5143e0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:31:00+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:7b9f5cb240379d27c5d6df59bfe71ac973c6acde113e56d1e7d3dac6eafa1994"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:32:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T02:21:04+09:00"
    tests_green_at: "2026-07-01T02:20:00+09:00"
    verdict: pass
    scope: "Continuation 30: S4 pending Discovery/Scrum PLANs now expose a dedicated non-destructive `ut-tdd s4 decision-packet` surface. The packet reads `s4_decision_record`, reports confirmed/rejected/pivot routes, and fixes `planOnly=true`, `mustNotDecide=true`, `decisionCommandAvailable=false`, and `decisionAllowed=false` so PO/S4 decision support cannot mutate status, record decision_outcome, Forward-merge, or trigger Reverse fullback."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T02:18:00+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:20:00+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T02:20:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T00:32:57+09:00"
    tests_green_at: "2026-07-01T00:32:57+09:00"
    verdict: pass
    scope: "Continuation 29: completion decision packet lint now validates top-level decisionKind, allowedOutcomes, and nextWorkflowRoute against the primary blockerReason. Record-level metadata can no longer be correct while the decision item itself points PO/human judgment to the wrong blocker kind, outcome set, or route."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T00:32:57+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T00:32:57+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T20:02:43+09:00"
    tests_green_at: "2026-06-30T20:02:43+09:00"
    verdict: pass
    scope: "Continuation 28: completion decision packet lint now rejects duplicate or extra record metadata entries. requiredRecords, allowedOutcomesByRecord, nextWorkflowRoutesByRecord, and recordTemplates must name the same record set exactly once, so ambiguous duplicate records or unused other_record metadata cannot remain in a PO/human decision packet."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T20:02:43+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T20:02:43+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:57:18+09:00"
    tests_green_at: "2026-06-30T19:57:18+09:00"
    verdict: pass
    scope: "Continuation 27: completion decision packet lint now validates record-level allowed outcomes and workflow routes against canonical record semantics. Non-empty allowedOutcomesByRecord/nextWorkflowRoutesByRecord are no longer sufficient; unknown outcomes, missing expected outcomes, or routes that omit S4/version-up/parked-review/cutover/action-binding semantics fail-close."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:57:18+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:57:18+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:48:01+09:00"
    tests_green_at: "2026-06-30T19:48:01+09:00"
    verdict: pass
    scope: "Continuation 26: completion decision packet templates now carry semantic guidance, not just record headers and field placeholders. Packet lint rejects templates that omit record-specific workflow meaning: S4 outcome routes, version-up add-feature/reject/archive/review_by controls, L14 cutover execution controls, and action-binding least-privilege approval/audit constraints."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:48:01+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:48:01+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:48:01+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:48:01+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:35:18+09:00"
    tests_green_at: "2026-06-30T19:35:18+09:00"
    verdict: pass
    scope: "Continuation 25: action-binding approval readiness now validates least-privilege binding semantics, not just field presence. Approval records reject broad/wildcard actor/tool/target/params, require approval_scope to limit a concrete boundary rather than say scope/limited only, require concrete review evidence, expiry or trigger-bound re-approval, and audit routes for approver/action/result/incident."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:35:18+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:fded6d59d59447515e22bf699c525a81d1a53bc6e17cdb92871e4da6bd5143e0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:35:18+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:7b9f5cb240379d27c5d6df59bfe71ac973c6acde113e56d1e7d3dac6eafa1994"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:28:24+09:00"
    tests_green_at: "2026-06-30T19:28:24+09:00"
    verdict: pass
    scope: "Continuation 24: L14 cutover readiness now validates execution-control semantics, not just cutover_decision_record field presence. Irreversible apply requires frozen HEAD, quiet window, single-run/concurrency, drift re-approval, non-destructive dry-run, branch/tag rollback, state restore, audit, and post-cutover monitoring evidence."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:28:24+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:93c979bb83cf0f99ba681620d10a5524dd668e1994012cb6132b6bedfc4554f0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:28:24+09:00"
        evidence_path: src/lint/cutover-readiness.ts
        output_digest: "sha256:94ec6dcba86d5565b2c0c7b0ea6325b151e426f1b5615bda852a8a9bef0153bc"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:15:49+09:00"
    tests_green_at: "2026-06-30T19:15:49+09:00"
    verdict: pass
    scope: "Continuation 23: S4 decision readiness now validates selected-outcome semantics, not just record presence. confirmed/rejected/pivot must align with terminal status, forward route, reverse fullback, and promotion/rejection/pivot rationale so a PLAN cannot claim one S4 outcome while routing as another."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:15:49+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:15:49+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:07:08+09:00"
    tests_green_at: "2026-06-30T19:07:08+09:00"
    verdict: pass
    scope: "Continuation 22: S4 decision readiness now validates terminal S4 PoC plans, not only S3 pending plans. Existing confirmed/completed Discovery PLANs now carry structured s4_decision_record blocks, so frontmatter decision_outcome alone can no longer stand in for PO/S4 basis, route, risk, and fullback evidence."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:07:08+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:07:08+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:59:06+09:00"
    tests_green_at: "2026-06-30T18:59:06+09:00"
    verdict: pass
    scope: "Continuation 21: readiness gates now validate allowed_outcome as the exact design enum set, not just a non-empty field. S4, version-up activation, L14 cutover, and action-binding approval records fail on unknown outcomes or missing required outcomes, preventing function-list / decision-packet drift from passing as structured evidence."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/action-binding-approval-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: src/lint/shared.ts
        output_digest: "sha256:9ba125aeb2d818e0c3e25d07af7d85a14ed698115a775f13cf44087f3f49c37b"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:28:00+09:00"
    tests_green_at: "2026-06-30T18:28:00+09:00"
    verdict: pass
    scope: "Continuation 20: completion decision packet sourcePaths are now repo-aware. Doctor and handover gates reject missing, absolute, drive-letter, or path-traversal sourcePaths so decision records cannot cite nonexistent workflow/design sources."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/completion-decision-packet.test.ts tests/handover.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:28:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:28:00+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
      - kind: lint
        command: "bun run lint && git diff --check"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:28:00+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:3b13a33abb624a69f4d744d9dacc1025cd1024ee8ea8deb7de21b281cce5581b"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:17:24+09:00"
    tests_green_at: "2026-06-30T18:17:24+09:00"
    verdict: pass
    scope: "Continuation 19: doctor now fail-closes blocked handover CURRENT.json pointers that lack a same-snapshot completionDecisionPacket. Handover resume/status cannot hide missing recordTemplates behind a green standalone completion decision packet."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/handover.test.ts tests/doctor.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:17:24+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:3b13a33abb624a69f4d744d9dacc1025cd1024ee8ea8deb7de21b281cce5581b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:17:24+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:61094154bb6355fbb1e34a6c58c28168dbe8cf545d98117483a36982bcc07e2a"
      - kind: lint
        command: "bun run lint && git diff --check"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:17:24+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:7ed7860b34c01fc2b864f5396880a87d7d71d63367424b190efe87bd5041af86"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:01:37+09:00"
    tests_green_at: "2026-06-30T18:01:37+09:00"
    verdict: pass
    scope: "Continuation 18: handover CURRENT.json now carries completionDecisionPacket from the same outstanding snapshot. Handover resume/status keeps recordTemplates for PO/S4, version-up, cutover, and action-binding decisions instead of only exposing outstanding counts."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/handover.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:01:37+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:01:37+09:00"
        evidence_path: src/handover/index.ts
        output_digest: "sha256:61094154bb6355fbb1e34a6c58c28168dbe8cf545d98117483a36982bcc07e2a"
      - kind: lint
        command: "bun run lint && git diff --check"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:01:37+09:00"
        evidence_path: tests/handover.test.ts
        output_digest: "sha256:3b13a33abb624a69f4d744d9dacc1025cd1024ee8ea8deb7de21b281cce5581b"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T17:47:32+09:00"
    tests_green_at: "2026-06-30T17:47:32+09:00"
    verdict: pass
    scope: "Continuation 17: completion decision packets now include recordTemplates for every required decision record. PO/S4, version-up, cutover, and action-binding blockers expose copyable YAML record blocks, and packet lint rejects missing templates or missing fields."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T17:47:32+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T17:47:32+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint && git diff --check"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T17:47:32+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b1254925c4dcbd8df051acd3c3af5895f2c2981c9b49f280c3bdc3878ee4d3a7"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:44:15+09:00"
    tests_green_at: "2026-06-30T16:44:15+09:00"
    verdict: pass
    scope: "Continuation 16: completion decision packets now expose nextWorkflowRoutesByRecord for every required decision record. Multi-blocker PLANs can no longer hide action-binding or parked-review return routes behind a primary S4/version-up/cutover route."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:44:15+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:44:15+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:34:00+09:00"
    tests_green_at: "2026-06-30T16:34:00+09:00"
    verdict: pass
    scope: "Continuation 15: completion decision packets now expose allowedOutcomesByRecord for every required decision record. Multi-blocker PLANs can no longer hide action-binding outcomes behind a primary S4/version-up/cutover outcome list."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:34:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:34:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:21:00+09:00"
    tests_green_at: "2026-06-30T16:21:00+09:00"
    verdict: pass
    scope: "Continuation 14: L14 cutover approval now requires execution_window_or_freeze_policy. Irreversible cutover decisions must bind a frozen HEAD/window, no-concurrent-apply policy, and re-approval trigger for drift before apply."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/cutover-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:21:00+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:93c979bb83cf0f99ba681620d10a5524dd668e1994012cb6132b6bedfc4554f0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:21:00+09:00"
        evidence_path: src/lint/cutover-readiness.ts
        output_digest: "sha256:94ec6dcba86d5565b2c0c7b0ea6325b151e426f1b5615bda852a8a9bef0153bc"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:12:00+09:00"
    tests_green_at: "2026-06-30T16:12:00+09:00"
    verdict: pass
    scope: "Continuation 13: action-binding approval no longer treats approval_scope prose as enough. Records now require approved_actor, approved_tool, approved_target, and approved_params, so high-impact approvals bind the actual execution subject/tool/resource/parameters before activation."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/action-binding-approval-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:12:00+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:fded6d59d59447515e22bf699c525a81d1a53bc6e17cdb92871e4da6bd5143e0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:12:00+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:7b9f5cb240379d27c5d6df59bfe71ac973c6acde113e56d1e7d3dac6eafa1994"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:47:45+09:00"
    tests_green_at: "2026-06-30T15:47:45+09:00"
    verdict: pass
    scope: "Continuation 12: version-up parked decision packets now require activation_decision_record fields for target_version_or_release_trigger and activation_route, so parked future work has a concrete release trigger and add-feature/Forward return route before activation."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:41:37+09:00"
    tests_green_at: "2026-06-30T15:41:37+09:00"
    verdict: pass
    scope: "Continuation 11: S4 decision readiness now hard-gates the concrete route after meaning-based PO decision. S3 pending PoC PLANs must carry promotion_strategy_or_rejection_pivot_rationale in s4_decision_record, so confirmed outcomes name the promotion strategy and rejected/pivot outcomes name the closure/backlog route before terminal status."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/s4-decision-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/poc-s3-s4-boundary.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:41:37+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:41:37+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:26:09+09:00"
    tests_green_at: "2026-06-30T15:26:09+09:00"
    verdict: pass
    scope: "Continuation 10: action-binding approval is now a PLAN-body readiness gate, not only completion packet prose. Non-terminal high-impact approval PLANs must carry action_binding_approval_record with allowed_outcome, approval policy/approver, scope, review evidence, expiry/trigger, and audit record. doctor hard-gates missing structured action-binding records while keeping approval itself human-owned."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/action-binding-approval-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:26:09+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:fded6d59d59447515e22bf699c525a81d1a53bc6e17cdb92871e4da6bd5143e0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:26:09+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:7b9f5cb240379d27c5d6df59bfe71ac973c6acde113e56d1e7d3dac6eafa1994"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:00:21+09:00"
    tests_green_at: "2026-06-30T15:00:21+09:00"
    verdict: pass
    scope: "Continuation 9: completion decision packets now carry structured requiredRecords with recordName, fields, and sourcePaths for every blocker on a PLAN, including S4, version-up activation, irreversible cutover, approval, and terminal evidence routes. completion-decision-packet lint rejects packets that drop requiredRecords or leave record fields/source paths empty."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:00:21+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:00:21+09:00"
        evidence_path: src/lint/completion-decision-packet.ts
        output_digest: "sha256:73271c06cb2a62fd9c3c688786e506c78e6c436df5b3c227cbcff4283f064754"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:53:25+09:00"
    tests_green_at: "2026-06-30T14:53:25+09:00"
    verdict: pass
    scope: "Continuation 8: S4 decision readiness now requires decomposed decision_basis fields (verified_evidence, stakeholder_review_or_proxy, acceptance_gap, unresolved_risk, external_source_basis, route_impact, and later promotion_strategy_or_rejection_pivot_rationale) and an official S4 decision source ledger in Discovery/Scrum mode docs. Pending S3 PoC PLANs keep status=draft and decision_outcome unset, but now carry the structured PO decision material."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/s4-decision-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:53:25+09:00"
        evidence_path: tests/s4-decision-readiness.test.ts
        output_digest: "sha256:edf1066b009ed2f5949143190cfbe288bf56d8f452c5676aac6f33b2598c6d28"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:53:25+09:00"
        evidence_path: src/lint/s4-decision-readiness.ts
        output_digest: "sha256:89c63bb3180336ba11a5ac8dca93d5ee7b71b5b026f0e3c746bdc5fda8008d66"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:41:22+09:00"
    tests_green_at: "2026-06-30T14:41:22+09:00"
    verdict: pass
    scope: "PO『4 は対応しろ』(2026-06-22) を受け IMP-139 (status/handover/DB が『未了の正の集計シグナル』を出さず doctor green=完了 と誤読され得る) を実装。新規 src/lint/outstanding.ts: analyzeOutstandingWork (純関数、非終端 PLAN を layer 別集計、terminal=confirmed/completed/accepted と archived を除外、key 昇順決定論、openDefers を Math.max(0) クランプ) + loadOutstandingPlanRows (docs/plans frontmatter から layer/status) + computeOutstandingWork (placeholder-deps specBackfillWaits を open defer として合成、I/O 失敗は fail-open ゼロ寄せ) + outstandingSummaryLine。surface 2 面: (1) ut-tdd status --json に outstanding を additive 付加 (nextAction を additive 付加した A-138/PLAN-L7-84 の前例に倣う、既存 6 field 不変) + status text に 1 行。(2) handover CURRENT.json pointer に outstanding を additive (session 再開時の完了主張を機械照合可能に)。2026-06-30 に意味別 blocker 分類と requiredAction/requiredEvidence を追加。さらに `completionReadiness` を追加し、doctor green とは別に whole-program / L14 全件達成 claim の ready/blocked を機械判定する。2026-06-30 continuation で `completionDecisionPacketForOutstanding` と `ut-tdd completion decision-packet` を追加し、PO/S4 判断・version-up activation・action-binding approval・不可逆 migration signoff を PLAN 単位の decision packet として出す。status JSON に `completionDecisionPacket` を additive に接続し、blocked status text から packet command へ直接辿れるようにした。2026-06-30 continuation 2 で `s4-decision-readiness` hard gate を追加し、S3 verified PoC が S4 decision record (allowed_outcome / decision_owner / decision_basis / forward_route / reverse_fullback_required) 無しに outstanding から消えないようにした。2026-06-30 continuation 3 で `cutover-readiness` hard gate を追加し、不可逆 L14 cutover が cutover decision record (allowed_outcome / trigger_condition / blast_radius_baseline / dry_run_plan / rollback_plan / state_backup_plan / approval_scope / audit_record / post_cutover_monitoring / legacy_alias_policy) 無しに completion packet から消えないようにした。2026-06-30 continuation 4 で version-up parked の requiredEvidence に parked_review_record を追加し、review owner / trigger / stale action が無い将来版保全を completion blocker として維持する。2026-06-30 continuation 5 で decision packet に generatedAt / sourceCommand / freshness (24h expiry) を追加し、status 埋め込み packet と standalone packet の生成元を分離、古い packet の転記利用を stale として判別可能にした。2026-06-30 continuation 6 で `completion-decision-packet` doctor hard gate を追加し、generatedFrom / ok-status 整合 / generatedAt / sourceCommand / freshness policy-window-expiresAt / stale flag / decisionCount を fail-close 検査する。2026-06-30 continuation 7 で L14 cutover source ledger を official URL / adopted version/date / latest official status / adoption decision / cutover use / required field impact に構造化し、SLSA Provenance を含む cutover evidence basis が欠けたら `cutover-readiness` が fail-close するようにした。outstanding 集計自体は informational surface のままだが、完了判断 packet の鮮度・出所・形と L14 cutover 判断前の証跡形状は hard gate である。test 15 ケース (analyze 5 + completion readiness 2 + decision packet 3 + summaryLine 2 + loader/compute 3) + completion-decision-packet 6 ケース + S4 readiness 4 ケース + cutover readiness 6 ケース + CLI status/decision-packet surface + 既存 handover/status スイート不破壊。typecheck/Biome/Vitest/doctor green。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/outstanding.test.ts tests/cli-surface.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T12:36:00+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:817b8cb1643a2d0b2748ec7504388627855c3b54d4859477af3c47b2c92e8688"
      - kind: unit_test
        command: "bun run vitest run tests/completion-decision-packet.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T13:00:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:5bef1f76d721dc74e657b28fdc68dd940dbf2c681ccdf9b8d311afe08246dd9a"
      - kind: unit_test
        command: "bun run vitest run tests/cutover-readiness.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:41:22+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:93c979bb83cf0f99ba681620d10a5524dd668e1994012cb6132b6bedfc4554f0"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T12:36:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T12:36:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-06-30T12:36:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:7198268ae12f2ad7a03def7f1c5131fa0e27baf7f197a8f6cc88c39b012ce64d"
agent_slots:
  - role: tl
    slot_label: "TL - outstanding-work additive surface (status/handover, IMP-139)"
generates:
  - artifact_path: docs/plans/PLAN-L7-94-outstanding-work-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/source-ledger-freshness.ts
    artifact_type: source_module
  - artifact_path: src/lint/shared.ts
    artifact_type: source_module
  - artifact_path: src/lint/action-binding-approval-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/s4-decision-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/discovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/scrum.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-01-workflow-metamodel.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-02-roster-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-03-skill-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-04-process-workflows.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-05-roadmap-registration.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-06-orchestrator-rule-parity.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-08-forward-convergence-invariant.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-09-version-up-mode.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/handover/index.ts
    artifact_type: source_module
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/s4-decision-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
---

# PLAN-L7-94 (impl): outstanding-work surface (IMP-139)

## 0. Objective

「未了の正の集計シグナル」(非終端 PLAN の層別数 + open defer 数 + 意味別待ち理由) を `ut-tdd status --json` と
handover CURRENT.json に **additive** に surface し、「doctor green = 完了」誤読 (PLAN 完了 ≠ 層完了) を
機械照合可能にする。informational surface であり gate ではない。

## 1. Problem (IMP-139)

`ut-tdd status` (mode + next のみ) も handover digest (commits/files/failures のみ) も CURRENT.json も
「層内の非終端 (draft 等) PLAN 数 / open な explicit-defer 数」を出さない。merged-plan-status
([[PLAN-L7-87]]) / plan-completion-drift ([[PLAN-L7-93]]) は drift を fail-close 検出するが、それは
「異常」検出であって「未了の総量」を可視化しない。結果、完了主張が機械照合不能だった
([[feedback_coverage_not_substance]] / [[feedback_verify_carry_status_against_code]])。

## 2. Fix

`src/lint/outstanding.ts` (新規) + status / handover 配線:

- `analyzeOutstandingWork(plans, openDefers)`: 非終端 PLAN を layer 別集計 (純関数)。
  terminal (confirmed/completed/accepted) と archived を除外、key 昇順、openDefers は Math.max(0)。
- `blockersByKind` / `items`: 非終端 PLAN を `version_up_parked`、`po_decision_pending`、
  `human_approval_pending`、`irreversible_migration_pending`、`active_draft` に分類する。これは完了判定ではなく、
  「要求・設計・承認・将来版保全のどこで止まっているか」を status/handover から照合するための意味 surface。
- `items[].requiredAction` / `items[].requiredEvidence`: blocker を人間が再解釈しなくても、S4 decision、
  version-up activation、action-binding approval、不可逆 cutover signoff のどの証跡を足せば進められるかを
  PLAN 単位で出す。これは自動承認ではなく、承認なしに進めてはいけない境界を明示するための additive surface。
- `completionReadiness`: `nonTerminalPlansTotal` / `openDefers` / `blockersByKind` を全件完了 claim 用に集約し、
  `ready` / `blocked` と required actions を返す。これは doctor health と分離した判定で、doctor green を
  L14 全件達成の代替にしない。
- `workflowNextActionForOutstanding` / `workflowNextActionsForOutstanding`: status の top action は既存互換の
  1 行 guidance として維持しつつ、複数 blocker がある場合は `workflowNextActions[]` に PO/S4 decision、
  version-up activation、L14 cutover signoff、action-binding approval の全 queue を順序付きで返す。
  各 item は PLAN ID、reason、decision kind、必要 action/evidence、next route、主導線の
  decision packet command、全 blocker 用の packet commands を持ち、top 1 件だけで他の blocker が隠れる状態を
  避ける。主 blocker は `po_decision_pending` -> `ut-tdd s4 decision-packet --json`、
  `version_up_parked` -> `ut-tdd version-up activation-packet --json`、
  `irreversible_migration_pending` -> `ut-tdd rename plan --json`、
  `human_approval_pending` -> `ut-tdd action-binding approval-packet --json` に意味ベースで接続する。
- `completionDecisionPacketForOutstanding`: `completionReadiness` が blocked のとき、未了 PLAN を
  `po_s4_decision` / `version_up_activation` / `human_action_approval` /
  `irreversible_migration_signoff` / `workflow_continuation` の decision item に変換する。
  各 item は allowed outcomes、next workflow route、主導線の decision packet command、全 blocker 用の
  packet commands を持ち、PO が何を記録し、どの S4 / version-up / L14 cutover / action-binding packet を
  開けばよいかを機械出力にする。これは判断代行ではなく、判断待ちの証跡化である。
- decision packet は `generatedAt` / `sourceCommand` / `freshness` を持つ。freshness は
  `decision-packet-freshness.v1`、既定 `validForMinutes=1440`、`expiresAt` 超過で `stale=true`。
  `status --json` に埋め込まれた packet は `sourceCommand=ut-tdd status --json`、standalone packet は
  `sourceCommand=ut-tdd completion decision-packet --json` とし、古い転記や生成元不明の判断材料を避ける。
- `src/lint/completion-decision-packet.ts`: generatedFrom / ok-status 整合 / generatedAt /
  sourceCommand / freshness policy-window-expiresAt / stale flag / decisionCount を doctor hard gate として
  検査する。outstanding 集計は informational surface のままだが、完了判断 packet の鮮度・出所・形は
  fail-close で担保する。2026-06-30 continuation 9 で各 decision item の `requiredRecords`
  (recordName / fields / sourcePaths) も検査対象にし、各 PLAN の全 blocker から record schema を合成する。
  これにより PO/S4 と action-binding approval が同じ PLAN に同居しても承認 record が packet から落ちず、
  PO 判断 packet が文章の requiredEvidence だけに戻ることを防ぐ。2026-06-30 continuation 15 で
  `allowedOutcomesByRecord` を追加し、primary blocker 以外の record outcome (例: action-binding approval) が
  allowed outcomes から落ちる状態も fail-close にした。2026-06-30 continuation 16 で
  `nextWorkflowRoutesByRecord` を追加し、primary blocker 以外の record route (例: action-binding approval /
  parked review) が next route から落ちる状態も fail-close にした。2026-06-30 continuation 27 で
  `allowedOutcomesByRecord` は record 名ごとの canonical outcome 集合と一致すること、`nextWorkflowRoutesByRecord`
  は record 名ごとの canonical route guidance を含むことまで検査し、非空だが意味が drift した outcome/route
  を fail-close する。2026-06-30 continuation 28 で requiredRecords / allowedOutcomesByRecord /
  nextWorkflowRoutesByRecord / recordTemplates の recordName 集合が一対一であることを検査し、同名重複や
  required record に無い余剰 metadata を fail-close する。2026-07-01 continuation 29 で decision item 直下の
  `decisionKind` / `allowedOutcomes` / `nextWorkflowRoute` も primary `blockerReason` と照合し、record-level
  metadata は正しいが top-level decision が別 blocker の kind/outcome/route を示す packet を fail-close する。
  2026-06-30 continuation 17 で
  `recordTemplates` を追加し、requiredRecords の各 record を PLAN に記録するための copyable YAML block
  (`recordName:` header、`insertionHint`、全 required field の `- field:` 行) を packet に含める。template 欠落や
  field 欠落は fail-close し、PO/人間判断が prose-only requiredEvidence に戻る状態を防ぐ。2026-06-30
  continuation 26 で template guidance も record ごとの意味契約に含め、field は揃っているが S4 route /
  version-up activation route / L14 cutover execution control / action-binding least-privilege 制約を示さない
  弱い template を `invalid_record_template` として fail-close する。
- 2026-06-30 continuation 20 で `sourcePaths` を repo-aware に検査する。`requiredRecords[].sourcePaths[]`
  は repo-relative 実在ファイルでなければならず、absolute path / drive-letter path / `..` / missing file は
  `invalid_required_record_source_path` として fail-close する。これにより decision packet が存在しない要件・
  workflow 根拠を指していても shape だけで green になる状態を防ぐ。
- `src/lint/action-binding-approval-readiness.ts`: high-impact approval / action-binding / human approval を含む
  非終端 PLAN が `action_binding_approval_record` を本文に持つことを doctor hard gate として検査する。
  record は `allowed_outcome`、`approval_policy_or_named_approver`、`approval_scope`、
  `approved_actor`、`approved_tool`、`approved_target`、`approved_params`、
  `review_approval_evidence`、`expires_at_or_trigger`、`audit_record` を必須にする。これは承認代行ではなく、
  承認前に actor / tool / target / params / expiry / audit route を個別 field として固定して
  prose-only approval や scope への丸め込みを防ぐ gate である。
  2026-07-01 continuation 31 で `buildActionBindingApprovalPackets` と
  `ut-tdd action-binding approval-packet` を追加し、high-impact approval PLAN を
  `action-binding-approval-packet.v1` として独立出力する。packet は `planOnly=true`、
  `mustNotApprove=true`、`approvalCommandAvailable=false`、`approvalAllowed=false` を固定し、
  `approve_action_binding` / `deny_action` / `request_scope_reduction` の route と
  current `action_binding_approval_record` の actor/tool/target/params 欠落理由を出す。これにより
  action-binding 承認が completion packet の補助 record に埋もれず、PO / named approver の意味判断面として
  分離されるが、承認記録・適用・外部 action 実行は行わない。
- `src/lint/source-ledger-freshness.ts`: external-source ledger の `checked YYYY-MM-DD` を共通検査する。
  未来日、または現在日から 90 日超過の ledger は stale とし、S4 decision / version-up activation /
  L14 cutover / completion decision packet の判断材料にしない。これは source row/column/adoption decision が
  揃っていても、外部公式ソースの再確認が古ければ fail-close するための横断 helper である。
  `sourceLedgerHeadingPattern` は `checked` 日付を `2026-06-30` 固定にせず、再確認日を更新しても
  parser が ledger table を読み続けることを保証する。
- `src/lint/shared.ts`: `allowedOutcomeSetViolation` を追加し、decision record の `allowed_outcome` を
  非空 field ではなく、設計 enum と同じ集合として検査する。S4 / version-up activation / L14 cutover /
  action-binding approval のいずれも、未知 outcome 混入または必須 outcome 欠落を fail-close し、機能一覧・
  decision packet・PLAN record が意味的にずれたまま shape だけで green になる状態を防ぐ。
- `src/lint/version-up-readiness.ts`: version-up parked PLAN の activation を plain draft / indefinite future へ戻さない。
  `activation_decision_record` は `target_version_or_release_trigger` と `activation_route` を必須にし、将来版 activation が
  add-feature / Forward のどの route へ戻るかを構造化する。外部 activation は引き続き action-binding approval
  / escalation boundary / dry-run / rollback なしに進めない。
- `src/lint/s4-decision-readiness.ts`: S3 pending PoC の S4 判断材料を `decision_basis` 自由文から
  `verified_evidence`、`stakeholder_review_or_proxy`、`acceptance_gap`、`unresolved_risk`、
  `external_source_basis`、`route_impact`、`promotion_strategy_or_rejection_pivot_rationale` に分解する。Discovery/Scrum mode doc の S4 decision source ledger は
  official URL、adopted version/date、latest official status、adoption decision、S4 decision use、
  required field impact を持ち、Scrum Guide / ISO 29148 / ISTQB / NIST SSDF のいずれかを落とすと fail-close する。
  ledger の `checked` が未来日または 90 日超過 stale の場合も fail-close し、古い外部根拠で S4 に進めない。
  2026-06-30 continuation 22 で terminal S4 PoC (`workflow_phase=S4` + `decision_outcome`) も同じ
  `s4_decision_record` 検査対象にした。これにより confirmed/completed PLAN の frontmatter だけで
  PO/S4 basis、route、risk、Reverse fullback を証跡化した扱いにしない。
- `src/lint/cutover-readiness.ts`: L14 cutover の source ledger を official URL、adopted version/date、
  latest official status、adoption decision、cutover use、required field impact で検査する。NIST SSDF、
  GitHub Environments required reviewers、GitHub Actions concurrency、Google SRE Release Engineering、
  OWASP LLM06、SLSA Provenance のいずれかを落とす、または adoption decision を空にすると fail-close する。
  ledger の `checked` が未来日または 90 日超過 stale の場合も fail-close し、古い cutover 外部根拠で
  irreversible migration signoff に進めない。
  `cutover_decision_record` は `execution_window_or_freeze_policy` を必須にし、不可逆 apply が承認後の
  HEAD/scope drift や並行実行で実行時条件をすり替えられないようにする。
- `loadOutstandingPlanRows(repoRoot)`: docs/plans frontmatter から layer/status (registry を介さず最新値)。
- `computeOutstandingWork(repoRoot)`: open defer = placeholder-deps `specBackfillWaits` を合成
  (上位仕様確定待ちの正当な carry、threshold は descent-obligation 担当)。I/O 失敗は fail-open。
- status `--json` に `outstanding` / `workflowNextActions` / `completionDecisionPacket` を additive
  (既存 6 field + nextAction 不変、A-138/PLAN-L7-84 前例)。status text に `outstandingSummaryLine`、
  `completionReadinessLine`、`workflow-next-actions` 件数、blocked 時の
  top blocker 専用 decision packet 導線と whole-program 監査用の
  `ut-tdd completion decision-packet --json` 導線を出す。
- `ut-tdd completion decision-packet [--json]` が同じ outstanding 正本から decision packet を出す。
- handover `runHandover` が CURRENT.json pointer に `outstanding` と同じ生成時点の
  `completionDecisionPacket` (`sourceCommand=ut-tdd handover`) を additive 記録する。`ut-tdd handover status --json`
  は CURRENT.json を session pointer の正本として残しつつ、read-only resume preflight の `outstanding` /
  `completionDecisionPacket` / G-SF `semanticFeatureFrontierRecords` を live PLAN state から overlay するため、
  古い pointer snapshot が recordTemplates、専用 packet commands、または revised-request / parked /
  cutover の意味分類を落としていても再開時に復元して読める。
- doctor `handover-decision-packet` hard gate が、blocked outstanding を持つ handover CURRENT.json に
  `completionDecisionPacket` が存在し、`sourceCommand=ut-tdd handover`、freshness/shape lint OK、
  `completionReadiness` と ok/status 一致、`outstanding.items.length` と decision count 一致であることを検査する。
  これにより standalone `completion decision-packet` が green でも、resume surface の旧 pointer が recordTemplates を
  落としている状態を doctor green で隠さない。

Source ledger (checked 2026-06-30):

| Source | How it constrains this packet |
|--------|-------------------------------|
| NIST SSDF SP 800-218: https://csrc.nist.gov/pubs/sp/800/218/final | Decision evidence must be traceable to current verification / provenance, not stale prose. |
| GitHub Environments deployment protection rules: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | Approval/wait boundaries are first-class protected steps, so generated decision material needs source and expiry. |
| Scrum Guide 2020: https://scrumguides.org/scrum-guide.html | Review/decision output is an adaptation point; S4 packets must be fresh enough to guide the next route. |
| OWASP LLM06:2025 Excessive Agency: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | High-impact agentic actions need constrained authority, human oversight, and auditable approval scope. |

placement: placeholder-deps / shared を再利用するため解析層 `src/lint/outstanding.ts` に置く
(runtime→lint は coding-rules module-boundary 違反ゆえ、消費側 cli / handover が lint を import する形)。

## 3. Acceptance Criteria — met

- [x] 非終端 PLAN を layer 別に集計 (terminal/archived 除外、決定論順)。
- [x] 非終端 PLAN を意味別 blocker に分類し、status --json / handover の outstanding に additive surface。
- [x] 非終端 PLAN ごとの requiredAction / requiredEvidence を出し、承認待ち・S4 判断待ち・version-up parked を
  「次に残すべき証跡」へ落とす。
- [x] `completionReadiness` で whole-program / L14 全件達成 claim の ready/blocked を doctor green と別判定する。
- [x] `completion decision-packet` で PO/S4・version-up・approval・不可逆 migration の判断待ちを
  PLAN 単位の allowed outcomes / next route へ落とす。
- [x] decision packet が `generatedAt` / `sourceCommand` / `freshness` を持ち、24h を超えた packet を
  stale として判別できる。
- [x] doctor `completion-decision-packet` hard gate が、古い/生成元不明/shape drift した packet を拒否する。
- [x] completion decision packet が requiredRecords (recordName / fields / sourcePaths) を持ち、S4 / version-up /
  cutover / approval / terminal evidence の record schema を JSON で出す。requiredRecords 欠落や空 fields/sourcePaths は
  doctor `completion-decision-packet` hard gate が拒否する。
- [x] completion decision packet は `allowedOutcomesByRecord` を持ち、requiredRecords ごとの allowed outcomes
  欠落や primary blocker への丸め込みを doctor `completion-decision-packet` hard gate が拒否する。
- [x] completion decision packet は `nextWorkflowRoutesByRecord` を持ち、requiredRecords ごとの workflow route
  欠落や primary blocker への丸め込みを doctor `completion-decision-packet` hard gate が拒否する。
- [x] completion decision packet の record-level allowed outcomes / workflow routes は canonical record semantics と
  一致し、未知 outcome 混入や route 意味欠落を doctor `completion-decision-packet` hard gate が拒否する。
- [x] completion decision packet の requiredRecords / allowedOutcomesByRecord / nextWorkflowRoutesByRecord /
  recordTemplates は recordName 集合が一対一で、同名重複や余剰 record metadata を hard gate が拒否する。
- [x] completion decision packet の top-level decisionKind / allowedOutcomes / nextWorkflowRoute は primary
  blockerReason と一致し、record-level metadata との意味ずれを hard gate が拒否する。
- [x] completion decision packet の decisionPacketCommand / packetCommands は blockerReason / blockers と一致し、
  handover resume packet でも S4 / version-up / rename cutover / action-binding の専用 packet 導線を失わない。
- [x] completion decision packet は `recordTemplates` を持ち、requiredRecords ごとの copyable YAML block
  欠落や field 欠落を doctor `completion-decision-packet` hard gate が拒否する。
- [x] completion decision packet の `recordTemplates` は field 行だけでなく S4 / version-up / cutover /
  action-binding の workflow semantic guidance を持ち、弱い placeholder-only template を fail-close する。
- [x] completion decision packet の `requiredRecords[].sourcePaths[]` は repo-relative 実在ファイルでなければ
  通らず、存在しない根拠 doc や absolute/path traversal 参照を doctor / handover gate が拒否する。
- [x] doctor `action-binding-approval-readiness` hard gate が、承認待ち PLAN 本文の `action_binding_approval_record`
  欠落や field 欠落を拒否し、completion packet だけに承認境界が残る状態を防ぐ。
- [x] action-binding approval は `approval_scope` prose だけでは通らず、`approved_actor` / `approved_tool` /
  `approved_target` / `approved_params` が揃わない承認待ち PLAN を拒否する。
- [x] `ut-tdd action-binding approval-packet` が承認待ち high-impact PLAN を専用 packet に分離し、
  `planOnly=true` / `mustNotApprove=true` / `approvalAllowed=false` / `approvalCommandAvailable=false` の
  非破壊 surface として actor/tool/target/params の concrete 欠落理由と承認/拒否/縮小 route を出す。
- [x] doctor `version-up-readiness` hard gate が、version-up parked の activation record から
  `target_version_or_release_trigger` / `activation_route` が落ちる状態を拒否し、将来版保全を無期限 draft に戻さない。
- [x] doctor `s4-decision-readiness` hard gate が、S4 判断材料の分解不足
  (verified evidence / stakeholder review / acceptance gap / unresolved risk / external source / route impact / promotion strategy or rejection/pivot rationale) と
  S4 decision source ledger 劣化・90 日超過 stale を拒否する。
- [x] doctor `cutover-readiness` hard gate が、不可逆 L14 cutover の source ledger 劣化
  (required row / adopted version-date / latest official status / adoption decision / provenance source 欠落) と
  90 日超過 stale を拒否する。
- [x] source ledger parser は `checked` 日付を固定文字列で探さず、公式 source 再確認による日付更新を
  missing rows と誤判定しない。
- [x] L14 cutover は `execution_window_or_freeze_policy` を持たない限り通らず、frozen HEAD / 実行 window /
  no-concurrent-apply / drift 時再承認条件を cutover 判断前に固定する。
- [x] open defer (spec-backfill placeholder_deps carry) を集計。
- [x] status --json / status text / handover CURRENT.json に additive surface (既存契約不変)。blocked status から
  S4 / version-up / rename cutover / action-binding の専用 decision packet へ直接辿れる。status JSON は
  `workflowNextActions[]` で全 blocker queue と補助 packet commands も出す。handover status preflight は
  live overlay により `outstanding.semanticFeatureFrontierRecords[]` を復元し、古い CURRENT.json snapshot を
  G-SF の完了許可根拠にしない。
- [x] handover CURRENT.json は `completionDecisionPacket` を持ち、handover 再開時にも required record の
  `recordTemplates` を失わない。
- [x] doctor `handover-decision-packet` hard gate が、blocked outstanding を持つ旧 CURRENT.json の
  `completionDecisionPacket` 欠落、source mismatch、freshness/shape drift、readiness/decision count mismatch を拒否する。
- [x] informational surface = 非 fail-close (gate ではない、doctor.ok に連動させない)。
- [x] test 15 ケース (analyze 5 / completion readiness 2 / decision packet 3 / summaryLine 2 / loader+compute 3)、
  completion-decision-packet 14 ケース、action-binding approval readiness 8 ケース、S4 readiness 7 ケース、cutover readiness 6 ケース。typecheck / Biome /
  Vitest / doctor green。

## 4. Out of scope

- 専用 harness.db 物理表の新設 = 集計はオンデマンド導出で足り、db-projection-coverage gate を増やさない
  (将来 telemetry 集計が要れば別 PLAN)。
- 非終端の fail-close 化 = 本 surface は「正の量」の可視化であり、drift の fail-close は
  merged-plan-status / plan-completion-drift が担当 (相補)。
