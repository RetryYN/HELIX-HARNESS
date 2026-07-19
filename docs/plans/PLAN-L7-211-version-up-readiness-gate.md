---
plan_id: PLAN-L7-211-version-up-readiness-gate
title: "PLAN-L7-211 (add-impl): version-up parked readiness gate"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-07-01
owner: Codex
parent_design: docs/process/modes/version-up.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up parked readiness gate"
  - role: qa
    slot_label: "QA - activation boundary regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-211-version-up-readiness-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-09-version-up-mode.md
  requires:
    - docs/plans/PLAN-DISCOVERY-09-version-up-mode.md
    - docs/plans/PLAN-REVERSE-211-version-up-readiness-gate.md
    - docs/process/modes/version-up.md
  references:
    - docs/plans/PLAN-L7-146-serverless-readonly-share.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T05:55:24+09:00"
    tests_green_at: "2026-07-01T05:55:24+09:00"
    verdict: approve
    scope: "Continuation: version-up activation packets now expose sourceLedgerFreshness with checkedDate, stale status, row count, and missing required sources. Stale or incomplete source ledgers become activation blocked reasons in the packet itself, not only in doctor, so PO/TL cannot review future activation against stale external assumptions. The surface remains planOnly/mustNotApply/applyCommandAvailable=false and does not activate PLAN-L7-146 or touch Cloudflare/GitHub/auth/secret infrastructure."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T05:55:24+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:55:24+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:55:24+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:55:24+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:55:24+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:a2be76547fa5120719aafcbd12f5acb6c7e250fa0f3ae88a1a3693fb87ecc5a2"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T05:32:31+09:00"
    tests_green_at: "2026-07-01T05:32:31+09:00"
    verdict: approve
    scope: "Continuation: version-up now has a non-destructive dry-run surface for current->target release/tag updates. The dry-run normalizes SemVer, rejects invalid/same/downgrade targets, returns migration/rollback/idempotency/release-gate/source-basis evidence, and keeps planOnly/mustNotApply/applyCommandAvailable=false so version-up planning cannot become apply authority."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:a2be76547fa5120719aafcbd12f5acb6c7e250fa0f3ae88a1a3693fb87ecc5a2"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:35:00+09:00"
    tests_green_at: "2026-07-01T03:35:00+09:00"
    verdict: approve
    scope: "Continuation: version-up activation packet now exposes externalRehearsalPlan, costGuardrails, and provenanceRequirements for Cloudflare/GitHub activation candidates. External parked work must carry structured free-tier, HMAC, access-control, no-secret/PII, no-prod-write, rollback, approval, and audit evidence before future activation; the surface remains plan-only and non-applying."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:21:30+09:00"
    tests_green_at: "2026-06-30T19:21:30+09:00"
    verdict: approve
    scope: "Continuation: version-up activation records now validate outcome semantics, not just field presence. activate_future_version must name an add-feature/Forward route, reject_or_archive must have an archive route, keep_parked_with_review_date must have a review-date route, and parked review must remain visible through completion/status decision packets."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:21:30+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:21:30+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:59:06+09:00"
    tests_green_at: "2026-06-30T18:59:06+09:00"
    verdict: approve
    scope: "Continuation: activation_decision_record allowed_outcome is now checked as the exact version-up activation enum set. Parked work cannot pass with an unknown activation outcome or a partial outcome list that diverges from the mode definition."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/action-binding-approval-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:47:45+09:00"
    tests_green_at: "2026-06-30T15:47:45+09:00"
    verdict: approve
    scope: "Continuation: activation_decision_record now requires target_version_or_release_trigger and activation_route. Version-up parked work can no longer remain an indefinite future draft or activate without naming the release trigger and add-feature/Forward route."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:32:07+09:00"
    tests_green_at: "2026-06-30T14:32:07+09:00"
    verdict: approve
    scope: "Version-up parked PLANs are hard-gated for activation markers, external action-binding approval boundaries, structured parked_review_record, and official source-ledger adoption decisions without activating the parked work."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:30:08+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:28:03+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:29:20+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:32:07+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:4b05fe6be6b15f71728b2f363f092f27c79bd207dadc65b8ad4b478618403464"
---

# PLAN-L7-211: version-up parked readiness gate（保留版 readiness gate）

## 目的

`version_target` が曖昧な draft 退避先になることを防ぐ。parked version-up PLAN は、
version-up parked であること、activation path、将来 activation 前の approval / escalation boundary を
明示しなければならない。

## スコープ

