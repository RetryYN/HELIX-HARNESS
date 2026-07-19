---
plan_id: PLAN-L7-265-version-up-security-checklist-evidence
title: "PLAN-L7-265: version-up security checklist evidence status"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "version-up security checklist の row 契約を evidence 状態付きにする小変更。L3 機能意味と external activation 境界は既存 version-up 設計を維持する。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "explorer - version-up security checklist gap audit"
  - role: tl
    slot_label: "TL - packet/test/doc implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-265-version-up-security-checklist-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/modes/version-up.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/version-up-readiness.ts
    - src/cli.ts
    - tests/version-up-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T14:53:00+09:00"
    tests_green_at: "2026-07-03T14:53:00+09:00"
    verdict: approve
    scope: "version-up security checklist の requiredEvidence を row 単位の status/evidence/reason に接続し、present の concrete evidence 欠落を fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T14:53:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:db5b0f0811037c69086063b9bda57d737637cdeaacfcfd26a47f348391f78775"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T14:53:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
---

# PLAN-L7-265: version-up security checklist evidence 状態

## 目的

`version-up security-checklist` は source metadata と `requiredEvidence` を持っていたが、各 security check が
現在どの証跡状態なのかを row 単位で表現できなかった。そのため、「要求が書かれている」ことと
「concrete evidence がある」ことを承認者が同じ field から読み分ける必要があった。

この PLAN は、security checklist の各 row に `status` / `evidence` / `reason` を追加し、承認前 activation が
未実証 security evidence を実証済みとして扱わないようにする。

## 変更

- `securityChecklistPacket.securityChecks[]` に `status: present | pending_evidence`、`evidence`、`reason` を追加する。
- concrete locator が未接続の row は `pending_evidence` とし、`requiredEvidence` を実証済み evidence と読み替えない。
- `status=present` の row が concrete locator を持たない場合、または `evidence` / `reason` が空・placeholder の場合は fail-close する。
- activation snapshot の `evidenceDigest` に security checklist row を含め、snapshot drift 検出対象にする。
- completion/status supporting summary の `requiredReviewFields[]` に security checklist の `status` / `evidence` / `reason` を追加する。
- CLI text / JSON、unit test、version-up mode doc、L7 unit test design を同じ契約に揃える。

## 境界

- GitHub Actions、Cloudflare、webhook、release tag、production infra への外部変更は行わない。
- `pending_evidence` 自体は parked activation packet として正当な状態であり、doctor は field 欠落や虚偽の `present` を fail-close する。
- `PLAN-M-02` の rename/cutover、`.helix` から HELIX への実 state move は扱わない。

## 完了条件

- security checklist row が `status` / `evidence` / `reason` を公開する。
- `status=present` かつ concrete locator 欠落が violation になる。
- activation snapshot の `evidenceDigest` が security checklist row の変更で変わる入力を持つ。
- completion/status の review field が新契約を列挙する。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
