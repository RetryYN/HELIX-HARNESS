---
plan_id: PLAN-L7-301-consumer-doctor-package-preflight-and-cutover-safety
title: "PLAN-L7-301: consumer doctor の package preflight と cutover safety review fields"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
backprop_decision: not_required
backprop_decision_reason: "既存の consumer doctor / completion decision packet の fail-close 強化。D-API/D-DB、認証/secret、外部 API apply、不可逆 migration 実行、PLAN-M-02 cutover は変更しない。"
owner: TL (Codex)
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: tests/doctor.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "explorer - consumer doctor stale-state 監査"
  - role: qa
    slot_label: "explorer - PLAN-M-02 human review safety field 監査"
  - role: tl
    slot_label: "TL - fail-close 実装"
generates:
  - artifact_path: docs/plans/PLAN-L7-301-consumer-doctor-package-preflight-and-cutover-safety.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T00:30:00+09:00"
    tests_green_at: "2026-07-04T00:30:00+09:00"
    verdict: approve
    scope: "Subagent 監査で、consumer doctor が保存済み setup state の readinessOk=true を信じて現在の package preflight を再検査しない stale-state false-green と、PLAN-M-02 humanReviewBundle が mustNotApply / applyAuthorized を落とす safety 表示非対称を確認した。本 PLAN は現在の package.json scripts / Bun lockfile と human review safety fields を fail-close で固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/doctor.test.ts -t \"runConsumerDoctor\" --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:30:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:a3a70dc521bb4c9cb956993bbcc508e42c1179f4325acb45400eee8d847ed34d"
      - kind: unit_test
        command: "npm test tests/completion-decision-packet.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T00:30:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:61ed86ac2db4b1b47712ab77b0f05bfa2ba4b4d19967529cc5d5cd18789a063f"
---

# PLAN-L7-301: consumer doctor の package preflight と cutover safety review fields

## 目的

HELIX consumer setup と PLAN-M-02 cutover review の「green に見えるが意味上は未検査」という穴を閉じる。

## 問題

- `helix doctor --profile consumer` は `.helix/state/project-setup.json` の `readinessOk=true` と検証 matrix を確認する一方、現在の consumer package root にある `package.json.scripts.helix` / `typecheck` / `test` と `bun.lock|bun.lockb` を再検査していなかった。setup 後に package surface が壊れても stale state により green になり得る。
- PLAN-M-02 の dedicated packet summary は `mustNotApply` / `applyAuthorized` を持つが、`humanReviewBundle.items[].safetyReviewFields` がその2項目を落としていた。PO/chat 向け review surface で「承認前は適用不可」「apply は未承認」を追いにくい。

## 受入条件

- consumer doctor は保存済み setup state が ready でも、現在の package root に `package.json`、`scripts.helix`、`scripts.typecheck`、`scripts.test`、`bun.lock|bun.lockb` が無ければ `consumer-package-preflight` violation を返す。
- consumer doctor の生成 artifact 正常系 (generated artifact happy path) は package preflight を含めて OK になる。
- completion decision packet の human review bundle は PLAN-M-02 rename plan / approval draft の `mustNotApply` と `applyAuthorized` を safety review field として出す。
- completion review packet 側と human review bundle 側で safety flag の分類が非対称にならない。

## 検証

- `npm test tests/doctor.test.ts -t "runConsumerDoctor" --timeout 300000`
- `npm test tests/completion-decision-packet.test.ts --timeout 300000`
- `npm test tests/distribution-acceptance.test.ts --timeout 300000`
- `npm run typecheck`
- `npx --no-install tsx src/cli.ts doctor`