- `version-up-readiness` lint と doctor hard gate を追加する。
- L0 charter、L3 requirements、L4 functional design などの設計 source を確認し、mode catalog、
  version-up mode document、S4 discovery decision、現行 `version_target` PLAN を 1 本の semantic trace として検査する。
- version-up source ledger を、official URL、adopted version/date、latest official status、
  adoption decision、version-up use、required field impact を持つ structured table として検査する。
  release automation candidate（semantic-release / Release Please）は、release ADR まで compare-only に留める。
- version-up source ledger の `checked` date を検査する。未来日または 90 日超過の date は stale とし、
  parked review、activation、completion packet decision の根拠にできない。
- `checked` heading は初期文字列 `2026-06-30` ではなく date shape で parse し、
  正当な official-source refresh で version-up ledger table が壊れないようにする。
- 同じ source ledger freshness を `version-up-activation-packet.v1` に出し、
  PO/TL activation review が doctor gate だけでなく packet 内で `checkedDate`、stale status、
  row count、missing required sources を直接確認できるようにする。
- external activation candidate には action-binding approval、`escalation_boundaries`、
  unapproved `exit 1` behavior の明記を要求する。
- external activation candidate には structured `external_rehearsal_plan`、`cost_guardrails`、
  `activation_provenance_requirements` を要求し、$0/free-tier、HMAC、access-control、secret/PII、
  no-prod-write、rollback、approval、audit evidence を prose だけに残さない。
- `helix version-up dry-run --current <version> --target <version>` を non-destructive な
  tag/release pin planning surface として追加する。出力は `version-up-dry-run-plan.v1` とし、
  SemVer normalization と migration/rollback 計画、idempotency check、release gate check、
  official source basis を含める。downgrade / invalid target は fail closed し、apply command は出さない。
  remote distribution tag は明示的な `--release-remote <url>` / `git ls-remote --tags` で検査し、
  local tag 欠落を external HELIX-HARNESS-OS tag 欠落の証拠に使わない。
  activation packet は `--target future` dry-run command を出してはならない。未解決 future target は、
  concrete SemVer tag または release trigger が記録されるまで activation-packet review material に留める。
- `PLAN-L7-146` を activate せず、external infrastructure、auth、secrets、access control、
  Cloudflare configuration には触れない。

## 設計 Trace

| Source | この gate が保持する意味 |
|---|---|
| L0 charter P1 | version-up により、現 release 外の作業を失わない |
| L3 `HR-FR-P1-02` / `HAC-P1-02a` | 現 version 外の requirement には `version_target` と rationale が必要 |
| L4 `HB-P1 continuous-autonomy` / routing | version-up は continuous autonomy と escalation-aware routing に属する |
| `docs/process/modes/README.md` | `version_deferral` は `version-up` として列挙され、activation は add-feature 経由で戻る |
| `docs/process/modes/version-up.md` | parked / activation / approval semantics の operational SSoT |
| `PLAN-L7-146` | 現行 live parked case は draft のまま、activation せず external rehearsal、cost、provenance material を露出する |

## 受入条件

- `doctor` が `version-up-readiness - OK` を含む。
- `PLAN-L7-146-serverless-readonly-share` は `status=draft` + `version_target: future` のまま、
  activation boundary readiness の検査対象になる。
- L0/L3/L4/mode catalog semantics を落とすと lint が fail する。
- version-up source ledger row、adoption decision、latest official status などの source 証跡、
  release automation comparison source、または 90 日以内 freshness を落とすと lint が fail する。
- version-up source ledger をより新しい valid `checked` date に refresh しても、
  row parsing と readiness は green のまま保たれる。
- targeted tests、typecheck、lint、DB rebuild、doctor、full tests が pass する。
- `helix version-up activation-packet --json` は external rehearsal、cost guardrails、
  provenance requirements、`sourceLedgerFreshness` を含み、`applyCommandAvailable=false` を保つ。
  stale source ledger は activation 前に packet blocked reason として露出する。
- `helix version-up dry-run --current v0.1.0 --target v0.2.0 --json` は
  `planOnly=true`、`mustNotApply=true`、`applyCommandAvailable=false`、
  `semverChange=minor`、migration/rollback/idempotency/release gate/source basis row を返す。
  downgrade または invalid target input は、apply surface が存在する前に `ok=false` を返す。
- remote HELIX-HARNESS-OS tag 検査 command は次の通りである。
  `helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` は
  HELIX-HARNESS-OS tag を `git ls-remote --tags` で解決し、`releaseTagSource=remote` を報告する。
  concrete SemVer target が無い場合、activation packet verification は `--target future` を出さず、
  activation-packet review command を使う。
