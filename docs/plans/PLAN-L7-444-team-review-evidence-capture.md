---
plan_id: PLAN-L7-444-team-review-evidence-capture
title: "PLAN-L7-444 (troubleshoot): team review evidence capture fail-close"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-13 /goal『バグがあればその場で是正し検出力を強化』に基づく実測で、PLAN-L7-443 cross-runtime team runがprovider/model分離とexit 0だけを返し、reviewer判定本文を証跡化しなかった"
created: 2026-07-13
updated: 2026-07-13
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存の『明示verdictなしをacceptしない』契約をL5/L6とtest-designへ同一PLAN内でbackprop済みのため、追加の上位backprop PLANは不要。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-444-team-review-evidence-capture.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/agent-slots.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L5-detailed-design/physical-data.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L7-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/team/run.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/team-run.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-review-receipt-schema.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-review-receipt-doctor.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-425-system-review-issue-handoff.md
  requires: []
review_evidence:
  - reviewer: review_444_round1
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-13T04:08:30+09:00"
    tests_green_at: "2026-07-13T04:07:47+09:00"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-fresh-subagent
    scope: "strict verdict、truncation fail-close、NULL-safe receipt、repository HEAD/provider binding、append-only schema、raw非露出を三巡敵対監査しBlocker/High 0。cross-provider実receipt未取得をcross_agent evidenceと称さない。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/team-run.test.ts tests/team-review-receipt-schema.test.ts tests/team-review-receipt-doctor.test.ts --reporter=dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-13T04:07:47+09:00"
        evidence_path: tests/team-run.test.ts
        output_digest: "sha256:82d82fb44f383d41e601f48a376453646f44de5b4560932c0096ff0f3c1b6c00"
agent_slots:
  - { role: aim, slot_label: "AIM — incident境界とevidence authorityを監査" }
  - { role: se, slot_label: "SE — bounded output captureとdigest/verdict実装" }
  - { role: qa, slot_label: "QA — missing/FAIL/PASS/truncation oracle" }
---

# PLAN-L7-444: チームレビュー証跡のfail-close

## 工程表

| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [直列] | L6実行結果契約と`U-TEAMRUN-004`をfreeze | raw非露出、bounded capture、明示verdict契約が一致 |
| 2 | [直列] | provider stdout/stderrをbounded captureしdigest/bytes/truncatedへ正規化 | JSONがreview evidence metadataを返す |
| 3 | [直列] | reviewerのmissing/FAIL verdictをexit 0でもfail-close | worker成功とreview合格を混同しない |
| 4 | [review] | 別runtime/model familyでVペアとnegative oracleを監査 | Blocker/High 0、green evidence記録 |

## 完了条件

- reviewer role (`tl` / `qa` / `uiux`) は `VERDICT: PASS` のみ成功とする。
- `VERDICT: FAIL`、verdict欠落、provider非zeroはteam全体を失敗にする。
- provider raw outputはJSON/DBへ含めず、SHA-256 digest、byte数、truncation、正規化verdictだけを返す。
- member receiptは`harness.db.team_member_run_receipts`へappend-onlyで保存し、update/deleteを拒否する。
- captureは上限を持ち、巨大出力でmemoryを無制限消費しない。
- `U-TEAMRUN-004`、CLI fake-provider回帰、typecheck、lint、doctorがgreenである。
